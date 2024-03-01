import { createStore, produce } from "solid-js/store";
import { onMount, createEffect, createContext, JSX } from "solid-js";

export type Store = ReturnType<typeof createAppStore>;

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

export const AppContext = createContext<Store>([] as unknown as Store);

export function StoreProvider(props: { children: JSX.Element }) {
  const store = createAppStore();

  return (
    <AppContext.Provider value={store}>{props.children}</AppContext.Provider>
  );
}

// store
function createAppStore() {
  const [store, setStore] = createStore<StoreData>({
    version: 1,
    width: 8,
    height: 4,
    field: [[""]],
    images: {
      ":-satan-:":
        "https://emoji.slack-edge.com/T47BK6X1U/-satan-/e40cbb4f8726fae4.jpg",
      ":12ozmouse-buttermilk:":
        "https://emoji.slack-edge.com/T47BK6X1U/12ozmouse-buttermilk/2e626d7ad2ff12bb.png",
    },
    mouse: null, // left / right
    fg: ":-satan-:",
    bg: ":12ozmouse-buttermilk:",
    isListOpened: false,
  });

  function clearWith(emoji: string) {
    setStore("field", () => {
      const field = [];
      for (let i = 0; i < store.height; i++) {
        const row = Array(store.width).fill(emoji);
        field.push(row);
      }
      return field;
    });
  }

  function asText() {
    let text = "";
    for (const row of store.field) {
      for (const cell of row) {
        text += cell;
      }
      text += "\n";
    }

    return text;
  }

  const methods = {
    setStore,
    clearWith,
    asText,
  };

  persistStore([store, methods]);
  syncSelectedEmojis([store, methods]);
  syncFieldSize([store, methods]);

  return [store, methods] as const;
}

function persistStore(state: Store) {
  const [store, { setStore }] = state;

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
  const [store, { setStore }] = state;

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
  const [store, { setStore }] = state;

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
      Array.from({ length: store.height }).map((_, i) => i),
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

export function validateEmojis(text: string) {
  try {
    const images = JSON.parse(text);
    // check what images is an object with string keys and values starting with "http"
    if (typeof images !== "object") throw new Error("Not an object.");
    for (const [key, value] of Object.entries(images)) {
      if (typeof key !== "string") throw new Error("Key is not a string.");
      if (typeof value !== "string") throw new Error("Value is not a string.");
      if (!value.startsWith("http")) throw new Error("Value is not a URL.");
    }

    return images as Record<string, string>;
  } catch (e) {
    console.error(e);
    return;
  }
}
