import { createSignal, createMemo, For } from "solid-js";
import { useStoreContext } from "../context";

export function List() {
  const [store, { setStore }] = useStoreContext();

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
    <div class="list" style={{ display: store.isListOpened ? "flex" : "none" }}>
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
