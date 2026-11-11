/* Sign-in and create-account page. Creating an account is split into two short steps. */
window.renderPage = function (P) {
  const { C, esc, icon, pottySVG, notify, flash } = P;
  const L = C.login;
  const main = document.getElementById("main");
  const signed = PottyAuth.current();

  const pw = (id, label, help, auto) => `<div class="field"><label for="${id}">${label}</label>
    ${help ? `<span class="help" id="${id}-help">${help}</span>` : ""}
    <div class="pw-wrap"><input id="${id}" name="${id}" type="password" autocomplete="${auto}" ${help ? `aria-describedby="${id}-help"` : ""} required>
    <button type="button" data-show="${id}" aria-label="Show password">Show</button></div></div>`;

  main.innerHTML = `<section class="auth"><div class="wrap" style="display:flex;justify-content:center">
    <div class="card auth-card">
      <div style="width:110px;margin:0 auto 8px">${pottySVG({ label: "Potty smiling" })}</div>
      <h1 class="center" style="font-size:2rem">${esc(L.title)}</h1>
      <p class="center" style="color:var(--ink-soft)">${esc(L.intro)}</p>
      ${signed ? `<div class="form-msg ok">You're already signed in as ${esc(signed.displayName)}.</div>
        <div class="btn-row" style="justify-content:center"><a class="btn" href="dashboard.html">Go to my space</a>
        <button class="btn btn-ghost" id="out">Sign out</button></div>` : `
      <div class="tabs" role="tablist" aria-label="Choose what to do">
        <button role="tab" aria-selected="true" aria-controls="form-in" data-tab="in" id="tab-in">Sign in</button>
        <button role="tab" aria-selected="false" aria-controls="form-up" data-tab="up" id="tab-up">Create account</button>
      </div>
      <div id="msg" role="alert"></div>

      <form id="form-in" novalidate>
        <div class="field"><label for="u-in">Username</label><input id="u-in" autocomplete="username" required></div>
        ${pw("p-in", "Password", "", "current-password")}
        <button class="btn" style="width:100%" type="submit">${icon("lock")} Sign in</button>
        <div class="hint">${esc(L.demoHint)} <button type="button" class="btn btn-small btn-ghost" id="fill" style="margin-top:8px">Fill in the demo details for me</button></div>
      </form>

      <form id="form-up" novalidate hidden>
        <p class="stepper" id="stepper">Step 1 of 2: About you</p>
        <div class="stepper-bar" aria-hidden="true"><span id="stepper-bar" style="width:50%"></span></div>
        <div id="step-1">
          <div class="field"><label for="n-up">What should Potty call you?</label>
            <span class="help" id="n-help">Your first name or a nickname. Potty uses it to greet you.</span>
            <input id="n-up" autocomplete="nickname" aria-describedby="n-help" placeholder="For example, Maggie"></div>
          <button class="btn" style="width:100%" type="button" id="next">Next: choose a password →</button>
        </div>
        <div id="step-2" hidden>
          <div class="field"><label for="u-up">Choose a username</label>
            <span class="help" id="u-help">At least 3 letters or numbers. You'll type this each time you sign in.</span>
            <input id="u-up" autocomplete="username" aria-describedby="u-help" required></div>
          ${pw("p-up", "Choose a password", "At least 6 characters. Pick something you'll remember, because it can't be recovered.", "new-password")}
          ${pw("p-up2", "Type the password again", "This makes sure there are no typing mistakes.", "new-password")}
          <ul class="checks" aria-live="polite">
            <li id="chk-len">○ Password has at least 6 characters</li>
            <li id="chk-match">○ Both passwords match</li>
          </ul>
          <button class="btn" style="width:100%" type="submit">${icon("lock")} Create my private space</button>
          <div class="btn-row" style="margin-top:12px"><button class="link-btn" type="button" id="back">← Back to step 1</button></div>
        </div>
      </form>`}
      <details class="explain"><summary>Why do I need a password?</summary><p>${esc(L.whyPassword)}</p></details>
      <p class="lock-note">${icon("lock", "#3f7a4a")}<span>Your password never leaves this device. It creates the key that locks your health data, so nobody else can read it.</span></p>
    </div></div></section>`;

  if (signed) {
    document.getElementById("out").onclick = () => { PottyAuth.logout(); notify("You've signed out. Your data is locked."); setTimeout(() => location.reload(), 900); };
    return;
  }

  const msg = document.getElementById("msg");
  const say = (text, kind = "error") => { msg.innerHTML = text ? `<div class="form-msg ${kind}">${esc(text)}</div>` : ""; };

  document.querySelectorAll("[data-tab]").forEach((t) => t.addEventListener("click", () => {
    const up = t.dataset.tab === "up";
    document.getElementById("tab-in").setAttribute("aria-selected", !up);
    document.getElementById("tab-up").setAttribute("aria-selected", up);
    document.getElementById("form-in").hidden = up;
    document.getElementById("form-up").hidden = !up;
    say("");
    document.getElementById(up ? "n-up" : "u-in").focus();
  }));
  document.querySelectorAll("[data-show]").forEach((b) => b.addEventListener("click", () => {
    const i = document.getElementById(b.dataset.show);
    const show = i.type === "password";
    i.type = show ? "text" : "password";
    b.textContent = show ? "Hide" : "Show";
    b.setAttribute("aria-label", show ? "Hide password" : "Show password");
  }));
  document.getElementById("fill").onclick = () => {
    document.getElementById("u-in").value = L.demoUser.username;
    document.getElementById("p-in").value = L.demoUser.password;
    document.querySelector("#form-in [type=submit]").focus();
  };

  // Two-step account creation
  const step = (n) => {
    document.getElementById("step-1").hidden = n !== 1;
    document.getElementById("step-2").hidden = n !== 2;
    document.getElementById("stepper").textContent = n === 1 ? "Step 1 of 2: About you" : "Step 2 of 2: Your sign-in details";
    document.getElementById("stepper-bar").style.width = n === 1 ? "50%" : "100%";
    document.getElementById(n === 1 ? "n-up" : "u-up").focus();
    say("");
  };
  document.getElementById("next").onclick = () => step(2);
  document.getElementById("back").onclick = () => step(1);
  document.getElementById("n-up").addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); step(2); } });
  const check = () => {
    const p = document.getElementById("p-up").value, p2 = document.getElementById("p-up2").value;
    const set = (id, ok, text) => { const li = document.getElementById(id); li.className = ok ? "ok" : ""; li.textContent = (ok ? "✓ " : "○ ") + text; };
    set("chk-len", p.length >= 6, "Password has at least 6 characters");
    set("chk-match", p.length > 0 && p === p2, "Both passwords match");
  };
  ["p-up", "p-up2"].forEach((id) => document.getElementById(id).addEventListener("input", check));

  async function run(form, fn, welcome) {
    const btn = form.querySelector("[type=submit]");
    const label = btn.innerHTML;
    btn.disabled = true; btn.textContent = "Unlocking your space, please wait…";
    try {
      const s = await fn();
      say("Done! Opening your private space…", "ok");
      flash(welcome(s));
      location.href = "dashboard.html";
    } catch (e) {
      say(e.message || "Something went wrong. Please try again.");
      btn.disabled = false; btn.innerHTML = label;
    }
  }

  document.getElementById("form-in").addEventListener("submit", (e) => {
    e.preventDefault();
    const u = document.getElementById("u-in").value, p = document.getElementById("p-in").value;
    if (!u || !p) return say("Please type both your username and your password.");
    run(e.target, () => PottyAuth.login(u, p), (s) => `You're signed in, ${s.displayName}. Your data is unlocked for this visit only.`);
  });
  document.getElementById("form-up").addEventListener("submit", (e) => {
    e.preventDefault();
    if (document.getElementById("step-2").hidden) return step(2);
    const n = document.getElementById("n-up").value, u = document.getElementById("u-up").value;
    const p = document.getElementById("p-up").value, p2 = document.getElementById("p-up2").value;
    if (p !== p2) return say("The two passwords are different. Please type the same password in both boxes.");
    run(e.target, () => PottyAuth.register(u, p, n), (s) => `Welcome, ${s.displayName}! Your private space is ready and locked with your password.`);
  });
};
