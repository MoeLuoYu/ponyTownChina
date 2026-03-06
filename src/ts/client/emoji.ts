import { escape } from 'lodash';
import { Sprite } from '../common/interfaces';
import { canvasToSource } from './canvasUtils';
import { drawCanvas } from '../graphics/contextSpriteBatch';
import { WHITE } from '../common/colors';
import { normalSpriteSheet } from '../generated/sprites';
import { includes } from '../common/utils';

export interface Emoji {
	names: string[];
	symbol: string;
}

export const emojis: Emoji[] = [
	// faces
	['🙂', 'face', 'tiny', 'tinyface', 'slight_smile', '笑脸', '微笑'],
	['😵', 'derp', 'dizzy_face', '晕', '眩晕'],
	['😠', 'angry', '生气', '愤怒'],
	['😐', 'neutral', 'neutral_face', '冷漠', '面无表情'],
	['😑', 'expressionless', '无语'],
	['😆', 'laughing', '大笑', '笑'],
	['😍', 'heart_eyes', '爱心眼', '喜欢'],
	['😟', 'worried', '担心', '忧虑'],
	['🤔', 'thinking', '思考', '想'],
	['🙃', 'upside_down', '倒脸'],
	['😈', 'evil', 'smiling_imp', '恶魔', '坏'],
	['👿', 'imp', 'angry_evil', '恶魔生气'],
	['👃', 'nose', 'c', '鼻子'],

	// cat faces
	['🐱', 'cat', '猫', '猫脸'],
	['😺', 'smiley_cat', '笑脸猫'],
	['😸', 'smile_cat', '微笑猫'],
	['😹', 'joy_cat', '笑哭猫'],
	['😻', 'heart_eyes_cat', '爱心眼猫'],
	['😼', 'smirk_cat', '得意猫'],
	['😽', 'kissing_cat', '亲亲猫'],
	['🙀', 'scream_cat', '惊吓猫'],
	['😿', 'cryingcat', 'crying_cat_face', '哭猫', '伤心猫'],
	['😾', 'pouting_cat', '生气猫'],

	// hearts
	['❤', 'heart', '心', '红心'],
	['💙', 'blue_heart', 'meno', '蓝心'],
	['💚', 'green_heart', 'chira', '绿心'],
	['💛', 'yellow_heart', '黄心'],
	['💜', 'purple_heart', '紫心'],
	['🖤', 'black_heart', 'shino', '黑心'],
	['💔', 'broken_heart', '碎心', '心碎'],
	['💖', 'sparkling_heart', '闪心', '闪亮心'],
	['💗', 'heartpulse', '跳动心'],
	['💕', 'two_hearts', '两颗心'],

	// food / objects
	['🥌', 'rock', 'stone', '石头', '岩石'],
	['🍕', 'pizza', '披萨', '比萨'],
	['🍎', 'apple', '苹果', '红苹果'],
	['🍏', 'gapple', 'green_apple', '青苹果', '绿苹果'],
	['🍊', 'orange', 'tangerine', '橙子', '橘子'],
	['🍐', 'pear', '梨', '梨子'],
	['🥭', 'mango', '芒果'],
	['🥕', 'carrot', '胡萝卜', '萝卜'],
	['🍇', 'grapes', '葡萄'],
	['🍌', 'banana', '香蕉'],
	['⛏', 'pick', '镐', '矿镐'],
	['🥚', 'egg', '蛋', '鸡蛋'],
	['💮', 'flower', 'white_flower', '花', '白花'],
	['🌸', 'cherry_blossom', '樱花'],
	['🍬', 'candy', '糖', '糖果'],
	['🍡', 'candy_cane', '糖葫芦', '团子'],
	['🍭', 'lollipop', '棒棒糖'],
	['⭐', 'star', '星', '星星'],
	['🌟', 'star2', '闪星', '亮星'],
	['🌠', 'shooting_star', '流星'],
	['⚡', 'zap', '闪电'],
	['❄', 'snow', 'snowflake', '雪', '雪花'],
	['⛄', 'snowpony', 'snowman', '雪人', '雪马'],
	['🏀', 'pumpkin', '南瓜'],
	['🎃', 'jacko', 'jack_o_lantern', '南瓜灯'],
	['🌲', 'evergreen_tree', 'pinetree', '松树', '常青树'],
	['🎄', 'christmas_tree', '圣诞树'],
	['🕯', 'candle', '蜡烛'],
	['🎅', 'santa_hat', 'santa_claus', '圣诞老人', '圣诞帽'],
	['💐', 'holly', '冬青'],
	['🌿', 'mistletoe', '槲寄生'],
	['🎲', 'die', 'dice', 'game_die', '骰子', '色子'],
	['✨', 'sparkles', '闪光', '闪亮'],
	['🎁', 'gift', 'present', '礼物', '礼品'],
	['🔥', 'fire', '火', '火焰'],
	['🎵', 'musical_note', '音符'],
	['🎶', 'notes', '音符们'],
	['🌈', 'rainbow', '彩虹'],
	['🐾', 'feet', 'paw', 'paws', '爪印', '脚印'],
	['👑', 'crown', '皇冠', '王冠'],
	['💎', 'gem', '宝石', '钻石'],
	['☘', 'shamrock', 'clover', '三叶草'],
	['🍀', 'four_leaf_clover', '四叶草'],
	['🍪', 'cookie', '饼干', '曲奇'],

	// animals
	['🦋', 'butterfly', '蝴蝶'],
	['🦇', 'bat', '蝙蝠'],
	['🕷', 'spider', '蜘蛛'],
	['👻', 'ghost', '鬼', '幽灵'],
	['🐈', 'cat2', '猫2'],

	// other
	['™', 'tm', '商标'],
	['♂', 'male', '男', '男性'],
	['♀', 'female', '女', '女性'],
	['⚧', 'trans', 'transgender', '跨性别'],
].map(createEmoji);

