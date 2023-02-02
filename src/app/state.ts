import whiteSquare from './assets/white_square.png';

export interface State {
	images: Record<string, string>;
	field: string[][];
	brush: string;
	background: string;
}

export const defaultState: State = {
	brush: ':white_square:',
	background: ':white_square:',
	field: [[':white_square:']],
	images: {
		':white_square:': whiteSquare,
	},
};
