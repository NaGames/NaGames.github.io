/* ==========================================================================
   render.js - turns data/content.js into the page
   --------------------------------------------------------------------------
   Every renderable region is marked up in the HTML as:
       <div data-render="games"></div>
   This file finds those and fills them. Nothing here is page-specific beyond
   that, so adding a region to a page needs no JS changes.
   ========================================================================== */

(function (NG) {
  const d = NG.data || {};

  /* ----------------------------------------------------------- fragments -- */

  function gameCard(game, live) {
    const card = document.createElement("a");
    card.className = "game-card";
    card.href = NG.gameUrl(game);

    const media = document.createElement("div");
    media.className = "game-card__media";
    media.appendChild(NG.roblox.thumbnail(game, live, `${game.name} cover art`));

    if (game.status) {
      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = game.status;
      media.appendChild(badge);
    }

    const s = NG.roblox.stats(game, live);
    const meta = [
      s.visits ? `<span><b>${NG.esc(s.visits)}</b> visits</span>` : "",
      s.players ? `<span><b>${NG.esc(s.players)}</b> playing</span>` : "",
      !s.visits && !s.players && game.genre ? `<span>${NG.text(game.genre)}</span>` : "",
    ]
      .filter(Boolean)
      .join("");

    const body = document.createElement("div");
    body.className = "game-card__body";
    body.innerHTML = `
      <h3>${NG.text(game.name)}</h3>
      <p class="game-card__desc">${NG.text(game.tagline)}</p>
      ${meta ? `<div class="game-card__meta">${meta}</div>` : ""}`;

    card.append(media, body);
    return card;
  }

  /**
   * Copies text to the clipboard, defensively.
   *
   * navigator.clipboard.writeText can hang forever - neither resolving nor
   * rejecting - when the clipboard permission is blocked or the document is
   * not properly focused. Awaiting it unguarded means the caller never
   * continues and the button dies silently, so it is always raced against a
   * timeout and falls back to the old execCommand path.
   *
   * Returns true if the text definitely made it to the clipboard.
   */
  async function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await Promise.race([
          navigator.clipboard.writeText(text),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("clipboard timed out")), 600)
          ),
        ]);
        return true;
      } catch {
        /* blocked, unfocused or hung - fall through to the legacy path */
      }
    }

    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none";
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, ta.value.length);
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    ta.remove();
    return ok;
  }

  /** Last resort: select the code so the reader can copy it by hand. */
  function selectText(el) {
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function codeRow(entry) {
    const row = document.createElement("div");
    row.className = "code-row" + (entry.expired ? " code-row--expired" : "");
    row.innerHTML = `
      <code class="code-row__code">${NG.esc(entry.code)}</code>
      <span class="code-row__reward">${NG.text(entry.reward)}</span>`;

    if (!entry.expired) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn--sm copy-btn";
      btn.textContent = "Copy";
      btn.addEventListener("click", async () => {
        if (btn.dataset.busy === "1") return;
        btn.dataset.busy = "1";

        const ok = await copyText(entry.code);

        if (ok) {
          btn.textContent = "Copied";
          btn.classList.add("is-copied");
        } else {
          // both paths failed - highlight the code so it can be copied manually
          btn.textContent = "Select it";
          selectText(row.querySelector(".code-row__code"));
        }

        setTimeout(() => {
          btn.textContent = "Copy";
          btn.classList.remove("is-copied");
          btn.dataset.busy = "";
        }, 1600);
      });
      row.appendChild(btn);
    } else {
      const tag = document.createElement("span");
      tag.className = "update__date";
      tag.textContent = "Expired";
      row.appendChild(tag);
    }
    return row;
  }

  const noteList = (notes) =>
    (notes || []).length
      ? `<ul>${notes.map((n) => `<li>${NG.text(n)}</li>`).join("")}</ul>`
      : "";

  /**
   * One patch note.
   *
   * Takes either a flat `notes` array for small updates, or `sections`
   * ([{ heading, notes }]) for big ones. `date` is optional - the chip is
   * simply left off when there isn't one yet.
   */
  function updateCard(update, showGame) {
    const el = document.createElement("article");
    el.className = "update";
    el.dataset.game = update.game?.slug || "";

    const date = String(update.date || "").trim();

    const body = (update.sections || []).length
      ? (update.sections || [])
          .map(
            (s) => `<section class="update__section">
              <h4>${NG.text(s.heading)}</h4>
              ${noteList(s.notes)}
            </section>`
          )
          .join("")
      : noteList(update.notes);

    el.innerHTML = `
      <div class="update__top">
        ${update.version ? `<span class="update__version">${NG.text(update.version)}</span>` : ""}
        ${date ? `<span class="update__date">${NG.fmtDate(date)}</span>` : ""}
        ${showGame && update.game ? `<span class="update__game">${NG.text(update.game.name)}</span>` : ""}
      </div>
      <h3>${NG.text(update.title)}</h3>
      ${update.summary ? `<p class="update__summary">${NG.text(update.summary)}</p>` : ""}
      ${body}`;
    return el;
  }

  const empty = (msg) => `<div class="empty">${NG.esc(msg)}</div>`;

  /* ----------------------------------------------------------- renderers -- */

  const renderers = {
    /* homepage stat strip. `source` pulls the number live; `num` is the fallback. */
    async stats(host) {
      const rows = (d.stats || []).filter((s) => s && (s.num || s.source));
      if (!rows.length) return host.remove();

      const live = await NG.roblox.loadAll();
      const sources = {
        totalVisits: live.totals?.visits,
        groupMembers: live.group?.memberCount,
        gameCount: live.totals?.games ?? (d.games || []).length,
      };

      host.className = "stats";
      host.innerHTML = rows
        .map((s) => {
          const fromLive = s.source ? sources[s.source] : undefined;
          const value =
            fromLive !== undefined && fromLive !== null ? NG.fmtNum(fromLive) : s.num;
          return `<div class="stat">
            <div class="stat__num">${NG.text(value)}</div>
            <div class="stat__label">${NG.esc(s.label)}</div>
          </div>`;
        })
        .join("");
    },

    /* game grid. data-featured="true" limits it to featured games. */
    async games(host) {
      const onlyFeatured = host.dataset.featured === "true";
      let games = d.games || [];
      if (onlyFeatured) {
        const featured = games.filter((g) => g.featured);
        if (featured.length) games = featured;
      }
      if (!games.length) {
        host.innerHTML = empty("No games listed yet. Add one in data/content.js.");
        return;
      }

      const live = await NG.roblox.load();
      host.className = "game-grid";
      host.dataset.count = String(games.length);
      host.innerHTML = "";
      games.forEach((g) => host.appendChild(gameCard(g, live[g.slug])));
    },

    /* every code across every game, grouped by game */
    codes(host) {
      const games = (d.games || []).filter((g) => (g.codes || []).length);
      if (!games.length) {
        host.innerHTML = empty(
          "No codes right now. When you add some to data/content.js they show up here."
        );
        return;
      }

      host.innerHTML = "";
      for (const game of games) {
        const active = game.codes.filter((c) => !c.expired);
        const expired = game.codes.filter((c) => c.expired);

        const group = document.createElement("section");
        group.className = "code-group";
        group.innerHTML = `
          <div class="code-group__head">
            <h3>${NG.text(game.name)}</h3>
            <a class="btn btn--ghost btn--sm" href="${NG.gameUrl(game)}">Game page</a>
          </div>
          ${
            game.redeem
              ? `<p class="redeem">Redeem at <b>${NG.text(game.redeem)}</b></p>`
              : ""
          }`;

        const list = document.createElement("div");
        list.className = "code-list";
        if (active.length) {
          active.forEach((c) => list.appendChild(codeRow(c)));
        } else {
          list.innerHTML = empty("No active codes for this game right now.");
        }
        group.appendChild(list);

        if (expired.length) {
          const details = document.createElement("details");
          details.className = "expired-wrap";
          details.innerHTML = `<summary>${expired.length} expired code${
            expired.length === 1 ? "" : "s"
          }</summary>`;
          const exList = document.createElement("div");
          exList.className = "code-list";
          expired.forEach((c) => exList.appendChild(codeRow(c)));
          details.appendChild(exList);
          group.appendChild(details);
        }

        host.appendChild(group);
      }
    },

    /* patch notes. data-limit="3" trims it for the homepage. */
    updates(host) {
      const limit = parseInt(host.dataset.limit || "0", 10);
      let updates = NG.allUpdates();
      if (!updates.length) {
        host.innerHTML = empty("No updates posted yet. Add them per game in data/content.js.");
        return;
      }
      if (limit > 0) updates = updates.slice(0, limit);

      host.className = "update-list";
      host.innerHTML = "";
      updates.forEach((u) => host.appendChild(updateCard(u, true)));
    },

    /* filter buttons for the updates page */
    "updates-filter"(host) {
      const games = (d.games || []).filter((g) => (g.updates || []).length);
      if (games.length < 2) return host.remove();

      host.className = "filter-bar";
      host.innerHTML =
        `<button type="button" class="is-active" data-filter="">All</button>` +
        games
          .map((g) => `<button type="button" data-filter="${NG.esc(g.slug)}">${NG.text(g.name)}</button>`)
          .join("");

      host.addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;
        host.querySelectorAll("button").forEach((b) => b.classList.toggle("is-active", b === btn));
        const want = btn.dataset.filter;
        document.querySelectorAll(".update").forEach((card) => {
          card.style.display = !want || card.dataset.game === want ? "" : "none";
        });
      });
    },

    async team(host) {
      const team = d.team || [];
      if (!team.length) {
        const section = host.closest("section");
        return section ? section.remove() : host.remove();
      }

      // live Roblox headshots, keyed by user id; manual avatar is the fallback
      const avatars = (await NG.roblox.loadAll()).team || {};

      host.className = "team-grid";
      host.innerHTML = team
        .map((m) => {
          const src = avatars[String(m.robloxUserId)] || m.avatar || "assets/logo.svg";
          const discord = m.discord
            ? `<p class="member__handle">${NG.esc(m.discord)} on Discord</p>`
            : "";
          const inner = `
            <img class="member__avatar" src="${NG.esc(src)}" alt="" width="68" height="68"
                 onerror="this.onerror=null;this.src='assets/logo.svg'">
            <p class="member__name">${NG.text(m.name)}</p>
            <p class="member__role">${NG.text(m.role)}</p>
            ${discord}`;
          return m.link
            ? `<a class="member" href="${NG.esc(m.link)}" target="_blank" rel="noopener">${inner}</a>`
            : `<div class="member">${inner}</div>`;
        })
        .join("");
    },

    /* "What we do" cards - the studio is not Roblox-only */
    services(host) {
      const services = d.services || [];
      if (!services.length) {
        const section = host.closest("section");
        return section ? section.remove() : host.remove();
      }

      host.className = "service-grid";
      host.innerHTML = services
        .map((s) => {
          const link =
            s.link && s.linkLabel
              ? `<a class="btn btn--ghost btn--sm" href="${NG.esc(s.link)}">${NG.text(
                  s.linkLabel
                )}</a>`
              : "";
          return `<article class="service">
            <h3>${NG.text(s.title)}</h3>
            <p>${NG.text(s.body)}</p>
            ${link}
          </article>`;
        })
        .join("");
    },

    /* the About page story - one block per person, byline read from `team` */
    async story(host) {
      const story = d.studio?.story || [];
      if (!story.length) return host.remove();

      const avatars = (await NG.roblox.loadAll()).team || {};
      const team = d.team || [];

      host.className = "story";
      host.innerHTML = story
        .map((entry) => {
          const member = team.find((m) => m.name === entry.by);
          const src =
            avatars[String(member?.robloxUserId)] || member?.avatar || "assets/logo.svg";
          const paragraphs = String(entry.text || "")
            .split(/\n{2,}/)
            .filter((p) => p.trim())
            .map((p) => `<p>${NG.text(p.trim())}</p>`)
            .join("");

          return `<article class="story__part">
            <div class="story__byline">
              <img class="story__avatar" src="${NG.esc(src)}" alt="" width="44" height="44"
                   onerror="this.onerror=null;this.src='assets/logo.svg'">
              <div>
                <p class="story__name">${NG.text(entry.by)}</p>
                <p class="story__role">${NG.text(member?.role || "")}</p>
              </div>
            </div>
            <div class="story__text">${paragraphs}</div>
          </article>`;
        })
        .join("");
    },

    /* how many games are listed, for the About page stat strip */
    "game-count"(host) {
      host.textContent = String((d.games || []).length);
    },

    /* simple text slots: data-render="field" data-field="studio.founded" */
    field(host) {
      const path = (host.dataset.field || "").split(".");
      let value = d;
      for (const key of path) value = value?.[key];
      host.innerHTML = NG.text(value);
    },

    /* community buttons */
    social(host) {
      const links = d.links || {};
      const rows = [
        ["discord", "Join the Discord", true],
        ["group", "Roblox group", false],
        ["youtube", "YouTube", false],
        ["tiktok", "TikTok", false],
        ["twitter", "X / Twitter", false],
      ].filter(([key]) => links[key]);

      if (!rows.length) {
        host.innerHTML = empty("Add your Discord and socials to data/content.js.");
        return;
      }
      host.className = "social-row";
      host.innerHTML = rows
        .map(
          ([key, label, primary]) =>
            `<a class="btn ${primary ? "btn--primary" : "btn--ghost"}" href="${NG.esc(
              links[key]
            )}" target="_blank" rel="noopener">${label}</a>`
        )
        .join("");
    },

    /* the whole game detail page */
    async "game-detail"(host) {
      const slug = new URLSearchParams(location.search).get("id");
      const game = slug ? NG.findGame(slug) : null;

      // unknown or missing id must never render an empty shell
      if (!game) {
        location.replace("games.html");
        return;
      }

      const live = (await NG.roblox.load())[game.slug];
      const s = NG.roblox.stats(game, live);
      const play = NG.playUrl(game);

      document.title = `${game.name} - ${d.studio?.name || "NaGames"}`;

      const art = live?.thumbnail || game.art || NG.roblox.PLACEHOLDER;

      const codes = (game.codes || []).filter((c) => !c.expired);
      const codesPanel = codes.length
        ? `<div class="code-list" id="detail-codes"></div>`
        : empty("No active codes for this game right now.");

      const features = (game.features || []).length
        ? `<div class="panel">
             <h3>What is in it</h3>
             <ul class="feature-list">
               ${game.features.map((f) => `<li>${NG.text(f)}</li>`).join("")}
             </ul>
           </div>`
        : "";

      const updates = game.updates || [];

      const kvRows = [
        ["Status", game.status],
        ["Genre", game.genre],
        ["Visits", s.visits],
        ["Playing now", s.players],
        ["Favourites", s.favorites],
      ]
        .filter(([, v]) => v)
        .map(
          ([k, v]) =>
            `<div class="kv__row"><span class="kv__key">${k}</span><span class="kv__val">${NG.text(
              v
            )}</span></div>`
        )
        .join("");

      host.innerHTML = `
        <section class="game-hero">
          <div class="game-hero__art" style="background-image:url('${NG.esc(art)}')"></div>
          <div class="wrap game-hero__inner">
            <p class="eyebrow"><a href="games.html">&larr; All games</a></p>
            <h1>${NG.text(game.name)}</h1>
            <p class="lede">${NG.text(game.tagline)}</p>
            <div class="hero__actions" style="justify-content:flex-start;margin-top:26px">
              ${
                play
                  ? `<a class="btn btn--primary" href="${NG.esc(
                      play
                    )}" target="_blank" rel="noopener">Play on Roblox</a>`
                  : `<span class="todo">Add a placeId in data/content.js to enable the Play button</span>`
              }
              ${
                d.links?.discord
                  ? `<a class="btn btn--ghost" href="${NG.esc(
                      d.links.discord
                    )}" target="_blank" rel="noopener">Discord</a>`
                  : ""
              }
            </div>
          </div>
        </section>

        <div class="wrap section">
          <div class="detail-grid">
            <div>
              <h2>About</h2>
              ${String(game.description || "")
                .split(/\n{2,}/)
                .filter((p) => p.trim())
                .map((p) => `<p class="lede">${NG.text(p.trim())}</p>`)
                .join("")}

              <h2 style="margin-top:48px">Codes</h2>
              ${
                codes.length && game.redeem
                  ? `<p class="redeem">Redeem at <b>${NG.text(game.redeem)}</b></p>`
                  : ""
              }
              ${codesPanel}

              <h2 style="margin-top:48px">Updates</h2>
              <div class="update-list" id="detail-updates"></div>
            </div>
            <aside>
              <div class="panel">
                <h3>At a glance</h3>
                <div class="kv">${kvRows || '<span class="todo">Add stats in data/content.js</span>'}</div>
              </div>
              ${features}
            </aside>
          </div>
        </div>`;

      const codeHost = host.querySelector("#detail-codes");
      if (codeHost) codes.forEach((c) => codeHost.appendChild(codeRow(c)));

      const updHost = host.querySelector("#detail-updates");
      if (updHost) {
        if (updates.length) {
          [...updates]
            .sort((a, b) => String(b.date).localeCompare(String(a.date)))
            .forEach((u) => updHost.appendChild(updateCard(u, false)));
        } else {
          updHost.innerHTML = empty("No updates posted for this game yet.");
        }
      }
    },
  };

  /* ------------------------------------------------------------ dispatch -- */

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-render]").forEach((host) => {
      const name = host.dataset.render;
      const fn = renderers[name];
      if (!fn) return console.warn(`No renderer called "${name}"`);
      try {
        fn(host);
      } catch (err) {
        console.error(`Renderer "${name}" failed:`, err);
      }
    });
  });
})(window.NG);
