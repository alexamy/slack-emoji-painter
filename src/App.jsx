import './App.css';
import { Index, createEffect, onMount } from 'solid-js';
import { createStore, produce, unwrap } from 'solid-js/store';

// store
function createAppStore() {
  const [store, setStore] = createStore({
    version: 1,
    width: 8,
    height: 4,
    field: [],
    images: {},
    mouse: null, // left / right / none
    fg: "",
    bg: "",
  });

  // load store from local storage on mount if available
  onMount(() => {
    const raw = localStorage.getItem("store");
    if(!raw) return;

    try {
      const data = JSON.parse(raw);
      if(data.version !== store.version) {
        throw new Error("Version mismatch.");
      }
      setStore(data);
    } catch(e) {
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

    if(!store.images[store.fg]) {
      setStore("fg", first);
    }
    if(!store.images[store.bg]) {
      setStore("bg", second ?? first);
    }
  });

  return [store, setStore];
}

function validateEmojis(text) {
  try {
    const images = JSON.parse(text);
    // check what images is an object with string keys and values starting with "http"
    if(typeof images !== "object") throw new Error("Not an object.");
    for(const [key, value] of Object.entries(images)) {
      if(typeof key !== "string") throw new Error("Key is not a string.");
      if(typeof value !== "string") throw new Error("Value is not a string.");
      if(!value.startsWith("http")) throw new Error("Value is not a URL.");
    }

    return images;
  } catch(e) {
    console.error(e);
    return;
  }
}

// app
export function App() {
  const [store, setStore] = createAppStore();

  return (
    <div class="app">
      <Buttons store={[store, setStore]} />
      <CurrentEmoji store={[store, setStore]} />
      <FieldSize store={[store, setStore]} />
      <Field store={[store, setStore]} />
      <Help />
    </div>
  )
}

// buttons
function Buttons(props) {
  const [store, setStore] = props.store;

  function clearWithBackground() {
    setStore(produce(store => {
      const field = [];
      for(let i = 0; i < store.height; i++) {
        const row = Array(store.width).fill(store.bg);
        field.push(row);
      }
      store.field = field;
    }));
  }

  function copy() {
    let text = "";
    for(const row of store.field) {
      for(const cell of row) {
        text += cell;
      }
      text += "\n";
    }

    console.log("Copied.");
    navigator.clipboard.writeText(text);
  }

  function loadEmojis(file) {
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target.result;
      const images = validateEmojis(text);
      if(!images) return;

      setStore("images", images);
    }
  }

  return (
    <div class="buttons">
      <button onClick={clearWithBackground}>
        Clear with Background
      </button>
      <button onClick={copy}>
        Copy
      </button>
      <input
        type="file"
        accept=".json"
        onChange={e => loadEmojis(e.target.files[0])}
        title="Contact authorized personnel to acquire images"
      >
        Load images JSON
      </input>
    </div>
  );
}

// current foreground and background emojis
function CurrentEmoji(props) {
  const [store, setStore] = props.store;

  // TODO add context menu and favorites

  return (
    <div class="current-emoji">
      Foreground:
      <img
        class="emoji"
        src={store.images[store.fg]}
      />
      Background:
      <img
        class="emoji"
        src={store.images[store.bg]}
      />
    </div>
  );
}

// field size controls
function FieldSize(props) {
  const [store, setStore] = props.store;

  return (
    <div class="field-size">
      Width:
      <input
        type='number'
        class="counter"
        value={store.width}
        onInput={e => setStore("width", parseInt(e.target.value))}
        min={1}
      />
      Height:
      <input
        type='number'
        class="counter"
        value={store.height}
        onInput={e => setStore("height", parseInt(e.target.value))}
        min={1}
      />
    </div>
  );
}

// the field itself
function Field(props) {
  const [store, setStore] = props.store;

  // change the height of the field
  createEffect(() => {
    setStore("field", produce(field => {
      if(store.height < field.length) {
        field.length = store.height;
      } else if(store.height > field.length) {
        for(let i = field.length; i < store.height; i++) {
          field.push([...field[0] ?? []]);
        }
      }
    }));
  });

  // change the width of the field
  createEffect(() => {
    setStore("field", produce(field => {
      if(store.width < field[0].length) {
        field.forEach(col => col.length = store.width);
      } else if (store.width > field[0].length) {
        field.forEach(col => {
          for(let i = col.length; i < store.width; i++) {
            col.push(store.bg);
          }
        });
      }
    }));
  });

  function changeCell(e, row, col) {
    e.preventDefault();
    if(store.mouse) {
      setStore("field", produce(field => {
        const emoji = store.mouse === "left" ? store.fg : store.bg;
        field[row][col] = emoji;
      }));
    }
  }

  function onMouseDown(e, row, col) {
    e.preventDefault();
    setStore("mouse", () => {
      if(e.button === 0) return "left";
      if(e.button === 2) return "right";
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
    <div class="field-outer" onContextMenu={e => e.preventDefault()}>
      <div class="field" onMouseLeave={onMouseUp}>
        <Index each={store.field}>{(emojis, row) => (
          <div class="row">
            <Index each={emojis()}>{(cell, col) => (
              <img
                class="emoji"
                src={store.images[cell()]}
                onClick={e => e.preventDefault()}
                onContextMenu={e => e.preventDefault()}
                onMouseDown={e => onMouseDown(e, row, col)}
                onMouseOver={e => onMouseOver(e, row, col)}
                onMouseUp={e => onMouseUp(e, row, col)}
              />
            )}</Index>
          </div>
        )}</Index>
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
          Click on the field with the <b>left mouse button</b> to draw the main emoji.
        </li>
        <li>
          Click on the field with the <b>right mouse button</b> to draw the background emoji.
        </li>
        <li>Hold the mouse button to paint like a brush.</li>
        <li>
          Copy emojis with the <b>copy</b> button and paste them into Slack!
        </li>
      </ul>
      Select emoji:
      <ul>
        <li>
          Click on the <b>main</b> or <b>background</b> emoji to open the emoji menu.
        </li>
        <li>Click on the emoji to select it.</li>
        <li>Right-click on the emoji to add it to favorites.</li>
      </ul>
      Field settings:
      <ul>
        <li>
          Use the <b>width</b> / <b>height</b> to change the field size.
        </li>
        <li>
          Fill the entire field with the background emoji using the <b>Clear with background</b> button.
        </li>
      </ul>
    </div>
	);
}
