import whiteSquare from './assets/white_square.png';

export interface State {
	brush: string;
	background: string;
	field: string[][];
	favorites: Record<string, null>;
	images: Record<string, string>;
}

const { default: images } = await import('./images.json');
const defaultImages: Record<string, string> = {
	':white_square:': whiteSquare,
};

export const defaultState: State = {
	brush: ':white_square:',
	background: ':white_square:',
	field: [[':white_square:']],
	favorites: {},
	images: {
		...defaultImages,
		...(images as unknown as Record<string, string>),
	},
};
