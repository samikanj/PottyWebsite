/* Shared layout: header, footer, icons, accessibility settings and small helpers used by every page. */
(function () {
  const C = window.POTTY;

  // Storage that never throws (private windows can block it).
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} },
  };

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const ICONS = {
    hand: '<path d="M18 11V6a2 2 0 0 0-4 0v5"/><path d="M14 10V4a2 2 0 0 0-4 0v6"/><path d="M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>',
    eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    wind: '<path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>',
    wave: '<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>',
    dna: '<path d="M4 2c0 7 16 13 16 20"/><path d="M20 2c0 7-16 13-16 20"/><path d="M7 5h10"/><path d="M5 9h14"/><path d="M5 15h14"/><path d="M7 19h10"/>',
    scale: '<path d="m16 16 3-8 3 8c-.9.7-1.9 1-3 1s-2.1-.3-3-1Z"/><path d="m2 16 3-8 3 8c-.9.7-1.9 1-3 1s-2.1-.3-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
    thermo: '<path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>',
    chip: '<rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/>',
    code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
    pulse: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    smile: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    eyeoff: '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>',
    drop: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
    sparkle: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
    volume: '<path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a10 10 0 0 1 0 14"/>',
    layers: '<path d="m12 2 10 5-10 5L2 7l10-5z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  };
  const icon = (name, color = "currentColor") =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.sparkle}</svg>`;

  const ICON_COLORS = { peach: "#c2553a", sage: "#3f7a4a", lavender: "#5a4790", butter: "#8a6510" };

  // Potty's body, drawn in code so its face can change expression. The shape follows the product render
  // (assets/img/potty-product.jpg): a rounded cream shell with soft pink skin-like cushions.
  // `parts` is shared with the "Look inside Potty" model on the home page, so both stay in step.
  let uid = 0;
  function pottyParts(opts = {}) {
    const id = "p" + ++uid;
    const mood = opts.mood || "happy";
    const glow = "#ffd9a8";
    let face;
    if (mood === "sleepy") {
      face = `<path d="M130 116 q6 5 12 0 M158 116 q6 5 12 0" stroke="${glow}" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M144 129 q6 4 12 0" stroke="${glow}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    } else if (mood === "love") {
      const h = (x) => `<path transform="translate(${x} 106) scale(.75)" d="M10 18 L1.5 9.5 A5 5 0 0 1 10 3 A5 5 0 0 1 18.5 9.5Z" fill="#ff9b85"/>`;
      face = h(128) + h(157) + `<path d="M136 128 Q150 140 164 128" stroke="${glow}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    } else {
      face = `<ellipse class="potty-eye" cx="137" cy="113" rx="5.5" ry="8" fill="${glow}"/><ellipse class="potty-eye" cx="163" cy="113" rx="5.5" ry="8" fill="${glow}"/>
        <path d="M137 128 Q150 138 163 128" stroke="${glow}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    }
    const pink = `url(#pink-${id})`;
    return {
      defs: `<defs>
        <linearGradient id="pink-${id}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#f6d3c4"/><stop offset="1" stop-color="#e2a892"/></linearGradient>
        <linearGradient id="shell-${id}" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#fffaf4"/><stop offset="1" stop-color="#eadfd3"/></linearGradient>
      </defs>`,
      glow: `<ellipse cx="150" cy="324" rx="96" ry="9" fill="#ffd9a8" opacity=".55"/>`,
      shell: `<path d="M38 168 C36 250 84 318 150 318 C216 318 264 250 262 168 Z" fill="url(#shell-${id})" stroke="#e2d3c4" stroke-width="3"/>
        <path d="M66 204 C72 252 100 288 136 302" stroke="#fff" stroke-width="6" opacity=".6" fill="none" stroke-linecap="round"/>
        <ellipse cx="150" cy="168" rx="112" ry="24" fill="#f7f0e8" stroke="#e2d3c4" stroke-width="3"/>
        <path d="M84 170 C82 112 112 76 150 76 C188 76 218 112 216 170 Z" fill="#fbf6f0" stroke="#e2d3c4" stroke-width="3"/>`,
      button: `<circle cx="104" cy="284" r="8" fill="none" stroke="#d6c5b4" stroke-width="2.5"/><circle cx="104" cy="284" r="2.5" fill="#d6c5b4"/>`,
      chip: `<rect x="128" y="98" width="44" height="38" rx="10" fill="#c9b8e8"/>
        <path d="M122 107h6M122 117h6M122 127h6M172 107h6M172 117h6M172 127h6" stroke="#8f7cc0" stroke-width="3" stroke-linecap="round"/>
        <path d="M150 126 l-8 -8 a4.7 4.7 0 0 1 8 -5 a4.7 4.7 0 0 1 8 5z" fill="#fff"/>`,
      display: `<rect x="114" y="92" width="72" height="50" rx="18" fill="#3b2f2a"/>
        <circle cx="126" cy="128" r="4" fill="#ff9b85" opacity=".45"/><circle cx="174" cy="128" r="4" fill="#ff9b85" opacity=".45"/>${face}`,
      backrest: `<path d="M62 150 C58 76 100 36 150 36 C200 36 242 76 238 150 C238 160 222 162 218 150 C214 100 188 66 150 66 C112 66 86 100 82 150 C78 162 62 160 62 150 Z" fill="${pink}"/>
        <path d="M94 68 C110 52 130 45 150 45" stroke="#fff" stroke-width="5" opacity=".5" fill="none" stroke-linecap="round"/>`,
      armL: `<rect x="24" y="146" width="74" height="36" rx="18" transform="rotate(-8 61 164)" fill="${pink}"/>`,
      armR: `<rect x="202" y="146" width="74" height="36" rx="18" transform="rotate(8 239 164)" fill="${pink}"/>`,
      seat: `<ellipse cx="150" cy="182" rx="84" ry="22" fill="${pink}"/><ellipse cx="150" cy="184" rx="52" ry="12" fill="#fff" stroke="#e8dcd2" stroke-width="2"/>`,
      scanner: `<ellipse cx="150" cy="196" rx="60" ry="12" fill="none" stroke="#3f7a4a" stroke-width="6"/>
        <g fill="#a8cfae">${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const a = (i / 8) * Math.PI * 2; return `<circle cx="${(150 + Math.cos(a) * 60).toFixed(1)}" cy="${(196 + Math.sin(a) * 12).toFixed(1)}" r="4.5"/>`; }).join("")}</g>`,
    };
  }

  function pottySVG(opts = {}) {
    const P = pottyParts(opts);
    return `<svg viewBox="16 26 268 306" role="img" aria-label="${esc(opts.label || "Potty, a rounded cream toilet with soft pink cushions and a small glowing face")}" class="${opts.cls || ""}">
      ${P.defs}${P.glow}${P.shell}${P.chip}${P.display}${P.backrest}${P.seat}${P.armL}${P.armR}${P.button}
    </svg>`;
  }

  const logo = () => `<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="4" y="4" width="40" height="40" rx="14" fill="#3b2f2a"/><ellipse class="potty-eye" cx="18" cy="21" rx="3" ry="4.5" fill="#ffd9a8"/><ellipse class="potty-eye" cx="30" cy="21" rx="3" ry="4.5" fill="#ffd9a8"/><path d="M17 30 q7 6 14 0" stroke="#ffd9a8" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`;

  // Display preferences (text size, light/dark, contrast, animations), remembered per visitor.
  const PREFS = {
    text: { label: "Text size", options: [["normal", "Standard"], ["large", "Large"], ["xlarge", "Extra large"]] },
    theme: { label: "Colours", options: [["light", "Light"], ["dark", "Dark"]] },
    contrast: { label: "Contrast", options: [["normal", "Standard"], ["high", "High"]] },
    motion: { label: "Animations", options: [["on", "On"], ["off", "Off"]] },
  };
  function prefValue(key) {
    const saved = store.get("potty." + key);
    if (saved) return saved;
    if (key === "theme") return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    if (key === "motion") return matchMedia("(prefers-reduced-motion: reduce)").matches ? "off" : "on";
    return PREFS[key].options[0][0];
  }
  function applyPrefs() {
    for (const key in PREFS) document.documentElement.dataset[key] = prefValue(key);
  }
  applyPrefs();

  // Visual notifications: every action gets a clear, readable confirmation that stays long enough to read.
  function notify(message, kind = "ok") {
    let box = document.querySelector(".toasts");
    if (!box) {
      box = document.createElement("div");
      box.className = "toasts"; box.setAttribute("role", "status"); box.setAttribute("aria-live", "polite");
      document.body.appendChild(box);
    }
    const t = document.createElement("div");
    t.className = "toast " + kind;
    t.innerHTML = `<span class="t-icon" aria-hidden="true">${kind === "error" ? "!" : kind === "info" ? "i" : "✓"}</span><p>${esc(message)}</p><button type="button">Close</button>`;
    const close = () => t.remove();
    t.querySelector("button").onclick = close;
    box.appendChild(t);
    setTimeout(close, 9000);
  }
  // A message to show after the next page loads (e.g. "You've signed out").
  const flash = (message, kind = "ok") => { try { sessionStorage.setItem("potty.flash", JSON.stringify([message, kind])); } catch (e) {} };
  function showFlash() {
    try {
      const f = JSON.parse(sessionStorage.getItem("potty.flash") || "null");
      sessionStorage.removeItem("potty.flash");
      if (f) notify(f[0], f[1]);
    } catch (e) {}
  }

  // Plain-language confirm dialog with clearly named buttons. Resolves true/false.
  function confirmDialog({ title, body, yes, no = "No, go back", danger = false }) {
    return new Promise((resolve) => {
      const d = document.createElement("dialog");
      d.className = "confirm";
      d.innerHTML = `<h2>${esc(title)}</h2><p>${esc(body)}</p>
        <div class="btn-row"><button class="btn ${danger ? "btn-danger" : ""}" data-v="1">${esc(yes)}</button><button class="btn btn-ghost" data-v="0">${esc(no)}</button></div>`;
      document.body.appendChild(d);
      const done = (v) => { d.close(); d.remove(); resolve(v); };
      d.querySelectorAll("[data-v]").forEach((b) => (b.onclick = () => done(b.dataset.v === "1")));
      d.addEventListener("cancel", (e) => { e.preventDefault(); done(false); });
      if (d.showModal) { d.showModal(); d.querySelector('[data-v="0"]').focus(); }
      else done(window.confirm(title + "\n\n" + body));
    });
  }

  const displayIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';

  function header() {
    const here = location.pathname.split("/").pop() || "index.html";
    const signedIn = !!window.PottyAuth?.current();
    const links = C.nav.map((n) => `<a href="${n.href}"${n.href === here ? ' aria-current="page"' : ""}>${esc(n.label)}</a>`).join("");
    const account = signedIn
      ? `<a class="btn btn-small" href="dashboard.html">My Potty space</a>`
      : `<a class="btn btn-small" href="login.html">Sign in</a>`;
    return `<a class="skip" href="#main">Skip to content</a>
    <header class="site-header"><div class="wrap">
      <a class="brand" href="index.html">${logo()}<span>${esc(C.product.name)}</span></a>
      <button class="menu-btn" aria-expanded="false" aria-controls="nav"><span aria-hidden="true">☰</span> Menu</button>
      <nav class="nav" id="nav" aria-label="Main">${links}${account}
        <button class="display-btn" aria-expanded="false" aria-controls="display-panel">${displayIcon} Display</button>
      </nav>
    </div>
    <div class="display-panel" id="display-panel" role="region" aria-label="Display settings" hidden>
      <h2>Display settings</h2>
      <p>Make the website easier to read. Your choices are remembered on this device.</p>
      ${Object.entries(PREFS).map(([key, p]) => `<div class="setting" role="group" aria-labelledby="pl-${key}">
        <span class="setting-label" id="pl-${key}">${p.label}</span>
        <div class="seg">${p.options.map(([v, l]) => `<button type="button" data-pref="${key}" data-val="${v}" aria-pressed="${prefValue(key) === v}">${l}</button>`).join("")}</div>
      </div>`).join("")}
      <div class="btn-row" style="margin-top:22px"><button class="btn btn-small" id="display-done">Done</button></div>
    </div></header>`;
  }

  function footer() {
    const links = C.nav.map((n) => `<a href="${n.href}">${esc(n.label)}</a>`).join("");
    const K = C.contact;
    const tel = (n) => `<a href="tel:${esc(n.replace(/\s/g, ""))}">${esc(n)}</a>`;
    return `<footer class="site-footer"><div class="wrap footer-grid">
      <div><div class="brand">${logo()}<span>${esc(C.product.name)}</span></div>
        <p>${esc(C.footer.note)}</p>
        <p class="f-small">${esc(C.product.course)} · ${esc(C.product.team)} · ${esc(C.product.version)}</p></div>
      ${K ? `<div><h2 class="f-head">${esc(K.company)}</h2>
        <p><a href="mailto:${esc(K.email)}">${esc(K.email)}</a><br>${tel(K.phone)}</p>
        <p class="f-small">${esc(K.hours)}</p>
        <p><a href="contact.html" class="f-cta">Contact us →</a></p></div>
      <div><h2 class="f-head">Our offices</h2>
        ${K.offices.map((o) => `<p><strong>${esc(o.city)}</strong><br><span class="f-small">${o.address.slice(1).map(esc).join(", ")}</span><br>${tel(o.phone)}</p>`).join("")}
        <p class="f-small">${esc(K.note)}</p></div>` : ""}
      <nav aria-label="Footer"><h2 class="f-head">Pages</h2><div class="footer-links">${links}<a href="login.html">Sign in</a></div>
        ${C.footer.devLink ? `<p class="f-dev"><a href="${C.footer.devLink.href}">${icon("code")} ${esc(C.footer.devLink.label)}</a>${C.footer.devLink.note ? `<br><span class="f-small">${esc(C.footer.devLink.note)}</span>` : ""}</p>` : ""}</nav>
    </div></footer>`;
  }

  function mountLayout() {
    document.body.insertAdjacentHTML("afterbegin", header());
    document.body.insertAdjacentHTML("beforeend", footer());
    const btn = document.querySelector(".menu-btn");
    const nav = document.getElementById("nav");
    btn.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open);
    });

    // Switch to the Menu button whenever the links don't fit on one line (narrow windows, larger text sizes).
    const head = document.querySelector(".site-header"), brand = head.querySelector(".brand");
    const fit = () => {
      head.classList.remove("compact");
      if (matchMedia("(max-width: 960px)").matches) return;
      const tight = nav.scrollWidth > nav.clientWidth + 1 || nav.getBoundingClientRect().left < brand.getBoundingClientRect().right + 12;
      head.classList.toggle("compact", tight);
      if (!tight) { nav.classList.remove("open"); btn.setAttribute("aria-expanded", false); }
    };
    fit();
    addEventListener("resize", fit);
    document.addEventListener("potty:prefs", fit);
    if (document.fonts) document.fonts.ready.then(fit);

    const dBtn = document.querySelector(".display-btn");
    const panel = document.getElementById("display-panel");
    const setPanel = (open) => {
      panel.hidden = !open;
      dBtn.setAttribute("aria-expanded", open);
      if (open) panel.querySelector('[aria-pressed="true"]').focus(); else dBtn.focus();
    };
    dBtn.addEventListener("click", () => setPanel(panel.hidden));
    document.getElementById("display-done").addEventListener("click", () => setPanel(false));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) setPanel(false); });
    panel.querySelectorAll("[data-pref]").forEach((b) =>
      b.addEventListener("click", () => {
        const key = b.dataset.pref;
        store.set("potty." + key, b.dataset.val);
        panel.querySelectorAll(`[data-pref="${key}"]`).forEach((o) => o.setAttribute("aria-pressed", o === b));
        applyPrefs();
        document.dispatchEvent(new CustomEvent("potty:prefs"));
      })
    );
  }

  // Fade sections in as they scroll into view.
  function reveal() {
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) return els.forEach((e) => e.classList.add("in"));
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }), { threshold: 0.12 });
    els.forEach((e) => io.observe(e));
  }

  window.Potty = { C, store, esc, icon, ICON_COLORS, pottySVG, pottyParts, logo, notify, flash, confirmDialog };

  document.addEventListener("DOMContentLoaded", () => {
    mountLayout();
    if (typeof window.renderPage === "function") window.renderPage(window.Potty);
    reveal();
    showFlash();
  });
})();
