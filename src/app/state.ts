import aaa from './assets/aaa.png';
import whiteSquare from './assets/white_square.png';
import youDead from './assets/you-dead.png';

export interface State {
	images: Record<string, string>;
	field: string[][];
	brush: string;
	background: string;
}

export const defaultState: State = {
	brush: ':aaa:',
	background: ':white_square:',
	field: [[':aaa:', ':white_square:']],
	images: {
		':aaa:': aaa,
		':white_square:': whiteSquare,
		':you-dead:': youDead,
	},
};
