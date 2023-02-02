import { setSize, useAppStore } from './store';
import squareImg from './assets/white_square.png';
import { useMemo } from 'react';

export function App() {
	const width = useAppStore((state) => state.width);
	const height = useAppStore((state) => state.height);

	const canvas = useMemo(() => {
		return [...Array(height).keys()].map((row) => {
			return (
				<div key={row} className='flex'>
					{[...Array(width).keys()].map((column) => {
						return (
							<img
								key={column}
								className='shrink-0'
								src={squareImg}
								width={32}
								height={32}
							/>
						);
					})}
				</div>
			);
		});
	}, [width, height]);

	return (
		<div className='h-screen w-screen bg-slate-900 p-4'>
			<div>
				<SizeInputs width={width} height={height} />
				<div>{canvas}</div>
			</div>
		</div>
	);
}

function SizeInputs({ width, height }: { width: number; height: number }) {
	return (
		<div className='mb-4 flex space-x-4'>
			<span>
				<label htmlFor='width' className='mr-2 text-white'>
					Width:
				</label>
				<input
					type='number'
					name='width'
					value={width}
					className='w-12 text-right'
					onChange={(event) => {
						setSize({ width: limit(event.currentTarget.value) });
					}}
				/>
			</span>
			<span>
				<label htmlFor='height' className='mr-2 text-white'>
					Height:
				</label>
				<input
					type='number'
					name='height'
					value={height}
					className='w-12 text-right'
					onChange={(event) => {
						setSize({ height: limit(event.currentTarget.value) });
					}}
				/>
			</span>
		</div>
	);
}

function limit(inputNumber: string, min = 1, max = 200): number {
	const value = Number(inputNumber);
	const isInLimit = value >= min && value <= max;
	const number = isInLimit ? value : Math.min(max, Math.max(min, value));

	return number;
}
