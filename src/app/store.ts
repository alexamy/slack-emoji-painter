import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface State {
	width: number;
	height: number;
}

export const useStore = create(
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

export function action() {
	useStore.setState((state) => {});
}
