import { JSX, createContext, useContext } from "solid-js";
import { createAppStore } from "./store";
import { Store } from "./store";
import { produce } from "solid-js/store";

const AppContext = createContext<Store>([] as unknown as Store);

export function StoreProvider(props: { children: JSX.Element }) {
  const store = createAppStore();

  return (
    <AppContext.Provider value={store}>{props.children}</AppContext.Provider>
  );
}

export function useStoreContext() {
  const [store, setStore] = useContext(AppContext);

  function clearWith(emoji: string) {
    setStore("field", (field) => {
      return field.map((row) => row.map(() => emoji));
    });
  }

  function asText() {
    return store.field.map((row) => row.join("")).join("\n");
  }

  function loadEmojis(file: File) {
    const reader = new FileReader();
    reader.addEventListener(
      "load",
      (e) => {
        const text = e.target?.result;
        if (typeof text !== "string") return;

        const images = validateEmojis(text);
        if (!images) return;

        setStore({ images });
      },
      { once: true },
    );
    reader.readAsText(file);
  }

  function drawCell(row: number, col: number) {
    if (!store.mouse) return;
    setStore(
      "field",
      produce((field) => {
        const emoji = store.mouse === "left" ? store.fg : store.bg;
        field[row][col] = emoji;
      }),
    );
  }

  return [
    store,
    { setStore, clearWith, asText, loadEmojis, drawCell },
  ] as const;
}

function validateEmojis(text: string) {
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
