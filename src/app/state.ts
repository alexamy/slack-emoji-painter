import images from './images.json';
import whiteSquare from './assets/white_square.png';

export interface State {
	images: Record<string, string>;
	field: string[][];
	brush: string;
	background: string;
}

const defaultImages: Record<string, string> = {
	':white_square:': whiteSquare,
};

export const defaultState: State = {
	brush: ':white_square:',
	background: ':white_square:',
	field: [[':white_square:']],
	images: {
		...defaultImages,
		...(images as unknown as Record<string, string>),
	},
};
