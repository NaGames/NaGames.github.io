/* ==========================================================================
   roblox.js - live Roblox data, with a fallback chain that cannot fail
   --------------------------------------------------------------------------
   The browser never talks to Roblox directly. It cannot: none of Roblox's
   APIs send an Access-Control-Allow-Origin header, so every cross-origin
   request from a GitHub Pages site is blocked, and the old direct-image
   endpoint (roblox.com/asset-thumbnail/image) now returns 404.

   Instead a GitHub Action runs scripts/fetch-roblox.mjs once a day, calls
   those APIs server-side where CORS does not apply, and commits the result
   to data/roblox.json. This file just reads that.

   Thumbnail fallback order:
     1. the Roblox CDN url from data/roblox.json  (fresh, auto-updating)
     2. game.art from data/content.js             (local, fastest, never 404s)
     3. a generated gold mascot placeholder       (so no broken image ever shows)
   ========================================================================== */

(function (NG) {
  let cache = null;

  /** Inline SVG placeholder - no network request, always available. */
  const PLACEHOLDER =
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 768 432">' +
        '<rect width="768" height="432" fill="#1C1C1F"/>' +
        '<g transform="translate(334 166) scale(1)" opacity="0.45">' +
        '<path d="M30 12C42 5 58 6 68 13c10-2 20 5 23 16 5 9 4 21-1 30 2 12-6 23-18 27-10 7-24 8-34 3-12-1-22-9-25-20-7-8-8-21-3-31 2-12 10-22 20-26Z" fill="#D4A24C"/>' +
        '<ellipse cx="37" cy="46" rx="4.6" ry="6.4" fill="#1A1208"/>' +
        '<ellipse cx="63" cy="46" rx="4.6" ry="6.4" fill="#1A1208"/>' +
        '<rect x="34" y="65" width="32" height="5.4" rx="2.7" fill="#1A1208"/>' +
        "</g></svg>"
    );

  const EMPTY = { games: {}, group: null, team: {}, totals: {} };

  /** The whole file: games, group, team avatars, totals. Never rejects. */
  async function loadAll() {
    if (cache) return cache;
    try {
      const res = await fetch("data/roblox.json", { cache: "no-cache" });
      if (!res.ok) throw new Error(res.status);
      cache = { ...EMPTY, ...(await res.json()) };
    } catch (err) {
      console.info("data/roblox.json unavailable - using content.js values only.", err);
      cache = { ...EMPTY };
    }
    return cache;
  }

  /** Just the { slug: {...} } game map, which is what most callers want. */
  async function load() {
    return (await loadAll()).games || {};
  }

  /**
   * Builds an <img> whose src degrades through the chain above.
   * onerror is wired before src is set, so even an instant failure is caught.
   */
  function thumbnail(game, live, alt) {
    const img = document.createElement("img");
    img.alt = alt || "";
    img.loading = "lazy";
    img.decoding = "async";
    img.width = 768;
    img.height = 432;

    const chain = [live?.thumbnail, game?.art, PLACEHOLDER].filter(Boolean);
    let step = 0;

    img.addEventListener("error", () => {
      step += 1;
      if (step < chain.length) img.src = chain[step];
    });

    img.src = chain[0];
    return img;
  }

  /** Live values win; the manual values in content.js are the fallback. */
  function stats(game, live) {
    return {
      visits: live?.visits != null ? NG.fmtNum(live.visits) : game.visits || "",
      players: live?.playing != null ? NG.fmtNum(live.playing) : game.players || "",
      favorites: live?.favorites != null ? NG.fmtNum(live.favorites) : "",
      isLive: Boolean(live && live.visits != null),
    };
  }

  NG.roblox = { load, loadAll, thumbnail, stats, PLACEHOLDER };
})(window.NG);
