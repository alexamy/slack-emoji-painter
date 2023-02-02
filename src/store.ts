import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface State {}

export const useStore = create(
	devtools(
		persist(
			immer<State>(() => ({
				tags: {},
				cards: {},
				columns: {},
			})),
			{ name: 'slack-emoji-painter' }
		)
	)
);

export function action() {
	useStore.setState((state) => {});
}
