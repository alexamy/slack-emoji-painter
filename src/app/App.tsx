import { MutableRefObject, useEffect, useMemo, useRef, useState } from 'react';
import { VirtuosoGrid } from 'react-virtuoso';
import {
	addToFavorites,
	clear,
	copy,
	erase,
	paint,
	removeFromFavorites,
	reset,
	setBackground,
	setBrush,
	setSize,
	useAppStore,
} from './store';

export function App() {
	const { field, images, brush, background, favorites } = useAppStore();
	const isLeftDown = useRef(false);
	const isRightDown = useRef(false);
	const canvas = useFieldPainter(isLeftDown, isRightDown);

	const [visible, setVisible] = useState(false);
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const brushSetter = useRef<(brush: string) => void>();
	const brushRef = useRef<HTMLImageElement | null>(null);
	const backgroundRef = useRef<HTMLImageElement | null>(null);

	const contextMenuRef = useRef<HTMLDivElement | null>(null);
	useClickOutside(contextMenuRef, () => setVisible(false));

	function setBrushFromMenu(key: string) {
		brushSetter.current?.(key);
		setVisible(false);
	}

	const [query, setQuery] = useState('');
	const emojiList = useMemo(() => {
		return Object.entries(images).filter(([key]) => key.includes(query));
	}, [query]);

	return (
		<div className='h-screen w-screen p-4'>
			<div
				ref={contextMenuRef}
				style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
				className={`absolute w-[440px] rounded bg-slate-600 p-1 text-sm text-white ${
					visible ? 'visible' : 'hidden'
				}`}
			>
				<div>Favorites</div>
				<div className='flex flex-wrap'>
					{Object.keys(favorites).map((key) => {
						return (
							<img
								className='h-[32px] w-[32px] shrink-0 grow-0'
								title={key}
								key={key}
								src={images[key]}
								width={32}
								height={32}
								onClick={() => setBrushFromMenu(key)}
								onContextMenu={(event) => {
									event.preventDefault();
									removeFromFavorites(key);
								}}
							/>
						);
					})}
				</div>
				<div>All</div>
				<input
					placeholder='Type to filter emojis'
					value={query}
					onInput={(event) => setQuery(event.currentTarget.value)}
					className='mb-1 w-full p-1 text-black'
				/>
				<VirtuosoGrid
					style={{ height: 330 }}
					data={emojiList}
					listClassName='flex flex-wrap'
					itemContent={(_index, [key, path]) => (
						<img
							className='h-[32px] w-[32px] shrink-0 grow-0'
							title={key}
							src={path}
							width={32}
							height={32}
							onClick={() => setBrushFromMenu(key)}
							onContextMenu={(event) => {
								event.preventDefault();
								addToFavorites(key);
							}}
						/>
					)}
				/>
			</div>
			<div>
				<div className='mb-4 flex space-x-4'>
					<span className='text-white'>Main (left click):</span>
					<img
						className='h-[32px] w-[32px] cursor-pointer'
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
					<span className='text-white'>Background (right click):</span>
					<img
						className='h-[32px] w-[32px] cursor-pointer'
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
					<button
						className='rounded bg-white px-4 hover:bg-gray-200 active:bg-gray-300'
						onClick={copy}
					>
						Copy for Slack
					</button>
				</div>
				<div className='mb-4 flex space-x-4'>
					<SizeInputs width={field[0].length} height={field.length} />
					<Buttons />
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
				<Help />
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
								className='h-[32px] w-[32px] shrink-0 cursor-pointer'
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

function Help() {
	return (
		<div className='mt-4 text-white'>
			Drawing:
			<ul className='mb-2 list-inside list-disc marker:text-slate-400'>
				<li>
					Click on field with <b>left mouse button</b> to draw main emoji
				</li>
				<li>
					Click on field with <b>right mouse button</b> to draw background emoji
				</li>
				<li>Hold mouse button to brush-like painting</li>
				<li>
					Copy emojis with <b>copy</b> button and paste them into Slack!
				</li>
			</ul>
			Select emoji:
			<ul className='mb-2 list-inside list-disc marker:text-slate-400'>
				<li>
					Click on the <b>main</b> or <b>background</b> emoji to open emojis
					menu
				</li>
				<li>Click on the emoji to select it</li>
				<li>Right click on the emoji to add it to favorites</li>
			</ul>
			Field settings:
			<ul className='list-inside list-disc marker:text-slate-400'>
				<li>
					Use <b>width</b> / <b>height</b> to change field size
				</li>
				<li>
					Fill entire field with background emoji with{' '}
					<b>Clear with background</b> button
				</li>
				<li>
					Reset entire app state with <b>Reset</b> button
				</li>
			</ul>
		</div>
	);
}

function limit(inputNumber: string, min = 1, max = 60): number {
	const value = Number(inputNumber);
	const isInLimit = value >= min && value <= max;
	const number = isInLimit ? value : Math.min(max, Math.max(min, value));

	return number;
}

function useClickOutside(
	ref: MutableRefObject<HTMLElement | null>,
	onOutside: () => void,
) {
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (ref.current) {
				const isOutside = !ref.current.contains(event.target as Node);
				if (isOutside) onOutside();
			}
		}

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [ref, onOutside]);
}
