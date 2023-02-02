# Slack emoji painter

## Paint like a PRO

## Get emojis from you slack

Go to `https://<your-organization>.slack.com/customize/emoji`.

Open developer tools in console tab. Paste and run this code:

```javascript
// get list
const result = {};
let lastVisited = '';
while(true) {
  const list = document.querySelector('.c-virtual_list__scroll_container');
  const emojis = Array.from(list.children);
  const last = emojis[emojis.length - 1];

  if(lastVisited === last.textContent) {
    console.log('Finished. Run `copy(result)` to save emoji list into a clipboard.');
    break;
  }
  lastVisited = last.textContent;

  console.log(`Saving next part...`);
  emojis.forEach(emoji => {
    const src = emoji.querySelector('img').src;
    const name = emoji.querySelector('.c-table_view_row_item .black').textContent.trim();
    result[name] = src;
  });

  last.scrollIntoView();
  await new Promise(resolve => setTimeout(resolve, 2000));
}
copy(result);
```
