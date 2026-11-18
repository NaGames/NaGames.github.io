/* ==========================================================================
   site.js - shared helpers, header and footer
   Injected on every page so nav changes happen in exactly one place.
   ========================================================================== */

window.NG = (function () {
  const data = window.NAGAMES;
  if (!data) {
    console.error("data/content.js did not load. Check the script order in the page <head>.");
  }

  /* ------------------------------------------------------------ helpers -- */

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
    ));

  /** Placeholder content renders with a loud dashed outline so it can't ship by accident. */
  const isTodo = (v) => typeof v === "string" && v.trim().toUpperCase().startsWith("TODO");
  const text = (v, fallback = "") => {
    const val = String(v ?? "").trim();
    if (!val) return fallback;
    return isTodo(val) ? `<span class="todo">${esc(val)}</span>` : esc(val);
  };

  /** 45445641129 -> "45.4B". Strings pass through untouched. */
  function fmtNum(n) {
    if (n === null || n === undefined || n === "") return "";
    if (typeof n === "string") return n;
    if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
    return String(n);
  }

  function fmtDate(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return esc(iso);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  const playUrl = (game) =>
    game.placeId ? `https://www.roblox.com/games/${encodeURIComponent(game.placeId)}/` : "";

  const gameUrl = (game) => `game.html?id=${encodeURIComponent(game.slug)}`;

  const findGame = (slug) => (data?.games || []).find((g) => g.slug === slug) || null;

  /**
   * Every game's updates, flattened, newest first.
   *
   * Dated entries sort by date and come first. Undated ones keep the order
   * they were written in content.js, so an update with no date yet still
   * lands in the right place as long as you add it to the top of the array.
   */
  function allUpdates() {
    const out = [];
    for (const game of data?.games || []) {
      (game.updates || []).forEach((u, i) => out.push({ ...u, game, _i: out.length + i }));
    }
    return out.sort((a, b) => {
      const da = String(a.date || "").trim();
      const db = String(b.date || "").trim();
      if (da && db) return db.localeCompare(da);
      if (da) return -1;
      if (db) return 1;
      return a._i - b._i;
    });
  }

  /* ------------------------------------------------- header and footer -- */

  const NAV = [
    { href: "games.html", label: "Games" },
    { href: "codes.html", label: "Codes" },
    { href: "updates.html", label: "Updates" },
    { href: "about.html", label: "About" },
  ];

  function currentPage() {
    const file = location.pathname.split("/").pop() || "index.html";
    return file === "" ? "index.html" : file;
  }

  function buildHeader() {
    const here = currentPage();
    const discord = data?.links?.discord;

    const links = NAV.map((item) => {
      const active = item.href === here ? ' aria-current="page"' : "";
      return `<a href="${item.href}"${active}>${item.label}</a>`;
    }).join("");

    const discordBtn = discord
      ? `<a class="btn btn--primary btn--sm" href="${esc(discord)}" target="_blank" rel="noopener">Join Discord</a>`
      : "";

    return `
      <a class="skip-link" href="#main">Skip to content</a>
      <header class="site-header">
        <div class="wrap site-header__inner">
          <a class="brand" href="index.html">
            <img src="assets/logo.svg" alt="" width="34" height="34">
            <span class="brand__name">${esc(data?.studio?.name || "NaGames")}</span>
          </a>
          <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-nav">
            <span class="visually-hidden">Menu</span>&#9776;
          </button>
          <nav class="nav" id="primary-nav" aria-label="Primary">${links}${discordBtn}</nav>
        </div>
      </header>`;
  }

  function buildFooter() {
    const links = data?.links || {};
    const socials = [
      ["discord", "Discord"],
      ["group", "Roblox group"],
      ["roblox", "Roblox profile"],
      ["youtube", "YouTube"],
      ["tiktok", "TikTok"],
      ["twitter", "X / Twitter"],
    ]
      .filter(([key]) => links[key])
      .map(
        ([key, label]) =>
          `<li><a href="${esc(links[key])}" target="_blank" rel="noopener">${label}</a></li>`
      )
      .join("");

    const games = (data?.games || [])
      .map((g) => `<li><a href="${gameUrl(g)}">${text(g.name)}</a></li>`)
      .join("");

    const email = data?.studio?.email;
    const emailLine =
      email && !isTodo(email)
        ? `<li><a href="mailto:${esc(email)}">${esc(email)}</a></li>`
        : "";

    return `
      <footer class="site-footer">
        <div class="wrap">
          <div class="site-footer__cols">
            <div>
              <a class="brand" href="index.html" style="margin-bottom:14px">
                <img src="assets/logo.svg" alt="" width="34" height="34">
                <span class="brand__name">${esc(data?.studio?.name || "NaGames")}</span>
              </a>
              <p class="site-footer__note">${text(data?.studio?.tagline)}</p>
            </div>
            <div>
              <h4>Games</h4>
              <ul>${games || "<li>Coming soon</li>"}</ul>
            </div>
            <div>
              <h4>Studio</h4>
              <ul>
                <li><a href="about.html">About</a></li>
                <li><a href="updates.html">Updates</a></li>
                <li><a href="codes.html">Codes</a></li>
                ${emailLine}
              </ul>
            </div>
            <div>
              <h4>Community</h4>
              <ul>${socials || "<li>Links coming soon</li>"}</ul>
            </div>
          </div>
          <div class="site-footer__bottom">
            <span>&copy; ${new Date().getFullYear()} ${esc(data?.studio?.name || "NaGames")}</span>
            <span class="site-footer__note">${esc(data?.footer?.disclaimer || "")}</span>
          </div>
        </div>
      </footer>`;
  }

  function mountChrome() {
    const header = document.getElementById("site-header");
    const footer = document.getElementById("site-footer");
    if (header) header.outerHTML = buildHeader();
    if (footer) footer.outerHTML = buildFooter();

    const toggle = document.querySelector(".nav-toggle");
    const nav = document.getElementById("primary-nav");
    if (toggle && nav) {
      toggle.addEventListener("click", () => {
        const open = nav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", String(open));
      });
      // close the mobile menu after following a link
      nav.addEventListener("click", (e) => {
        if (e.target.tagName === "A") {
          nav.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    }
  }

  return {
    data,
    esc,
    text,
    isTodo,
    fmtNum,
    fmtDate,
    playUrl,
    gameUrl,
    findGame,
    allUpdates,
    mountChrome,
  };
})();

document.addEventListener("DOMContentLoaded", window.NG.mountChrome);
