import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { defaultState, State } from './state';

export const useAppStore = create(
	devtools(
		persist(
			immer<State>(() => defaultState),
			{ name: 'slack-emoji-painter', version: 3 },
		),
	),
);

export function reset() {
	useAppStore.setState(() => {
		return defaultState;
	});
}

export function clear() {
	useAppStore.setState((state) => {
		state.field.forEach((row) => {
			row.forEach((_, i) => {
				row[i] = state.background;
			});
		});
	});
}

export function copy() {
	const { field } = useAppStore.getState();
	const text = field.map((row) => row.join('')).join('\n');

	navigator.clipboard.writeText(text);
}

export function paint(row: number, col: number) {
	useAppStore.setState((state) => {
		state.field[row][col] = state.brush;
	});
}

export function erase(row: number, col: number) {
	useAppStore.setState((state) => {
		state.field[row][col] = state.background;
	});
}

export function setBrush(brush: string) {
	useAppStore.setState((state) => {
		state.brush = brush;
	});
}

export function setBackground(brush: string) {
	useAppStore.setState((state) => {
		state.background = brush;
	});
}

export function addToFavorites(key: string) {
	useAppStore.setState((state) => {
		state.favorites.push(key);
	});
}

export function removeFromFavorites(key: string) {
	useAppStore.setState((state) => {
		const index = state.favorites.indexOf(key);
		if (index > -1) state.favorites.splice(index, 1);
	});
}

export function setSize({
	width,
	height,
}: {
	width?: number;
	height?: number;
}) {
	useAppStore.setState((state) => {
		const { field, background } = state;

		if (height) {
			const emptyRow = Array(field[0].length).fill(background);
			while (field.length > height) {
				field.pop();
			}
			while (field.length < height) {
				field.push(emptyRow);
			}
		}

		if (width) {
			while (field[0].length > width) {
				field.forEach((row) => row.pop());
			}
			while (field[0].length < width) {
				field.forEach((row) => row.push(background));
			}
		}
	});
}
