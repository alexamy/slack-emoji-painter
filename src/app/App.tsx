import { setSize, useAppStore } from './store';

export function App() {
	const width = useAppStore((state) => state.width);
	const height = useAppStore((state) => state.height);

	const rows = [...Array(height).keys()].map((row) => {
		const elements = [...Array(width).keys()].map((column) => {
			return (
				<div
					key={column}
					className="h-8 w-8 shrink-0 border-[1px] border-slate-800 bg-white"
				></div>
			);
		});

		return (
			<div key={row} className="flex">
				{elements}
			</div>
		);
	});

	return (
		<div className="h-screen w-screen bg-slate-900 p-4">
			<div>
				<div className="mb-4 flex space-x-4">
					<span>
						<label htmlFor="width" className="mr-2 text-white">
							Width:
						</label>
						<input
							type="number"
							name="width"
							value={width}
							className="w-12 text-right"
							onChange={(event) => {
								setSize({ width: limit(event.currentTarget.value) });
							}}
						/>
					</span>
					<span>
						<label htmlFor="height" className="mr-2 text-white">
							Height:
						</label>
						<input
							type="number"
							name="height"
							value={height}
							className="w-12 text-right"
							onChange={(event) => {
								setSize({ height: limit(event.currentTarget.value) });
							}}
						/>
					</span>
				</div>
				<div className="">{rows}</div>
			</div>
		</div>
	);
}

function limit(inputNumber: string, min = 1, max = 200): number {
	const value = Number(inputNumber);
	const isInLimit = value >= min && value <= max;
	const number = isInLimit ? value : Math.min(max, Math.max(min, value));

	return number;
}
