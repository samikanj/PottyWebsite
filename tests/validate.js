/*
  Potty validation: checks every rule in content.js → developer.validation.rules
  in a real browser, then writes the results to assets/js/validation-results.js
  so the Validation page in the developer area shows them.

  Run from the potty-website folder:
    npm install --prefix tests        (first time only)
    npx --prefix tests playwright install chromium   (first time only, if no browser is found)
    node tests/validate.js
*/
const path = require("path"), fs = require("fs"), vm = require("vm");
let chromium;
try { ({ chromium } = require("playwright")); } catch (e) { ({ chromium } = require(path.join(__dirname, "node_modules", "playwright"))); }

const root = path.join(__dirname, "..");
const url = (page) => "file://" + path.join(root, page).split(path.sep).join("/");
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "assets/js/content.js"), "utf8"), sandbox);
const C = sandbox.window.POTTY;
const PUBLIC = ["index", "features", "character", "how-it-works", "technology", "design", "contact", "login"];
const DEV = ["developer", "developer-architecture", "developer-technology", "developer-prompts", "developer-validation"];
const ALL = [...PUBLIC, "dashboard", ...DEV];
const PHONE = { width: 390, height: 844 }, DESK = { width: 1360, height: 900 };

(async () => {
  const browser = await chromium.launch();
  const errors = [], requests = new Set();
  // a fresh browser tab; dev pages unlocked and the demo account signed in unless asked otherwise
  async function open(page, { viewport = DESK, prefs = {}, unlock = true, signIn = true } = {}) {
    const ctx = await browser.newContext({ viewport });
    await ctx.addInitScript(({ prefs, unlock }) => {
      for (const k in prefs) localStorage.setItem("potty." + k, prefs[k]);
      if (unlock) sessionStorage.setItem("potty.dev", "1");
    }, { prefs, unlock });
    const p = await ctx.newPage();
    p.on("pageerror", (e) => errors.push(`${page}: ${e.message}`));
    p.on("console", (m) => { if (m.type() === "error") errors.push(`${page}: ${m.text()}`); });
    p.on("request", (r) => requests.add(r.url().split("?")[0]));
    if (signIn && page === "dashboard") {
      await p.goto(url("login.html")); await p.fill("#u-in", C.login.demoUser.username); await p.fill("#p-in", C.login.demoUser.password);
      await p.click("#form-in button[type=submit]"); await p.waitForURL(/dashboard/, { timeout: 15000 });
    } else await p.goto(url(page + ".html"));
    await p.waitForTimeout(400);
    return { p, ctx };
  }
  const sideways = (p) => p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  const results = {};
  const rule = async (id, fn) => {
    try { const [pass, detail] = await fn(); results[id] = { pass, detail }; }
    catch (e) { results[id] = { pass: false, detail: "The check could not run: " + e.message.split("\n")[0] }; }
    console.log((results[id].pass ? "PASS " : "FAIL ") + id + " · " + results[id].detail);
  };

  await rule("big-targets", async () => {
    const small = [];
    for (const vp of [DESK, PHONE]) for (const page of ALL) {
      const { p, ctx } = await open(page, { viewport: vp });
      small.push(...(await p.evaluate(() => [...document.querySelectorAll("button, .btn, input:not([type=radio]):not([type=checkbox]), select, textarea")]
        .filter((e) => e.offsetParent && e.getBoundingClientRect().height < 44)
        .map((e) => `${location.pathname.split("/").pop()} "${(e.textContent || e.name || e.id).trim().slice(0, 30)}"`))));
      await ctx.close();
    }
    return [!small.length, small.length ? `Too small: ${[...new Set(small)].slice(0, 5).join(", ")}` : `All buttons and fields on ${ALL.length} pages are 44px or taller`];
  });
  await rule("text-size", async () => {
    const bad = [];
    for (const page of ALL) { const { p, ctx } = await open(page, { viewport: PHONE, prefs: { text: "xlarge" } }); if (await sideways(p) > 0) bad.push(page); await ctx.close(); }
    return [!bad.length, bad.length ? `Scrolls sideways: ${bad.join(", ")}` : `${ALL.length} pages fit a phone with extra large text`];
  });
  await rule("alt-text", async () => {
    let n = 0; const bad = [];
    for (const page of ALL) { const { p, ctx } = await open(page); const r = await p.evaluate(() => { const imgs = [...document.images]; return [imgs.length, imgs.filter((i) => !i.hasAttribute("alt") && !i.closest("[aria-hidden=true]")).map((i) => i.src.split("/").pop())]; }); n += r[0]; bad.push(...r[1]); await ctx.close(); }
    return [!bad.length, bad.length ? `Missing: ${bad.slice(0, 5).join(", ")}` : `All ${n} pictures have a description or are marked as decoration`];
  });
  await rule("one-heading", async () => {
    const bad = [];
    for (const page of ALL) { const { p, ctx } = await open(page); const n = await p.$$eval("h1", (h) => h.length); if (n !== 1) bad.push(`${page} (${n})`); await ctx.close(); }
    return [!bad.length, bad.length ? `Wrong number of main headings: ${bad.join(", ")}` : `${ALL.length} pages each have one main heading`];
  });
  await rule("dark-theme", async () => {
    const { p, ctx } = await open("index", { prefs: { theme: "light" } });
    const before = await p.evaluate(() => getComputedStyle(document.body).backgroundColor);
    await p.click(".display-btn"); await p.click('[data-pref="theme"][data-val="dark"]'); await p.waitForTimeout(300);
    const after = await p.evaluate(() => [document.documentElement.dataset.theme, getComputedStyle(document.body).backgroundColor]);
    await ctx.close();
    return [after[0] === "dark" && after[1] !== before, `Page background went from ${before} to ${after[1]}`];
  });
  await rule("motion-off", async () => {
    const { p, ctx } = await open("index", { prefs: { motion: "off" } });
    const r = await p.evaluate(() => [document.documentElement.dataset.motion, [...document.querySelectorAll(".reveal")].filter((e) => getComputedStyle(e).opacity < 0.99).length]);
    await ctx.close();
    return [r[0] === "off" && r[1] === 0, r[1] ? `${r[1]} sections stayed hidden` : "Animations off, and every section shows straight away"];
  });
  await rule("keyboard", async () => {
    const { p, ctx } = await open("index");
    await p.focus("#explode-btn"); await p.keyboard.press("Enter"); await p.waitForTimeout(1200);
    const opened = !!(await p.$(".focus-layer"));
    await p.keyboard.press("Escape"); await p.waitForTimeout(1500);
    const closed = !(await p.$(".focus-layer"));
    await ctx.close();
    return [opened && closed, `Enter opened it: ${opened ? "yes" : "no"}. Escape closed it: ${closed ? "yes" : "no"}`];
  });
  await rule("no-popups", async () => {
    const { p, ctx } = await open("index", { prefs: { theme: "light" } });
    await p.click(".display-btn");
    for (const [k, v] of [["theme", "dark"], ["text", "large"], ["contrast", "high"], ["motion", "off"]]) await p.click(`[data-pref="${k}"][data-val="${v}"]`);
    await p.waitForTimeout(500);
    const n = await p.$$eval(".toast", (t) => t.length);
    await ctx.close();
    return [n === 0, n ? `${n} pop-ups appeared` : "Changed 4 settings, and no pop-up appeared"];
  });
  await rule("stays-open", async () => {
    const { p, ctx } = await open("index");
    await p.click("#explode-btn"); await p.waitForTimeout(1500);
    await p.click("#explode-btn"); await p.waitForTimeout(1500);   // put Potty back together
    const still = !!(await p.$(".focus-layer"));
    await p.click(".focus-close"); await p.waitForTimeout(1500);
    const closed = !(await p.$(".focus-layer"));
    await ctx.close();
    return [still && closed, `Still open after putting Potty back together: ${still ? "yes" : "no"}. Closed by ✕: ${closed ? "yes" : "no"}`];
  });
  await rule("menu-fits", async () => {
    const bad = [];
    for (const w of [1440, 1280, 1100, 1000, 961]) for (const text of ["normal", "large", "xlarge"]) {
      const { p, ctx } = await open("index", { viewport: { width: w, height: 800 }, prefs: { text } });
      const tall = await p.$$eval(".nav a", (a) => a.filter((e) => e.offsetParent && e.getBoundingClientRect().height > 60).map((e) => e.textContent));
      if (tall.length) bad.push(`${w}px ${text}: ${tall.join(", ")}`);
      await ctx.close();
    }
    return [!bad.length, bad.length ? bad.slice(0, 3).join("; ") : "One line at 5 widths × 3 text sizes (the menu folds into a button when it doesn't fit)"];
  });
  await rule("one-form", async () => {
    const { p, ctx } = await open("contact");
    const r = await p.evaluate(() => [document.querySelectorAll("main form").length, [...document.querySelectorAll('input[name="c-type"]')].map((i) => i.value)]);
    await p.check('input[value="demo"]'); await p.waitForTimeout(200);
    await ctx.close();
    return [r[0] === 1 && r[1].includes("message") && r[1].includes("demo"), `${r[0]} form, with the choices ${r[1].join(" and ")}`];
  });
  await rule("encrypted", async () => {
    const { p, ctx } = await open("dashboard");
    const r = await p.evaluate(() => {
      const raw = localStorage.getItem("potty.users") || ""; const rec = Object.values(JSON.parse(raw || "{}"))[0] || {};
      let readable = false; try { JSON.parse(atob(rec.vault)); readable = true; } catch (e) {}
      return { hasVault: !!rec.vault, readable, leaks: ["hydration", "fibre", "kidney"].filter((w) => raw.includes(w)) };
    });
    await ctx.close();
    return [r.hasVault && !r.readable && !r.leaks.length, r.leaks.length ? `Readable words found: ${r.leaks.join(", ")}` : "Signed in as the demo user: the saved health data is scrambled, with no readable words"];
  });
  await rule("dev-locked", async () => {
    const locked = [];
    for (const page of DEV) { const { p, ctx } = await open(page, { unlock: false }); if (await p.$("#dev-form")) locked.push(page); await ctx.close(); }
    const { p, ctx } = await open("developer", { unlock: false });
    await p.fill("#dev-u", "admin"); await p.fill("#dev-p", "wrong"); await p.click("#dev-form button[type=submit]");
    const wrongStays = !!(await p.$("#dev-form"));
    await p.fill("#dev-p", "admin"); await p.click("#dev-form button[type=submit]"); await p.waitForTimeout(400);
    const opens = !!(await p.$(".j-step"));
    await ctx.close();
    return [locked.length === DEV.length && wrongStays && opens, `${locked.length} of ${DEV.length} pages locked, a wrong password is refused, admin / admin opens it`];
  });
  await rule("no-errors", async () => {
    for (const vp of [DESK, PHONE]) for (const page of ALL) { const { ctx } = await open(page, { viewport: vp }); await ctx.close(); }
    return [!errors.length, errors.length ? errors.slice(0, 3).join(" | ") : `No errors on ${ALL.length} pages, on a phone and a computer`];
  });
  await rule("no-sideways", async () => {
    const bad = [];
    for (const page of ALL) { const { p, ctx } = await open(page, { viewport: PHONE }); await p.waitForTimeout(800); if (await sideways(p) > 0) bad.push(page); await ctx.close(); }
    return [!bad.length, bad.length ? `Scrolls sideways: ${bad.join(", ")}` : `${ALL.length} pages fit a phone screen`];
  });
  // checked last, so it covers every page opened above
  await rule("nothing-sent", async () => {
    const outside = [...requests].filter((r) => !r.startsWith("file:") && !r.startsWith("data:") && !/fonts\.(googleapis|gstatic)\.com/.test(r));
    return [!outside.length, outside.length ? `Outside requests: ${outside.slice(0, 3).join(", ")}` : `${requests.size} files loaded, all from the folder except the Google Fonts`];
  });

  await browser.close();
  const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const out = { date, runner: "Playwright with Chromium", results };
  fs.writeFileSync(path.join(root, "assets/js/validation-results.js"),
    "/* Written by tests/validate.js. Do not edit by hand: run the checks again instead. */\nwindow.POTTY_VALIDATION = " + JSON.stringify(out, null, 1) + ";\n");
  const failed = Object.values(results).filter((r) => !r.pass).length;
  console.log(`\n${Object.keys(results).length - failed} passed, ${failed} failed. Results saved for the Validation page.`);
  process.exitCode = failed ? 1 : 0;
})();
