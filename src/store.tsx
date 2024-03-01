import { createStore, produce } from "solid-js/store";
import { onMount, createEffect, createContext, JSX } from "solid-js";

export type Store = ReturnType<typeof createAppStore>;
export type StoreProp = { store: Store };

export const AppContext = createContext<Store>([] as unknown as Store);

export function StoreProvider(props: { children: JSX.Element }) {
  const store = createAppStore();

  return (
    <AppContext.Provider value={store}>{props.children}</AppContext.Provider>
  );
}

// store
export function createAppStore() {
  const [store, setStore] = createStore({
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

  // select fg and bg from new images
  createEffect(() => {
    const first = Object.keys(store.images)[0];
    const second = Object.keys(store.images)[1];

    if (!store.images[store.fg as keyof typeof store.images]) {
      setStore("fg", first);
    }
    if (!store.images[store.bg as keyof typeof store.images]) {
      setStore("bg", second ?? first);
    }
  });

  // change the height of the field
  createEffect(() => {
    setStore(
      "field",
      produce((field) => {
        if (store.height < field.length) {
          field.length = store.height;
        } else if (store.height > field.length) {
          for (let i = field.length; i < store.height; i++) {
            field.push(Array(store.width).fill(store.bg));
          }
        }
      }),
    );
  });

  // change the width of the field
  createEffect(() => {
    setStore(
      "field",
      produce((field) => {
        if (store.width < field[0].length) {
          field.forEach((col) => (col.length = store.width));
        } else if (store.width > field[0].length) {
          field.forEach((col) => {
            for (let i = col.length; i < store.width; i++) {
              col.push(store.bg);
            }
          });
        }
      }),
    );
  });

  return [store, setStore] as const;
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
