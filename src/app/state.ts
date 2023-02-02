import images from './images.json';
import whiteSquare from './assets/white_square.png';

export interface State {
	brush: string;
	background: string;
	field: string[][];
	favorites: string[];
	images: Record<string, string>;
}

const defaultImages: Record<string, string> = {
	':white_square:': whiteSquare,
};

export const defaultState: State = {
	brush: ':white_square:',
	background: ':white_square:',
	field: [[':white_square:']],
	favorites: [],
	images: {
		...defaultImages,
		...(images as unknown as Record<string, string>),
	},
};
