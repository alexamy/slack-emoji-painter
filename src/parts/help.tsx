export function Help() {
  return (
    <div>
      Drawing:
      <ul>
        <li>
          Click on the field with the <b>left mouse button</b> to draw the
          foreground emoji.
        </li>
        <li>
          Click on the field with the <b>right mouse button</b> to draw the
          background emoji.
        </li>
        <li>Hold the mouse button to paint like a brush.</li>
        <li>
          Click <b>swap</b> button to swap foreground and background emojis.
        </li>
        <li>
          <i>
            Copy emojis with the <b>copy</b> button and paste them into Slack!
          </i>
        </li>
      </ul>
      Emoji list:
      <ul>
        <li>
          Click on foreground or background emoji to open emoji picker, click
          again to hide.
        </li>
        <li>Click on the emoji to set foreground emoji.</li>
        <li>Right-click on the emoji to to set background emoji.</li>
      </ul>
      Buttons:
      <ul>
        <li>
          <b>Clear</b> button fills the entire field with the background emoji.
        </li>
        <li>
          <b>Copy</b> button copies the field content as text to the clipboard.
        </li>
        <li>
          <b>Load images JSON</b> button loads a JSON file with emojis.
        </li>
        <li>
          The JSON should be structured as an object where each entry consists
          of a "name" key and a corresponding "url" value.
        </li>
      </ul>
      Field settings:
      <ul>
        <li>
          Use the <b>width</b> / <b>height</b> sliders to change the field size.
        </li>
      </ul>
    </div>
  );
}