export const emojiMap = new Map<string, string>();
export const emojiNames = emojis.slice().sort().map(e => `:${e.names[0]}:`);
emojis.forEach(e => e.names.forEach(name => emojiMap.set(`:${name}:`, e.symbol)));

export function findEmoji(name: string): Emoji | undefined {
	return emojis.find(e => name === e.symbol || includes(e.names, name));
}

export function replaceEmojis(text: string | undefined): string {
	return (text || '').replace(/:[a-z0-9_]+:/ig, match => emojiMap.get(match) || match);
}

function createEmoji([symbol, ...names]: string[]): Emoji {
	return { symbol, names: [...names, ...names.filter(n => /_/.test(n)).map(n => n.replace(/_/g, ''))] };
}

const emojiImages = new Map<Sprite, string>();
const emojiImagePromises = new Map<Sprite, Promise<string>>();

export function getEmojiImageAsync(sprite: Sprite, callback: (str: string) => void) {
	const src = emojiImages.get(sprite);

	if (src) {
		callback(src);
		return;
	}

	const promise = emojiImagePromises.get(sprite);

	if (promise) {
		promise.then(callback);
		return;
	}

	const width = sprite.w + sprite.ox;
	// const height = sprite.h + sprite.oy;
	const canvas = drawCanvas(width, 10, normalSpriteSheet, undefined, batch => batch.drawSprite(sprite, WHITE, 0, 0));
	const newPromise = canvasToSource(canvas);
	emojiImagePromises.set(sprite, newPromise);

	newPromise
		.then(src => {
			emojiImages.set(sprite, src);
			emojiImagePromises.delete(sprite);
			return src;
		})
		.then(callback);
}

const emojisRegex = new RegExp(`(${[
	...emojis.map(e => e.symbol),
	'♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '⛎',
].join('|')})`, 'g');

export function splitEmojis(text: string) {
	return text.split(emojisRegex);
}

export function hasEmojis(text: string) {
	return emojisRegex.test(text);
}

export function nameToHTML(name: string) {
	return escape(name);
}

export interface AutocompleteState {
	lastEmoji?: string;
}

const names = emojiNames.slice().sort();

export function autocompleteMesssage(message: string, shift: boolean, state: AutocompleteState): string {
	return message.replace(/:[a-z0-9_]+:?$/, match => {
		state.lastEmoji = state.lastEmoji || match;
		const matches = names.filter(e => e.indexOf(state.lastEmoji!) === 0);
		const index = matches.indexOf(match);
		const offset = index === -1 ? 0 : (index + matches.length + (shift ? -1 : 1)) % matches.length;
		return matches[offset] || match;
	});
}
