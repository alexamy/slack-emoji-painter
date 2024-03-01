import "./App.css";
import { For, Index, Show, createMemo, createSignal } from "solid-js";
import { produce } from "solid-js/store";
import {
  StoreProp,
  StoreProvider,
  createAppStore,
  validateEmojis,
} from "./store";

// app
export function App() {
  const [store, setStore] = createAppStore();

  return (
    <StoreProvider>
      <div class="app">
        <CurrentEmoji store={[store, setStore]} />
        <Show when={store.isListOpened}>
          <List store={[store, setStore]} />
        </Show>
        <Buttons store={[store, setStore]} />
        <FieldSize store={[store, setStore]} />
        <Field store={[store, setStore]} />
        <Help />
      </div>
    </StoreProvider>
  );
}

// buttons
function Buttons(props: StoreProp) {
  const [store, setStore] = props.store;

  function clearWithBackground() {
    setStore(
      produce((store) => {
        const field = [];
        for (let i = 0; i < store.height; i++) {
          const row = Array(store.width).fill(store.bg);
          field.push(row);
        }
        store.field = field;
      }),
    );
  }

  function copy() {
    let text = "";
    for (const row of store.field) {
      for (const cell of row) {
        text += cell;
      }
      text += "\n";
    }

    console.log("Copied.");
    navigator.clipboard.writeText(text);
  }

  function loadEmojis(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener(
      "load",
      (e) => {
        const text = e.target?.result;
        if (typeof text !== "string") return;

        const images = validateEmojis(text);
        if (!images) return;

        setStore(
          produce((state) => {
            state.images = images;
          }),
        );
      },
      { once: true },
    );
    reader.readAsText(file);
  }

  return (
    <div class="buttons">
      <button onClick={clearWithBackground}>Clear</button>
      <button onClick={copy}>Copy</button>
      <input
        type="file"
        accept=".json"
        onChange={(e) => loadEmojis(e.target.files?.[0])}
        title="Contact authorized personnel to acquire images"
      >
        Load images JSON
      </input>
    </div>
  );
}

// current foreground and background emojis
function CurrentEmoji(props: StoreProp) {
  const [store, setStore] = props.store;

  function onClick(e: MouseEvent) {
    e.preventDefault();
    setStore("isListOpened", !store.isListOpened);
    window.scrollTo(0, 0);
  }

  return (
    <div class="current-emoji">
      Foreground:
      <img
        class="emoji"
        src={store.images[store.fg as keyof typeof store.images]}
        onClick={onClick}
      />
      Background:
      <img
        class="emoji"
        src={store.images[store.bg as keyof typeof store.images]}
        onClick={onClick}
      />
    </div>
  );
}

// field size controls
function FieldSize(props: StoreProp) {
  const [store, setStore] = props.store;

  return (
    <div class="field-size">
      Width:
      <input
        type="number"
        class="counter"
        value={store.width}
        onInput={(e) => setStore("width", parseInt(e.target.value))}
        min={1}
      />
      Height:
      <input
        type="number"
        class="counter"
        value={store.height}
        onInput={(e) => setStore("height", parseInt(e.target.value))}
        min={1}
      />
    </div>
  );
}

// the field itself
function Field(props: StoreProp) {
  const [store, setStore] = props.store;

  function changeCell(e: MouseEvent, row: number, col: number) {
    e.preventDefault();
    if (store.mouse) {
      setStore(
        "field",
        produce((field) => {
          const emoji = store.mouse === "left" ? store.fg : store.bg;
          field[row][col] = emoji;
        }),
      );
    }
  }

  function onMouseDown(e: MouseEvent, row: number, col: number) {
    e.preventDefault();
    setStore("mouse", (mouse) => {
      if (e.button === 0) return "left";
      if (e.button === 2) return "right";
      return null;
    });
    changeCell(e, row, col);
  }

  function onMouseOver(e: MouseEvent, row: number, col: number) {
    e.preventDefault();
    changeCell(e, row, col);
  }

  function onMouseUp(e: MouseEvent) {
    e.preventDefault();
    setStore("mouse", null);
  }

  return (
    <div class="field-outer" onContextMenu={(e) => e.preventDefault()}>
      <div class="field" onMouseLeave={onMouseUp}>
        <Index each={store.field}>
          {(emojis, row) => (
            <div class="row">
              <Index each={emojis()}>
                {(cell, col) => (
                  <img
                    class="emoji"
                    src={store.images[cell() as keyof typeof store.images]}
                    onClick={(e) => e.preventDefault()}
                    onContextMenu={(e) => e.preventDefault()}
                    onMouseDown={(e) => onMouseDown(e, row, col)}
                    onMouseOver={(e) => onMouseOver(e, row, col)}
                    onMouseUp={(e) => onMouseUp(e)}
                  />
                )}
              </Index>
            </div>
          )}
        </Index>
      </div>
    </div>
  );
}

// emojis list
function List(props: StoreProp) {
  const [store, setStore] = props.store;

  const [search, setSearch] = createSignal("");
  const filtered = createMemo(() => {
    if (search() === "") return store.images;
    const query = search().toLowerCase();

    const result: Record<string, string> = {};
    for (const [name, url] of Object.entries(store.images)) {
      if (name.includes(query)) {
        result[name] = url;
      }
    }
    return result;
  });

  function onMouseDown(e: MouseEvent, name: string) {
    e.preventDefault();
    if (e.button === 0) setStore("fg", name);
    if (e.button === 2) setStore("bg", name);
  }

  return (
    <div class="list">
      <input
        type="text"
        placeholder="Search by name"
        value={search()}
        onInput={(e) => setSearch(e.target.value)}
      />
      <div class="emojis">
        <For each={Object.entries(filtered())}>
          {([name, url]) => (
            <img
              class="emoji"
              src={url}
              title={name}
              onContextMenu={(e) => e.preventDefault()}
              onMouseDown={(e) => onMouseDown(e, name)}
            />
          )}
        </For>
      </div>
    </div>
  );
}

// help messages
function Help() {
  return (
    <div>
      Drawing:
      <ul>
        <li>
          Click on the field with the <b>left mouse button</b> to draw the
          foreground emoji.
        </li>
        <li>
          Click on the field with the <b>right mouse button</b> to draw the
          background emoji.
        </li>
        <li>Hold the mouse button to paint like a brush.</li>
        <li>
          Copy emojis with the <b>copy</b> button and paste them into Slack!
        </li>
      </ul>
      Emoji list:
      <ul>
        <li>Click on foreground or background emoji to open emoji picker.</li>
        <li>Click on the emoji to set foreground emoji.</li>
        <li>Right-click on the emoji to to set background emoji.</li>
      </ul>
      Field settings:
      <ul>
        <li>
          Use the <b>width</b> / <b>height</b> to change the field size.
        </li>
        <li>
          Fill the entire field with the background emoji using the{" "}
          <b>Clear with background</b> button.
        </li>
      </ul>
    </div>
  );
}
