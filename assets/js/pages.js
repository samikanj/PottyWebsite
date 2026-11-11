/* Builds each public page from content.js. The page is chosen by <body data-page="..."> */
window.renderPage = function (P) {
  const { C, esc, icon, ICON_COLORS, pottySVG } = P;
  const main = document.getElementById("main");
  const page = document.body.dataset.page;

  const featureCard = (f) => `
    <a class="card feature-card reveal" href="${f.link ? f.link.href : `features.html#${f.id}`}">
      <div class="icon-badge bg-${f.color}">${icon(f.icon, ICON_COLORS[f.color])}</div>
      <h3>${esc(f.title)}</h3><p>${esc(f.short)}</p><span class="more">Learn more →</span>
    </a>`;

  /* ---------- Interactive "look inside" model ---------- */
  // Built from two photos: the whole Potty and Potty taken apart. Both are cut into matching pieces
  // (assets/img/pieces/<part>-together.png and <part>-apart.png). Each part glides from where it is in the
  // whole photo to where it is in the taken-apart photo, changing shape as it goes, so the two photos blend
  // into each other. Boxes are x, y, width, height in the taken-apart photo's pixels (about 460 x 490).
  // The personality chip and the sensor ring can't be seen in the photos, so they are drawn and fade in.
  const APART = {
    backrest: [123.67, 16.33, 211.67, 72],
    display: [138, 85.67, 180.33, 103.67],
    armL: [27.67, 101.67, 97.33, 89.67],
    armR: [331.67, 100.67, 96.67, 89.67],
    seat: [70.67, 186.67, 311.33, 110.67],
    bowl: [145.67, 207.67, 162.67, 174.67],
    shellBack: [61.67, 285.33, 328.33, 98],
    shellFront: [58, 305.67, 334, 181.67],
  };
  const TOGETHER = {
    backrest: [102.12, 89.32, 246.13, 95.22],
    display: [112.54, 169.81, 231.39, 117.13],
    armL: [38.16, 173.04, 91.26, 120.37],
    armR: [322.73, 187.06, 89.83, 106.35],
    seat: [80.2, 261.43, 289.6, 128.99],
    shell: [57.56, 265.74, 334.87, 221.33],
  };
  const WHOLE = [37.8, 89.32, 374.76, 397.75]; // the whole-Potty photo, shown on the page before Potty is taken apart
  // CSS transform that stretches box `from` onto box `to`
  const fit = (from, to) => { const sx = to[2] / from[2], sy = to[3] / from[3];
    return `translate(${(to[0] - sx * from[0]).toFixed(2)}px, ${(to[1] - sy * from[1]).toFixed(2)}px) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`; };
  const pic = (file, box, cls, style) => `<image class="${cls}" href="assets/img/pieces/${file}.png" x="${box[0]}" y="${box[1]}" width="${box[2]}" height="${box[3]}" style="${style}"/>`;
  // One part: its taken-apart picture underneath, its whole-photo picture on top. `t` overrides the
  // together box (used for the shell, which is one piece in the whole photo and two when taken apart).
  const part = (name, t = TOGETHER[name]) => `<g class="part">${pic(name + "-apart", APART[name], "pa", `--to: ${fit(APART[name], t)}`)}${TOGETHER[name] ? pic(name + "-together", t, "pt", `--to: ${fit(t, APART[name])}`) : ""}</g>`;
  const box = (...bs) => { const x = Math.min(...bs.map((b) => b[0])), y = Math.min(...bs.map((b) => b[1]));
    return [x, y, Math.max(...bs.map((b) => b[0] + b[2])) - x, Math.max(...bs.map((b) => b[1] + b[3])) - y]; };
  const SHELL = box(APART.shellBack, APART.shellFront); // both shell halves move together
  const shellPart = (name, withWhole) => `<g class="part">${pic(name + "-apart", APART[name], "pa", `--to: ${fit(SHELL, TOGETHER.shell)}`)}${withWhole ? pic("shell-together", TOGETHER.shell, "pt", `--to: ${fit(TOGETHER.shell, SHELL)}`) : ""}</g>`;
  const drawn = (dx, dy, svg) => `<g class="piece" style="--together: translate(${dx}px, ${dy}px)"><g class="inner">${svg}</g></g>`;
  const ring = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => { const a = (i / 8) * Math.PI; return `<circle cx="${(228 + Math.cos(a) * 74).toFixed(1)}" cy="${(335 + Math.sin(a) * 10).toFixed(1)}" r="3.5"/>`; }).join("");
  // Keyed by feature id (see content.js -> home.explode.layers). `badge` is where the layer's number sits.
  const GEO = {
    face: { badge: [300, 104], parts: [part("display")] },
    personality: { badge: [432, 28], parts: [drawn(-146, 90, `<path d="M352 62 Q335 80 318 96" stroke="#8f7cc0" stroke-width="2.5" stroke-dasharray="4 5" fill="none"/>
        <rect x="352" y="30" width="48" height="40" rx="10" fill="#c9b8e8"/>
        <path d="M346 40h6M346 50h6M346 60h6M400 40h6M400 50h6M400 60h6" stroke="#8f7cc0" stroke-width="3" stroke-linecap="round"/>
        <path d="M376 60 l-8 -8 a4.7 4.7 0 0 1 8 -5 a4.7 4.7 0 0 1 8 5z" fill="#fff"/>`)] },
    scanner: { badge: [440, 330], line: [302, 340], parts: [`<g class="part">${pic("bowl-apart", APART.bowl, "pa", "--to: translate(0px, 70px)")}</g>`,
      drawn(0, 70, `<path d="M154 335 A74 10 0 0 0 302 335" fill="none" stroke="#3f7a4a" stroke-width="5" stroke-linecap="round"/><g fill="#a8cfae">${ring}</g>`)] },
    skin: { badge: [122, 30], parts: [part("seat"), part("armL"), part("armR"), part("backrest")] },
  };

  function explodeMarkup() {
    const X = C.home.explode;
    const ids = X.layers.filter((id) => GEO[id] && C.features.some((f) => f.id === id));
    // Hidden layers keep their photo pieces (so Potty stays whole) but lose their number and drawn parts.
    const layer = (id) => ids.includes(id) ? `<g class="layer" data-layer="${id}">${GEO[id].parts.join("")}</g>`
      : GEO[id].parts.filter((p) => !p.includes('class="inner"')).join("");
    const badges = ids.map((id, i) => { const [bx, by] = GEO[id].badge, l = GEO[id].line;
      return `<g class="badge">${l ? `<path class="guide" d="M${l[0]} ${l[1]} L${bx} ${by}" stroke="#7d6a5e" stroke-width="2" stroke-dasharray="4 5"/>` : ""}
      <circle cx="${bx}" cy="${by}" r="18" fill="#3b2f2a" stroke="#fff" stroke-width="3"/><text x="${bx}" y="${by + 6}" text-anchor="middle" font-family="Nunito,Arial,sans-serif" font-weight="800" font-size="18" fill="#fff">${i + 1}</text></g>`; }).join("");
    const [wx, wy, ww, wh] = WHOLE;
    return `<div class="explode" id="explode">
      <div class="explode-main">
      <div class="explode-stage" id="explode-stage">
        <svg viewBox="10 0 450 495" role="img" aria-labelledby="explode-title">
          <title id="explode-title">${esc(C.home.heroAlt)}</title>
          <defs><radialGradient id="ground"><stop offset="0" stop-color="#3b2f2a" stop-opacity=".22"/><stop offset="1" stop-color="#3b2f2a" stop-opacity="0"/></radialGradient></defs>
          <g class="whole">
            <ellipse cx="228" cy="484" rx="190" ry="16" fill="url(#ground)"/>
            <g data-part="shell">${shellPart("shellBack", false)}</g>
            ${layer("face")}${layer("personality")}${layer("scanner")}
            <g data-part="shell">${shellPart("shellFront", true)}</g>
            ${layer("skin")}
            <image class="whole-photo" href="${C.home.heroImage}" x="${wx}" y="${wy}" width="${ww}" height="${wh}"/>
          </g>
          ${badges}
        </svg>
      </div>
      <p class="explode-hint" id="explode-hint">${esc(X.hintClosed)}</p>
      <div class="explode-actions"><button class="btn" id="explode-btn" aria-expanded="false" aria-controls="layer-panel">${icon("layers")} <span>${esc(X.openLabel)}</span></button></div>
      </div>
      <div id="layer-panel" hidden>
        <h2 class="focus-title">${esc(X.focusTitle || "Inside Potty")}</h2>
        <ol class="layer-list">${ids.map((id, i) => {
          const f = C.features.find((x) => x.id === id);
          return `<li><button type="button" data-pick="${id}" aria-pressed="false"><span class="num">${i + 1}</span><span>${esc(f.title)}<small>${esc(f.layerLabel || "")}</small></span></button></li>`;
        }).join("")}</ol>
        <div class="card layer-detail" id="layer-detail" aria-live="polite"></div>
      </div>
    </div>`;
  }

  function wireExplode() {
    const X = C.home.explode;
    const root = document.getElementById("explode");
    if (!root) return;
    const btn = document.getElementById("explode-btn");
    const panel = document.getElementById("layer-panel");
    const detail = document.getElementById("layer-detail");
    const hint = document.getElementById("explode-hint");

    function pick(id) {
      const f = C.features.find((x) => x.id === id);
      if (!f) return;
      if (!root.classList.contains("open")) setApart(true);
      root.querySelectorAll("[data-layer]").forEach((g) => {
        g.classList.toggle("sel", g.dataset.layer === id);
        g.classList.toggle("dim", g.dataset.layer !== id);
      });
      root.querySelectorAll("[data-part]").forEach((g) => g.classList.add("dim"));
      root.querySelectorAll("[data-pick]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.pick === id));
      detail.innerHTML = `<div class="icon-badge bg-${f.color}">${icon(f.icon, ICON_COLORS[f.color])}</div>
        <h3>${esc(f.title)}</h3><p>${esc(f.short)}</p>
        <ul class="ticks">${f.points.slice(0, 3).map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
        <p style="margin-top:14px"><a href="${f.link ? f.link.href : `features.html#${f.id}`}">${f.link ? esc(f.link.label) : `Read more about ${esc(f.title.toLowerCase())}`} →</a></p>`;
    }

    // Taking Potty apart moves it into a centred focus view and blurs the rest of the page.
    const stage = document.getElementById("explode-stage");
    const reduced = () => document.documentElement.dataset.motion === "off" || matchMedia("(prefers-reduced-motion: reduce)").matches;
    let overlay = null, placeholder = null;

    // Slide the picture from where it was to where it is now (FLIP animation).
    function glide(from) {
      if (reduced()) return;
      const to = stage.getBoundingClientRect();
      stage.style.transition = "none";
      stage.style.transformOrigin = "top left";
      stage.style.transform = `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})`;
      stage.getBoundingClientRect();
      stage.style.transition = "transform .7s cubic-bezier(.2,.8,.2,1)";
      stage.style.transform = "";
    }

    function enterFocus() {
      placeholder = document.createElement("div");
      placeholder.style.height = root.offsetHeight + "px";
      root.replaceWith(placeholder);
      overlay = document.createElement("div");
      overlay.className = "focus-layer";
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-modal", "true");
      overlay.setAttribute("aria-label", X.focusTitle || "Inside Potty");
      overlay.innerHTML = `<button class="btn btn-ghost btn-small focus-close" type="button">✕ Close</button>`;
      overlay.appendChild(root);
      document.body.appendChild(overlay);
      document.body.classList.add("focus-open");
      [...document.body.children].forEach((el) => { if (el !== overlay) el.inert = true; });
      overlay.querySelector(".focus-close").onclick = () => setOpen(false);
    }

    function leaveFocus() {
      placeholder.replaceWith(root);
      overlay.remove();
      overlay = placeholder = null;
      document.body.classList.remove("focus-open");
      [...document.body.children].forEach((el) => (el.inert = false));
    }

    // The focus view stays open until ✕ Close (or the Escape key). Inside it, the main button takes Potty
    // apart and puts it back together as often as you like.
    // Opening: glide into the focus view, then the parts glide apart.
    // Closing: the parts glide back together first, then Potty glides back to its place on the page.
    let closing = null;
    const isApart = () => root.classList.contains("open");
    function setApart(apart) {
      root.classList.toggle("open", apart);
      if (!apart) {
        root.querySelectorAll(".sel, .dim").forEach((g) => g.classList.remove("sel", "dim"));
        root.querySelectorAll("[data-pick]").forEach((b) => b.setAttribute("aria-pressed", "false"));
        intro();
      }
      btn.querySelector("span").textContent = apart ? X.closeLabel : (X.apartLabel || X.openLabel);
      hint.textContent = apart ? X.hintOpen : (X.hintTogether || X.hintOpen);
    }
    const intro = () => { detail.innerHTML = `<div class="icon-badge bg-peach">${icon("layers", ICON_COLORS.peach)}</div><h3>${esc(X.focusTitle || "Inside Potty")}</h3>
      <p>${esc(X.hintOpen)}</p><p>Each number shows where a feature sits. The personality chip and the sensor ring can't be seen in the photo, so they are drawn in.</p>`; };
    function setOpen(open) {
      if (closing || open === !!overlay) return;
      if (open) {
        const from = stage.getBoundingClientRect();
        root.classList.add("model");
        enterFocus();
        glide(from);
        intro();
        root.querySelectorAll("[data-pick]").forEach((b) => b.setAttribute("aria-pressed", "false"));
        panel.hidden = false;
        requestAnimationFrame(() => requestAnimationFrame(() => setApart(true)));
        btn.setAttribute("aria-expanded", true);
        root.querySelector("[data-pick]").focus({ preventScroll: true });
      } else {
        const wasApart = isApart();
        setApart(false);
        const finish = () => {
          closing = null;
          const from = stage.getBoundingClientRect();
          root.classList.remove("model");
          panel.hidden = true;
          leaveFocus();
          glide(from);
          btn.setAttribute("aria-expanded", false);
          btn.querySelector("span").textContent = X.openLabel;
          hint.textContent = X.hintClosed;
          btn.focus({ preventScroll: true });
        };
        if (reduced() || !wasApart) finish(); else closing = setTimeout(finish, 1050);
      }
    }
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && overlay) setOpen(false); });

    btn.addEventListener("click", () => { if (!overlay) setOpen(true); else if (!closing) setApart(!isApart()); });
    stage.addEventListener("click", (e) => {
      if (!overlay) return setOpen(true);
      if (closing) return;
      if (!isApart()) return setApart(true);
      const g = e.target.closest("[data-layer]");
      if (g) pick(g.dataset.layer);
    });
    root.querySelectorAll("[data-pick]").forEach((b) => b.addEventListener("click", () => pick(b.dataset.pick)));
  }

  /* ---------- "Potty from every side" photo viewer ---------- */
  const angleSrc = (A, view, apart) => `${A.folder}${apart ? "apart" : "together"}-${view}.png`;
  const angleAlt = (A, view, apart) => `Potty seen from the ${view === "top" ? "top" : view === "front" || view === "back" ? view : view.replace("left", "left side").replace("right", "right side")}, ${apart ? "taken apart into its pieces" : "put together"}`;
  function anglesMarkup() {
    const A = C.home.angles;
    if (!A) return "";
    return `<section id="angles"><div class="wrap">
      <div class="center reveal"><span class="eyebrow">${esc(A.eyebrow)}</span><h2>${esc(A.title)}</h2><p class="lead">${esc(A.intro)}</p></div>
      <div class="angles reveal">
        <figure class="angle-stage"><img id="angle-img" src="${angleSrc(A, A.views[0].id, false)}" alt="${esc(angleAlt(A, A.views[0].id, false))}"></figure>
        <div class="angle-controls">
          <fieldset class="choices"><legend>Side</legend><div class="choice-grid angle-views">${A.views.map((v, i) => `<label class="choice"><input type="radio" name="angle-view" value="${v.id}" ${i === 0 ? "checked" : ""}><span>${esc(v.label)}</span></label>`).join("")}</div></fieldset>
          <fieldset class="choices"><legend>Show Potty</legend><div class="choice-grid">
            <label class="choice"><input type="radio" name="angle-state" value="together" checked><span>${esc(A.together)}</span></label>
            <label class="choice"><input type="radio" name="angle-state" value="apart"><span>${esc(A.apart)}</span></label>
          </div></fieldset>
        </div>
      </div>
    </div></section>`;
  }
  function wireAngles() {
    const A = C.home.angles, img = document.getElementById("angle-img");
    if (!A || !img) return;
    // Preload every photo so switching is instant
    A.views.forEach((v) => [false, true].forEach((a) => { new Image().src = angleSrc(A, v.id, a); }));
    const update = () => {
      const view = document.querySelector("[name=angle-view]:checked").value;
      const apart = document.querySelector("[name=angle-state]:checked").value === "apart";
      img.classList.add("swap");
      setTimeout(() => { img.src = angleSrc(A, view, apart); img.alt = angleAlt(A, view, apart); img.classList.remove("swap"); }, 150);
    };
    document.querySelectorAll("[name=angle-view], [name=angle-state]").forEach((r) => r.addEventListener("change", update));
  }

  /* ---------- "Meet Potty" character page, with a scripted chat demo ---------- */
  function characterPage() {
    const K = C.character, cols = ["peach", "sage", "lavender", "butter"];
    const canSpeak = "speechSynthesis" in window;
    main.innerHTML = `
    <section class="char-hero"><div class="wrap grid grid-2" style="align-items:center;gap:48px">
      <div><span class="eyebrow">${esc(K.eyebrow)}</span><h1>${esc(K.title)}</h1><p class="lead">${esc(K.intro)}</p>
        <div class="btn-row"><a class="btn" href="#chat">${esc(K.chatTitle)}</a><a class="btn btn-ghost" href="#control">${esc(K.controlTitle)}</a></div></div>
      <div class="char-greet">
        <div class="char-face"><img class="char-photo float" src="${C.home.heroImage}" alt="${esc(C.home.heroAlt)}"></div>
        <p class="bubble char-hello">${esc(K.greeting)}</p>
      </div>
    </div></section>

    <section class="section-alt"><div class="wrap">
      <div class="center reveal"><h2>${esc(K.profileTitle)}</h2><p class="lead">${esc(K.profileIntro)}</p></div>
      <div class="grid grid-3 traits" style="margin-top:32px">${K.traits.map((t, i) => `<div class="card reveal trait">
        <span class="trait-name bg-${cols[i % 4]}">${esc(t.name)}</span><p>${esc(t.text)}</p></div>`).join("")}</div>
      <div class="grid grid-2" style="margin-top:28px">
        <div class="card reveal"><h3>${esc(K.caresTitle)}</h3><ul class="ticks">${K.cares.map((c) => `<li>${esc(c)}</li>`).join("")}</ul></div>
        <div class="card reveal"><h3>${esc(K.neverTitle)}</h3><ul class="nevers">${K.never.map((c) => `<li><span aria-hidden="true">✕</span> ${esc(c)}</li>`).join("")}</ul></div>
      </div>
      <p class="center pronoun-note reveal">${esc(K.pronounNote)}</p>
    </div></section>

    <section><div class="wrap">
      <div class="center reveal"><h2>${esc(K.dayTitle)}</h2><p class="lead">${esc(K.dayIntro)}</p></div>
      <ol class="day-line">${K.day.map((d) => `<li class="reveal"><span class="day-time">${esc(d.time)}</span>
        <div class="card"><h3>${esc(d.title)}</h3><p class="bubble">“${esc(d.potty)}”</p><p class="day-note">${esc(d.note)}</p></div></li>`).join("")}</ol>
    </div></section>

    <section class="section-alt" id="chat"><div class="wrap">
      <div class="center reveal"><h2>${esc(K.chatTitle)}</h2><p class="lead">${esc(K.chatIntro)}</p></div>
      <div class="card chat-demo">
        <div class="chat-face" aria-hidden="true"><img class="char-photo " src="${C.home.heroImage}" alt=""></div>
        <div class="chat-main">
          <div class="chat-log" id="chat-log" role="log" aria-live="polite" aria-label="Conversation with Potty"></div>
          <p class="caption-note">${icon("volume").replace("<svg", '<svg width="18" height="18"')} Captions are always on: everything Potty says is written here.</p>
          <p class="chat-prompt" id="chat-prompt"></p>
          <div class="replies" id="chat-choices"></div>
          <div class="replies chat-tools">
            ${canSpeak ? `<button class="speak" id="chat-speak" type="button">${icon("volume")} Read Potty's last message aloud</button>` : ""}
            <button type="button" id="chat-restart">Start again</button>
          </div>
        </div>
      </div>
    </div></section>

    <section><div class="wrap grid grid-2" style="gap:48px;align-items:center">
      <div class="reveal"><h2>${esc(K.comfortTitle)}</h2><p class="lead">${esc(K.comfortBody)}</p>
        <a href="features.html#skin">About the skin-like cushions →</a></div>
      <div class="grid grid-2 comfort">${K.comfort.map((c, i) => `<div class="card reveal bg-${cols[i % 4]}" style="box-shadow:none"><h3>${esc(c.title)}</h3><p>${esc(c.body)}</p></div>`).join("")}</div>
    </div></section>

    <section class="section-alt"><div class="wrap">
      <div class="center reveal"><h2>${esc(K.growthTitle)}</h2><p class="lead">${esc(K.growthIntro)}</p></div>
      <ol class="growth">${K.growth.map((g, i) => `<li class="card reveal"><span class="num">${i + 1}</span><span class="when">${esc(g.when)}</span><h3>${esc(g.title)}</h3><p>${esc(g.body)}</p></li>`).join("")}</ol>
    </div></section>

    <section><div class="wrap grid grid-2" style="gap:48px;align-items:center">
      <div class="reveal"><h2>${esc(K.selfTitle)}</h2><p class="lead">${esc(K.selfIntro)}</p></div>
      <div class="card self-health reveal"><div class="self-head"><div class="self-face" aria-hidden="true"><img class="char-photo " src="${C.home.heroImage}" alt=""></div><strong>How I'm doing today</strong></div>
        <ul>${K.self.map((x) => `<li><div><strong>${esc(x.part)}</strong><span>“${esc(x.says)}”</span></div>
          <span class="status ${x.status === "good" ? "good" : "watch"}">${x.status === "good" ? "✓" : "!"} ${esc(K.selfLabels[x.status])}</span></li>`).join("")}</ul></div>
    </div></section>

    <section class="section-alt" id="control"><div class="wrap">
      <h2 class="center reveal">${esc(K.controlTitle)}</h2>
      <div class="grid grid-3" style="margin-top:32px">${K.control.map((c, i) => `<div class="card reveal"><div class="icon-badge bg-${cols[i % 4]}">${icon(c.icon, ICON_COLORS[cols[i % 4]])}</div><h3>${esc(c.title)}</h3><p>${esc(c.body)}</p></div>`).join("")}</div>
    </div></section>

    <section><div class="wrap grid grid-2" style="gap:48px;align-items:start">
      <div class="reveal"><h2>${esc(K.whyTitle)}</h2><ul class="ticks">${K.why.map((w) => `<li>${esc(w)}</li>`).join("")}</ul>
        <a href="design.html">Meet the people we designed for →</a></div>
      <div class="card reveal center" style="background:var(--lavender-soft)"><h2>${esc(K.ctaTitle)}</h2><p>${esc(K.ctaBody)}</p>
        <a class="btn" href="login.html">Open the demo</a></div>
    </div></section>`;

    // Scripted chat: choose a topic, then one of Potty's suggested replies, then another topic.
    const log = document.getElementById("chat-log"), choices = document.getElementById("chat-choices");
    const prompt = document.getElementById("chat-prompt");
    let last = K.greeting;
    const add = (who, text) => {
      const el = document.createElement("div");
      el.className = "msg " + who;
      el.innerHTML = `<span class="who">${who === "potty" ? "Potty" : "You"}</span><p>${esc(text)}</p>`;
      log.appendChild(el);
      log.scrollTop = log.scrollHeight;
      if (who === "potty") last = text;
    };
    const buttons = (label, list, onPick) => {
      prompt.textContent = label;
      choices.innerHTML = list.map((x, i) => `<button type="button" data-i="${i}">${esc(x.label)}</button>`).join("");
      choices.querySelectorAll("button").forEach((b) => (b.onclick = () => onPick(list[b.dataset.i])));
    };
    const topics = () => buttons("What would you like to talk about?", K.chat, (t) => {
      add("you", t.label); add("potty", t.potty);
      buttons("Choose your reply:", t.replies, (r) => {
        add("you", r.label); add("potty", r.potty);
        topics();
        prompt.textContent = "Talk about something else?";
        choices.querySelector("button").focus();
      });
      choices.querySelector("button").focus();
    });
    const restart = () => { log.innerHTML = ""; add("potty", K.greeting); topics(); };
    restart();
    document.getElementById("chat-restart").onclick = () => { restart(); choices.querySelector("button").focus(); };
    if (canSpeak) document.getElementById("chat-speak").onclick = () => {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(last);
      u.rate = 0.9; u.lang = "en-GB";
      speechSynthesis.speak(u);
    };
  }

  /* ---------- Developer area: a demo sign-in, then the animated version history ---------- */
  const DEV_KEY = "potty.dev";
  const devIn = () => { try { return sessionStorage.getItem(DEV_KEY) === "1"; } catch (e) { return false; } };
  // "Name: text" in a change list is shown with the name in bold
  const changeList = (list) => `<ul class="changes">${list.map((c) => { const m = c.match(/^([^:]{2,28}):\s(.*)$/); return `<li>${m ? `<strong>${esc(m[1])}:</strong> ${esc(m[2])}` : esc(c)}</li>`; }).join("")}</ul>`;

  // the tabs at the top of every developer page, with a way out
  function devNav(active) {
    return `<nav class="dev-tabs" aria-label="Developer area"><div class="wrap">
      <span class="dev-tabs-label">${icon("code")} ${esc(C.developer.eyebrow)}</span>
      <div class="dev-tabs-links">${C.developer.tabs.map((t) => `<a href="${t.href}"${t.href === active ? ' aria-current="page"' : ""}>${esc(t.label)}</a>`).join("")}</div>
      <button class="btn btn-small btn-ghost" id="dev-out">${icon("lock")} Leave</button></div></nav>`;
  }
  function wireDevNav() {
    // on phones the tabs scroll sideways, so start with the current one in view
    const links = document.querySelector(".dev-tabs-links"), cur = links.querySelector("[aria-current]");
    if (cur) links.scrollLeft = cur.offsetLeft - links.offsetLeft - 16;
    document.getElementById("dev-out").addEventListener("click", () => { try { sessionStorage.removeItem(DEV_KEY); } catch (e) {} location.href = "index.html"; });
  }
  // a <details> box that slides open and closed instead of jumping
  function smoothDetails(selector, bodySel) {
    const reduced = () => document.documentElement.dataset.motion === "off" || matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.querySelectorAll(selector).forEach((d) => {
      const body = d.querySelector(bodySel);
      let anim = null;
      d.querySelector("summary").addEventListener("click", (e) => {
        if (reduced() || !body.animate) return;
        e.preventDefault();
        if (anim) anim.cancel();
        const opening = !d.open || d.classList.contains("closing");
        const from = d.open ? body.offsetHeight : 0;
        d.open = true; d.classList.toggle("closing", !opening);
        const to = opening ? body.scrollHeight : 0;
        anim = body.animate([{ height: from + "px", opacity: opening ? 0 : 1 }, { height: to + "px", opacity: opening ? 1 : 0 }],
          { duration: Math.min(520, 260 + to / 4 + from / 4), easing: "cubic-bezier(.25,.8,.3,1)" });
        anim.onfinish = () => { anim = null; if (!opening) { d.open = false; d.classList.remove("closing"); } };
      });
    });
  }
  // sections and diagram steps animate in once they scroll into view
  function revealIn(selector, threshold = 0.25) {
    const els = [...document.querySelectorAll(selector)];
    const reduced = document.documentElement.dataset.motion === "off" || matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) return els.forEach((el) => el.classList.add("in"));
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold });
    els.forEach((el) => io.observe(el));
  }

  function developerPage() {
    const D = C.developer;
    if (!devIn()) return devLock(developerPage);
    const steps = C.releases.filter((r) => r.visual), later = C.releases.filter((r) => !r.visual);
    const img = (src, cls = "", alt = "") => `<img class="${cls}" src="${src}" alt="${alt}" loading="lazy">`;
    const views = (name) => `assets/img/views/together-${name}.png`;
    const lines = (n) => Array.from({ length: n }, (_, i) => `<span class="sk" style="--w:${60 + ((i * 37) % 35)}%"></span>`).join("");
    const featureIcons = C.features.map((f, i) => `<span class="icon-badge bg-${f.color}" style="--i:${i}">${icon(f.icon, ICON_COLORS[f.color])}</span>`).join("");
    const pin = (label, i) => `<span class="jv-pin" style="--i:${i}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z" fill="#c2553a"/><circle cx="12" cy="10" r="2.6" fill="#fff"/></svg>${label}</span>`;
    // a small copy of the Look inside model that comes apart and back together on its own
    const miniModel = `<div class="explode model jv-model"><svg viewBox="10 0 450 495" aria-hidden="true"><g class="whole">
      ${shellPart("shellBack", false)}${part("display")}<g class="part">${pic("bowl-apart", APART.bowl, "pa", "--to: translate(0px, 70px)")}</g>
      ${shellPart("shellFront", true)}${part("seat")}${part("armL")}${part("armR")}${part("backrest")}</g></svg></div>`;
    const V = {
      pages: () => `<div class="jv-pages">${["Home", "Features", "How it works", "Design story", "Sign in", "My space"].map((t, i) => `<div class="mini-page" style="--i:${i}"><div class="mini-bar"><i></i><i></i><i></i></div><b>${t}</b>${lines(3)}${i === 4 ? `<span class="mini-lock">${icon("lock", "#c2553a")}</span>` : ""}</div>`).join("")}</div>
        <div class="jv-icons">${featureIcons}</div>`,
      access: () => `<div class="jv-grid4">
        <div class="jv-tile"><span class="jv-aa">Aa</span><small>Bigger text</small></div>
        <div class="jv-tile"><span class="jv-theme"><span class="sun">☀</span><span class="moon">☾</span></span><small>Light or dark</small></div>
        <div class="jv-tile"><span class="jv-tap">Next →</span><small>Big buttons</small></div>
        <div class="jv-tile"><span class="jv-cap"><span>Good morning!</span></span><small>Captions</small></div></div>`,
      focus: () => `<div class="jv-focus"><div class="jv-lines">${lines(7)}</div>${img(views("front"), "jv-focus-potty")}</div>
        <div class="jv-row"><span class="jv-toast">Colours changed ✓<i class="strike"></i></span>${pin("Stara Zagora", 0)}${pin("Beirut", 1)}</div>`,
      redesign: () => `<div class="jv-swap"><figure class="jv-before">${pottySVG({ mood: "happy", label: "Potty drawing" })}<figcaption>Drawing</figcaption></figure>
        <span class="jv-arrow" aria-hidden="true">→</span>
        <figure class="jv-after">${img("assets/img/source/potty-render-v0.4.jpg", "", "The v0.4 Potty render")}<figcaption>Render</figcaption></figure></div>`,
      merge: () => `<div class="jv-merge">
        <div class="mini-form a"><b>Message</b>${lines(3)}</div>
        <div class="mini-form b"><b>Book a demo</b><span class="jv-cal">${icon("sparkle", "#5a4790")}</span>${lines(2)}</div>
        <div class="mini-form c"><b>Get in touch</b><span class="jv-toggle"><span class="on">Message</span><span>Demo</span></span>${lines(3)}</div></div>`,
      angles: () => `<div class="jv-fan">${["left", "back", "front", "top", "right"].map((v, i) => img(views(v), "", "") .replace("<img", `<img style="--k:${i - 2}"`)).join("")}</div>`,
      edges: () => `<div class="jv-zoom"><figure><div class="lens">${img("assets/img/journey/edge-before.png")}</div><figcaption>Before</figcaption></figure>
        <span class="jv-arrow" aria-hidden="true">→</span>
        <figure><div class="lens">${img("assets/img/journey/edge-after.png")}</div><figcaption>After</figcaption></figure></div>`,
      apart: () => miniModel,
      chat: () => `<div class="jv-chat">${img(C.home.heroImage, "jv-chat-potty")}
        <div class="jv-msgs"><p class="m potty" style="--i:0">Good morning! How did you sleep?</p><p class="m you" style="--i:1">Quite well, thanks.</p>
        <p class="m potty" style="--i:2">Lovely. Shall I read you the news?</p></div></div>`,
      timeline: () => `<div class="jv-tl">${["v0.1", "v1.0", "v2.0", "v3.0"].map((v, i) => `<div class="jv-tl-row" style="--i:${i}"><span class="jv-tl-dot"></span><b>${v}</b>${lines(1)}</div>`).join("")}</div>`,
      checks: () => `<ul class="jv-checks">${["Big buttons", "Fits a phone", "No pop-ups", "Data scrambled", "No errors"].map((t, i) => `<li style="--i:${i}"><span>✓</span>${t}</li>`).join("")}</ul>`,
      prompt: () => `<div class="jv-chat jv-prompt"><div class="jv-msgs">${[["you", "Goal, design direction and who it's for"], ["potty", "A few questions, with a default for each"], ["you", "Companion, scripted chat, and \"it\""], ["potty", "New version ready, tested on phone and desktop ✓"]].map(([w, t], i) => `<p class="m ${w}" style="--i:${i}">${esc(t)}</p>`).join("")}</div></div>`,
      blueprint: () => `<div class="jv-bp">${["HTML", "content.js", "site.js", "pages.js"].map((t, i) => `<span class="jv-bp-box" style="--i:${i}">${t}</span>`).join(`<span class="jv-bp-line" aria-hidden="true"></span>`)}</div>
        <div class="jv-row">${["Architecture", "Technologies"].map((t, i) => `<span class="jv-bp-tag" style="--i:${i}">${t}</span>`).join("")}</div>`,
      sensors: () => `<div class="jv-scan">${img(C.technology.mapImage, "jv-scan-potty")}<span class="jv-beam"></span>
        ${C.technology.zones.map((z, i) => `<span class="jv-spot" style="left:${z.x}%;top:${z.y}%;--i:${i}">${i + 1}</span>`).join("")}</div>
        <div class="jv-row"><span class="jv-lockchip">${icon("lock", "#5a4790")} admin</span></div>`,
    };
    const id = (v) => "v" + v.replace(/\D/g, "-").replace(/^-|-$/g, "");
    main.innerHTML = devNav("developer.html") + `
    <section class="j-hero"><div class="wrap center">
      <span class="eyebrow">${icon("code")} ${esc(D.eyebrow)}</span><h1>${esc(D.title)}</h1><p class="lead">${esc(D.intro)}</p>
      <nav class="j-dots" aria-label="Jump to a version">${steps.map((st) => `<a class="${st.major ? "major" : ""}" href="#${id(st.version)}">${esc(st.version)}</a>`).join("")}</nav>
      <ul class="j-legend"><li><span class="j-badge major">Major</span> ${esc(D.legendMajor)}</li><li><span class="j-badge">Minor</span> ${esc(D.legendMinor)}</li></ul>
      <p class="j-scroll" aria-hidden="true">Scroll ↓</p>
    </div></section>
    <section class="j-track"><div class="wrap">
      <div class="j-rail" aria-hidden="true"><span id="j-fill"></span></div>
      <ol class="j-steps">${steps.map((st, i) => `<li class="j-step${i % 2 ? " flip" : ""}${st.major ? " major" : ""}" id="${id(st.version)}">
        <div class="j-text"><span class="j-badge${st.major ? " major" : ""}">${st.major ? "Major update" : "Minor update"}</span>
          <span class="j-ver">${esc(st.version)}</span><span class="j-date">${esc(st.date)}</span>
          <h2>${esc(st.title)}</h2><ul class="j-tags">${st.tags.map((t, n) => `<li style="--i:${n}">${esc(t)}</li>`).join("")}</ul>
          <details class="j-more"><summary>Read more</summary><div class="j-more-body"><p>${esc(st.notes)}</p>${st.changes && st.changes.length ? changeList(st.changes) : ""}</div></details></div>
        <div class="jv jv--${st.visual}" aria-hidden="true">${(V[st.visual] || (() => ""))()}</div>
      </li>`).join("")}</ol>
    </div></section>
    <section class="section-alt"><div class="wrap">
      <h2 class="center">${esc(D.moreTitle)}</h2>
      <div class="grid grid-3" style="margin-top:32px">${D.more.map((c) => `<div class="card dev-soon">${c.href ? "" : `<span class="j-badge">Coming soon</span>`}<h3>${esc(c.title)}</h3><p>${esc(c.body)}</p>
        ${c.href ? `<a class="btn btn-small" href="${c.href}">${esc(c.cta)} →</a>` : ""}</div>`).join("")}
      </div>
      ${later.length ? `<p class="center dev-next">${later.map((r) => `<strong>${esc(r.version)}</strong> ${esc(r.notes)}`).join(" ")}</p>` : ""}
    </div></section>`;
    wireDevNav();

    smoothDetails(".j-more", ".j-more-body");

    const reduced = () => document.documentElement.dataset.motion === "off" || matchMedia("(prefers-reduced-motion: reduce)").matches;
    const items = [...document.querySelectorAll(".j-step")];
    const show = (el) => el.classList.add("in");
    if (reduced() || !("IntersectionObserver" in window)) items.forEach(show);
    else {
      const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } }), { threshold: 0.3 });
      items.forEach((el) => io.observe(el));
    }
    // the rail on the left fills up as you scroll through the versions
    const track = document.querySelector(".j-steps"), fill = document.getElementById("j-fill");
    const progress = () => {
      const r = track.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / r.height));
      fill.style.height = (p * 100).toFixed(1) + "%";
    };
    addEventListener("scroll", progress, { passive: true }); addEventListener("resize", progress); progress();
    // the mini Look inside model keeps coming apart and going back together while it's on screen
    const model = document.querySelector(".jv-model");
    if (model) {
      if (reduced()) model.classList.add("open");
      else {
        let t = null;
        new IntersectionObserver(([e]) => {
          clearInterval(t);
          if (e.isIntersecting) { setTimeout(() => model.classList.add("open"), 400); t = setInterval(() => model.classList.toggle("open"), 2600); }
        }, { threshold: 0.4 }).observe(model);
      }
    }
  }

  /* ---------- Developer area: Architecture page (diagrams of how the site is built) ---------- */
  // a row of boxes joined by arrows; it turns into a column on narrow screens
  const flowDiagram = (items, cls = "") => `<ol class="dg-flow ${cls}" style="--n:${items.length}">${items.map((f, i) => `${i ? `<li class="dg-link" aria-hidden="true" style="--i:${i}"><span></span></li>` : ""}
    <li class="dg-node" style="--i:${i}"><span class="dg-num">${i + 1}</span>${f.file ? `<code class="dg-file">${esc(f.file)}</code>` : ""}<h3>${esc(f.title)}</h3><p>${esc(f.body)}</p></li>`).join("")}</ol>`;

  function architecturePage() {
    if (!devIn()) return devLock(architecturePage);
    const A = C.developer.architecture;
    const head = (title, intro) => `<h2 class="center">${esc(title)}</h2>${intro ? `<p class="center lead dg-intro">${esc(intro)}</p>` : ""}`;
    main.innerHTML = devNav("developer-architecture.html") + `
    <section class="j-hero"><div class="wrap center">
      <span class="eyebrow">Architecture</span><h1>${esc(A.title)}</h1><p class="lead">${esc(A.intro)}</p>
      <ul class="dg-stats">${A.stats.map((x, i) => `<li style="--i:${i}"><b>${esc(x.value)}</b><span>${esc(x.label)}</span></li>`).join("")}</ul>
    </div></section>
    <section class="section-alt"><div class="wrap">${head(A.flowTitle, A.flowIntro)}${flowDiagram(A.flow, "dg-files")}</div></section>
    <section><div class="wrap">${head(A.layersTitle, A.layersIntro)}
      <ol class="dg-layers">${A.layers.map((l, i) => `<li class="dg-layer bg-${l.color}" style="--i:${i}">
        <div class="dg-layer-name"><h3>${esc(l.name)}</h3><span>${esc(l.kind)}</span></div>
        <ul>${l.items.map((t) => { const m = t.match(/^([^:]+):\s(.*)$/); return `<li>${m ? `<code>${esc(m[1])}</code> ${esc(m[2])}` : `<code>${esc(t)}</code>`}</li>`; }).join("")}</ul></li>`).join("")}</ol>
    </div></section>
    <section class="section-alt"><div class="wrap">${head(A.mapTitle, A.mapIntro)}
      <div class="dg-tree">
        <div class="dg-root">${icon("smile")} Home</div>
        <div class="dg-branches">
          <div class="dg-branch" style="--i:0"><h3>Open to everyone</h3><ul>${A.mapPublic.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
          ${A.mapLocked.map((g, i) => `<div class="dg-branch locked" style="--i:${i + 1}"><h3>${esc(g.door)}</h3>
            <span class="dg-lock">${icon("lock")} ${esc(g.lock)}</span><ul>${g.pages.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>`).join("")}
        </div>
      </div>
    </div></section>
    <section><div class="wrap">${head(A.privacyTitle, A.privacyIntro)}${flowDiagram(A.privacy, "dg-privacy")}
      <p class="tech-note dg-note">${icon("shield", "#5a4790")} ${esc(A.privacyNote)}</p></div></section>
    <section class="section-alt"><div class="wrap">${head(A.pipelineTitle, A.pipelineIntro)}${flowDiagram(A.pipeline, "dg-pipe")}</div></section>
    <section><div class="wrap">${head(A.decisionsTitle)}
      <div class="grid grid-3 dg-cards">${A.decisions.map((d, i) => `<div class="card dg-card" style="--i:${i}"><h3>${esc(d.title)}</h3><p>${esc(d.body)}</p></div>`).join("")}</div>
    </div></section>`;
    wireDevNav();
    revealIn(".dg-stats, .dg-flow, .dg-layers, .dg-tree, .dg-cards", 0.2);
  }

  /* ---------- Developer area: Technologies page ---------- */
  function technologiesPage() {
    if (!devIn()) return devLock(technologiesPage);
    const T = C.developer.technologies;
    const total = T.code.reduce((n, c) => n + c.lines, 0) || 1;
    main.innerHTML = devNav("developer-technology.html") + `
    <section class="j-hero"><div class="wrap center">
      <span class="eyebrow">Technologies</span><h1>${esc(T.title)}</h1><p class="lead">${esc(T.intro)}</p>
      <div class="tc-code"><h2>${esc(T.codeTitle)}</h2>
        <div class="tc-bar" role="img" aria-label="${T.code.map((c) => `${c.name} ${Math.round((c.lines / total) * 100)}%`).join(", ")}">${T.code.map((c, i) => `<span style="--w:${((c.lines / total) * 100).toFixed(1)}%;--c:${c.color};--i:${i}"></span>`).join("")}</div>
        <ul class="tc-legend">${T.code.map((c) => `<li><i style="background:${c.color}"></i><b>${esc(c.name)}</b> ${Math.round((c.lines / total) * 100)}% <span>(${c.lines.toLocaleString("en-GB")} lines)</span></li>`).join("")}</ul>
        <p class="f-note">${esc(T.codeNote)}</p></div>
    </div></section>
    ${T.groups.map((g, n) => `<section class="${n % 2 ? "" : "section-alt"}"><div class="wrap">
      <h2 class="center">${esc(g.title)}</h2>${g.note ? `<p class="center lead dg-intro">${esc(g.note)}</p>` : ""}
      <div class="tc-grid">${g.items.map((t, i) => `<article class="card tc-card" style="--i:${i}">
        <div class="sensor-head"><div class="icon-badge bg-${t.color}" style="margin:0;flex:none">${icon(t.icon, ICON_COLORS[t.color])}</div>
          <div><h3>${esc(t.name)}</h3><p class="sensor-tech">${esc(t.what)}</p></div></div>
        <dl class="sensor-facts"><dt>Why</dt><dd>${esc(t.why)}</dd><dt>How</dt><dd>${esc(t.how)}</dd><dt>Where</dt><dd><code>${esc(t.where)}</code></dd></dl>
      </article>`).join("")}</div>
    </div></section>`).join("")}
    <section class="${T.groups.length % 2 ? "" : "section-alt"}"><div class="wrap">
      <h2 class="center">${esc(T.notUsedTitle)}</h2>
      <div class="grid grid-4 tc-grid tc-not">${T.notUsed.map((x, i) => `<div class="card tc-card" style="--i:${i}"><span class="tc-x" aria-hidden="true">✕</span><h3>${esc(x.title)}</h3><p>${esc(x.body)}</p></div>`).join("")}</div>
    </div></section>`;
    wireDevNav();
    revealIn(".tc-code, .tc-grid", 0.15);
  }

  /* ---------- Developer area: How we worked with Claude (prompting framework and the real conversation) ---------- */
  function promptsPage() {
    if (!devIn()) return devLock(promptsPage);
    const P = C.developer.prompts;
    const head = (title, intro) => `<h2 class="center">${esc(title)}</h2>${intro ? `<p class="center lead dg-intro">${esc(intro)}</p>` : ""}`;
    main.innerHTML = devNav("developer-prompts.html") + `
    <section class="j-hero"><div class="wrap center">
      <span class="eyebrow">Prompts</span><h1>${esc(P.title)}</h1><p class="lead">${esc(P.intro)}</p>
      <ul class="dg-stats">${P.stats.map((x, i) => `<li style="--i:${i}"><b>${esc(x.value)}</b><span>${esc(x.label)}</span></li>`).join("")}</ul>
    </div></section>
    <section class="section-alt"><div class="wrap">${head(P.anatomyTitle, P.anatomyIntro)}
      <div class="pr-anatomy">${P.anatomy.map((a, i) => `<article class="card pr-part" style="--i:${i}">
        <span class="pr-tag bg-${a.color}">${esc(a.name)}</span><p>${esc(a.body)}</p>
        <blockquote>“${esc(a.quote)}”</blockquote></article>`).join("")}</div>
    </div></section>
    <section><div class="wrap">${head(P.loopTitle, P.loopIntro)}${flowDiagram(P.loop, "dg-loop")}
      <p class="pr-repeat" aria-hidden="true">↻ and round again</p></div></section>
    <section class="section-alt"><div class="wrap">${head(P.tipsTitle)}
      <div class="grid grid-3 dg-cards">${P.tips.map((d, i) => `<div class="card dg-card" style="--i:${i}"><h3>${esc(d.title)}</h3><p>${esc(d.body)}</p></div>`).join("")}</div>
    </div></section>`;
    wireDevNav();
    revealIn(".dg-stats, .dg-flow, .dg-cards, .pr-anatomy", 0.15);
  }

  /* ---------- Developer area: Validation (our rules, and the results of the automatic checks) ---------- */
  function validationPage() {
    if (!devIn()) return devLock(validationPage);
    const V = C.developer.validation, R = window.POTTY_VALIDATION || null;
    const head = (title, intro) => `<h2 class="center">${esc(title)}</h2>${intro ? `<p class="center lead dg-intro">${esc(intro)}</p>` : ""}`;
    const result = (r) => (r.eye ? { cls: "eye", label: V.eyeLabel } : !R || !R.results[r.id] ? { cls: "none", label: V.notRunLabel }
      : R.results[r.id].pass ? { cls: "pass", label: "Passed" } : { cls: "fail", label: "Failed" });
    const auto = V.rules.filter((r) => !r.eye), passed = R ? auto.filter((r) => R.results[r.id] && R.results[r.id].pass).length : 0;
    main.innerHTML = devNav("developer-validation.html") + `
    <section class="j-hero"><div class="wrap center">
      <span class="eyebrow">Validation</span><h1>${esc(V.title)}</h1><p class="lead">${esc(V.intro)}</p>
      <figure class="va-quote"><blockquote>“${esc(V.quote)}”</blockquote><figcaption>${esc(V.quoteSource)}</figcaption></figure>
    </div></section>
    <section class="section-alt"><div class="wrap">${head(V.cycleTitle, V.cycleIntro)}${flowDiagram(V.cycle, "dg-cycle")}</div></section>
    <section><div class="wrap">${head(V.examplesTitle)}
      <div class="va-examples">${V.examples.map((x, i) => `<article class="va-ex" style="--i:${i}">
        <div class="va-step va-said"><span>We said</span><blockquote>“${esc(x.said)}”</blockquote></div>
        <div class="va-step va-rl"><span>The rule</span><p>${esc(x.rule)}</p></div>
        <div class="va-step va-ck"><span>The check</span><p>${esc(x.check)}</p></div></article>`).join("")}</div>
    </div></section>
    <section class="section-alt"><div class="wrap">${head(V.rulesTitle, V.rulesIntro)}
      <div class="va-score">${R ? `<b>${passed} of ${auto.length}</b> automatic checks passed on ${esc(R.date)} <span>(${esc(R.runner)})</span>` : esc(V.notRunLabel)}
        · <b>${V.rules.length - auto.length}</b> checked by eye</div>
      ${V.areas.map((a) => `<h3 class="va-area">${esc(a.title)}</h3>
        <ul class="va-rules">${V.rules.filter((r) => r.area === a.id).map((r) => { const st = result(r), d = R && R.results[r.id] ? R.results[r.id].detail : "";
          return `<li class="va-rule"><span class="va-badge ${st.cls}">${st.cls === "pass" ? "✓ " : st.cls === "fail" ? "✕ " : st.cls === "eye" ? "◉ " : ""}${esc(st.label)}</span>
            <div><p class="va-text">${esc(r.rule)}</p><p class="va-meta">From: ${esc(r.source)}${d ? ` · ${esc(d)}` : ""}</p></div></li>`; }).join("")}</ul>`).join("")}
    </div></section>
    <section><div class="wrap" style="max-width:760px">
      <div class="card va-run"><h2>${esc(V.runTitle)}</h2><p>${esc(V.runBody)}</p>
        <pre><code>${V.runCommands.map(esc).join("\n")}</code></pre></div>
    </div></section>`;
    wireDevNav();
    revealIn(".dg-flow", 0.15);
  }

  // the demo lock screen: any visitor can get in with admin / admin
  function devLock(after) {
    const D = C.developer;
    main.innerHTML = `<section class="auth"><div class="wrap" style="display:flex;justify-content:center">
      <div class="card auth-card">
        <div class="dev-lock-icon">${icon("code", "#5a4790")}</div>
        <h1 class="center" style="font-size:2rem">${esc(D.lockTitle)}</h1>
        <p class="center" style="color:var(--ink-soft)">${esc(D.lockIntro)}</p>
        <div id="msg" role="alert"></div>
        <form id="dev-form" novalidate>
          <div class="field"><label for="dev-u">Username</label><input id="dev-u" autocomplete="off" required></div>
          <div class="field"><label for="dev-p">Password</label><input id="dev-p" type="password" autocomplete="off" required></div>
          <button class="btn" style="width:100%" type="submit">${icon("lock")} Open the developer area</button>
          <div class="hint">${esc(D.lockHint)} <button type="button" class="btn btn-small btn-ghost" id="dev-fill" style="margin-top:8px">Fill it in for me</button></div>
        </form>
      </div></div></section>`;
    const u = document.getElementById("dev-u"), pw = document.getElementById("dev-p"), msg = document.getElementById("msg");
    document.getElementById("dev-fill").addEventListener("click", () => { u.value = D.demoUser.username; pw.value = D.demoUser.password; });
    document.getElementById("dev-form").addEventListener("submit", (e) => {
      e.preventDefault();
      if (u.value.trim().toLowerCase() === D.demoUser.username && pw.value === D.demoUser.password) {
        try { sessionStorage.setItem(DEV_KEY, "1"); } catch (err) {}
        window.scrollTo(0, 0); after();
      } else {
        msg.innerHTML = `<div class="form-msg error">That username or password is not right. For this demo, both are ${esc(D.demoUser.username)}.</div>`;
        pw.value = ""; pw.focus();
      }
    });
  }

  /* ---------- Tech story page: where each health sensor sits and what it does ---------- */
  function technologyPage() {
    const T = C.technology;
    const zoneNo = (zid) => T.zones.findIndex((z) => z.id === zid) + 1;
    const sensorCard = (x) => `<article class="card sensor">
      <div class="sensor-head"><div class="icon-badge bg-${x.color}" style="margin:0;flex:none">${icon(x.icon, ICON_COLORS[x.color])}</div>
        <div><h3>${esc(x.name)}</h3><p class="sensor-tech">${esc(x.tech)}</p></div></div>
      <dl class="sensor-facts"><dt>Where it sits</dt><dd>${esc(x.where)}</dd><dt>How it works</dt><dd>${esc(x.how)}</dd>
        <dt>What it looks for</dt><dd>${esc(x.finds)}</dd><dt>What happens next</dt><dd>${esc(x.happens)}</dd></dl></article>`;
    main.innerHTML = `
    <section class="hero-sm"><div class="wrap center" style="max-width:820px">
      <span class="eyebrow">${esc(T.eyebrow)}</span><h1>${esc(T.title)}</h1><p class="lead">${esc(T.intro)}</p>
      <p class="tech-note">${icon("shield", "#5a4790")} ${esc(T.disclaimer)}</p>
    </div></section>
    <section class="section-alt"><div class="wrap">
      <h2 class="center">${esc(T.mapTitle)}</h2><p class="center lead">${esc(T.mapIntro)}</p>
      <div class="tech-map">
        <div class="tech-figure">
          <img src="${T.mapImage}" alt="Potty seen from the front">
          ${T.zones.map((z, i) => `<button class="tech-spot" style="left:${z.x}%;top:${z.y}%" data-zone="${z.id}" aria-label="${i + 1}: ${esc(z.label)}">${i + 1}</button>`).join("")}
        </div>
        <div class="tech-panel">
          <div class="tabs tech-tabs" role="tablist" aria-label="Parts of Potty">${T.zones.map((z, i) => `<button role="tab" id="tab-${z.id}" aria-controls="zone-${z.id}" data-zone="${z.id}">${i + 1}. ${esc(z.label)}</button>`).join("")}</div>
          ${T.zones.map((z) => `<div class="tech-zone" role="tabpanel" id="zone-${z.id}" aria-labelledby="tab-${z.id}">
            <p class="tech-count">${((n) => `${n} ${n === 1 ? "sensor" : "sensors"}`)(T.sensors.filter((x) => x.zone === z.id).length)} in the ${esc(z.label.toLowerCase())}</p>
            ${T.sensors.filter((x) => x.zone === z.id).map(sensorCard).join("")}</div>`).join("")}
        </div>
      </div>
    </div></section>
    <section><div class="wrap">
      <h2 class="center">${esc(T.journeyTitle)}</h2>
      <ol class="tech-journey">${T.journey.map((j, i) => `<li class="reveal" style="--i:${i}"><span class="tech-step">${i + 1}</span><h3>${esc(j.title)}</h3><p>${esc(j.body)}</p></li>`).join("")}</ol>
    </div></section>
    <section class="section-alt"><div class="wrap grid grid-2">
      <div class="card reveal"><h2>${esc(T.privacyTitle)}</h2><ul class="ticks">${T.privacy.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
      <div class="card reveal bg-lavender" style="box-shadow:none"><h2>${esc(T.challengeTitle)}</h2><p>${esc(T.challenge)}</p>
        <div class="btn-row"><a class="btn" href="character.html">Meet Potty</a><a class="btn btn-ghost" href="how-it-works.html">How it works</a></div></div>
    </div></section>`;

    const pick = (zid, focus) => {
      document.querySelectorAll(".tech-tabs [role=tab]").forEach((b) => { const on = b.dataset.zone === zid; b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1; if (on && focus) b.focus(); });
      document.querySelectorAll(".tech-spot").forEach((b) => b.classList.toggle("on", b.dataset.zone === zid));
      document.querySelectorAll(".tech-zone").forEach((z) => { z.hidden = z.id !== "zone-" + zid; });
    };
    document.querySelectorAll("[data-zone]").forEach((b) => b.addEventListener("click", () => {
      pick(b.dataset.zone);
      // on phones the cards sit under the picture, so bring them into view
      if (b.classList.contains("tech-spot") && matchMedia("(max-width: 860px)").matches) document.querySelector(".tech-panel").scrollIntoView({ behavior: "smooth", block: "start" });
    }));
    const tabs = [...document.querySelectorAll(".tech-tabs [role=tab]")];
    tabs.forEach((b, i) => b.addEventListener("keydown", (e) => {
      const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (d) { e.preventDefault(); pick(tabs[(i + d + tabs.length) % tabs.length].dataset.zone, true); }
    }));
    pick("bowl");
  }

  /* ---------- Contact page (demo forms: nothing is sent) ---------- */
  function contactPage() {
    const K = C.contact, G = K.page;
    const tel = (n) => `<a href="tel:${esc(n.replace(/\s/g, ""))}">${esc(n)}</a>`;
    const field = (id, label, help, input) => `<div class="field" data-field="${id}"><label for="${id}">${label}</label>
      ${help ? `<span class="help" id="${id}-help">${help}</span>` : ""}${input}<p class="field-error" id="${id}-err" hidden></p></div>`;
    const choices = (name, legend, opts, first = true) => `<fieldset class="choices" data-field="${name}"><legend>${legend}</legend>
      <div class="choice-grid">${opts.map((o, i) => `<label class="choice"><input type="radio" name="${name}" value="${esc(o)}" ${first && i === 0 ? "checked" : ""}><span>${esc(o)}</span></label>`).join("")}</div></fieldset>`;
    main.innerHTML = `
    <section style="padding-bottom:32px"><div class="wrap">
      <span class="eyebrow">${esc(G.eyebrow)}</span><h1>${esc(G.title)}</h1><p class="lead">${esc(G.intro)}</p>
      <p class="demo-note">${icon("sparkle")} ${esc(G.demoNote)}</p>
    </div></section>
    <section style="padding-top:0"><div class="wrap contact-layout">
      <div class="contact-forms">
        <div class="card" id="contact-card">
          <h2>Get in touch</h2>
          <p class="help-line">Choose what you'd like to do, then fill in the details. Fields marked <strong>(required)</strong> must be filled in.</p>
          <form id="contact-form" novalidate>
            <fieldset class="choices big-choices" data-field="c-type"><legend>What would you like to do?</legend>
              <div class="choice-grid">
                <label class="choice"><input type="radio" name="c-type" value="message" checked><span><strong>Send a message</strong><small>Ask a question or tell us something</small></span></label>
                <label class="choice"><input type="radio" name="c-type" value="demo"><span><strong>Book a demo</strong><small>See and feel Potty for yourself</small></span></label>
              </div></fieldset>
            ${field("c-name", "Your name <strong>(required)</strong>", "", `<input id="c-name" autocomplete="name">`)}
            ${field("c-email", "Email address <strong>(required)</strong>", "We'll only use it to reply to you.", `<input id="c-email" type="email" autocomplete="email" aria-describedby="c-email-help">`)}
            ${field("c-phone", "Phone number (optional)", "Add this if you'd like us to call you.", `<input id="c-phone" type="tel" autocomplete="tel" aria-describedby="c-phone-help">`)}
            <div id="part-message">
              ${choices("c-topic", "What is your message about?", G.topics)}
              ${field("c-msg", "Your message <strong>(required)</strong>", "Write as much or as little as you like. There's no time limit.", `<textarea id="c-msg" rows="5" aria-describedby="c-msg-help"></textarea>`)}
            </div>
            <div id="part-demo" hidden>
              ${choices("d-place", "Where would you like the demo?", G.demoPlaces)}
              ${field("d-date", "Preferred date (optional)", "Pick any day. We'll suggest the nearest free slot.", `<input id="d-date" type="date" aria-describedby="d-date-help">`)}
              ${choices("d-time", "Best time of day", G.times)}
              ${field("d-note", "Anything we should know? (optional)", "For example, if you'd like to bring someone with you.", `<textarea id="d-note" rows="3" aria-describedby="d-note-help"></textarea>`)}
            </div>
            ${choices("c-reply", "How should we reply?", ["By email", "By phone"])}
            <div class="field" data-field="c-ok"><label class="check"><input type="checkbox" id="c-ok"><span>I agree that Potty Care can use these details only to reply to me. <strong>(required)</strong></span></label>
              <p class="field-error" id="c-ok-err" hidden></p></div>
            <button class="btn" type="submit" id="c-submit" style="width:100%">Send message</button>
          </form>
        </div>
      </div>

      <aside class="contact-side" aria-label="Our details">
        <div class="card"><h2 class="h3">${esc(K.company)}</h2>
          <p><strong>Email</strong><br><a href="mailto:${esc(K.email)}">${esc(K.email)}</a></p>
          <p><strong>Phone</strong><br>${tel(K.phone)}</p>
          <p><strong>Opening hours</strong><br>${esc(K.hours)}</p></div>
        ${K.offices.map((o) => `<div class="card"><span class="eyebrow">${esc(o.city)}</span><h2 class="h3">${esc(o.role)}</h2>
          <address>${o.address.map(esc).join("<br>")}</address>
          <p style="margin-top:12px"><strong>Phone</strong><br>${tel(o.phone)}</p></div>`).join("")}
        <p class="contact-note">${esc(K.note)}</p>
      </aside>
    </div></section>

    <section class="section-alt"><div class="wrap" style="max-width:820px">
      <h2>Before you write</h2>
      ${G.faqs.map((f) => `<details class="faq"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")}
    </div></section>`;

    // Friendly validation with messages next to each field, then an in-page confirmation.
    const val = (id) => (document.getElementById(id).value || "").trim();
    function showErrors(form, errors) {
      form.querySelectorAll(".field-error").forEach((e) => { e.hidden = true; e.textContent = ""; });
      form.querySelectorAll("[aria-invalid]").forEach((e) => e.removeAttribute("aria-invalid"));
      errors.forEach(([id, text]) => {
        const err = document.getElementById(id + "-err"), input = document.getElementById(id);
        err.textContent = "⚠ " + text; err.hidden = false;
        input.setAttribute("aria-invalid", "true");
      });
      if (errors.length) document.getElementById(errors[0][0]).focus();
      return !errors.length;
    }
    function success(card, title, lines, again) {
      const ref = "PC-" + Math.floor(1000 + Math.random() * 9000);
      const original = card.innerHTML;
      card.innerHTML = `<div class="sent" tabindex="-1"><div class="sent-icon" aria-hidden="true">✓</div>
        <h2>${esc(title)}</h2>${lines.map((l) => `<p>${esc(l)}</p>`).join("")}
        <p class="f-ref">Your reference number: <strong>${ref}</strong></p>
        <p class="demo-note">${esc(G.demoNote)}</p>
        <button class="btn btn-ghost" type="button">${esc(again)}</button></div>`;
      card.querySelector(".sent").focus();
      card.querySelector("button").onclick = () => { card.innerHTML = original; wire(); card.querySelector("input").focus(); };
    }
    function wire() {
      const form = document.getElementById("contact-form");
      if (!form) return;
      const isDemo = () => form.querySelector('[name="c-type"]:checked').value === "demo";
      const sync = () => {
        document.getElementById("part-message").hidden = isDemo();
        document.getElementById("part-demo").hidden = !isDemo();
        document.getElementById("c-submit").textContent = isDemo() ? "Request my demo" : "Send message";
      };
      form.querySelectorAll('[name="c-type"]').forEach((r) => r.addEventListener("change", sync));
      sync();
      form.onsubmit = (e) => {
        e.preventDefault();
        const errs = [];
        if (!val("c-name")) errs.push(["c-name", "Please tell us your name."]);
        if (!/^\S+@\S+\.\S+$/.test(val("c-email"))) errs.push(["c-email", "Please type an email address, like name@example.com."]);
        if (!isDemo() && !val("c-msg")) errs.push(["c-msg", "Please write a short message."]);
        if (!document.getElementById("c-ok").checked) errs.push(["c-ok", "Please tick the box so we're allowed to reply."]);
        if (!showErrors(form, errs)) return;
        const how = form.querySelector('[name="c-reply"]:checked').value.toLowerCase();
        const card = document.getElementById("contact-card");
        if (isDemo()) {
          const place = form.querySelector('[name="d-place"]:checked').value.replace(/^./, (c) => c.toLowerCase());
          const when = val("d-date") ? new Date(val("d-date") + "T00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }) : "a day that suits you";
          const time = form.querySelector('[name="d-time"]:checked').value.toLowerCase();
          success(card, `Thank you, ${val("c-name")}. Your demo request is in.`,
            [`We'll contact you ${how} to confirm a demo ${place}, on ${when}, in the ${time}.`, "Nothing is booked until we confirm with you."], "Start again");
        } else {
          success(card, `Thank you, ${val("c-name")}. Your message has been sent.`,
            [`We'll reply ${how} within two working days.`, "You don't need to do anything else."], "Send another message");
        }
      };
    }
    wire();
  }

  const pages = {
    home() {
      const h = C.home;
      main.innerHTML = `
      <section class="hero"><div class="wrap">
        <div>
          <span class="eyebrow">${esc(h.eyebrow)}</span>
          <h1>${esc(h.title)}</h1>
          <p class="lead">${esc(h.intro)}</p>
          <div class="btn-row">
            <a class="btn" href="${h.primaryCta.href}">${esc(h.primaryCta.label)}</a>
            <a class="btn btn-ghost" href="${h.secondaryCta.href}">${esc(h.secondaryCta.label)}</a>
          </div>
          <div class="stats">${h.stats.map((s) => `<div class="stat"><strong>${esc(s.value)}</strong><span>${esc(s.label)}</span></div>`).join("")}</div>
        </div>
        <div class="hero-art">${explodeMarkup()}</div>
      </div></section>

      <section class="section-alt"><div class="wrap">
        <div class="center reveal"><span class="eyebrow">What makes Potty different</span><h2>Designed around how you feel</h2>
          <p class="lead">${esc(C.howItWorks.intro)}</p></div>
        <div class="grid grid-4" style="margin-top:40px">${C.features.map(featureCard).join("")}</div>
      </div></section>

      ${anglesMarkup()}

      <section><div class="wrap grid grid-2" style="align-items:center;gap:56px">
        <div class="reveal"><h2>${esc(h.whyTitle)}</h2>${h.whyBody.map((p) => `<p>${esc(p)}</p>`).join("")}
          <a class="btn" href="design.html" style="margin-top:12px">Read our design story</a></div>
        <div class="card reveal" style="background:var(--lavender-soft)">
          <blockquote class="quote" style="margin:0">“${esc(h.quote.text)}”<footer>${esc(h.quote.by)}</footer></blockquote>
        </div>
      </div></section>

      <section class="section-alt"><div class="wrap center reveal">
        <div style="width:110px;margin:0 auto 16px">${icon("lock", "#c2553a")}</div>
        <h2>${esc(C.howItWorks.privacyTitle)}</h2>
        <p class="lead">${esc(C.howItWorks.privacyIntro)}</p>
        <div class="btn-row" style="justify-content:center">
          <a class="btn" href="login.html">Try the private space</a>
          <a class="btn btn-ghost" href="how-it-works.html#privacy">How we protect you</a>
        </div>
      </div></section>`;
      wireExplode();
      wireAngles();
    },

    features() {
      main.innerHTML = `
      <section style="padding-bottom:24px"><div class="wrap center">
        <span class="eyebrow">Features</span><h1>Everything Potty does for you</h1>
        <p class="lead">Each feature started from a real human need: comfort, reassurance, company and control.</p>
        <div class="chips" style="justify-content:center">${C.features.map((f) => `<a class="chip" href="#${f.id}">${esc(f.title)}</a>`).join("")}</div>
      </div></section>
      <section style="padding-top:0"><div class="wrap">
        ${C.features.map((f) => `
        <article class="feature-row reveal" id="${f.id}">
          <div class="feature-art bg-${f.color}"><img src="${f.image}" alt="Illustration for ${esc(f.title)}"></div>
          <div>
            <div class="icon-badge bg-${f.color}">${icon(f.icon, ICON_COLORS[f.color])}</div>
            <h2>${esc(f.title)}</h2>
            <p class="lead">${esc(f.body)}</p>
            <ul class="ticks">${f.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
            ${f.link ? `<a class="btn" href="${f.link.href}" style="margin-top:8px">${esc(f.link.label)} →</a>` : ""}
          </div>
        </article>`).join("")}
      </div></section>
      <section class="section-alt"><div class="wrap center reveal">
        <h2>See it working for you</h2>
        <p class="lead">Sign in to the demo to explore sample health insights and chat with Potty.</p>
        <div class="btn-row" style="justify-content:center"><a class="btn" href="login.html">Open the demo</a></div>
      </div></section>`;
    },

    how() {
      const h = C.howItWorks;
      main.innerHTML = `
      <section><div class="wrap grid grid-2" style="align-items:center;gap:56px">
        <div><span class="eyebrow">How it works</span><h1>${esc(h.title)}</h1><p class="lead">${esc(h.intro)}</p></div>
        <div style="max-width:360px;margin:0 auto">${pottySVG({ mood: "love", cls: "float" })}</div>
      </div></section>
      <section class="section-alt" style="padding-top:56px"><div class="wrap">
        <h2 class="center">A visit with Potty</h2>
        <ol class="steps">${h.steps.map((s) => `<li class="reveal"><div><h3>${esc(s.title)}</h3><p>${esc(s.body)}</p></div></li>`).join("")}</ol>
      </div></section>
      <section id="privacy"><div class="wrap">
        <div class="center reveal"><span class="eyebrow">Privacy</span><h2>${esc(h.privacyTitle)}</h2><p class="lead">${esc(h.privacyIntro)}</p></div>
        <div class="grid grid-4" style="margin-top:40px">
          ${h.privacy.map((p, i) => {
            const ic = ["lock", "shield", "eyeoff", "share"][i % 4];
            const col = ["peach", "sage", "lavender", "butter"][i % 4];
            return `<div class="card reveal"><div class="icon-badge bg-${col}">${icon(ic, ICON_COLORS[col])}</div><h3>${esc(p.title)}</h3><p>${esc(p.body)}</p></div>`;
          }).join("")}
        </div>
        <div class="btn-row" style="justify-content:center"><a class="btn" href="login.html">See your private space</a></div>
      </div></section>`;
    },

    design() {
      const d = C.design;
      const cols = ["peach", "sage", "lavender", "butter"];
      main.innerHTML = `
      <section><div class="wrap center">
        <span class="eyebrow">${esc(C.product.course)}</span><h1>${esc(d.title)}</h1><p class="lead">${esc(d.intro)}</p>
      </div></section>
      <section class="section-alt"><div class="wrap grid grid-2" style="gap:32px">
        <div class="card reveal"><h2>${esc(d.problemTitle)}</h2><p>${esc(d.problem)}</p></div>
        <div class="card reveal"><h2>${esc(d.audienceTitle)}</h2><p>${esc(d.audience)}</p>
          <ul class="ticks">${d.insights.slice(0, 2).map((i) => `<li>${esc(i)}</li>`).join("")}</ul></div>
      </div></section>
      <section><div class="wrap">
        <h2 class="center">Meet the people we designed for</h2>
        <div class="grid grid-3" style="margin-top:36px">
          ${d.personas.map((p) => `<div class="card persona reveal">
            <img src="${p.image}" alt="Illustrated portrait of ${esc(p.name)}">
            <h3>${esc(p.name)}</h3><p class="role">${esc(p.role)}</p>
            <dl><dt>Needs</dt><dd>${esc(p.needs)}</dd><dt>Frustration</dt><dd>${esc(p.frustration)}</dd></dl>
          </div>`).join("")}
        </div>
      </div></section>
      <section class="section-alt"><div class="wrap">
        <h2 class="center">${esc(d.insightsTitle)}</h2>
        <div class="grid grid-2" style="margin-top:32px">${d.insights.map((i, n) => `<div class="card reveal" style="display:flex;gap:16px;align-items:flex-start">
          <div class="icon-badge bg-${cols[n % 4]}" style="margin:0;flex:none">${icon("sparkle", ICON_COLORS[cols[n % 4]])}</div><p style="margin:0">${esc(i)}</p></div>`).join("")}</div>
      </div></section>
      <section><div class="wrap">
        <h2 class="center">${esc(d.principlesTitle)}</h2>
        <div class="grid grid-4" style="margin-top:32px">${d.principles.map((p, n) => `<div class="card reveal bg-${cols[n % 4]}" style="box-shadow:none"><h3>${esc(p.title)}</h3><p>${esc(p.body)}</p></div>`).join("")}</div>
      </div></section>
      <section class="section-alt"><div class="wrap" style="max-width:760px">
        <div class="card dev-note reveal"><div class="icon-badge bg-lavender" style="margin:0;flex:none">${icon("code", ICON_COLORS.lavender)}</div>
          <div><h2>${esc(d.devNoteTitle)}</h2><p>${esc(d.devNoteBody)}</p>
          <a class="btn btn-ghost" href="${C.footer.devLink.href}">${icon("lock")} Open the developer area</a></div></div>
      </div></section>`;
    },
  };

  if (page === "contact") return contactPage();
  if (page === "character") return characterPage();
  if (page === "developer") return developerPage();
  if (page === "dev-architecture") return architecturePage();
  if (page === "dev-technology") return technologiesPage();
  if (page === "dev-prompts") return promptsPage();
  if (page === "dev-validation") return validationPage();
  if (page === "technology") return technologyPage();
  (pages[page] || pages.home)();
};
