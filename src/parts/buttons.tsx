import { useStoreContext } from "../context";

export function Buttons() {
  const [store, { clearWith, asText, loadEmojis }] = useStoreContext();

  function clearWithBackground() {
    clearWith(store.bg);
  }

  function copy() {
    console.log("Copied.");
    const text = asText();
    navigator.clipboard.writeText(text);
  }

  function load(file: File | undefined) {
    if (!file) return;
    loadEmojis(file);
  }

  return (
    <div class="buttons">
      <button onClick={copy}>Copy</button>
      <div class="divider"></div>
      <button>
        <label for="files" class="btn">
          Load images JSON
        </label>
      </button>
      <button onClick={clearWithBackground}>Clear</button>
      <input
        id="files"
        type="file"
        accept=".json"
        style={{ visibility: "hidden" }}
        title="Contact authorized personnel to acquire images"
        onChange={(e) => load(e.target.files?.[0])}
      />
    </div>
  );
}
