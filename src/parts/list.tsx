import { createSignal, createMemo, Index } from "solid-js";
import { useStoreContext } from "../context";

export function List() {
  const [store, { setStore }] = useStoreContext();
  const [search, setSearch, filtered] = createFiltered(() => store.images);

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
        <Index each={Object.entries(filtered())}>
          {(entry) => (
            <img
              class="emoji"
              src={entry()[1]}
              title={entry()[0]}
              onContextMenu={(e) => e.preventDefault()}
              onMouseDown={(e) => onMouseDown(e, entry()[0])}
            />
          )}
        </Index>
      </div>
    </div>
  );
}

function createFiltered(items: () => Record<string, string>) {
  const [search, setSearch] = createSignal("");
  const filtered = createMemo(() => {
    if (search() === "") return items();

    const query = search().toLowerCase();
    const result: Record<string, string> = {};
    for (const [name, url] of Object.entries(items())) {
      if (name.includes(query)) {
        result[name] = url;
      }
    }
    return result;
  });

  return [search, setSearch, filtered] as const;
}
