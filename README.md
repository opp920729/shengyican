# 省一餐

今天吃什麼最划算。台灣連鎖餐飲優惠，每天早上自動更新，依 CP 值排名。

- `index.html`：網站本體
- `deals.json`：優惠資料（每天由排程更新）
- `manifest.webmanifest`、`sw.js`、`icon-*`：手機加到主畫面用

`deals.json` 格式：`{ "updatedAt": "YYYY/MM/DD HH:mm", "deals": [ {id, brand, cat, meals, title, price, orig, people, pct, gift, how, code, ends, regions, pay, note, src, mapq, buy, buyName}, ... ] }`
