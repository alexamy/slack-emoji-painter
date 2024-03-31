import { createStore, produce } from "solid-js/store";
import { onMount, createEffect, on } from "solid-js";

export interface EmojiData {
  src: string;
  name: string;
  date: string;
  author: string;
}

export interface StoreData {
  version: number;
  width: number;
  height: number;
  field: string[][];
  emojis: EmojiData[];
  images: Record<string, EmojiData>;
  favorites: string[];
  mouse: "left" | "right" | null;
  fg: string;
  bg: string;
  isListOpened: boolean;
  emojiSize: number;
}

export type Store = ReturnType<typeof createAppStore>;

const satan = {
  name: ":satan:",
  src: "https://emoji.slack-edge.com/T47BK6X1U/-satan-/e40cbb4f8726fae4.jpg",
  date: "2024-01-01",
  author: "John Doe",
} satisfies EmojiData;

const mouse = {
  name: ":mouse:",
  src: "https://emoji.slack-edge.com/T47BK6X1U/12ozmouse-buttermilk/2e626d7ad2ff12bb.png",
  date: "2024-01-01",
  author: "John Doe",
} satisfies EmojiData;

export function createAppStore() {
  const [store, setStore] = createStore<StoreData>({
    version: 3,
    width: 8,
    height: 4,
    mouse: null,
    fg: ":satan:",
    bg: ":mouse:",
    isListOpened: false,
    emojiSize: 32,
    field: [],
    emojis: [satan, mouse],
    images: { ":satan:": satan, ":mouse:": mouse },
    favorites: [],
  });

  // persist in local storage
  onMount(() => loadFromLocalStorage([store, setStore]));
  createEffect(() => saveToLocalStorage([store, setStore]));
  // update store after emoji upload
  createEffect(
    on(
      () => [store.emojis],
      () => updateStoreOnEmojis([store, setStore]),
    ),
  );
  // update field when size is changed
  createEffect(
    on(
      () => [store.emojis, store.width, store.height],
      () => changeFieldSize([store, setStore]),
    ),
  );

  return [store, setStore] as const;
}

// persist
function loadFromLocalStorage(state: Store) {
  const [store, setStore] = state;

  const raw = localStorage.getItem("store");
  if (!raw) return;

  try {
    const data = JSON.parse(raw);
    if (data.version !== store.version) {
      throw new Error(
        "Version mismatch. Please reupload emojis from Slack into the app.",
      );
    }
    setStore(data);
  } catch (e) {
    console.log(e);
    return;
  }
}

function saveToLocalStorage(state: Store) {
  const [store] = state;

  const data = JSON.stringify(store);
  localStorage.setItem("store", data);
}

// size
function changeFieldSize(state: Store) {
  const [store, setStore] = state;

  // change the height of the field
  setStore(
    "field",
    produce((field) => {
      if (store.height < field.length) {
        field.length = store.height;
      } else if (store.height > field.length) {
        for (let i = field.length; i < store.height; i++) {
          const row = Array(store.width).fill(store.bg);
          field.push(row);
        }
      }
    }),
  );

  // change the width of the field
  setStore(
    "field",
    Array.from({ length: store.height }, (_, i) => i),
    produce((row) => {
      if (store.width < row.length) {
        row.length = store.width;
      } else if (store.width > row.length) {
        for (let i = row.length; i < store.width; i++) {
          row.push(store.bg);
        }
      }
    }),
  );
}

// emojis upload
function updateStoreOnEmojis(state: Store) {
  setImages(state);
  setBrushes(state);
  filterFavorites(state);
}

function setImages(state: Store) {
  const [store, setStore] = state;

  const images: Record<string, EmojiData> = {};
  for (const emoji of store.emojis) {
    images[emoji.name] = emoji;
  }

  setStore({ images });
}

function setBrushes(state: Store) {
  const [store, setStore] = state;
  const [first, second] = store.emojis;

  if (!store.images[store.fg]) {
    setStore("fg", first.name);
  }
  if (!store.images[store.bg]) {
    setStore("bg", second.name ?? first.name);
  }
}

function filterFavorites(state: Store) {
  const [store, setStore] = state;

  const favorites = store.favorites.filter((name) => {
    return Boolean(store.images[name]);
  });

  setStore({ favorites });
}
