import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface State {
	width: number;
	height: number;
	field: string[][];
}

const defaultState: State = {
	field: [[]],
	width: 1,
	height: 1,
};

export const useAppStore = create(
	devtools(
		persist(
			immer<State>(() => defaultState),
			{ name: 'slack-emoji-painter' },
		),
	),
);

export function reset() {
	useAppStore.setState(() => {
		return defaultState;
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
		if (width) state.width = width;
		if (height) state.height = height;
	});
}
