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
        <li>
          Press mouse wheel to add the emoji to favorites (sorry if you dont
          have mouse wheel).
        </li>
        <li>
          Press mouse wheel in favorites list to remove the emoji from
          favorites.
        </li>
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
          <b>Load images JSON</b> button loads a <i>emojis.json</i> from the
          script below.
        </li>
        <li>
          <a
            target="blank"
            href="https://gist.github.com/alexamy/67dac86a9e604f29318982a41f7ab53d"
          >
            This script
          </a>{" "}
          downloads emojis from your Slack.
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
