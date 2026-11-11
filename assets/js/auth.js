/*
  Demo login with real encryption, all in the browser.

  There is no server. Accounts live in this browser's localStorage, and each
  user's health data is encrypted with AES-GCM using a key derived from their
  password (PBKDF2). Without the password the stored data is unreadable, which
  is exactly what the dashboard's "what a stranger would see" panel shows.
  The unlocked key is kept in sessionStorage, so closing the tab locks it again.
*/
(function () {
  const USERS = "potty.users";
  const SESSION = "potty.session";
  const ITER = 150000;
  const subtle = window.crypto && window.crypto.subtle;
  const enc = new TextEncoder();
  const dec = new TextDecoder();

  const ls = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } },
  };
  const ss = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return memory[k] || null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { memory[k] = v; } },
    del(k) { try { sessionStorage.removeItem(k); } catch (e) {} delete memory[k]; },
  };
  const memory = {};

  const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
  const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  const users = () => { try { return JSON.parse(ls.get(USERS) || "{}"); } catch (e) { return {}; } };
  const saveUsers = (u) => ls.set(USERS, JSON.stringify(u));
  const norm = (u) => String(u || "").trim().toLowerCase();

  async function derive(password, salt) {
    const base = await subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
    const bits = new Uint8Array(await subtle.deriveBits({ name: "PBKDF2", salt, iterations: ITER, hash: "SHA-256" }, base, 512));
    const keyRaw = bits.slice(0, 32);
    const verifier = b64(await subtle.digest("SHA-256", bits.slice(32)));
    return { keyRaw, verifier };
  }
  const aesKey = (raw) => subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"]);

  async function encrypt(raw, obj) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await subtle.encrypt({ name: "AES-GCM", iv }, await aesKey(raw), enc.encode(JSON.stringify(obj)));
    return { iv: b64(iv), vault: b64(ct) };
  }
  async function decrypt(raw, rec) {
    const pt = await subtle.decrypt({ name: "AES-GCM", iv: unb64(rec.iv) }, await aesKey(raw), unb64(rec.vault));
    return JSON.parse(dec.decode(pt));
  }

  // Made-up but believable health history, different for every username.
  function seedData(username, displayName) {
    let s = [...username].reduce((a, c) => a + c.charCodeAt(0) * 31, 7);
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    const days = [];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      const trend = (29 - i) / 29;
      days.push({
        date: d.toISOString().slice(0, 10),
        hydration: Math.round(58 + trend * 18 + rnd() * 14),
        gut: Math.round(66 + Math.sin(i / 3) * 8 + rnd() * 10),
        fibre: Math.round(14 + rnd() * 12 - (i < 4 ? 5 : 0)),
        visits: 4 + Math.round(rnd() * 3),
      });
    }
    return {
      profile: { displayName, memberSince: today.toISOString().slice(0, 10) },
      days,
      markers: { kidney: "Normal", sugar: "Normal", blood: "None detected" },
      settings: { face: true, voice: true, chatty: true, shareDoctor: false, shareFamily: false },
      notes: [],
    };
  }

  const PottyAuth = {
    secure: !!subtle,

    current() {
      try { const s = JSON.parse(ss.get(SESSION) || "null"); return s && s.username ? s : null; } catch (e) { return null; }
    },

    async register(username, password, displayName) {
      const u = norm(username);
      if (!subtle) throw new Error("This browser can't open a private space from here. Please try Chrome, Edge, Firefox or Safari.");
      if (u.length < 3) throw new Error("Please choose a username with at least 3 characters.");
      if (String(password).length < 6) throw new Error("Please choose a password with at least 6 characters.");
      const all = users();
      if (all[u]) throw new Error("That username is already used on this device. Please choose a different one.");
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const { keyRaw, verifier } = await derive(password, salt);
      const name = (displayName || "").trim() || username.trim();
      const sealed = await encrypt(keyRaw, seedData(u, name));
      all[u] = { salt: b64(salt), verifier, ...sealed, created: Date.now() };
      if (!saveUsers(all)) throw new Error("This browser window can't save accounts (private browsing may be on). Please open a normal window and try again.");
      ss.set(SESSION, JSON.stringify({ username: u, displayName: name, key: b64(keyRaw) }));
      return { username: u, displayName: name };
    },

    async login(username, password) {
      const u = norm(username);
      if (!subtle) throw new Error("This browser can't open a private space from here. Please try Chrome, Edge, Firefox or Safari.");
      const demo = window.POTTY.login.demoUser;
      let rec = users()[u];
      if (!rec && u === norm(demo.username) && password === demo.password) {
        return this.register(demo.username, demo.password, demo.displayName);
      }
      if (!rec) throw new Error("We couldn't find that account on this device. Check the username or create an account.");
      const { keyRaw, verifier } = await derive(password, unb64(rec.salt));
      if (verifier !== rec.verifier) throw new Error("That password doesn't match. Please try again.");
      const data = await decrypt(keyRaw, rec);
      const s = { username: u, displayName: data.profile.displayName, key: b64(keyRaw) };
      ss.set(SESSION, JSON.stringify(s));
      return s;
    },

    logout() { ss.del(SESSION); },

    async loadData() {
      const s = this.current();
      if (!s) return null;
      const rec = users()[s.username];
      if (!rec) { this.logout(); return null; }
      return decrypt(unb64(s.key), rec);
    },

    async saveData(data) {
      const s = this.current();
      if (!s) return;
      const all = users();
      Object.assign(all[s.username], await encrypt(unb64(s.key), data));
      saveUsers(all);
    },

    // What anyone opening this browser's storage would see without the password.
    rawRecord() {
      const s = this.current();
      return s ? users()[s.username] : null;
    },

    deleteAccount() {
      const s = this.current();
      if (!s) return;
      const all = users();
      delete all[s.username];
      saveUsers(all);
      this.logout();
    },
  };

  window.PottyAuth = PottyAuth;
})();
