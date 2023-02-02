import {
	clear,
	copy,
	erase,
	paint,
	reset,
	setSize,
	useAppStore,
} from './store';
import { useMemo, useRef } from 'react';

export function App() {
	const { images, field, background, brush } = useAppStore((state) => state);
	const isDownLeft = useRef(false);
	const isDownRight = useRef(false);

	const canvas = useMemo(() => {
		return field.map((keys, row) => {
			return (
				<div key={row} className='flex'>
					{keys.map((key, col) => {
						return (
							<img
								key={col}
								className='shrink-0 cursor-pointer'
								src={images[key]}
								width={32}
								height={32}
								onMouseDown={(event) => {
									event.preventDefault();

									if (event.button === 0) {
										isDownLeft.current = true;
										paint(row, col, brush);
									}

									if (event.button === 2) {
										isDownRight.current = true;
										erase(row, col);
									}
								}}
								onMouseOver={() => {
									if (isDownLeft.current) {
										paint(row, col, brush);
									}
									if (isDownRight.current) {
										erase(row, col);
									}
								}}
								onMouseUp={(event) => {
									event.preventDefault();

									if (event.button === 0) {
										isDownLeft.current = false;
									}

									if (event.button === 2) {
										isDownRight.current = false;
									}
								}}
								onContextMenu={(event) => {
									event.preventDefault();
									erase(row, col);
								}}
							/>
						);
					})}
				</div>
			);
		});
	}, [field]);

	return (
		<div className='h-screen w-screen bg-slate-900 p-4'>
			<div>
				<div className='mb-4 flex space-x-4'>
					<SizeInputs width={field[0].length} height={field.length} />
					<Buttons />
				</div>
				<div
					className='w-fit select-none'
					onMouseLeave={() => {
						isDownLeft.current = false;
						isDownRight.current = false;
					}}
				>
					{canvas}
				</div>
			</div>
		</div>
	);
}

function SizeInputs({ width, height }: { width: number; height: number }) {
	return (
		<>
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
		</>
	);
}

function Buttons() {
	return (
		<>
			<button
				className='rounded bg-white px-4 hover:bg-gray-200 active:bg-gray-300'
				onClick={copy}
			>
				Copy
			</button>
			<button
				className='rounded bg-white px-4 hover:bg-red-200 active:bg-red-300'
				onClick={clear}
			>
				Clear
			</button>
			<button
				className='rounded bg-white px-2 hover:bg-red-200 active:bg-red-300'
				onClick={reset}
			>
				Reset
			</button>
		</>
	);
}

function limit(inputNumber: string, min = 1, max = 200): number {
	const value = Number(inputNumber);
	const isInLimit = value >= min && value <= max;
	const number = isInLimit ? value : Math.min(max, Math.max(min, value));

	return number;
}
