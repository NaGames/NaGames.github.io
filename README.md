# NaGames website

Studio site and player hub. Plain HTML, CSS and JavaScript — **no build step, no
dependencies, nothing to install.** Edit a file, refresh the browser, done.

---

## Run it locally

Opening `index.html` straight from the file system mostly works, but `game.html?id=`
and the Roblox data file need a real server. Use either:

```bash
npx serve .
# or
python -m http.server 8765
```

Then open <http://127.0.0.1:8765>. In WebStorm you can also right-click
`index.html` → **Open in Browser**, which starts its built-in server.

---

## Editing the site

**Everything you'll ever change lives in [`data/content.js`](data/content.js).**
You should not need to touch the HTML. Anything left as `TODO` renders on the live
site with a loud dashed gold outline, so unfinished content is impossible to miss.

Search that file for `TODO` to find everything still waiting on you.

### Add a game

Copy a whole `{ ... }` block in the `games` array and change the values:

```js
{
  slug: "tower-defence",        // unique; becomes game.html?id=tower-defence
  name: "Tower Defence",
  placeId: "123456789",         // the number in roblox.com/games/[THIS]/Name
  art: "assets/games/td.png",   // optional local fallback image
  featured: true,               // shows on the homepage
  status: "Live",
  tagline: "One line that makes someone click Play.",
  description: "A longer paragraph for the game's own page.",
  genre: "Tower Defence",
  visits: "",                   // leave empty — filled automatically, see below
  players: "",
  codes: [],
  updates: [],
}
```

### Add a code

Inside that game's `codes` array:

```js
codes: [
  { code: "LAUNCH",  reward: "500 coins",  expired: false },
  { code: "OLDNEWS", reward: "100 coins",  expired: true  },
]
```

Expired codes aren't deleted — they move into a collapsed section at the bottom of
the list, because players search for those too.

### Add a patch note

Inside that game's `updates` array, **at the top** — newest first.

For a small update, a flat list is enough:

```js
{
  date: "2026-11-18",        // optional; YYYY-MM-DD
  version: "v0.9",           // optional gold chip
  title: "Hotfix",
  notes: ["Fixed falling through the floor"],
}
```

For a big one, use `sections` instead of `notes` and it renders with headings:

```js
{
  date: "",
  version: "v0.9",
  title: "Take to the skies",
  summary: "One line under the title.",
  sections: [
    { heading: "Scout Helicopter", notes: ["Seats 4", "Unlocks at Rebirth 3"] },
    { heading: "Fixes",            notes: ["Fixed flickering textures"] },
  ],
}
```

Everything except `title` is optional. Dated entries sort by date and appear
above undated ones; undated entries keep their array order, so adding to the top
always puts a new update first.

---

## Live Roblox data

These all come from Roblox automatically — you don't type any of them in:

| On the site | Pulled from |
|---|---|
| Visit count, players online, favourites | the game's universe |
| Game cover art | the game's thumbnail |
| Total visits (homepage strip) | every game's visits added up |
| Group members (homepage strip) | group `34650790` |
| Games live (homepage strip) | how many games are in `content.js` |
| Team avatars (About page) | each member's `robloxUserId` |

**Why it works the way it does:** Roblox's APIs send no `Access-Control-Allow-Origin`
header, so a browser on a GitHub Pages site is blocked from calling them, and the old
direct-image URL (`roblox.com/asset-thumbnail/image`) now returns 404. The image URLs
Roblox hands out also expire — game thumbnails after 180 days, avatar headshots after
only 30 — so they can't just be pasted in once. The daily refresh is what keeps them
alive.

So instead, [`.github/workflows/refresh-roblox.yml`](.github/workflows/refresh-roblox.yml)
runs [`scripts/fetch-roblox.mjs`](scripts/fetch-roblox.mjs) on GitHub's servers — where
CORS doesn't apply — and commits the results to `data/roblox.json`. That's what the
site reads.

It runs:
- **daily** at 05:17 UTC,
- **whenever you push a change** to `data/content.js`,
- **on demand** from the repo's **Actions** tab → *Refresh Roblox data* → *Run workflow*.

Run it yourself any time:

```bash
node scripts/fetch-roblox.mjs
```

