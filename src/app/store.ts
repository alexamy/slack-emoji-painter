import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface State {
	width: number;
	height: number;
}

export const useAppStore = create(
	devtools(
		persist(
			immer<State>(() => ({
				width: 10,
				height: 10,
			})),
			{ name: 'slack-emoji-painter' }
		)
	)
);

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
