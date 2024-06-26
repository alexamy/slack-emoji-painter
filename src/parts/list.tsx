import { createSignal, createMemo, Index, Show } from "solid-js";
import rfdc from "rfdc";
import { useStoreContext } from "../context";
import { EmojiData } from "../store";

type Sorting = "none" | "name" | "date" | "author";

export function List() {
  const [store, { setStore }] = useStoreContext();
  const [descending, setDescending] = createSignal(false);
  const [search, setSearch, filtered] = createFiltered(() => store.emojis);
  const [sorting, setSorting, sorted] = createSorted(filtered, descending);

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
        <label>Sort:</label>
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
        <label for="name">Name</label>
        <input
          onChange={() => setSorting("date")}
          checked={sorting() === "date"}
          type="radio"
          name="sort"
          id="date"
          value="date"
        />
        <label for="date">Date</label>
        <input
          onChange={() => setSorting("author")}
          checked={sorting() === "author"}
          type="radio"
          name="sort"
          id="author"
          value="author"
        />
        <label for="author">Author</label>
        <input
          onChange={() => setDescending((value) => !value)}
          checked={descending()}
          disabled={sorting() === "none"}
          type="checkbox"
          name="descending"
          id="descending"
        />
        <label for="descending">Descending</label>
      </div>
      <EmojiList emojis={sorted()} sorting={sorting()} />
    </div>
  );
}

function EmojiList(props: { emojis: EmojiData[]; sorting: Sorting }) {
  const [store, { setStore, addFavorite, removeFavorite }] = useStoreContext();
  const groups = createGroups(
    () => props.emojis,
    () => props.sorting,
  );

  function onMouseDown(
    e: MouseEvent,
    name: string,
    place: "favorites" | "list",
  ) {
    e.preventDefault();
    if (e.button === 0) setStore("fg", name);
    if (e.button === 2) setStore("bg", name);
    if (e.button === 1) {
      if (place === "favorites") removeFavorite(name);
      else if (place === "list") addFavorite(name);
    }
  }

  return (
    <div
      style={{
        "--emoji-width": `${store.emojiSize}px`,
        "--emoji-height": `${store.emojiSize}px`,
      }}
    >
      <div class="emoji-group">
        <div>Favorites</div>
        <div class="emojis">
          <Index each={store.favorites}>
            {(name) => (
              <img
                class="emoji emoji-in-list"
                src={store.images[name()].src}
                title={getEmojiTitle(store.images[name()])}
                onContextMenu={(e) => e.preventDefault()}
                onMouseDown={(e) => onMouseDown(e, name(), "favorites")}
              />
            )}
          </Index>
        </div>
      </div>
      <Index each={groups()}>
        {(group) => (
          <div class="emoji-group">
            <div>{group().header}</div>
            <div class="emojis">
              <Index each={group().emojis}>
                {(emoji) => (
                  <img
                    class="emoji emoji-in-list"
                    src={emoji().src}
                    title={getEmojiTitle(emoji())}
                    onContextMenu={(e) => e.preventDefault()}
                    onMouseDown={(e) => onMouseDown(e, emoji().name, "list")}
                  />
                )}
              </Index>
            </div>
          </div>
        )}
      </Index>
    </div>
  );
}

function getEmojiTitle(e: EmojiData) {
  return `${e.name}\n${e.date}\n${e.author}`;
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

function createSorted(items: () => EmojiData[], descending: () => boolean) {
  const [sorting, setSorting] = createSignal<Sorting>("none");
  const sorted = createMemo(() => {
    const result = rfdc()(items());
    const key = sorting();
    if (key === "none") return result;

    result.sort((a, b) => {
      if (a[key] < b[key]) return descending() ? 1 : -1;
      if (a[key] > b[key]) return descending() ? -1 : 1;
      return 0;
    });
    return result;
  });

  return [sorting, setSorting, sorted] as const;
}

interface EmojiGroup {
  header: string;
  emojis: EmojiData[];
}

function createGroups(sorted: () => EmojiData[], sorting: () => Sorting) {
  const groups = createMemo(() => {
    const key = sorting();

    if (key === "none" || key === "name") {
      return [{ header: "Emojis", emojis: sorted() }];
    } else {
      const result: EmojiGroup[] = [];
      let current: EmojiGroup | undefined = undefined;

      for (const emoji of sorted()) {
        const header = emoji[key];
        if (current && current.header === header) {
          current.emojis.push(emoji);
        } else {
          if (current) result.push(current);
          current = { header, emojis: [emoji] };
        }
      }
      if (current) result.push(current);

      return result;
    }
  });

  return groups;
}
