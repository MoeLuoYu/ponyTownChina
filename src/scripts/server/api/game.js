"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = require("url");
const errors_1 = require("../../common/errors");
const userError_1 = require("../userError");
const accountUtils_1 = require("../../common/accountUtils");
const adminUtils_1 = require("../../common/adminUtils");
const serverUtils_1 = require("../serverUtils");
const accountUtils_2 = require("../accountUtils");
exports.createJoinGame = (findServer, { version, host, debug, local }, findCharacter, join, addOrigin, hasInvites) => {
    const waiting = new Map();
    return async (account, characterId, serverId, clientVersion, url, hasAlert, origin) => {
        const accountId = account._id.toString();
        try {
            const [server, supporterInvited] = await Promise.all([
                findServer(serverId),
                hasInvites(account._id),
            ]);
            if (clientVersion !== version)
                throw new userError_1.UserError(errors_1.VERSION_ERROR);
            if (url_1.parse(url).host !== url_1.parse(host).host && !debug && !local)
                throw new userError_1.UserError('无效数据', { message: '无效主机', desc: url });
            if (!server)
                throw new userError_1.UserError('无效数据');
            if (serverUtils_1.isServerOffline(server))
                throw new userError_1.UserError('服务器离线');
            if (server.state.settings.blockJoining)
                throw new userError_1.UserError('无法加入服务器');
            if (!accountUtils_1.meetsRequirement({ roles: account.roles, supporter: adminUtils_1.supporterLevel(account), supporterInvited }, server.state.require))
                throw new userError_1.UserError('服务器受限');
            if (!characterId || typeof characterId !== 'string')
                throw new userError_1.UserError('无效数据', { message: '无效小马ID', desc: `"${characterId}"` });
            const req = waiting.get(accountId);
            const time = new Date();
            if (req) {
                throw new userError_1.UserError('正在等待加入请求');
            }
            const alert = accountUtils_2.getAccountAlertMessage(account);
            if (alert && !hasAlert) {
                return { alert };
            }
            waiting.set(accountId, { characterId, time });
            const character = await findCharacter(characterId, account._id);
            if (!character) {
                throw new userError_1.UserError('角色不存在', {
                    desc: `(加入) (账号: ${accountId} 小马: ${characterId})`
                });
            }
            await addOrigin(account, origin);
            const token = await join(server, account, character);
            return { token };
        }
        finally {
            waiting.delete(accountId);
        }
    };
};
//# sourceMappingURL=game.js.map