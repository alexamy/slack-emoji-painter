import { useStoreContext } from "../context";

export function CurrentEmoji() {
  const [store, { setStore }] = useStoreContext();

  function switchList(e: MouseEvent) {
    e.preventDefault();
    setStore("isListOpened", !store.isListOpened);
    window.scrollTo(0, 0);
  }

  function swap() {
    setStore({ fg: store.bg, bg: store.fg });
  }

  return (
    <div class="current-emoji">
      Foreground:
      <img
        class="emoji"
        src={store.images[store.fg]}
        onClick={switchList}
        onContextMenu={switchList}
      />
      Background:
      <img
        class="emoji"
        src={store.images[store.bg]}
        onClick={switchList}
        onContextMenu={switchList}
      />
      <button onClick={swap}>Swap</button>
    </div>
  );
}
