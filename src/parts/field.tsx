import { Index } from "solid-js";
import { useStoreContext } from "../context";

export function Field() {
  const [store, { setStore, drawCell }] = useStoreContext();

  function onMouseDown(e: MouseEvent, row: number, col: number) {
    e.preventDefault();
    setStore("mouse", () => {
      if (e.button === 0) return "left";
      if (e.button === 2) return "right";
      return null;
    });
    drawCell(row, col);
  }

  function onMouseOver(e: MouseEvent, row: number, col: number) {
    e.preventDefault();
    drawCell(row, col);
  }

  function onMouseUp(e: MouseEvent) {
    e.preventDefault();
    setStore("mouse", null);
  }

  return (
    <div onContextMenu={(e) => e.preventDefault()}>
      <div class="field" onMouseLeave={onMouseUp}>
        <Index each={store.field}>
          {(emojis, row) => (
            <div>
              <Index each={emojis()}>
                {(cell, col) => (
                  <img
                    class="emoji"
                    src={store.images[cell()].src}
                    onClick={(e) => e.preventDefault()}
                    onContextMenu={(e) => e.preventDefault()}
                    onMouseDown={(e) => onMouseDown(e, row, col)}
                    onMouseOver={(e) => onMouseOver(e, row, col)}
                    onMouseUp={(e) => onMouseUp(e)}
                  />
                )}
              </Index>
            </div>
          )}
        </Index>
      </div>
    </div>
  );
}
