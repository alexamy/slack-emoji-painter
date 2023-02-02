# Slack emoji painter

> Paint like a Pro

## Get emojis from your slack

Go to `https://<your-organization>.slack.com/customize/emoji`.

Open developer tools in console tab. Paste and run this code:

```javascript
const result = {};
const allCount = parseInt(document.querySelector('.p-customize_emoji_wrapper__count').textContent);
let lastVisited = '';
const log = (s) => console.log('[SEP] %c%s', 'background: #2f3640; color: #00a8ff; font-weight: bold; font-size: 18px; padding: 1px', s);
while(true) {
  const list = document.querySelector('.c-virtual_list__scroll_container');
  const emojis = Array.from(list.children);

  emojis.forEach(emoji => {
    const src = emoji.querySelector('img').src;
    const name = emoji.querySelector('.c-table_view_row_item .black').textContent.trim();
    result[name] = src;
  });
  log(`Emojis saved: ${Object.keys(result).length}/${allCount}...`);

  const last = emojis.slice(-5)[0];
  if(lastVisited === last.textContent) {
    log('Finished. Run `copy(result)` to save emoji list into a clipboard.');
    break;
  }
  lastVisited = last.textContent;

  last.scrollIntoView();
  await new Promise(resolve => setTimeout(resolve, 2000));
}
```

Wait until saving is done. When run `copy(result)` to copy emojis list to clipboard.
