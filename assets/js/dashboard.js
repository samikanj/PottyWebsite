/* The signed-in user's private space: companion, health insights, privacy controls. All data is made up. */
window.renderPage = async function (P) {
  const { C, esc, icon, pottySVG, notify, flash, confirmDialog } = P;
  const D = C.dashboard;
  const main = document.getElementById("main");
  // Series colours come from CSS (--s1, --s2, --s3) so they switch with the light/dark theme.
  // The gut line is also dashed, so the two lines never differ by colour alone.
  const SERIES = {
    hydration: { color: "var(--s1)", dash: "", name: "Hydration" },
    gut: { color: "var(--s2)", dash: "7 5", name: "Gut health" },
    fibre: { color: "var(--s3)", dash: "", name: "Fibre" },
  };

  if (!PottyAuth.current()) { flash("Please sign in to see your private space.", "info"); location.replace("login.html"); return; }

  main.innerHTML = `<div class="wrap" style="padding:80px 0;text-align:center"><p class="lead" style="margin:auto">Unlocking your private data, please wait…</p></div>`;
  let data;
  try { data = await PottyAuth.loadData(); } catch (e) { data = null; }
  if (!data) { PottyAuth.logout(); flash("We couldn't open your space. Please sign in again.", "error"); location.replace("login.html"); return; }

  const save = () => PottyAuth.saveData(data);
  const days = data.days;
  const last = days[days.length - 1];
  const prevWeek = days.slice(-14, -7), thisWeek = days.slice(-7);
  const avg = (arr, k) => Math.round(arr.reduce((a, d) => a + d[k], 0) / arr.length);
  const hr = new Date().getHours();
  const greet = hr < 12 ? D.greetingMorning : hr < 18 ? D.greetingAfternoon : D.greetingEvening;
  const fmtDay = (iso) => new Date(iso + "T00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  const fmtShort = (iso) => new Date(iso + "T00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  const statusFor = (k, v) => {
    if (k === "fibre") return v >= 18 ? ["good", "On track"] : ["watch", "A little low"];
    return v >= 70 ? ["good", "Looking good"] : v >= 55 ? ["watch", "Worth watching"] : ["watch", "Low"];
  };
  const meaning = {
    hydration: "How well you're drinking. Above 70 is good.",
    gut: "How well your digestion is working. Above 70 is good.",
    fibre: "Estimated fibre today. Aim for 18 g or more.",
  };

  const lineKey = (k) => `<svg width="28" height="12" aria-hidden="true"><line x1="2" x2="26" y1="6" y2="6" stroke="${SERIES[k].color}" stroke-width="3" stroke-dasharray="${SERIES[k].dash}" stroke-linecap="round"/></svg>`;

  function spark(k) {
    const vals = days.slice(-14).map((d) => d[k]);
    const min = Math.min(...vals) - 4, max = Math.max(...vals) + 4;
    const pts = vals.map((v, i) => `${(i / (vals.length - 1)) * 200},${50 - ((v - min) / (max - min)) * 46}`).join(" ");
    return `<svg class="spark" viewBox="0 0 200 54" preserveAspectRatio="none" aria-hidden="true"><polyline points="${pts}" fill="none" style="stroke:${SERIES[k].color}" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }

  function metric(k, label, unit) {
    const v = last[k], [cls, txt] = statusFor(k, v);
    const diff = avg(thisWeek, k) - avg(prevWeek, k);
    return `<div class="card metric"><div class="label">${label}</div>
      <div class="value">${v}<small> ${unit}</small></div>
      <span class="status ${cls}">${cls === "good" ? "✓" : "!"} ${txt}</span>
      <p class="meaning">${diff >= 0 ? "▲ Up" : "▼ Down"} ${Math.abs(diff)} compared with last week.</p>
      <p class="meaning">${meaning[k]}</p>
      ${spark(k)}</div>`;
  }

  // 14-day line chart: two series sharing one scale, legend + direct labels + dashes, hover, tap and arrow keys.
  const CH = innerWidth < 600 ? { w: 380, h: 240, padL: 34, padR: 84, step: 4, fs: 14 } : { w: 640, h: 260, padL: 36, padR: 84, step: 3, fs: 13 };
  const rows = days.slice(-14);
  const cx = (i) => CH.padL + (i / (rows.length - 1)) * (CH.w - CH.padL - CH.padR);
  function chart() {
    const { w, h, padL, padR, fs } = CH, padT = 16, padB = 34;
    const y = (v) => padT + (1 - (v - 40) / 60) * (h - padT - padB);
    const grid = [40, 60, 80, 100].map((g) => `<line class="g-line" x1="${padL}" x2="${w - padR}" y1="${y(g)}" y2="${y(g)}"/><text class="g-txt" x="${padL - 8}" y="${y(g) + 4}" text-anchor="end" font-size="${fs}">${g}</text>`).join("");
    const xl = rows.map((d, i) => (rows.length - 1 - i) % CH.step === 0 ? `<text class="g-txt" x="${cx(i)}" y="${h - 8}" text-anchor="middle" font-size="${fs}">${fmtShort(d.date)}</text>` : "").join("");
    const line = (k) => {
      const pts = rows.map((d, i) => `${cx(i)},${y(d[k])}`).join(" ");
      const lx = cx(rows.length - 1), ly = y(rows[rows.length - 1][k]);
      return `<polyline points="${pts}" fill="none" style="stroke:${SERIES[k].color}" stroke-width="3" stroke-dasharray="${SERIES[k].dash}" stroke-linejoin="round" stroke-linecap="round"/>
        <circle class="g-ring" cx="${lx}" cy="${ly}" r="6" style="fill:${SERIES[k].color}" stroke-width="2"/>
        <text class="g-lbl" x="${lx + 11}" y="${ly + 5}" font-size="${fs + 1}" font-weight="800">${SERIES[k].name.split(" ")[0]}</text>`;
    };
    return `<svg viewBox="0 0 ${w} ${h}" role="img" tabindex="0" aria-describedby="chart-help" aria-label="Line chart of hydration and gut health scores for the last 14 days. Use the left and right arrow keys to read each day." id="trend">
      ${grid}${xl}${line("hydration")}${line("gut")}
      <line id="cross" class="g-cross" y1="${padT}" y2="${h - padB}" stroke-dasharray="3 3" opacity="0"/>
      <rect x="${padL - 10}" y="0" width="${w - padL - padR + 20}" height="${h}" fill="transparent" id="hit"/>
    </svg>
    <div id="tip" class="chart-tip" aria-live="polite"></div>`;
  }

  const alerts = [
    { icon: "✓", bg: "var(--sage-soft)", ink: "var(--sage-dark)", tag: "Good news", title: "Hydration improved", body: `Up to ${avg(thisWeek, "hydration")} on average this week. Lovely work.` },
    { icon: "!", bg: "var(--butter-soft)", ink: "var(--watch-ink)", tag: "Worth a look", title: "Fibre a little low", body: "Your last few days were below your usual. Fruit, oats or beans can help." },
    { icon: "i", bg: "var(--lavender-soft)", ink: "var(--info-ink)", tag: "All normal", title: "Kidney and sugar markers normal", body: "No traces of blood found. Your next full summary is on Sunday." },
  ];

  const toggles = [
    ["face", "Show Potty's face", "The glowing face on the display"],
    ["voice", "Potty's voice", "Spoken greetings and replies. Captions are always shown."],
    ["chatty", "Chatty mode", "Potty starts conversations with you"],
    ["shareDoctor", "Share reports with my doctor", "A weekly summary, nothing more"],
    ["shareFamily", "Share alerts with family", "Only important alerts, never details"],
  ];

  const rec = PottyAuth.rawRecord();
  const preview = { name: data.profile.displayName, today: { hydration: last.hydration, gut: last.gut, fibre: last.fibre }, markers: data.markers };
  const canSpeak = "speechSynthesis" in window;

  main.innerHTML = `<div class="wrap">
    <div class="dash-head">
      <div><h1 style="margin:0">${esc(greet)}, ${esc(data.profile.displayName)}</h1>
        <p style="margin:4px 0 0;color:var(--ink-soft)">Here's how you've been doing. Only you can see this page.</p></div>
      <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
        <span class="secure-pill">${icon("lock")} Locked with your password</span>
        <button class="btn btn-ghost btn-small" id="signout">Sign out</button>
      </div>
    </div>
    <nav class="next-steps" aria-label="On this page"><span>Jump to:</span>
      <a href="#potty">Talk to Potty</a><a href="#health">My health</a><a href="#settings">My settings</a><a href="#privacy">My privacy</a></nav>

    <div class="dash-grid">
      <div class="card companion span-12" id="potty">
        <button class="face" id="face" aria-label="Ask Potty for a new message">${pottySVG({ mood: data.settings.chatty ? "happy" : "sleepy" })}<small>Press me for a new message</small></button>
        <div>
          <h2 style="font-size:1.3rem;margin:0 0 8px">Potty says</h2>
          <div class="bubble" id="bubble" aria-live="polite"></div>
          <p class="caption-note">${icon("volume").replace("<svg", '<svg width="18" height="18"')} Captions are always on: everything Potty says is written here.</p>
          <div class="replies">
            ${canSpeak ? `<button class="speak" id="speak">${icon("volume")} Read it aloud</button>` : ""}
            ${D.quickReplies.map((r, i) => `<button data-reply="${i}">${esc(r.label)}</button>`).join("")}
          </div>
        </div>
      </div>

      <div class="span-12 grid grid-4" id="health">
        ${metric("hydration", "Hydration", "/ 100")}
        ${metric("gut", "Gut health", "/ 100")}
        ${metric("fibre", "Fibre estimate", "g")}
        <div class="card metric"><div class="label">Health markers</div>
          <ul class="ticks" style="margin-top:12px;font-size:.95rem">
            <li>Kidney: ${esc(data.markers.kidney)}</li><li>Sugar: ${esc(data.markers.sugar)}</li><li>Blood: ${esc(data.markers.blood)}</li>
          </ul></div>
      </div>

      <div class="card span-8" style="position:relative">
        <h2 style="font-size:1.4rem">Your last 14 days</h2>
        <div class="chart-legend"><span>${lineKey("hydration")}Hydration score (solid line)</span><span>${lineKey("gut")}Gut health score (dashed line)</span></div>
        <div class="chart-wrap">${chart()}</div>
        <p class="chart-help" id="chart-help">To read a day, move over the chart, tap it, or select it and use the arrow keys. You can also show the numbers as a table.</p>
        <details class="table-toggle"><summary>Show the numbers as a table</summary>
          <table class="data-table">
            <thead><tr><th align="left">Day</th><th align="right">Hydration</th><th align="right">Gut</th><th align="right">Fibre (g)</th></tr></thead>
            <tbody>${days.slice(-14).reverse().map((d) => `<tr><td>${fmtDay(d.date)}</td><td align="right">${d.hydration}</td><td align="right">${d.gut}</td><td align="right">${d.fibre}</td></tr>`).join("")}</tbody>
          </table></details>
      </div>

      <div class="card span-4">
        <h2 style="font-size:1.4rem">Gentle alerts</h2>
        <ul class="alert-list">${alerts.map((a) => `<li><span class="a-icon" style="background:${a.bg};color:${a.ink}" aria-hidden="true">${a.icon}</span><div><span class="tag">${a.tag}</span><strong>${esc(a.title)}</strong><br><span style="color:var(--ink-soft);font-size:.92rem">${esc(a.body)}</span></div></li>`).join("")}</ul>
        <p style="font-size:.85rem;color:var(--ink-soft);margin:16px 0 0">Sample data for demonstration. This is not medical advice.</p>
      </div>

      <div class="card span-6" id="settings">
        <h2 style="font-size:1.4rem">Potty and privacy settings</h2>
        <p style="color:var(--ink-soft);font-size:.92rem">You're in control. Each change is saved and locked straight away. The On or Off label shows the current setting.</p>
        ${toggles.map(([k, t, s]) => `<div class="toggle-row"><label for="t-${k}"><strong>${esc(t)}</strong><small>${esc(s)}</small></label>
          <span class="switch-wrap"><span class="switch-state" id="st-${k}" aria-hidden="true">${data.settings[k] ? "On" : "Off"}</span>
          <span class="switch"><input type="checkbox" role="switch" id="t-${k}" data-set="${k}" ${data.settings[k] ? "checked" : ""}><span></span></span></span></div>`).join("")}
      </div>

      <div class="card span-6" id="privacy">
        <h2 style="font-size:1.4rem">Who can see your data?</h2>
        <p style="color:var(--ink-soft);font-size:.92rem">This is what's really stored on this device. Without your password it's scrambled, so it's useless to anyone else.</p>
        <div class="compare">
          <div><h3>${icon("eyeoff")} What a stranger sees</h3>
            <div class="vault" tabindex="0" aria-label="Scrambled data">${esc((rec && rec.vault || "").slice(0, 420))}…</div></div>
          <div><h3>${icon("user")} What you see</h3>
            <div class="vault mine" tabindex="0" aria-label="Your readable data">${esc(JSON.stringify(preview, null, 1))}</div></div>
        </div>
        <div class="btn-row" style="margin-top:20px">
          <button class="btn btn-small" id="download">Download my data</button>
          <button class="btn btn-small btn-danger" id="delete">Delete my account</button>
        </div>
      </div>
    </div>
  </div>`;

  // Companion chat (text is the caption; reading aloud is optional)
  const bubble = document.getElementById("bubble");
  let mi = new Date().getDate() % D.pottyMessages.length;
  const reduced = () => document.documentElement.dataset.motion === "off" || matchMedia("(prefers-reduced-motion: reduce)").matches;
  const say = (text) => {
    clearInterval(say.t);
    bubble.dataset.full = text;
    if (reduced()) { bubble.textContent = text; return; }
    bubble.textContent = "";
    let i = 0;
    say.t = setInterval(() => { bubble.textContent = text.slice(0, ++i); if (i >= text.length) clearInterval(say.t); }, 18);
  };
  say(data.settings.chatty ? D.pottyMessages[mi] : "I'm keeping quiet today. Press my face whenever you'd like to talk.");
  document.getElementById("face").onclick = () => { mi = (mi + 1) % D.pottyMessages.length; say(D.pottyMessages[mi]); };
  document.querySelectorAll("[data-reply]").forEach((b) => (b.onclick = () => say(D.quickReplies[b.dataset.reply].answer)));
  if (canSpeak) document.getElementById("speak").onclick = () => {
    if (!data.settings.voice) return notify("Potty's voice is turned off in your settings. The captions above still show everything.", "info");
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(bubble.dataset.full || bubble.textContent);
    u.rate = 0.9; u.lang = "en-GB";
    speechSynthesis.speak(u);
  };

  // Chart: mouse, touch and keyboard all show the same day readout.
  const svg = document.getElementById("trend"), hit = document.getElementById("hit"), cross = document.getElementById("cross"), tip = document.getElementById("tip");
  let cur = rows.length - 1;
  function show(i) {
    cur = Math.max(0, Math.min(rows.length - 1, i));
    const x = cx(cur);
    cross.setAttribute("x1", x); cross.setAttribute("x2", x); cross.setAttribute("opacity", ".5");
    const d = rows[cur];
    tip.innerHTML = `<strong>${fmtDay(d.date)}</strong><br>${lineKey("hydration")}Hydration ${d.hydration}<br>${lineKey("gut")}Gut health ${d.gut}`;
    tip.style.display = "block";
    const r = svg.getBoundingClientRect(), wrap = svg.closest(".card").getBoundingClientRect();
    const px = (x / CH.w) * r.width + (r.left - wrap.left);
    tip.style.left = Math.max(12, Math.min(px + 14, wrap.width - tip.offsetWidth - 12)) + "px";
    tip.style.top = (r.top - wrap.top + 12) + "px";
  }
  const hide = () => { tip.style.display = "none"; cross.setAttribute("opacity", "0"); };
  const fromEvent = (ev) => {
    const r = svg.getBoundingClientRect();
    const sx = ((ev.clientX - r.left) / r.width) * CH.w;
    return Math.round(((sx - CH.padL) / (CH.w - CH.padL - CH.padR)) * (rows.length - 1));
  };
  hit.addEventListener("pointermove", (ev) => show(fromEvent(ev)));
  hit.addEventListener("pointerdown", (ev) => show(fromEvent(ev)));
  hit.addEventListener("pointerleave", (ev) => { if (ev.pointerType === "mouse") hide(); });
  svg.addEventListener("focus", () => show(cur));
  svg.addEventListener("blur", hide);
  svg.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); show(cur - 1); }
    if (e.key === "ArrowRight") { e.preventDefault(); show(cur + 1); }
    if (e.key === "Home") { e.preventDefault(); show(0); }
    if (e.key === "End") { e.preventDefault(); show(rows.length - 1); }
  });

  // Settings: every change is confirmed on screen.
  document.querySelectorAll("[data-set]").forEach((c) => c.addEventListener("change", async () => {
    const k = c.dataset.set;
    data.settings[k] = c.checked;
    document.getElementById("st-" + k).textContent = c.checked ? "On" : "Off";
    try {
      await save();
    } catch (e) {
      notify("That change couldn't be saved. Please try again.", "error");
    }
    if (k === "chatty") {
      document.getElementById("face").firstElementChild.outerHTML = pottySVG({ mood: c.checked ? "happy" : "sleepy" });
      say(c.checked ? "Yay, let's chat! I missed you." : D.quickReplies[2].answer);
    }
  }));

  document.getElementById("signout").onclick = () => {
    PottyAuth.logout();
    flash("You've signed out. Your data is locked again.");
    location.href = "index.html";
  };
  document.getElementById("download").onclick = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "my-potty-data.json"; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    notify('Downloaded. Look for "my-potty-data.json" in your Downloads folder.');
  };
  document.getElementById("delete").onclick = async () => {
    const ok = await confirmDialog({
      title: "Delete your account?",
      body: "This removes your account and all your health information from this device. It can't be undone.",
      yes: "Yes, delete everything", no: "No, keep my account", danger: true,
    });
    if (!ok) return notify("Nothing was deleted. Your account is safe.", "info");
    PottyAuth.deleteAccount();
    flash("Your account and all its data have been deleted from this device.");
    location.href = "index.html";
  };
};
