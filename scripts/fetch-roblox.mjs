/* ==========================================================================
   fetch-roblox.mjs
   --------------------------------------------------------------------------
   Reads the placeIds out of data/content.js, asks Roblox for each game's
   live stats and thumbnail, and writes the result to data/roblox.json.

   Why this exists: Roblox's APIs send no Access-Control-Allow-Origin header,
   so a browser on nagames.github.io cannot call them directly - every request
   is blocked by CORS. Running the same calls from GitHub Actions has no such
   restriction. The committed JSON is what the site actually reads.

   Thumbnail URLs returned by Roblox expire after 180 days, which is the other
   reason this cannot simply be hardcoded once.

   Run locally:  node scripts/fetch-roblox.mjs
   Runs in CI:   .github/workflows/refresh-roblox.yml (daily)

   No dependencies. Needs Node 18+ for built-in fetch.
   ========================================================================== */

import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = path.join(ROOT, "data", "content.js");
const OUTPUT = path.join(ROOT, "data", "roblox.json");

const THUMB_SIZE = "768x432";

/* -------------------------------------------------------------- helpers -- */

async function getJson(url) {
  const res = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "NaGames-site-builder" },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

/** content.js assigns to `window`, so give it one and read the result back. */
async function loadContent() {
  const src = await readFile(CONTENT, "utf8");
  const sandbox = {};
  new Function("window", src)(sandbox);
  const content = sandbox?.NAGAMES;
  if (!content || !Array.isArray(content.games)) {
    throw new Error("No NAGAMES.games array found in data/content.js");
  }
  return content;
}

/** Keep whatever we already had, so one bad API call never wipes good data. */
async function loadPrevious() {
  if (!existsSync(OUTPUT)) return { games: {}, team: {}, group: null, totals: {} };
  try {
    const prev = JSON.parse(await readFile(OUTPUT, "utf8"));
    return { games: {}, team: {}, group: null, totals: {}, ...prev };
  } catch {
    return { games: {}, team: {}, group: null, totals: {} };
  }
}

