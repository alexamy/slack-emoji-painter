import './App.css';
import { Index, createEffect } from 'solid-js';
import { createStore, produce, unwrap } from 'solid-js/store';

export function App() {
  const [store, setStore] = createStore({
    width: 8,
    height: 4,
    field: [],
    currentFg: ":-satan-:",
    currentBg: ":12ozmouse-buttermilk:",
    images: {
      ":-satan-:": "https://emoji.slack-edge.com/T47BK6X1U/-satan-/e40cbb4f8726fae4.jpg",
      ":12ozmouse-buttermilk:": "https://emoji.slack-edge.com/T47BK6X1U/12ozmouse-buttermilk/2e626d7ad2ff12bb.png",
    },
  });

  // new images uploaded
  createEffect(() => {
    const first = Object.keys(store.images)[0];
    if(!store.images[store.currentFg]) {
      setStore("currentFg", first);
    }
    if(!store.images[store.currentBg]) {
      setStore("currentBg", first);
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
        src={store.images[store.currentFg]}
      />
      <img
        class="emoji"
        src={store.images[store.currentBg]}
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
  createEffect(() => {
    setStore("field", produce(field => {
      if(store.width < field[0].length) {
        field.forEach(col => col.length = store.width);
      } else if (store.width > field[0].length) {
        field.forEach(col => {
          for(let i = col.length; i < store.width; i++) {
            col.push(store.currentBg);
          }
        });
      }
    }));
  });

  function changeCell(e, row, col, emoji) {
    e.preventDefault();
    setStore("field", produce(field => {
      field[row][col] = emoji;
    }));
  }

  return (
    <div>
      <Index each={store.field}>{(emojis, row) => (
        <div class="row">
          <Index each={emojis()}>{(cell, col) => (
            <img
              class="emoji"
              src={store.images[cell()]}
              onClick={(e, ) => changeCell(e, row, col, store.currentFg)}
              onContextMenu={(e, ) => changeCell(e, row, col, store.currentBg)}
            />
          )}</Index>
        </div>
      )}</Index>
    </div>
  );
}
