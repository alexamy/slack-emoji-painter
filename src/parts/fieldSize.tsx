import { useStoreContext } from "../context";

export function FieldSize() {
  const [store, { setStore }] = useStoreContext();

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