All you ever need to set is `placeId`. If Roblox is unreachable the previous values
are kept rather than overwritten with zeroes, and images fall back through:

1. the live Roblox thumbnail,
2. `art` from `content.js` (a local file — faster, and it never 404s),
3. a built-in gold mascot placeholder.

**A broken image never renders.** Committing local art to `assets/games/` is still
recommended: it loads faster than Roblox's CDN.

If you'd rather set the numbers by hand, just fill in `visits` and `players` in
`content.js` — manual values are used whenever live data is missing.

---

## Deploying to GitHub Pages

1. Push this repo to GitHub.
2. **Settings → Pages → Build and deployment → Deploy from a branch.**
3. Branch `master`, folder `/ (root)`. Save.
4. **Settings → Actions → General → Workflow permissions → Read and write**, so the
   refresh workflow can commit its results.

`.nojekyll` is already present, which stops GitHub stripping files.

### Custom domain

Buy the domain, then add a file called `CNAME` at the repo root containing only:

```
nagames.com
```

Point a `CNAME` DNS record at `<your-username>.github.io`, then tick **Enforce HTTPS**
in Settings → Pages.

### If you deploy to a project page

A **user page** (`nagames.github.io`) works as-is. A **project page**
(`username.github.io/NaGamesWeb/`) needs two edits, because `404.html` is served at
arbitrary path depths and therefore uses root-absolute links:

- in `404.html`, change `href="/"` → `href="/NaGamesWeb/"` and
  `href="/games.html"` → `href="/NaGamesWeb/games.html"`
- in `robots.txt` and `sitemap.xml`, update the URLs

---

## Still to do

- [ ] **Dates for the four updates** — Launch, v0.6, v0.7 and v0.8 are all in
      with full patch notes, but `date: ""`. Fill them in as `YYYY-MM-DD` and
      the date chip appears. Until then they display in the order they sit in
      the array (newest at the top), which is already correct.
- [ ] **redredgavin's part of the About story** — `studio.story[1].text`. His
      byline and avatar are already wired up; just replace the TODO text. Delete
      the whole entry if he'd rather not have one.
- [ ] `studio.email` — a business/press contact address
- [ ] Optional socials in `links`: `roblox`, `youtube`, `tiktok`, `twitter`.
      Empty ones simply don't render, so leaving them blank is fine.
- [ ] Patch notes in the game's `updates` array — the Updates page is empty until
      there's at least one
- [ ] Optional local cover art at `assets/games/blacksteel-arms-tycoon.png`
      (loads faster than Roblox's CDN and is the fallback if Roblox is down)
- [ ] Replace the placeholder URLs in `robots.txt` and `sitemap.xml`
- [ ] Change the `og:image` meta tags to absolute `https://` URLs once you have a
      domain — Discord and X need the full URL to render a link preview
- [ ] Check `assets/logo.svg` against the original mascot and say if the likeness
      needs adjusting

### A note on the Discord handles

`Zer02_` and `blazikenxx` are published on the About page. That's a deliberate
choice and easy to undo — delete the `discord` line from a team member in
`data/content.js` and it disappears. Worth knowing that public handles do attract
unsolicited DMs, including scam attempts aimed at studio accounts. Your call.

---

## File map

| Path | What it is |
|---|---|
| `data/content.js` | **All site content.** The only file you edit routinely. |
| `studio.story` | The About page, one block per person. `by` matches a `team` name, so the role and avatar come from there. |
| `data/roblox.json` | Generated by the workflow. Don't edit by hand. |
| `css/style.css` | All styling. Palette tokens are at the very top in `:root`. |
| `js/site.js` | Shared header and footer, nav, helpers. |
| `js/render.js` | Turns `content.js` into the page. |
| `js/roblox.js` | Reads `roblox.json`, handles the image fallback chain. |
| `scripts/fetch-roblox.mjs` | Talks to Roblox. Runs in CI, or locally via Node. |
| `assets/logo.svg` | The mascot, rebuilt as vector art. |
| `assets/og-image.png` | 1200×630 social share preview. |
| `game.html` | One template for every game, driven by `?id=<slug>`. |

To add a page, copy an existing one and change the `<title>`, `<meta description>`
and the body. The header and footer inject themselves.
