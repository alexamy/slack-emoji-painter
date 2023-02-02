import { hnImages } from '../hn';
import whiteSquare from './assets/white_square.png';

export interface State {
	images: Record<string, string>;
	field: string[][];
	brush: string;
	background: string;
}

const images: Record<string, string> = {
	':white_square:': whiteSquare,
};

export const defaultState: State = {
	brush: ':white_square:',
	background: ':white_square:',
	field: [[':white_square:']],
	images: {
		...images,
		...hnImages,
	},
};
