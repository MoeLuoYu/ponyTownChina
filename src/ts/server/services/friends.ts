import { NotificationFlags, FriendStatusFlags, FriendStatusData } from '../../common/interfaces';
import { HOUR, FRIENDS_LIMIT } from '../../common/constants';
import { AccountFlags } from '../../common/adminInterfaces';
import { hasFlag } from '../../common/utils';
import { IClient } from '../serverInterfaces';
import { addFriend, removeFriend } from '../accountUtils';
import { saySystem } from '../chat';
import { logger } from '../logger';
import { NotificationService } from './notification';
import { ActionLimiter, LimiterResult } from './actionLimiter';
import { updateEntityPlayerState } from '../playerUtils';
import { getEntityName } from '../entityUtils';

export const PENDING_LIMIT = 2;
export const REJECTED_LIMIT = 5;
export const REJECTED_TIMEOUT = 2 * HOUR;

export function isFriend(client: IClient, friend: IClient) {
	return client.friends.has(friend.accountId);
}

export function isOnlineFriend(client: IClient, friend: IClient) {
	return client.friends.has(friend.accountId) && !friend.accountSettings.hidden;
}

export function toFriendOnline(client: IClient): FriendStatusData {
	return {
		accountId: client.accountId,
		accountName: client.accountName,
		status: FriendStatusFlags.Online,
		entityId: client.pony.id,
		crc: client.pony.crc,
		name: client.pony.name,
		nameBad: client.pony.nameBad,
		info: client.pony.infoSafe,
	};
}

export function toFriendOffline(client: IClient): FriendStatusData {
	return {
		accountId: client.accountId,
		accountName: client.accountName,
		status: FriendStatusFlags.None,
		entityId: 0,
	};
}

export function toFriendRemove(client: IClient): FriendStatusData {
	return {
		accountId: client.accountId,
		status: FriendStatusFlags.Remove,
	};
}

export function toFriend(client: IClient): FriendStatusData {
	if (client.isConnected) {
		return toFriendOnline(client);
	} else {
		return toFriendOffline(client);
	}
}

export class FriendsService {
	private limiter = new ActionLimiter(REJECTED_TIMEOUT, REJECTED_LIMIT);
	private pending = new Map<string, Set<string>>();
	constructor(
		private notificationService: NotificationService,
		private reportInviteLimit: (client: IClient) => void
	) {
	}
	dispose() {
		this.limiter.dispose();
	}
	clientDisconnected(client: IClient) {
		for (const key of Array.from(this.pending.keys())) {
			const pending = this.pending.get(key)!;
			pending.delete(client.accountId);

			if (!pending.size) {
				this.pending.delete(key);
			}
		}
	}
	remove(client: IClient, friend: IClient) {
		removeFriend(client.accountId, friend.accountId).catch(e => logger.error(e));
		client.friends.delete(friend.accountId);
		client.friendsCRC = undefined;
		friend.friends.delete(client.accountId);
		friend.friendsCRC = undefined;
		client.reporter.systemLog(`移除好友 [${friend.accountId}]`);
		client.updateFriends([{ accountId: friend.accountId, status: FriendStatusFlags.Remove }], false);
		friend.updateFriends([{ accountId: client.accountId, status: FriendStatusFlags.Remove }], false);
		updateEntityPlayerState(client, friend.pony);
		updateEntityPlayerState(friend, client.pony);
	}

	removeByAccountId(client: IClient, friendAccountId: string) {
		removeFriend(client.accountId, friendAccountId).catch(e => logger.error(e));
		client.friends.delete(friendAccountId);
		client.friendsCRC = undefined;
		client.reporter.systemLog(`移除好友 [${friendAccountId}]`);
		client.updateFriends([{ accountId: friendAccountId, status: FriendStatusFlags.Remove }], false);
	}
	add(client: IClient, target: IClient) {
		const can = this.limiter.canExecute(client, target);

		if (can === LimiterResult.LimitReached) {
			return saySystem(client, '已达到请求拒绝限制');
		} else if (can !== LimiterResult.Yes) {
			return saySystem(client, '无法发送请求');
		}

		const pending = this.pending.get(client.accountId) || new Set();

		if (pending.has(target.accountId))
			return saySystem(client, '已发送请求');

		if (isFriend(client, target))
		 return saySystem(client, '已在好友列表中');

		if (client.friends.size >= FRIENDS_LIMIT)
		 return saySystem(client, '你的好友列表已满');

		if (target.friends.size >= FRIENDS_LIMIT)
            return saySystem(client, '目标玩家好友列表已满');

		if (hasFlag(client.account.flags, AccountFlags.BlockFriendRequests))
            return saySystem(client, '无法发送请求');

		if (target.accountSettings.ignoreFriendInvites)
            return saySystem(client, '无法发送请求');

		if (pending.size >= PENDING_LIMIT)
            return saySystem(client, '待处理请求过多');

		const notificationId = this.addInviteNotification(client, target);

		if (!notificationId) {
			return saySystem(client, '无法发送请求');
		}

		pending.add(target.accountId);
		this.pending.set(client.accountId, pending);
		client.reporter.systemLog(`好友请求 [${target.accountId}]`);
	}

	private acceptInvitation(client: IClient, friend: IClient, notificationId: number) {
		client.reporter.systemLog(`好友请求被 [${friend.accountId}] 接受`);
		saySystem(client, `好友请求被 ${getEntityName(friend.pony, client)} 接受`);

		addFriend(client.accountId, friend.accountId)
			.catch(e => {
				if (e.message !== `好友请求已存在`) {
					logger.error(e);
				}
			});

		client.friends.add(friend.accountId);
		client.friendsCRC = undefined;
		friend.friends.add(client.accountId);
		friend.friendsCRC = undefined;
		this.removePending(client, friend);
		this.notificationService.removeNotification(friend, notificationId);
		client.updateFriends([toFriend(friend)], false);
		friend.updateFriends([toFriend(client)], false);
		updateEntityPlayerState(client, friend.pony);
		updateEntityPlayerState(friend, client.pony);
	}
	private rejectInvitation(client: IClient, friend: IClient, notificationId: number) {
		client.reporter.systemLog(`好友请求被 [${friend.accountId}] 拒绝`);
		saySystem(client, `好友请求被 ${getEntityName(friend.pony, client)} 拒绝`);
		this.removePending(client, friend);
		this.notificationService.removeNotification(friend, notificationId);
		this.countReject(client);
	}
	private removePending(client: IClient, friend: IClient) {
		const pending = this.pending.get(client.accountId);

		if (pending) {
			pending.delete(friend.accountId);

			if (pending.size === 0) {
				this.pending.delete(client.accountId);
			}
		}
	}
	private countReject(invitedBy: IClient) {
		const count = this.limiter.count(invitedBy);

		if (count >= REJECTED_LIMIT) {
			this.reportInviteLimit(invitedBy);
		}
	}
	private addInviteNotification(client: IClient, friend: IClient) {
		const notificationId = this.notificationService.addNotification(friend, {
			id: 0,
			sender: client,
			name: client.pony.name || '',
			entityId: client.pony.id,
			message: `<div class="text-friends"><b>好友请求</b></div><b>#NAME#</b> 想要添加你为好友`,
			flags: NotificationFlags.Accept | NotificationFlags.Reject | NotificationFlags.Ignore |
				(client.pony.nameBad ? NotificationFlags.NameBad : 0),
			accept: () => this.acceptInvitation(client, friend, notificationId),
			reject: () => this.rejectInvitation(client, friend, notificationId),
		});

		return notificationId;
	}
}
