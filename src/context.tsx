import { JSX, createContext, useContext } from "solid-js";
import { createAppStore } from "./store";
import { Store } from "./store";
import { produce } from "solid-js/store";

interface EmojiData {
  src: string;
  name: string;
  date: string;
  author: string;
}

type T = keyof EmojiData;

const AppContext = createContext<Store>({} as Store);

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

        const images = processEmojis(text);
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

function processEmojis(text: string) {
  try {
    const emojis = JSON.parse(text);
    if (validateEmojis(emojis)) {
      const result = convertEmojis(emojis);
      return result;
    }
  } catch (e) {
    console.error(e);
    return;
  }
}

function convertEmojis(emojis: EmojiData[]): Record<string, EmojiData> {
  const result: Record<string, EmojiData> = {};
  for (const emoji of emojis) {
    result[emoji.name] = emoji;
  }
  return result;
}

function validateEmojis(emojis: unknown): emojis is EmojiData[] {
  // prettier-ignore
  try {
    if (!Array.isArray(emojis))
      throw new Error("Not an array.");
    for (const emoji of emojis) {
      if (typeof emoji.src !== "string")
        throw new Error("src is not a string.");
      if (!emoji.src.startsWith("http"))
        throw new Error("src is not an URL.");
      if (typeof emoji.name !== "string")
        throw new Error("name is not a string.");
      if (typeof emoji.date !== "string")
        throw new Error("date is not a string.");
      if (typeof emoji.author !== "string")
        throw new Error("author is not a string.");
    }
  } catch (e) {
    console.error(e);
    return false;
  }

  return true;
}
