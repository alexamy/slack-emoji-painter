import { createStore, produce } from "solid-js/store";
import { onMount, createEffect } from "solid-js";

interface StoreData {
  version: number;
  width: number;
  height: number;
  field: string[][];
  images: Record<string, string>;
  mouse: "left" | "right" | null;
  fg: string;
  bg: string;
  isListOpened: boolean;
}

export type Store = ReturnType<typeof createAppStore>;

export function createAppStore() {
  const [store, setStore] = createStore<StoreData>({
    version: 1,
    width: 8,
    height: 4,
    mouse: null,
    fg: "",
    bg: "",
    isListOpened: false,
    field: [],
    images: {
      ":-satan-:":
        "https://emoji.slack-edge.com/T47BK6X1U/-satan-/e40cbb4f8726fae4.jpg",
      ":12ozmouse-buttermilk:":
        "https://emoji.slack-edge.com/T47BK6X1U/12ozmouse-buttermilk/2e626d7ad2ff12bb.png",
    },
  });

  persistStore([store, setStore]);
  syncSelectedEmojis([store, setStore]);
  syncFieldSize([store, setStore]);

  return [store, setStore] as const;
}

function persistStore(state: Store) {
  const [store, setStore] = state;

  // load store from local storage on mount if available
  onMount(() => {
    const raw = localStorage.getItem("store");
    if (!raw) return;

    try {
      const data = JSON.parse(raw);
      if (data.version !== store.version) {
        throw new Error("Version mismatch.");
      }
      setStore(data);
    } catch (e) {
      console.log(e);
      return;
    }
  });

  // save store to local storage
  createEffect(() => {
    const data = JSON.stringify(store);
    localStorage.setItem("store", data);
  });
}

function syncSelectedEmojis(state: Store) {
  const [store, setStore] = state;

  // if new images loaded, set the current fg and bg to the first two images
  createEffect(() => {
    const [first, second] = Object.keys(store.images);

    if (!store.images[store.fg]) {
      setStore("fg", first);
    }
    if (!store.images[store.bg]) {
      setStore("bg", second ?? first);
    }
  });
}

function syncFieldSize(state: Store) {
  const [store, setStore] = state;

  // change the height of the field
  createEffect(() => {
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
  });

  // change the width of the field
  createEffect(() => {
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
  });
}
