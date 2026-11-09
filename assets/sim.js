/* Simulační část: přihlášení, harmonogram, učitelský panel.
   Stránky se registrují do window.EXTRA_PAGES, router je v app.js. */
(function () {
  "use strict";

  const TRIDY = ["L1B", "L1C"];
  const DNY = ["ne", "po", "út", "st", "čt", "pá", "so"];

  const A = () => window.APP;
  const esc = (s) => A().esc(s == null ? "" : s);

  /* ================= PŘIHLÁŠENÍ ================= */
  const auth = { client: null, user: null, profil: null, ready: false, chyba: null, authPages: ["harmonogram", "ucet", "ucitel"] };
  window.SIM = auth;

  if (window.supabase && window.SUPABASE_URL) {
    auth.client = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, storageKey: "demokracie-cr-auth" }
    });
    auth.client.auth.onAuthStateChange((ev, session) => {
      // načtení profilu mimo callback, aby se nezablokoval klient
      setTimeout(() => nactiProfil(session), 0);
    });
  } else {
    auth.ready = true;
    auth.chyba = "Nepodařilo se načíst připojení k databázi. Zkontroluj internet a obnov stránku.";
  }

  async function nactiProfil(session) {
    const predtim = auth.user ? auth.user.id : null;
    auth.user = session ? session.user : null;
    auth.profil = null;
    if (auth.user) {
      const { data } = await auth.client.from("zaci").select("id, jmeno, trida, strana_id, role_ve_strane, login, ucitel, strany(nazev)").eq("id", auth.user.id).maybeSingle();
      auth.profil = data || null;
    }
    const zmena = !auth.ready || predtim !== (auth.user ? auth.user.id : null);
    auth.ready = true;
    hlavicka();
    if (zmena && auth.authPages.includes(A().currentPage())) A().rerender();
  }

  function hlavicka() {
    const a = document.getElementById("acct");
    if (!a) return;
    if (auth.profil) {
      a.textContent = auth.profil.ucitel ? "Učitelský panel" : auth.profil.jmeno.split(" ")[0];
      a.href = auth.profil.ucitel ? "#ucitel" : "#ucet";
      a.dataset.page = auth.profil.ucitel ? "ucitel" : "ucet";
      a.classList.add("in");
    } else {
      a.textContent = window.innerWidth < 720 ? "Přihlásit" : "Přihlásit se";
      a.href = "#ucet";
      a.dataset.page = "ucet";
      a.classList.remove("in");
    }
    const cur = A().currentPage();
    a.setAttribute("aria-current", a.dataset.page === cur ? "page" : "false");
  }

  function normalizujKod(raw) {
    const s = String(raw || "").toUpperCase().replace(/\s+/g, "").normalize("NFD").replace(/[̀-ͯ]/g, "");
    const m = /^([BC]\d{2})-?([A-Z]+)-?(\d{4})$/.exec(s);
    return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
  }

  async function prihlasKodem(raw) {
    const kod = normalizujKod(raw);
    if (!kod) return "Kód má tvar jako B07-LIPA-4821. Zkontroluj ho na lístečku.";
    const email = kod.split("-")[0].toLowerCase() + "@" + window.LOGIN_DOMENA;
    const { error } = await auth.client.auth.signInWithPassword({ email, password: kod });
    if (error) return error.status === 429 ? "Příliš mnoho pokusů. Zkus to za pár minut znovu." : "Kód nesedí. Zkontroluj ho na lístečku, nebo si řekni učiteli o nový.";
    return null;
  }

  async function prihlasEmailem(email, heslo) {
    const { error } = await auth.client.auth.signInWithPassword({ email: String(email).trim(), password: heslo });
    return error ? "E-mail nebo heslo nesedí." : null;
  }

  function cekani(main, text) {
    main.innerHTML = `<div class="wrap"><div class="page-head"><div><h1>${esc(text)}</h1><p class="lead">Načítám…</p></div></div></div>`;
  }

  /* ================= STRÁNKA: ÚČET ================= */
  function renderUcet() {
    const main = A().main;
    if (!auth.ready) return cekani(main, "Přihlášení");
    if (auth.chyba && !auth.client) {
      main.innerHTML = `<div class="wrap"><div class="page-head"><div><h1>Přihlášení</h1><p class="lead">${esc(auth.chyba)}</p></div></div></div>`;
      return;
    }
    if (auth.profil) {
      const p = auth.profil;
      main.innerHTML = `
      <div class="wrap narrow">
        <div class="page-head"><div>
          <h1>${esc(p.jmeno)}</h1>
          <p class="lead">${p.ucitel ? "Učitelský účet." : `Třída ${esc(p.trida)}. ${p.strany ? `Strana ${esc(p.strany.nazev)}${p.role_ve_strane ? `, role ${esc(p.role_ve_strane)}` : ""}.` : "Do strany tě učitel zařadí v hodině 23. 11."}`}</p>
        </div></div>
        <div class="card-form">
          ${p.ucitel ? '<p><a class="btn" href="#ucitel">Otevřít učitelský panel</a></p>' : `<p class="btnrow"><a class="btn" href="#harmonogram">Harmonogram simulace</a>${p.strana_id ? '<a class="btn ghost" href="#strana">Profil naší strany</a>' : ""}</p>`}
          <p><button type="button" class="btn ghost" id="odhlasit">Odhlásit se</button></p>
          ${p.ucitel ? "" : '<p class="hint">Na školním počítači se po hodině vždy odhlas.</p>'}
        </div>
      </div>`;
      document.getElementById("odhlasit").addEventListener("click", async () => { await auth.client.auth.signOut(); location.hash = "#ucet"; });
      return;
    }
    if (auth.user && !auth.profil) {
      main.innerHTML = `<div class="wrap narrow"><div class="page-head"><div><h1>Účet bez profilu</h1><p class="lead">Tento účet zatím nemá v aplikaci profil. Požádej učitele, ať ho založí.</p></div></div><button type="button" class="btn ghost" id="odhlasit">Odhlásit se</button></div>`;
      document.getElementById("odhlasit").addEventListener("click", () => auth.client.auth.signOut());
      return;
    }
    main.innerHTML = `
    <div class="wrap narrow">
      <div class="page-head"><div>
        <h1>Přihlášení</h1>
        <p class="lead">Do simulace se přihlásíš kódem z lístečku, který dostaneš v hodině.</p>
      </div></div>
      <form class="card-form" id="f-kod" novalidate>
        <label for="kod">Tvůj kód</label>
        <input id="kod" name="kod" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="B07-LIPA-4821" inputmode="text">
        <button type="submit" class="btn">Přihlásit se</button>
        <p class="msg" id="msg-kod" role="alert"></p>
      </form>
      <details class="teacher-login">
        <summary>Přihlášení pro učitele</summary>
        <form class="card-form" id="f-mail" novalidate>
          <label for="email">E-mail</label>
          <input id="email" type="email" autocomplete="username">
          <label for="heslo">Heslo</label>
          <input id="heslo" type="password" autocomplete="current-password">
          <button type="submit" class="btn">Přihlásit se</button>
          <p class="msg" id="msg-mail" role="alert"></p>
        </form>
      </details>
    </div>`;
    const fk = document.getElementById("f-kod");
    fk.addEventListener("submit", async (e) => {
      e.preventDefault();
      const msg = document.getElementById("msg-kod");
      msg.textContent = "Přihlašuji…";
      const err = await prihlasKodem(document.getElementById("kod").value);
      msg.textContent = err || "";
      if (!err) location.hash = "#harmonogram";
    });
    document.getElementById("f-mail").addEventListener("submit", async (e) => {
      e.preventDefault();
      const msg = document.getElementById("msg-mail");
      msg.textContent = "Přihlašuji…";
      const err = await prihlasEmailem(document.getElementById("email").value, document.getElementById("heslo").value);
      msg.textContent = err || "";
      if (!err) location.hash = "#ucitel";
    });
  }

  /* ================= STRÁNKA: HARMONOGRAM ================= */
  const d = (iso) => new Date(iso.length === 10 ? iso + "T00:00:00" : iso);
  const konecDne = (iso) => new Date(iso + "T23:59:59");
  function rozsah(od, doo) {
    const a = d(od), b = d(doo);
    return a.getMonth() === b.getMonth() ? `${a.getDate()}.–${b.getDate()}. ${b.getMonth() + 1}.` : `${a.getDate()}. ${a.getMonth() + 1}.–${b.getDate()}. ${b.getMonth() + 1}.`;
  }
  function kdy(dt) {
    const hm = dt.getHours() || dt.getMinutes() ? ` ${dt.getHours()}:${String(dt.getMinutes()).padStart(2, "0")}` : "";
    return `${DNY[dt.getDay()]} ${dt.getDate()}. ${dt.getMonth() + 1}.${hm}`;
  }
  function zaKolik(dt, now) {
    const den = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate());
    const n = Math.round((den(dt) - den(now)) / 86400000);
    if (n === 0) return "dnes";
    if (n === 1) return "zítra";
    if (n < 5) return `za ${n} dny`;
    return `za ${n} dní`;
  }

  function vybranaTrida() {
    if (auth.profil && auth.profil.trida) return auth.profil.trida;
    const t = A().store.get("trida", "L1B");
    return TRIDY.includes(t) ? t : "L1B";
  }

  function renderHarmonogram() {
    const main = A().main, H = window.HARMONOGRAM, now = new Date();
    const T = vybranaTrida();
    const md = A().md;

    const terminy = [];
    H.tydny.forEach((w) => (w.ukoly || []).forEach((u) => terminy.push(u)));
    const nejblizsi = terminy
      .filter((u) => (u.konec ? d(u.konec) : d(u.termin)) >= now)
      .sort((a, b) => d(a.termin) - d(b.termin))
      .slice(0, 3);

    const osobni = auth.profil && !auth.profil.ucitel
      ? `<p class="me">${esc(auth.profil.jmeno)}, třída ${esc(auth.profil.trida)}. ${auth.profil.strany ? `Strana <b>${esc(auth.profil.strany.nazev)}</b>${auth.profil.role_ve_strane ? `, role ${esc(auth.profil.role_ve_strane)}` : ""}.` : "Do strany tě učitel zařadí v hodině 23. 11."}</p>`
      : "";

    const tydny = H.tydny.map((w) => {
      const zac = new Date(d(w.od).getTime() - 2 * 86400000);
      const kon = konecDne(w.do);
      const stav = now > kon ? "past" : now >= zac ? "now" : "future";
      const v = Object.assign({}, w, (w[T] || {}));
      const stLabel = stav === "past" ? "proběhlo" : stav === "now" ? "tento týden" : "";
      if (w.volno) {
        return `<li class="wk volno ${stav}"><div class="wk-date"><b>${rozsah(w.od, w.do)}</b>${stLabel ? `<span class="wk-st">${stLabel}</span>` : ""}</div><div class="wk-body"><p class="vl">${esc(w.volno)}${w.d ? `. ${esc(w.d)}` : ""}</p></div></li>`;
      }
      const row = (cls, lab, html) => `<div class="row ${cls}"><span class="lab">${lab}</span><div>${html}</div></div>`;
      let body = "";
      if (v.cz) body += row("r-cz", "Téma", `<h3>${esc(v.cz.t)}</h3>${v.cz.d ? `<p>${esc(v.cz.d)}</p>` : ""}${v.cz.teorie ? `<p class="teorie">Teorie: ${md(v.cz.teorie)}</p>` : ""}${v.cz.link ? `<p class="teorie"><a class="inl" href="${esc(v.cz.link[0])}" rel="noopener">${esc(v.cz.link[1])}</a></p>` : ""}`);
      if (v.sim) body += row("r-sim", "Simulace", `<h3>${esc(v.sim.t)}</h3>${v.sim.d ? `<p>${esc(v.sim.d)}</p>` : ""}`);
      if (v.denik) body += row("r-den", "Deník aktéra", `<p>${esc(H.denik[v.denik])}. ${esc(v.denikPozn || "Píše se v hodině.")}</p>`);
      (v.ukoly || []).forEach((u) => {
        body += row("r-ukol" + (u.volby ? " r-volby" : ""), u.volby ? "Volby" : u.strany ? "Úkol pro strany" : "Úkol",
          `<p>${esc(u.t)}</p><p class="termin">${u.konec ? `od ${esc(kdy(d(u.termin)))} do ${esc(kdy(d(u.konec)))}` : `do ${esc(kdy(d(u.termin)))}`}</p>`);
      });
      return `<li class="wk ${stav}"><div class="wk-date"><b>${rozsah(w.od, w.do)}</b>${stLabel ? `<span class="wk-st">${stLabel}</span>` : ""}</div><div class="wk-body">${body}</div></li>`;
    }).join("");

    main.innerHTML = `
    <div class="wrap">
      <div class="page-head"><div>
        <h1>Harmonogram simulace</h1>
        <p class="lead">Co se kdy probírá a co se v simulaci děje. Blok Demokracie a právní stát.</p>
        ${osobni}
      </div></div>
      <div class="toolbar">
        ${auth.profil && auth.profil.trida ? "" : `<div class="seg" id="seg-trida">${TRIDY.map((t) => `<button type="button" data-t="${t}" aria-pressed="${t === T}">${t}</button>`).join("")}</div>`}
        ${auth.profil ? "" : '<span class="tb-label">Po přihlášení uvidíš svou třídu a stranu. <a class="inl" href="#ucet">Přihlásit se</a></span>'}
      </div>
      ${nejblizsi.length ? `<section class="soon" aria-label="Nejbližší termíny"><h2>Nejbližší termíny</h2><ul>${nejblizsi.map((u) => {
        const probiha = u.konec && d(u.termin) <= now && d(u.konec) >= now;
        const kdyTxt = probiha ? "právě probíhá" : zaKolik(d(u.termin), now);
        return `<li class="${u.volby ? "volby" : ""}"><span class="when"><b>${esc(kdyTxt)}</b>${esc(kdy(d(u.termin)))}</span><span>${esc(u.t)}</span></li>`;
      }).join("")}</ul></section>` : ""}
      <ol class="weeks">${tydny}</ol>
    </div>`;

    document.querySelectorAll("#seg-trida button").forEach((b) => b.addEventListener("click", () => { A().store.set("trida", b.dataset.t); renderHarmonogram(); }));
  }

  /* ================= STRÁNKA: UČITELSKÝ PANEL ================= */
  const panel = { trida: "L1B", zaci: [], strany: [], novekody: null, stav: "" };

  async function zavolej(akce, data) {
    const { data: res, error } = await auth.client.functions.invoke("spravce", { body: Object.assign({ akce }, data) });
    if (error) {
      let zprava = error.message;
      try { const j = await error.context.json(); if (j && j.chyba) zprava = j.chyba; } catch (e) { /* bez těla */ }
      throw new Error(zprava);
    }
    return res;
  }

  async function nactiPanel() {
    const c = auth.client, T = panel.trida;
    const [z, s, n] = await Promise.all([
      c.from("zaci").select("id, jmeno, trida, strana_id, role_ve_strane, login, kody(kod)").eq("trida", T).eq("ucitel", false).order("login"),
      c.from("strany").select("id, nazev, trida, poradi, stav_uprav, created_at").eq("trida", T).order("poradi").order("created_at"),
      c.from("nastaveni").select("uzaverka_stran").eq("id", 1).maybeSingle()
    ]);
    panel.uzaverka = n.data ? n.data.uzaverka_stran : null;
    panel.zaci = (z.data || []).map((r) => Object.assign(r, { kod: Array.isArray(r.kody) ? (r.kody[0] || {}).kod : (r.kody || {}).kod }));
    panel.strany = s.data || [];
    panel.chyba = z.error ? z.error.message : s.error ? s.error.message : null;
  }

  function stav(t, chyba) {
    const el = document.getElementById("p-stav");
    if (!el) return;
    el.textContent = t;
    el.classList.toggle("err", !!chyba);
    clearTimeout(stav._t);
    if (!chyba && t) stav._t = setTimeout(() => (el.textContent = ""), 2500);
  }

  async function renderUcitel() {
    const main = A().main;
    if (!auth.ready) return cekani(main, "Učitelský panel");
    if (!auth.profil || !auth.profil.ucitel) {
      main.innerHTML = `<div class="wrap narrow"><div class="page-head"><div><h1>Učitelský panel</h1><p class="lead">Panel je jen pro učitele. ${auth.profil ? "Tvůj účet je žákovský." : '<a class="inl" href="#ucet">Přihlásit se</a>'}</p></div></div></div>`;
      return;
    }
    cekani(main, "Učitelský panel");
    await nactiPanel();
    drawPanel();
  }

  function drawPanel() {
    const main = A().main, T = panel.trida;
    const bezStrany = panel.zaci.filter((z) => !z.strana_id).length;
    const opts = (sel) => `<option value="">bez strany</option>` + panel.strany.map((s) => `<option value="${s.id}"${s.id === sel ? " selected" : ""}>${esc(s.nazev)}</option>`).join("");
    const sopts = (sel) => [["auto", "Upravují do uzávěrky"], ["zamceno", "Zamčeno"], ["odemceno", "Odemčeno i po uzávěrce"]].map((o) => `<option value="${o[0]}"${o[0] === sel ? " selected" : ""}>${o[1]}</option>`).join("");
    const lokal = (iso) => { if (!iso) return ""; const d = new Date(iso); const p2 = (x) => String(x).padStart(2, "0"); return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}T${p2(d.getHours())}:${p2(d.getMinutes())}`; };
    main.innerHTML = `
    <div class="wrap">
      <div class="page-head"><div>
        <h1>Učitelský panel</h1>
        <p class="lead">Žáci, přihlašovací kódy a strany. Změny se ukládají hned.</p>
      </div></div>
      <div class="toolbar">
        <div class="seg" id="p-trida">${TRIDY.map((t) => `<button type="button" data-t="${t}" aria-pressed="${t === T}">${t}</button>`).join("")}</div>
        <span class="tb-label">${panel.zaci.length} žáků, ${panel.strany.length} stran${bezStrany ? `, ${bezStrany} bez strany` : ""}</span>
        <span class="p-stav" id="p-stav" role="status"></span>
      </div>
      ${panel.chyba ? `<p class="msg">${esc(panel.chyba)}</p>` : ""}

      <div class="panel-grid">
        <section class="pbox">
          <h2>Strany v ${T}</h2>
          <ul class="p-strany">${panel.strany.map((s) => `<li data-id="${s.id}">
            <input type="text" value="${esc(s.nazev)}" aria-label="Název strany" data-f="nazev">
            <span class="cnt" title="počet členů">${panel.zaci.filter((z) => z.strana_id === s.id).length}</span>
            <a class="mini" href="#strany-${s.id}">Profil</a>
            <button type="button" class="mini danger" data-del="${s.id}">Smazat</button>
            <select class="stav-sel" data-stav="${s.id}" aria-label="Úpravy profilu">${sopts(s.stav_uprav)}</select></li>`).join("") || '<li class="empty">Zatím žádná strana. Strany vzniknou v hodině 23. 11., sem je pak přidáte. Název si strana může později změnit sama.</li>'}</ul>
          <form class="p-add" id="f-strana"><input id="nova-strana" type="text" placeholder="Název nové strany" aria-label="Název nové strany"><button type="submit" class="btn small">Přidat stranu</button></form>
          <label class="uzaverka"><span>Uzávěrka profilů a kalkulačky (obě třídy)</span><input type="datetime-local" id="uzaverka" value="${lokal(panel.uzaverka)}"></label>
        </section>

        <section class="pbox">
          <h2>Přidat žáky do ${T}</h2>
          <p class="hint">Jedno jméno na řádek. Každý dostane přihlašovací kód.</p>
          <textarea id="jmena" rows="6" placeholder="Jana Nováková&#10;Petr Svoboda"></textarea>
          <button type="button" class="btn small" id="zalozit">Založit účty</button>
          ${panel.novekody ? `<div class="novekody"><p><b>Nové účty:</b></p><ul>${panel.novekody.map((r) => `<li>${esc(r.jmeno)}: ${r.kod ? `<code>${esc(r.kod)}</code>` : `<span class="err">${esc(r.chyba)}</span>`}</li>`).join("")}</ul></div>` : ""}
        </section>
      </div>

      <section class="pbox wide">
        <div class="pbox-head"><h2>Žáci v ${T}</h2>${panel.zaci.length ? '<button type="button" class="btn small ghost" id="tisk">Vytisknout kódy</button>' : ""}</div>
        ${panel.zaci.length ? `<div class="tbl-wrap"><table class="p-zaci">
          <thead><tr><th>Jméno</th><th>Kód</th><th>Strana</th><th>Role ve straně</th><th></th></tr></thead>
          <tbody>${panel.zaci.map((z) => `<tr data-id="${z.id}">
            <td>${esc(z.jmeno)}</td>
            <td><code>${esc(z.kod || "")}</code></td>
            <td><select data-f="strana_id" aria-label="Strana">${opts(z.strana_id)}</select></td>
            <td class="role">${z.role_ve_strane ? esc(z.role_ve_strane) : '<span class="muted">určí strana</span>'}</td>
            <td class="acts"><button type="button" class="mini" data-kod="${z.id}">Nový kód</button><button type="button" class="mini danger" data-smaz="${z.id}">Smazat</button></td>
          </tr>`).join("")}</tbody></table></div>` : '<p class="hint">Zatím žádní žáci. Přidejte je seznamem jmen výše.</p>'}
      </section>
    </div>
    <div class="kody-tisk" aria-hidden="true">${panel.zaci.map((z) => `<div class="kt"><p class="kt-t">Simulace ${T}</p><p class="kt-j">${esc(z.jmeno)}</p><p class="kt-k">${esc(z.kod || "")}</p><p class="kt-u">${esc(location.origin + location.pathname)}#ucet</p></div>`).join("")}</div>`;
    bindPanel();
  }

  function dvaKroky(btn, akce) {
    if (btn.dataset.sure) { akce(); return; }
    const puvodni = btn.textContent;
    btn.dataset.sure = "1";
    btn.textContent = "Opravdu?";
    setTimeout(() => { if (btn.isConnected) { delete btn.dataset.sure; btn.textContent = puvodni; } }, 3000);
  }

  function bindPanel() {
    const c = auth.client, $$ = (s) => Array.from(document.querySelectorAll(s));
    $$("#p-trida button").forEach((b) => b.addEventListener("click", async () => { panel.trida = b.dataset.t; panel.novekody = null; await nactiPanel(); drawPanel(); }));

    document.getElementById("f-strana").addEventListener("submit", async (e) => {
      e.preventDefault();
      const n = document.getElementById("nova-strana").value.trim();
      if (!n) return;
      const { error } = await c.from("strany").insert({ trida: panel.trida, nazev: n, poradi: panel.strany.length + 1 });
      if (error) return stav("Stranu se nepodařilo přidat: " + error.message, true);
      await nactiPanel(); drawPanel(); stav("Strana přidána");
    });
    $$(".p-strany input[data-f=nazev]").forEach((inp) => inp.addEventListener("change", async () => {
      const id = inp.closest("li").dataset.id;
      const { error } = await c.from("strany").update({ nazev: inp.value.trim() }).eq("id", id);
      stav(error ? "Název se nepodařilo uložit: " + error.message : "Uloženo", !!error);
    }));
    $$("[data-stav]").forEach((sel) => sel.addEventListener("change", async () => {
      const { error } = await c.from("strany").update({ stav_uprav: sel.value }).eq("id", sel.dataset.stav);
      stav(error ? "Nepodařilo se uložit: " + error.message : "Uloženo", !!error);
    }));
    const uz = document.getElementById("uzaverka");
    if (uz) uz.addEventListener("change", async () => {
      if (!uz.value) return;
      const { error } = await c.from("nastaveni").update({ uzaverka_stran: new Date(uz.value).toISOString() }).eq("id", 1);
      stav(error ? "Uzávěrku se nepodařilo uložit: " + error.message : "Uzávěrka uložena", !!error);
    });
    $$("[data-del]").forEach((b) => b.addEventListener("click", () => dvaKroky(b, async () => {
      const { error } = await c.from("strany").delete().eq("id", b.dataset.del);
      if (error) return stav("Stranu se nepodařilo smazat: " + error.message, true);
      await nactiPanel(); drawPanel(); stav("Strana smazána");
    })));

    document.getElementById("zalozit").addEventListener("click", async (e) => {
      const jmena = document.getElementById("jmena").value.split("\n").map((s) => s.trim()).filter(Boolean);
      if (!jmena.length) return stav("Napište aspoň jedno jméno.", true);
      e.target.disabled = true; stav("Zakládám účty…");
      try {
        const res = await zavolej("zalozit", { trida: panel.trida, jmena });
        panel.novekody = res.vysledek;
        await nactiPanel(); drawPanel();
        const chyb = res.vysledek.filter((r) => r.chyba).length;
        stav(chyb ? `Založeno ${res.vysledek.length - chyb}, chyby: ${chyb}` : `Založeno ${res.vysledek.length} účtů`, !!chyb);
      } catch (err) { e.target.disabled = false; stav("Účty se nepodařilo založit: " + err.message, true); }
    });

    $$(".p-zaci select").forEach((sel) => sel.addEventListener("change", async () => {
      const id = sel.closest("tr").dataset.id;
      const { error } = await c.from("zaci").update({ [sel.dataset.f]: sel.value || null }).eq("id", id);
      if (error) return stav("Nepodařilo se uložit: " + error.message, true);
      const z = panel.zaci.find((x) => x.id === id); if (z) z[sel.dataset.f] = sel.value || null;
      stav("Uloženo");
      if (sel.dataset.f === "strana_id") document.querySelectorAll(".p-strany li[data-id]").forEach((li) => { li.querySelector(".cnt").textContent = panel.zaci.filter((x) => x.strana_id === li.dataset.id).length; });
    }));
    $$("[data-kod]").forEach((b) => b.addEventListener("click", () => dvaKroky(b, async () => {
      stav("Generuji nový kód…");
      try { const r = await zavolej("novy_kod", { zak_id: b.dataset.kod }); await nactiPanel(); drawPanel(); stav("Nový kód: " + r.kod + " (starý přestal platit)"); }
      catch (err) { stav("Kód se nepodařilo změnit: " + err.message, true); }
    })));
    $$("[data-smaz]").forEach((b) => b.addEventListener("click", () => dvaKroky(b, async () => {
      try { await zavolej("smazat", { zak_id: b.dataset.smaz }); await nactiPanel(); drawPanel(); stav("Účet smazán"); }
      catch (err) { stav("Účet se nepodařilo smazat: " + err.message, true); }
    })));
    const tisk = document.getElementById("tisk");
    if (tisk) tisk.addEventListener("click", () => window.print());
  }

  /* ================= REGISTRACE STRÁNEK ================= */
  window.EXTRA_PAGES = Object.assign(window.EXTRA_PAGES || {}, {
    harmonogram: { title: "Harmonogram simulace", render: renderHarmonogram },
    ucet: { title: "Přihlášení", render: renderUcet },
    ucitel: { title: "Učitelský panel", render: renderUcitel }
  });

  document.addEventListener("DOMContentLoaded", () => {
    hlavicka();
    window.addEventListener("hashchange", hlavicka);
    if (!auth.client) return;
    auth.client.auth.getSession().then(({ data }) => nactiProfil(data.session));
  });
})();
