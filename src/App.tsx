import "./App.css";
import {
  Index,
  Show,
  createEffect,
  createMemo,
  createSignal,
  onMount,
} from "solid-js";
import { createStore, produce } from "solid-js/store";

type StoreProp = { store: ReturnType<typeof createAppStore> };

// store
function createAppStore() {
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

  return [store, setStore] as const;
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

// app
export function App() {
  const [store, setStore] = createAppStore();

  return (
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

  // TODO move effects to the store

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

  function changeCell(e, row, col) {
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

  function onMouseDown(e, row, col) {
    e.preventDefault();
    setStore("mouse", () => {
      if (e.button === 0) return "left";
      if (e.button === 2) return "right";
      return null;
    });
    changeCell(e, row, col);
  }

  function onMouseOver(e, row, col) {
    e.preventDefault();
    changeCell(e, row, col);
  }

  function onMouseUp(e, row, col) {
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
                    src={store.images[cell()]}
                    onClick={(e) => e.preventDefault()}
                    onContextMenu={(e) => e.preventDefault()}
                    onMouseDown={(e) => onMouseDown(e, row, col)}
                    onMouseOver={(e) => onMouseOver(e, row, col)}
                    onMouseUp={(e) => onMouseUp(e, row, col)}
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

  function onMouseDown(e, name) {
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
