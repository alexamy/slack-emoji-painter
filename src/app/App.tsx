import {
	clear,
	copy,
	erase,
	paint,
	reset,
	setBackground,
	setBrush,
	setSize,
	useAppStore,
} from './store';
import { MutableRefObject, useMemo, useRef, useState } from 'react';

export function App() {
	const { field, images, brush, background } = useAppStore();
	const isLeftDown = useRef(false);
	const isRightDown = useRef(false);
	const canvas = useFieldPainter(isLeftDown, isRightDown);

	const [visible, setVisible] = useState(false);
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const brushSetter = useRef<(brush: string) => void>();
	const brushRef = useRef<HTMLImageElement | null>(null);
	const backgroundRef = useRef<HTMLImageElement | null>(null);

	return (
		<div className='h-screen w-screen bg-slate-900 p-4'>
			<div
				style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
				className={`absolute flex w-72 flex-wrap rounded bg-slate-600 p-1 ${
					visible ? 'visible' : 'hidden'
				}`}
			>
				{Object.entries(images).map(([key, path]) => {
					return (
						<img
							key={key}
							src={path}
							width={32}
							height={32}
							onClick={() => {
								brushSetter.current?.(key);
								setVisible(false);
							}}
						/>
					);
				})}
			</div>
			<div>
				<div className='mb-4 flex space-x-4'>
					<SizeInputs width={field[0].length} height={field.length} />
					<Buttons />
				</div>
				<div className='mb-4 flex space-x-4 text-white'>
					<span>Left click:</span>
					<img
						ref={brushRef}
						src={images[brush]}
						width={32}
						height={32}
						onClick={() => {
							if (!brushRef.current) return;
							const { x, y } = brushRef.current.getBoundingClientRect();
							brushSetter.current = setBrush;
							setPosition({ x, y });
							setVisible(true);
						}}
					/>
					<span>Right click (background):</span>
					<img
						ref={backgroundRef}
						src={images[background]}
						width={32}
						height={32}
						onClick={() => {
							if (!backgroundRef.current) return;
							const { x, y } = backgroundRef.current.getBoundingClientRect();
							brushSetter.current = setBackground;
							setPosition({ x, y });
							setVisible(true);
						}}
					/>
				</div>
				<div
					className='w-fit select-none'
					onMouseLeave={() => {
						isLeftDown.current = false;
						isRightDown.current = false;
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

function useFieldPainter(
	isLeftDown: MutableRefObject<boolean>,
	isRightDown: MutableRefObject<boolean>,
) {
	const images = useAppStore((state) => state.images);
	const field = useAppStore((state) => state.field);

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
										isLeftDown.current = true;
										paint(row, col);
									}

									if (event.button === 2) {
										isRightDown.current = true;
										erase(row, col);
									}
								}}
								onMouseOver={() => {
									if (isLeftDown.current) {
										paint(row, col);
									}
									if (isRightDown.current) {
										erase(row, col);
									}
								}}
								onMouseUp={(event) => {
									event.preventDefault();

									if (event.button === 0) {
										isLeftDown.current = false;
									}

									if (event.button === 2) {
										isRightDown.current = false;
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

	return canvas;
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
				Clear with background
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
