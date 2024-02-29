import './App.css';
import { Index, createEffect } from 'solid-js';
import { createStore, produce, unwrap } from 'solid-js/store';

export function App() {
  const [store, setStore] = createStore({
    width: 8,
    height: 4,
    field: [],
    mouse: null, // left / right / none
    fg: ":-satan-:",
    bg: ":12ozmouse-buttermilk:",
    images: {
      ":-satan-:": "https://emoji.slack-edge.com/T47BK6X1U/-satan-/e40cbb4f8726fae4.jpg",
      ":12ozmouse-buttermilk:": "https://emoji.slack-edge.com/T47BK6X1U/12ozmouse-buttermilk/2e626d7ad2ff12bb.png",
    },
  });

  // new images uploaded
  createEffect(() => {
    const first = Object.keys(store.images)[0];
    if(!store.images[store.fg]) {
      setStore("fg", first);
    }
    if(!store.images[store.bg]) {
      setStore("bg", first);
    }
  });

  createEffect(() => console.log(unwrap(store)));

  return (
    <div class="app">
      <CurrentEmoji store={[store, setStore]} />
      <FieldSize store={[store, setStore]} />
      <Field store={[store, setStore]} />
    </div>
  )
}

// current foreground and background emojis
function CurrentEmoji(props) {
  const [store, setStore] = props.store;

  return (
    <div>
      <img
        class="emoji"
        src={store.images[store.fg]}
      />
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
    <div>
      <input
        type='number'
        class="counter"
        value={store.width}
        onInput={e => setStore("width", e.target.value)}
        min={1}
      />
      <input
        type='number'
        class="counter"
        value={store.height}
        onInput={e => setStore("height", e.target.value)}
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
  createEffect(() => {emoji
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
    <div>
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
  );
}
