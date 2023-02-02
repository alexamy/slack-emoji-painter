export type EmojiKey = 'aaa' | 'white_square';

export const emojiPaths: Record<EmojiKey, string> = {
	aaa: '/aaa.png',
	white_square: '/white_square.png',
} as const;

export function getEmojiPath(key: EmojiKey) {
	return emojiPaths[key];
}
