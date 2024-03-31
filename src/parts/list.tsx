import { createSignal, createMemo, Index, Show } from "solid-js";
import rfdc from "rfdc";
import { useStoreContext } from "../context";
import { EmojiData } from "../store";

type Sorting = "none" | "name" | "date" | "author";

export function List() {
  const [store, { setStore }] = useStoreContext();
  const [search, setSearch, filtered] = createFiltered(() => store.emojis);
  const [sorting, setSorting, sorted] = createSorted(filtered);

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
        <input
          onChange={() => setSorting("none")}
          checked={sorting() === "none"}
          type="radio"
          name="sort"
          id="none"
          value="none"
        />
        <label for="none">None</label>
        <input
          onChange={() => setSorting("name")}
          checked={sorting() === "name"}
          type="radio"
          name="sort"
          id="name"
          value="name"
        />
        <label for="none">Name</label>
        <input
          onChange={() => setSorting("date")}
          checked={sorting() === "date"}
          type="radio"
          name="sort"
          id="date"
          value="date"
        />
        <label for="none">Date</label>
        <input
          onChange={() => setSorting("author")}
          checked={sorting() === "author"}
          type="radio"
          name="sort"
          id="author"
          value="author"
        />
        <label for="none">Author</label>
      </div>
      <EmojiList emojis={sorted()} sorting={sorting()} />
    </div>
  );
}

function EmojiList(props: { emojis: EmojiData[]; sorting: Sorting }) {
  const [store, { setStore }] = useStoreContext();
  const groups = createMemo(() => {
    return [{ header: "", emojis: props.emojis }];
  });
  const withHeaders = createMemo(() => {
    return ["none", "name"].includes(props.sorting);
  });

  function selectEmoji(e: MouseEvent, name: string) {
    e.preventDefault();
    if (e.button === 0) setStore("fg", name);
    if (e.button === 2) setStore("bg", name);
  }

  return (
    <div
      class="emojis"
      style={{
        "--emoji-width": `${store.emojiSize}px`,
        "--emoji-height": `${store.emojiSize}px`,
      }}
    >
      <Index each={groups()}>
        {(group) => (
          <>
            <Show when={withHeaders()}>
              <div>{group().header}</div>
            </Show>
            <Index each={group().emojis}>
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
          </>
        )}
      </Index>
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

function createSorted(items: () => EmojiData[]) {
  const [sorting, setSorting] = createSignal<Sorting>("none");
  const sorted = createMemo(() => {
    const result = rfdc()(items());
    const key = sorting();
    if (key === "none") return result;

    result.sort((a, b) => {
      if (a[key] < b[key]) return -1;
      if (a[key] > b[key]) return 1;
      return 0;
    });
    return result;
  });

  return [sorting, setSorting, sorted] as const;
}
