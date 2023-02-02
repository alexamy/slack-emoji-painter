import { useAppStore } from './store';

export function App() {
	const width = useAppStore((state) => state.width);
	const height = useAppStore((state) => state.height);

	const rows = [...Array(height).keys()].map((row) => {
		const elements = [...Array(width).keys()].map((column) => {
			return (
				<div
					key={column}
					className="h-8 w-8 border-2 border-green-400 bg-white"
				></div>
			);
		});

		return (
			<div key={row} className="flex">
				{elements}
			</div>
		);
	});

	return <div className="h-screen w-screen bg-slate-900 p-4">{rows}</div>;
}
