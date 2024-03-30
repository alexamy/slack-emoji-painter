import { createSignal, createMemo, Index } from "solid-js";
import { useStoreContext } from "../context";

export function List() {
  const [store, { setStore }] = useStoreContext();
  const [search, setSearch, filtered] = createFiltered(() => store.emojis);

  function selectEmoji(e: MouseEvent, name: string) {
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
      <div class="toolbar">
        <label for="emoji-size">Size:</label>
        <input
          class="emoji-size"
          id="emoji-size"
          min={8}
          type="number"
          value={store.emojiSize}
          onInput={(e) => setStore("emojiSize", parseInt(e.target.value))}
        />
        <label for="sort">Sort:</label>
        <input type="radio" name="sort" id="none" value="none" checked />
        <label for="none">None</label>
        <input type="radio" name="sort" id="name" value="name" />
        <label for="none">Name</label>
        <input type="radio" name="sort" id="date" value="date" />
        <label for="none">Date</label>
        <input type="radio" name="sort" id="author" value="author" />
        <label for="none">Author</label>
      </div>
      <div
        class="emojis"
        style={{
          "--emoji-width": `${store.emojiSize}px`,
          "--emoji-height": `${store.emojiSize}px`,
        }}
      >
        <Index each={filtered()}>
          {(entry) => (
            <img
              class="emoji emoji-in-list"
              src={entry().src}
              title={entry().name}
              onContextMenu={(e) => e.preventDefault()}
              onMouseDown={(e) => selectEmoji(e, entry().name)}
            />
          )}
        </Index>
      </div>
    </div>
  );
}

function createFiltered<T extends { name: string }>(items: () => T[]) {
  const [search, setSearch] = createSignal("");
  const filtered = createMemo(() => {
    if (search() === "") return items();
    const query = search().toLowerCase();
    const result = items().filter((item) => item.name.includes(query));
    return result;
  });

  return [search, setSearch, filtered] as const;
}