/** Group member count. Also CORS-blocked in the browser, so it belongs here. */
async function fetchGroup(groupId, previous) {
  if (!groupId) return previous;
  try {
    const g = await getJson(`https://groups.roblox.com/v1/groups/${groupId}`);
    console.log(`group     ${g.name}  members=${g.memberCount}`);
    return {
      id: String(groupId),
      name: g.name ?? previous?.name ?? null,
      memberCount: g.memberCount ?? previous?.memberCount ?? null,
      fetchedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.warn(`WARN  group ${groupId}: ${err.message}`);
    return previous;
  }
}

/**
 * Avatar headshots for the team.
 * These URLs carry a 30DAY- prefix and genuinely expire, which is why they
 * are refreshed on the daily cron rather than pasted in once.
 */
async function fetchAvatars(team, previous) {
  const ids = (team || [])
    .map((m) => String(m.robloxUserId || "").trim())
    .filter(Boolean);
  if (!ids.length) return previous;

  try {
    const res = await getJson(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${ids.join(
        ","
      )}&size=150x150&format=Png`
    );
    const out = { ...previous };
    for (const t of res.data || []) {
      if (t.state === "Completed" && t.imageUrl) out[String(t.targetId)] = t.imageUrl;
    }
    console.log(`avatars   ${Object.keys(out).length} of ${ids.length} resolved`);
    return out;
  } catch (err) {
    console.warn(`WARN  avatars: ${err.message}`);
    return previous;
  }
}

/* ----------------------------------------------------------------- main -- */

async function main() {
  const content = await loadContent();
  const games = content.games;
  const previous = await loadPrevious();

  // group and avatars are independent of the games, so fetch them either way
  const group = await fetchGroup(content.groupId, previous.group);
  const team = await fetchAvatars(content.team, previous.team);

  const targets = games.filter((g) => g.slug && String(g.placeId || "").trim());

  if (targets.length === 0) {
    console.log("No games with a placeId in data/content.js yet - skipping game stats.");
    await writeFile(
      OUTPUT,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          games: previous.games || {},
          group,
          team,
          totals: previous.totals || {},
        },
        null,
        2
      ) + "\n"
    );
    return;
  }

  // 1. placeId -> universeId (one request each; there is no batch endpoint)
  const resolved = [];
  for (const game of targets) {
    try {
      const { universeId } = await getJson(
        `https://apis.roblox.com/universes/v1/places/${game.placeId}/universe`
      );
      if (!universeId) throw new Error("no universeId returned");
      resolved.push({ ...game, universeId });
      console.log(`resolved  ${game.slug}  place ${game.placeId} -> universe ${universeId}`);
    } catch (err) {
      console.warn(`WARN  ${game.slug}: could not resolve placeId - ${err.message}`);
    }
  }

  if (resolved.length === 0) {
    console.warn("No placeId resolved. Keeping previous game stats, writing group/avatars.");
    await writeFile(
      OUTPUT,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          games: previous.games || {},
          group,
          team,
          totals: previous.totals || {},
        },
        null,
        2
      ) + "\n"
    );
    return;
  }

  const ids = resolved.map((g) => g.universeId).join(",");

  // 2. stats and thumbnails, both batched into a single request each
  const [details, thumbs] = await Promise.all([
    getJson(`https://games.roblox.com/v1/games?universeIds=${ids}`).catch((e) => {
      console.warn(`WARN  stats request failed - ${e.message}`);
      return { data: [] };
    }),
    getJson(
      `https://thumbnails.roblox.com/v1/games/multiget/thumbnails?universeIds=${ids}&size=${THUMB_SIZE}&format=Png`
    ).catch((e) => {
      console.warn(`WARN  thumbnail request failed - ${e.message}`);
      return { data: [] };
    }),
  ]);

  const detailById = new Map((details.data || []).map((d) => [d.id, d]));
  const thumbById = new Map((thumbs.data || []).map((t) => [t.universeId, t]));

  // 3. merge over whatever we had before
  const out = { ...(previous.games || {}) };

  for (const game of resolved) {
    const detail = detailById.get(game.universeId);
    const thumb = thumbById.get(game.universeId);
    const image = thumb?.thumbnails?.find((t) => t.state === "Completed")?.imageUrl;
    const prev = out[game.slug] || {};

    out[game.slug] = {
      universeId: game.universeId,
      placeId: String(game.placeId),
      // fall back to the previous value rather than writing a zero
      name: detail?.name ?? prev.name ?? null,
      playing: detail?.playing ?? prev.playing ?? null,
      visits: detail?.visits ?? prev.visits ?? null,
      favorites: detail?.favoritedCount ?? prev.favorites ?? null,
      maxPlayers: detail?.maxPlayers ?? prev.maxPlayers ?? null,
      thumbnail: image ?? prev.thumbnail ?? null,
      fetchedAt: new Date().toISOString(),
    };

    const stats = out[game.slug];
    console.log(
      `fetched   ${game.slug}  ${stats.name ?? "?"}  ` +
        `playing=${stats.playing ?? "?"}  visits=${stats.visits ?? "?"}  ` +
        `thumb=${stats.thumbnail ? "yes" : "NO"}`
    );
  }

  // 4. studio-wide totals for the homepage stat strip
  const visitValues = Object.values(out)
    .map((g) => g.visits)
    .filter((v) => typeof v === "number");

  const totals = {
    visits: visitValues.length ? visitValues.reduce((a, b) => a + b, 0) : null,
    games: Object.keys(out).length,
  };
  console.log(`totals    visits=${totals.visits ?? "?"}  games=${totals.games}`);

  await writeFile(
    OUTPUT,
    JSON.stringify(
      { generatedAt: new Date().toISOString(), games: out, group, team, totals },
      null,
      2
    ) + "\n"
  );
  console.log(`\nWrote ${path.relative(ROOT, OUTPUT)} (${Object.keys(out).length} games).`);
}

main().catch((err) => {
  console.error("fetch-roblox failed:", err);
  process.exit(1);
});
