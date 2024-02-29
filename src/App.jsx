import { Index, createContext, createEffect, useContext } from 'solid-js';
import './App.css';
import { createStore, produce, unwrap } from 'solid-js/store';

const AppContext = createContext([]);

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

  // uploaded new images
  createEffect(() => {
    const first = Object.keys(store.images)[0];
    setStore("currentFg", first);
    setStore("currentBg", first);
  });

  createEffect(() => console.log(unwrap(store)));

  return (
    <>
      <AppContext.Provider value={[store, setStore]}>
      <Field />
      </AppContext.Provider>
    </>
  )
}

function Field() {
  const [store, setStore] = useContext(AppContext);

  // change the height of the field
  createEffect(() => {
    setStore("field", produce(field => {
      if(store.height < field.length) {
        field.length = store.height;
      } else {
        for(let i = field.length; i < store.height; i++) {
          field.push([]);
        }
      }
    }));
  });

  // change the width of the field
  createEffect(() => {
    setStore("field", produce(field => {
      if(store.width < field[0].length) {
        field.forEach(col => col.length = store.width);
      } else {
        field.forEach(col => {
          for(let i = col.length; i < store.width; i++) {
            col.push(store.currentBg);
          }
        });
      }
    }));
  });

  return (
    <Index each={store.field}>{(row) => (
      <div class="row">
        <Index each={row()}>{(cell) => (
          <img
            class="emoji"
            src={store.images[cell()]}
          />
        )}</Index>
      </div>
    )}</Index>
  );
}
