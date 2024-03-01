import "./App.css";
import { For, Show, createMemo, createSignal, useContext } from "solid-js";
import { produce } from "solid-js/store";
import { AppContext, StoreProvider } from "./store";

// app
export function App() {
  return (
    <StoreProvider>
      <div class="app">
        <CurrentEmoji />
        <List />
        <Buttons />
        <FieldSize />
        <Field />
        <Help />
      </div>
    </StoreProvider>
  );
}

// buttons
function Buttons() {
  const [store, { clearWith, asText, loadEmojis }] = useContext(AppContext);

  function clearWithBackground() {
    clearWith(store.bg);
  }

  function copy() {
    console.log("Copied.");
    const text = asText();
    navigator.clipboard.writeText(text);
  }

  function load(file: File | undefined) {
    if (!file) return;
    loadEmojis(file);
  }

  return (
    <div class="buttons">
      <button onClick={clearWithBackground}>Clear</button>
      <button onClick={copy}>Copy</button>
      <button>
        <label for="files" class="btn">
          Load images JSON
        </label>
      </button>
      <input
        id="files"
        type="file"
        accept=".json"
        style={{ visibility: "hidden" }}
        title="Contact authorized personnel to acquire images"
        onChange={(e) => load(e.target.files?.[0])}
      />
    </div>
  );
}

// current foreground and background emojis
function CurrentEmoji() {
  const [store, { setStore }] = useContext(AppContext);

  function onClick(e: MouseEvent) {
    e.preventDefault();
    setStore("isListOpened", !store.isListOpened);
    window.scrollTo(0, 0);
  }

  return (
    <div class="current-emoji">
      Foreground:
      <img class="emoji" src={store.images[store.fg]} onClick={onClick} />
      Background:
      <img class="emoji" src={store.images[store.bg]} onClick={onClick} />
    </div>
  );
}

// field size controls
function FieldSize() {
  const [store, { setStore }] = useContext(AppContext);

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
function Field() {
  const [store, { setStore, updateCell }] = useContext(AppContext);

  function onMouseDown(e: MouseEvent, row: number, col: number) {
    e.preventDefault();
    setStore("mouse", () => {
      if (e.button === 0) return "left";
      if (e.button === 2) return "right";
      return null;
    });
    updateCell(row, col);
  }

  function onMouseOver(e: MouseEvent, row: number, col: number) {
    e.preventDefault();
    updateCell(row, col);
  }

  function onMouseUp(e: MouseEvent) {
    e.preventDefault();
    setStore("mouse", null);
  }

  return (
    <div class="field-outer" onContextMenu={(e) => e.preventDefault()}>
      <div class="field" onMouseLeave={onMouseUp}>
        <For each={store.field}>
          {(emojis, row) => (
            <div class="row">
              <For each={emojis}>
                {(cell, col) => (
                  <img
                    class="emoji"
                    src={store.images[cell]}
                    onClick={(e) => e.preventDefault()}
                    onContextMenu={(e) => e.preventDefault()}
                    onMouseDown={(e) => onMouseDown(e, row(), col())}
                    onMouseOver={(e) => onMouseOver(e, row(), col())}
                    onMouseUp={(e) => onMouseUp(e)}
                  />
                )}
              </For>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}

// emojis list
function List() {
  const [store, { setStore }] = useContext(AppContext);

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
    <Show when={store.isListOpened}>
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
    </Show>
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
        <li>
          Click on foreground or background emoji to open emoji picker, click
          again to hide.
        </li>
        <li>Click on the emoji to set foreground emoji.</li>
        <li>Right-click on the emoji to to set background emoji.</li>
      </ul>
      Buttons:
      <ul>
        <li>
          <b>Clear</b> button fills the entire field with the background emoji.
        </li>
        <li>
          <b>Copy</b> button copies the field content as text to the clipboard.
        </li>
        <li>
          <b>Load images JSON</b> button loads a JSON file with emojis.
        </li>
        <li>
          The JSON should be structured as an object where each entry consists
          of a "name" key and a corresponding "url" value.
        </li>
      </ul>
      Field settings:
      <ul>
        <li>
          Use the <b>width</b> / <b>height</b> sliders to change the field size.
        </li>
      </ul>
    </div>
  );
}
