import { JSX, createContext, useContext } from "solid-js";
import { EmojiData, createAppStore } from "./store";
import { Store } from "./store";
import { produce } from "solid-js/store";

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

        const emojis = processEmojis(text);
        if (!emojis) return;

        setStore({ emojis });
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
      return emojis;
    }
  } catch (e) {
    console.error(e);
    return;
  }
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
