/* Deník aktéra: zápisy žáků (#denik), správa otázek a termínů a přehled odevzdání pro učitele (#deniky).
   Data: denik_zapisy (otázky), denik_terminy (okna po třídách), denik (odpovědi), denik_vyjimky (prodloužení). */
(function () {
  "use strict";

  const A = () => window.APP;
  const S = () => window.SIM;
  const esc = (s) => A().esc(s == null ? "" : s);
  const TRIDY = ["L1B", "L1C"];
  const DNY = ["ne", "po", "út", "st", "čt", "pá", "so"];

  const d = (x) => (x ? new Date(x) : null);
  const p2 = (x) => String(x).padStart(2, "0");
  const cas = (x) => `${x.getHours()}:${p2(x.getMinutes())}`;
  const den = (x) => `${DNY[x.getDay()]} ${x.getDate()}. ${x.getMonth() + 1}.`;
  const kdy = (x) => `${den(x)} ${cas(x)}`;
  const stejnyDen = (a, b) => a.toDateString() === b.toDateString();
  function kdyKratce(x) {
    const now = new Date();
    if (stejnyDen(x, now)) return `dnes ${cas(x)}`;
    const zitra = new Date(now); zitra.setDate(now.getDate() + 1);
    if (stejnyDen(x, zitra)) return `zítra ${cas(x)}`;
    return kdy(x);
  }
  const lokal = (x) => (x ? `${x.getFullYear()}-${p2(x.getMonth() + 1)}-${p2(x.getDate())}T${p2(x.getHours())}:${p2(x.getMinutes())}` : "");
  const datum = (x) => (x ? `${x.getFullYear()}-${p2(x.getMonth() + 1)}-${p2(x.getDate())}` : "");
  const hm = (x) => (x ? `${p2(x.getHours())}:${p2(x.getMinutes())}` : "");
  const nid = () => Math.random().toString(36).slice(2, 8);

  function hlaska(nadpis, text) {
    A().main.innerHTML = `<div class="wrap narrow"><div class="page-head"><div><h1>${esc(nadpis)}</h1><p class="lead">${text}</p></div></div></div>`;
  }

  /* Stav jednoho zápisu žáka vůči termínu jeho třídy */
  function stav(r, t, vyj, now) {
    now = now || new Date();
    const od = t && d(t.hodina_od), hdo = t && d(t.hodina_do), uz = t && d(t.uzaverka), v = vyj && d(vyj.do_kdy);
    const otevreno = (od && uz && now >= od && now < uz) || (v && now < v);
    const konec = v && (!uz || v > uz) ? v : uz;
    const out = { otevreno: !!otevreno, od, hdo, uz, konec, vyjimka: v };
    if (!r) { out.k = otevreno ? "otevreno" : od && now < od ? "ceka" : od ? "chybi" : "bez"; return out; }
    out.odev = d(r.odevzdano_at); out.upr = d(r.upraveno_at); out.zac = d(r.zacato_at);
    if (out.odev) {
      out.k = hdo && out.odev <= hdo ? "vhodine" : "pohodine";
      out.uprPo = hdo && out.upr > hdo && out.upr - out.odev > 60000;
    } else out.k = "rozepsano";
    return out;
  }

  /* Otázky zápisů vrací databázová funkce denik_otazky: žákovi až od začátku hodiny, kdy se zápis
     jeho třídě otevírá (nebo s výjimkou / když už zápis začal psát), učiteli vždy. */
  function sOtazkami(zapisy, ot) {
    const m = new Map((ot || []).map((x) => [x.cislo, x.otazky]));
    return (zapisy || []).map((x) => Object.assign(x, { otazky: m.has(x.cislo) ? m.get(x.cislo) || [] : null }));
  }

  /* ================= ŽÁK: MŮJ DENÍK ================= */
  const z = { zapisy: [], terminy: [], moje: [], vyjimky: [], vybrany: null, timer: null, otevri: null, ukladam: 0, cekajici: false };

  async function nactiZaka() {
    const c = S().client, ja = S().profil;
    const [a, b, e, f, g] = await Promise.all([
      c.from("denik_zapisy").select("cislo, nazev, uvod").order("cislo"),
      c.from("denik_terminy").select("cislo, trida, hodina_od, hodina_do, uzaverka").eq("trida", ja.trida),
      c.from("denik").select("*").eq("zak_id", ja.id),
      c.from("denik_vyjimky").select("cislo, do_kdy").eq("zak_id", ja.id),
      c.rpc("denik_otazky")
    ]);
    if (a.error) throw new Error(a.error.message);
    z.zapisy = sOtazkami(a.data, g.data); z.terminy = b.data || []; z.moje = e.data || []; z.vyjimky = f.data || [];
  }
  const tZ = (c) => z.terminy.find((t) => t.cislo === c);
  const rZ = (c) => z.moje.find((r) => r.cislo === c);
  const vZ = (c) => z.vyjimky.find((v) => v.cislo === c);

  async function renderDenik(arg) {
    clearTimeout(z.timer); clearTimeout(z.otevri);
    if (!S().ready) return hlaska("Deník aktéra", "Načítám…");
    if (!S().profil) return hlaska("Deník aktéra", 'Do deníku se dostaneš po přihlášení kódem z lístečku. <a class="inl" href="#ucet">Přihlásit se</a>');
    if (S().profil.ucitel) { location.replace("#deniky"); return; }
    try { await nactiZaka(); } catch (e) { return hlaska("Deník aktéra", "Deník se nepodařilo načíst: " + esc(e.message) + ". Zkus obnovit stránku."); }
    const now = new Date();
    let c = parseInt(arg, 10);
    if (!z.zapisy.find((x) => x.cislo === c)) {
      const otevreny = z.zapisy.find((x) => stav(rZ(x.cislo), tZ(x.cislo), vZ(x.cislo), now).otevreno);
      const posledni = [...z.zapisy].reverse().find((x) => { const t = tZ(x.cislo); return (t && d(t.hodina_od) && d(t.hodina_od) <= now) || rZ(x.cislo); });
      c = (otevreny || posledni || z.zapisy[0] || {}).cislo;
    }
    z.vybrany = c;
    kresliDenik();
  }

  function stitekZaka(s) {
    switch (s.k) {
      case "otevreno": return { cls: "open", t: `Otevřeno do ${kdyKratce(s.konec)}` };
      case "rozepsano": return s.otevreno ? { cls: "open", t: `Rozepsáno, odevzdej do ${kdyKratce(s.konec)}` } : { cls: "warn", t: "Rozepsáno, neodevzdáno" };
      case "vhodine": case "pohodine": return { cls: "done", t: `Odevzdáno ${kdyKratce(s.odev)}` };
      case "ceka": return { cls: "wait", t: `Otevře se ${kdyKratce(s.od)}` };
      case "chybi": return { cls: "warn", t: "Neodevzdáno" };
      default: return { cls: "wait", t: "Termín zatím není" };
    }
  }

  function kresliDenik() {
    const ja = S().profil, now = new Date();
    const zap = z.zapisy.find((x) => x.cislo === z.vybrany);
    A().main.innerHTML = `
    <div class="wrap">
      <div class="page-head"><div>
        <h1>Deník aktéra</h1>
        <p class="lead">Zápis píšeš v hodině. Každý zápis má vlastní otázky. Piš konkrétně o tom, co se ve vaší straně dělo a jakou roli jsi v tom měl(a).</p>
        <p class="me">${esc(ja.jmeno)}, třída ${esc(ja.trida)}${ja.strany ? `, strana <b>${esc(ja.strany.nazev)}</b>` : ""}${ja.role_ve_strane ? `, ${esc(ja.role_ve_strane)}` : ""}</p>
      </div></div>
      ${z.zapisy.length ? `<div class="dn-grid">
        <nav class="dn-list" aria-label="Zápisy">
          <ol>${z.zapisy.map((x) => { const s = stav(rZ(x.cislo), tZ(x.cislo), vZ(x.cislo), now), st = stitekZaka(s);
            return `<li><a href="#denik-${x.cislo}" class="dn-item${x.cislo === z.vybrany ? " cur" : ""}" ${x.cislo === z.vybrany ? 'aria-current="page"' : ""}>
              <span class="dn-num">${x.cislo}</span><span class="dn-t"><b>${esc(x.nazev)}</b><span class="pill ${st.cls}">${esc(st.t)}</span></span></a></li>`; }).join("")}</ol>
        </nav>
        <article class="dn-page" id="dn-page">${zap ? strankaZapisu(zap, now) : ""}</article>
      </div>` : '<div class="empty-state"><h2>Zatím žádné zápisy</h2><p>Zápisy se objeví, až je učitel připraví.</p></div>'}
    </div>`;
    if (zap) bindZapis(zap);
    // stránka otevřená před začátkem hodiny se sama obnoví, jakmile se zápis otevře
    if (zap) {
      const s = stav(rZ(zap.cislo), tZ(zap.cislo), vZ(zap.cislo), now);
      if (s.k === "ceka" && s.od - now < 12 * 3600 * 1000) {
        z.otevri = setTimeout(() => { if (A().currentPage() === "denik") renderDenik(String(zap.cislo)); }, s.od - now + 1500);
      }
    }
  }

  function zaloha(c) { try { return JSON.parse(localStorage.getItem("denik-zaloha-" + S().profil.id + "-" + c) || "null"); } catch (e) { return null; } }
  function ulozZalohu(c, o) { try { if (o) localStorage.setItem("denik-zaloha-" + S().profil.id + "-" + c, JSON.stringify(o)); else localStorage.removeItem("denik-zaloha-" + S().profil.id + "-" + c); } catch (e) { /* bez úložiště */ } }

  function strankaZapisu(zap, now) {
    const r = rZ(zap.cislo), t = tZ(zap.cislo), s = stav(r, t, vZ(zap.cislo), now);
    const odp = (r && r.odpovedi) || {};
    const hlavicka = `<header class="dn-head"><p class="dn-kicker">Zápis ${zap.cislo}</p><h2>${esc(zap.nazev)}</h2>${zap.uvod ? `<p class="dn-uvod">${esc(zap.uvod)}</p>` : ""}</header>`;
    const komentar = r && r.komentar ? `<aside class="dn-kom"><h3>Komentář učitele</h3><p>${esc(r.komentar)}</p></aside>` : "";

    if (s.otevreno) {
      const z0 = zaloha(zap.cislo);
      const maZalohu = z0 && JSON.stringify(z0) !== JSON.stringify(odp);
      const vse = (zap.otazky || []).every((q) => (odp[q.id] || "").trim());
      return `${hlavicka}
        <p class="dn-okno">${s.odev ? `Odevzdáno ${esc(kdy(s.odev))}. ` : ""}Psát a upravovat můžeš do ${esc(kdyKratce(s.konec))}. Vše se průběžně ukládá.</p>
        ${maZalohu ? `<p class="dn-zaloha">V tomto prohlížeči je uložená novější verze, která se nestihla odeslat. <button type="button" class="mini" id="obnovit">Vložit ji do zápisu</button></p>` : ""}
        <form id="dn-form" novalidate>
          ${(zap.otazky || []).map((q, i) => `<div class="dn-q">
            <label for="q-${esc(q.id)}"><span class="dn-qn">${i + 1}.</span> ${esc(q.text)}</label>
            ${q.napoveda ? `<p class="hint">${esc(q.napoveda)}</p>` : ""}
            <textarea id="q-${esc(q.id)}" data-q="${esc(q.id)}" rows="4" maxlength="5000">${esc(odp[q.id] || "")}</textarea>
          </div>`).join("")}
          <div class="dn-actions">
            <button type="submit" class="btn" id="odevzdat"${vse ? "" : " disabled"}>${s.odev ? "Zápis je odevzdaný" : "Odevzdat zápis"}</button>
            <span class="dn-save" id="dn-save" role="status" aria-live="polite">${r ? `Uloženo ${esc(cas(d(r.upraveno_at)))}` : ""}</span>
          </div>
          <p class="hint" id="dn-chybi">${vse ? "" : "Odevzdat můžeš, až odpovíš na všechny otázky."}</p>
        </form>
        ${komentar}`;
    }

    if (r) {
      const qs = r.otazky && r.otazky.length ? r.otazky : zap.otazky || [];
      return `${hlavicka}
        <p class="dn-okno">${s.odev ? `Odevzdáno ${esc(kdy(s.odev))}.` : "Zápis nebyl odevzdán, uložila se rozepsaná verze."} Psaní je uzavřené.</p>
        <div class="dn-read">${qs.map((q, i) => `<section><h3><span class="dn-qn">${i + 1}.</span> ${esc(q.text)}</h3>${(odp[q.id] || "").trim() ? `<p>${esc(odp[q.id])}</p>` : '<p class="muted">Bez odpovědi.</p>'}</section>`).join("")}</div>
        ${komentar}`;
    }

    if (s.k === "ceka") return `${hlavicka}<p class="dn-okno">Zápis se otevře ${esc(kdy(s.od))}, v hodině. Otázky uvidíš, až se zápis otevře.</p>`;
    if (s.k === "chybi") return `${hlavicka}<p class="dn-okno warn">Tenhle zápis jsi neodevzdal(a). Pokud jsi v hodině chyběl(a), napíšeš náhradní zápis do 7 dnů. Řekni učiteli, ať ti ho otevře.</p>`;
    return `${hlavicka}<p class="dn-okno">Termín zápisu zatím není nastavený.</p>`;
  }

  function bindZapis(zap) {
    const f = document.getElementById("dn-form");
    if (!f) return;
    const pole = Array.from(f.querySelectorAll("textarea[data-q]"));
    const auto = (el) => { el.style.height = "auto"; el.style.height = Math.max(el.scrollHeight + 2, 110) + "px"; };
    pole.forEach(auto);
    const sber = () => { const o = {}; pole.forEach((el) => { if (el.value.trim()) o[el.dataset.q] = el.value; }); return o; };
    const kontrola = () => {
      const vse = (zap.otazky || []).every((q) => { const el = f.querySelector(`[data-q="${q.id}"]`); return el && el.value.trim(); });
      const b = document.getElementById("odevzdat"), r = rZ(zap.cislo);
      b.disabled = !vse || !!(r && r.odevzdano_at);
      document.getElementById("dn-chybi").textContent = vse ? "" : "Odevzdat můžeš, až odpovíš na všechny otázky.";
    };
    const info = (t, chyba) => { const el = document.getElementById("dn-save"); if (el) { el.textContent = t; el.classList.toggle("err", !!chyba); } };

    async function uloz(odevzdat) {
      clearTimeout(z.timer);
      const o = sber();
      z.ukladam++; info("Ukládám…");
      const row = { zak_id: S().profil.id, cislo: zap.cislo, odpovedi: o };
      if (odevzdat) row.odevzdano_at = new Date().toISOString();
      const { data, error } = await S().client.from("denik").upsert(row, { onConflict: "zak_id,cislo" }).select().maybeSingle();
      z.ukladam--;
      if (error || !data) {
        ulozZalohu(zap.cislo, o);
        info("Neuloženo: psaní je už uzavřené. Text zůstal v tomto prohlížeči, řekni učiteli.", true);
        return false;
      }
      ulozZalohu(zap.cislo, null);
      const i = z.moje.findIndex((x) => x.cislo === zap.cislo);
      if (i >= 0) z.moje[i] = data; else z.moje.push(data);
      info(`Uloženo ${cas(d(data.upraveno_at))}`);
      kontrola();
      return true;
    }

    pole.forEach((el) => el.addEventListener("input", () => {
      auto(el); kontrola(); info("Neuložené změny…");
      clearTimeout(z.timer); z.timer = setTimeout(() => uloz(false), 1500);
    }));
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      const b = document.getElementById("odevzdat"); b.disabled = true;
      if (await uloz(true)) kresliDenik();
      else b.disabled = false;
    });
    const ob = document.getElementById("obnovit");
    if (ob) ob.addEventListener("click", () => {
      const o = zaloha(zap.cislo) || {};
      pole.forEach((el) => { el.value = o[el.dataset.q] || ""; auto(el); });
      kontrola(); uloz(false);
      ob.parentElement.remove();
    });
  }

  /* ================= UČITEL: DENÍKY ================= */
  const u = { trida: "L1B", zaci: [], zapisy: [], terminy: [], denik: [], vyjimky: [] };

  async function nactiUcitel() {
    const c = S().client;
    const [a, b, e, f, g, h] = await Promise.all([
      c.from("zaci").select("id, jmeno, trida, strana_id, role_ve_strane, strany(nazev)").eq("ucitel", false).order("jmeno"),
      c.from("denik_zapisy").select("cislo, nazev, uvod, updated_at").order("cislo"),
      c.from("denik_terminy").select("*"),
      c.from("denik").select("*"),
      c.from("denik_vyjimky").select("*"),
      c.rpc("denik_otazky")
    ]);
    const err = [a, b, e, f, g, h].find((x) => x.error);
    if (err) throw new Error(err.error.message);
    u.zaci = a.data; u.zapisy = sOtazkami(b.data, h.data).map((x) => Object.assign(x, { otazky: x.otazky || [] })); u.terminy = e.data; u.denik = f.data; u.vyjimky = g.data;
  }
  const tU = (c, tr) => u.terminy.find((t) => t.cislo === c && t.trida === tr);
  const rU = (zak, c) => u.denik.find((r) => r.zak_id === zak && r.cislo === c);
  const vU = (zak, c) => u.vyjimky.find((v) => v.zak_id === zak && v.cislo === c);

  async function renderDeniky(arg) {
    if (!S().ready) return hlaska("Deníky aktéra", "Načítám…");
    if (!S().profil || !S().profil.ucitel) return hlaska("Deníky aktéra", 'Tahle stránka je jen pro učitele. <a class="inl" href="#denik">Můj deník</a>');
    hlaska("Deníky aktéra", "Načítám…");
    try { await nactiUcitel(); } catch (e) { return hlaska("Deníky aktéra", "Nepodařilo se načíst: " + esc(e.message)); }
    if (arg === "otazky") return spravaZapisu();
    const m = /^([0-9a-z-]+)-(\d+)$/i.exec(arg || "");
    if (m) return cteni(m[1], parseInt(m[2], 10));
    prehledOdevzdani();
  }

  function ucitelHlava(aktivni) {
    return `<nav class="subnav" aria-label="Učitelský panel">
      <a href="#ucitel"${aktivni === "ucitel" ? ' aria-current="page"' : ""}>Žáci a strany</a>
      <a href="#ukoly">Rozdělení úkolů</a>
      <a href="#deniky"${aktivni === "prehled" ? ' aria-current="page"' : ""}>Odevzdané deníky</a>
      <a href="#deniky-otazky"${aktivni === "otazky" ? ' aria-current="page"' : ""}>Otázky a termíny</a>
      <button type="button" class="subnav-out" data-odhlasit>Odhlásit se</button>
    </nav>`;
  }

  function stitekUcitel(s) {
    switch (s.k) {
      case "vhodine": return { cls: "done", t: `${cas(s.odev)} v hodině`, l: `Odevzdáno ${kdy(s.odev)}, v hodině` };
      case "pohodine": return { cls: "late", t: `${stejnyDen(s.odev, s.hdo || s.odev) ? cas(s.odev) : den(s.odev) + " " + cas(s.odev)} po hodině`, l: `Odevzdáno ${kdy(s.odev)}, po hodině` };
      case "rozepsano": return { cls: "draft", t: "rozepsáno", l: `Rozepsáno, naposledy upraveno ${kdy(s.upr)}` };
      case "otevreno": return { cls: "none", t: "nezačato", l: "Zatím nezačal(a) psát" };
      case "chybi": return { cls: "miss", t: "chybí", l: "Neodevzdáno" };
      default: return { cls: "none", t: "–", l: "Zápis ještě nezačal" };
    }
  }

  function prehledOdevzdani() {
    const T = u.trida, now = new Date();
    const zaci = u.zaci.filter((x) => x.trida === T);
    A().main.innerHTML = `
    <div class="wrap">
      <div class="page-head"><div><h1>Deníky aktéra</h1><p class="lead">Kdo co odevzdal a kdy. Zelená znamená odevzdáno v hodině, oranžová až po skončení hodiny. Klikněte na políčko a otevře se zápis.</p></div></div>
      ${ucitelHlava("prehled")}
      <div class="toolbar"><div class="seg" id="u-trida">${TRIDY.map((t) => `<button type="button" data-t="${t}" aria-pressed="${t === T}">${t}</button>`).join("")}</div></div>
      ${zaci.length ? `<div class="tbl-wrap"><table class="dn-tab">
        <thead><tr><th>Žák</th>${u.zapisy.map((x) => { const t = tU(x.cislo, T);
          const n = zaci.filter((zz) => { const r = rU(zz.id, x.cislo); return r && r.odevzdano_at; }).length;
          return `<th><span class="th-n">${x.cislo}. ${esc(x.nazev)}</span><span class="th-s">${t && t.hodina_od ? esc(den(d(t.hodina_od))) : "bez termínu"}, odevzdáno ${n} z ${zaci.length}</span></th>`; }).join("")}</tr></thead>
        <tbody>${zaci.map((zz) => `<tr><th scope="row">${esc(zz.jmeno)}${zz.strany ? `<span class="th-s">${esc(zz.strany.nazev)}</span>` : ""}</th>${u.zapisy.map((x) => {
          const r = rU(zz.id, x.cislo), s = stav(r, tU(x.cislo, T), vU(zz.id, x.cislo), now), st = stitekUcitel(s);
          const extra = (s.uprPo ? " · upraveno po hodině" : "") + (r && r.komentar ? " · s komentářem" : "") + (s.vyjimka && s.vyjimka > now ? " · prodlouženo" : "");
          return `<td>${r || s.vyjimka ? `<a class="cell ${st.cls}" href="#deniky-${zz.id}-${x.cislo}" title="${esc(st.l + extra.replace(/ · /g, ", "))}">` : `<span class="cell ${st.cls}" title="${esc(st.l)}">`}${esc(st.t)}${r && r.komentar ? '<i class="kdot" aria-label="s komentářem"></i>' : ""}${s.uprPo ? '<i class="udot" aria-label="upraveno po hodině"></i>' : ""}${r || s.vyjimka ? "</a>" : "</span>"}</td>`;
        }).join("")}</tr>`).join("")}</tbody></table></div>
        <p class="hint dn-legend"><i class="kdot"></i> má komentář <i class="udot"></i> po odevzdání upraveno ještě po hodině</p>`
      : `<div class="empty-state"><h2>Ve třídě ${T} zatím nejsou žáci</h2><p>Žáky přidáte v <a class="inl" href="#ucitel">učitelském panelu</a>.</p></div>`}
    </div>`;
    document.querySelectorAll("#u-trida button").forEach((b) => b.addEventListener("click", () => { u.trida = b.dataset.t; prehledOdevzdani(); }));
  }

  function cteni(zakId, c) {
    const zz = u.zaci.find((x) => x.id === zakId), zap = u.zapisy.find((x) => x.cislo === c);
    if (!zz || !zap) return hlaska("Zápis nenalezen", '<a class="inl" href="#deniky">Zpět na přehled</a>');
    u.trida = zz.trida;
    const t = tU(c, zz.trida), r = rU(zakId, c), vy = vU(zakId, c), now = new Date(), s = stav(r, t, vy, now);
    const spoluzaci = u.zaci.filter((x) => x.trida === zz.trida), i = spoluzaci.findIndex((x) => x.id === zakId);
    const pred = spoluzaci[i - 1], dalsi = spoluzaci[i + 1];
    const qs = r && r.otazky && r.otazky.length ? r.otazky : zap.otazky;
    const odp = (r && r.odpovedi) || {}, vh = (r && r.stav_v_hodine) || null;
    const lisiSe = r && vh && JSON.stringify(vh) !== JSON.stringify(odp);
    const casy = [];
    if (t && t.hodina_od) casy.push(`Hodina ${den(d(t.hodina_od))} ${cas(d(t.hodina_od))}–${t.hodina_do ? cas(d(t.hodina_do)) : "?"}`);
    if (s.zac) casy.push(`začal(a) psát ${kdyKratce(s.zac)}`);
    if (s.odev) casy.push(`<b class="${s.k === "vhodine" ? "c-ok" : "c-late"}">odevzdáno ${kdyKratce(s.odev)}, ${s.k === "vhodine" ? "v hodině" : "po hodině"}</b>`);
    else if (r) casy.push('<b class="c-late">neodevzdáno</b>');
    if (s.upr && (!s.odev || s.upr - s.odev > 60000)) casy.push(`poslední úprava ${kdyKratce(s.upr)}${s.hdo && s.upr > s.hdo ? " (po hodině)" : ""}`);

    A().main.innerHTML = `
    <div class="wrap">
      <p class="crumb"><a class="inl" href="#deniky">Přehled deníků</a></p>
      <div class="ct-head">
        <div><p class="dn-kicker">Zápis ${c}: ${esc(zap.nazev)}</p><h1>${esc(zz.jmeno)}</h1>
        <p class="lead">${esc(zz.trida)}${zz.strany ? `, ${esc(zz.strany.nazev)}` : ""}${zz.role_ve_strane ? `, ${esc(zz.role_ve_strane)}` : ""}</p></div>
        <div class="ct-nav">${pred ? `<a class="btn small ghost" href="#deniky-${pred.id}-${c}">Předchozí žák</a>` : ""}${dalsi ? `<a class="btn small ghost" href="#deniky-${dalsi.id}-${c}">Další žák</a>` : ""}</div>
      </div>
      <p class="ct-times">${casy.join(" · ")}</p>
      <div class="ct-grid">
        <article class="dn-page">
          ${r ? `${lisiSe ? `<div class="seg ct-ver" id="ct-ver"><button type="button" data-v="final" aria-pressed="true">Konečná verze</button><button type="button" data-v="hodina" aria-pressed="false">Verze z konce hodiny</button></div>` : ""}
            <div class="dn-read" id="ct-text">${textOdpovedi(qs, odp)}</div>` : '<p class="muted">Žák zatím nic nenapsal.</p>'}
        </article>
        <aside class="ct-side">
          ${r ? `<section class="pbox"><h2>Komentář pro žáka</h2><p class="hint">Žák ho uvidí u svého zápisu.</p>
            <textarea id="ct-kom" rows="5" maxlength="4000">${esc(r.komentar || "")}</textarea>
            <p class="btnrow"><button type="button" class="btn small" id="ct-ulozit">Uložit komentář</button><span class="p-stav" id="ct-stav" role="status"></span></p>
            ${r.komentar_at ? `<p class="hint">Naposledy uloženo ${esc(kdy(d(r.komentar_at)))}</p>` : ""}</section>` : ""}
          <section class="pbox"><h2>Prodloužit psaní</h2>
            <p class="hint">Pro náhradní zápis nebo když žák nestihl. Platí jen pro tohoto žáka a tento zápis.</p>
            <input type="datetime-local" id="ct-do" value="${esc(lokal(vy ? d(vy.do_kdy) : new Date(Date.now() + 7 * 864e5)))}">
            <p class="btnrow"><button type="button" class="btn small" id="ct-prodlouzit">${vy ? "Změnit" : "Prodloužit"}</button>${vy ? '<button type="button" class="btn small ghost" id="ct-zrusit">Zrušit prodloužení</button>' : ""}<span class="p-stav" id="ct-stav2" role="status"></span></p>
            ${vy ? `<p class="hint">${d(vy.do_kdy) > now ? "Prodlouženo do " : "Prodloužení skončilo "}${esc(kdy(d(vy.do_kdy)))}</p>` : ""}
          </section>
        </aside>
      </div>
    </div>`;

    const ver = document.getElementById("ct-ver");
    if (ver) ver.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
      ver.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      document.getElementById("ct-text").innerHTML = textOdpovedi(qs, b.dataset.v === "hodina" ? vh : odp);
    }));
    const c2 = S().client;
    const st = (id, t, chyba) => { const el = document.getElementById(id); el.textContent = t; el.classList.toggle("err", !!chyba); };
    const ul = document.getElementById("ct-ulozit");
    if (ul) ul.addEventListener("click", async () => {
      const k = document.getElementById("ct-kom").value.trim();
      const { data, error } = await c2.from("denik").update({ komentar: k || null }).eq("zak_id", zakId).eq("cislo", c).select().maybeSingle();
      if (error || !data) return st("ct-stav", "Neuloženo" + (error ? ": " + error.message : ""), true);
      Object.assign(r, data); st("ct-stav", "Uloženo");
    });
    document.getElementById("ct-prodlouzit").addEventListener("click", async () => {
      const v = document.getElementById("ct-do").value;
      if (!v) return st("ct-stav2", "Zadejte datum a čas.", true);
      const { error } = await c2.from("denik_vyjimky").upsert({ zak_id: zakId, cislo: c, do_kdy: new Date(v).toISOString() }, { onConflict: "zak_id,cislo" });
      if (error) return st("ct-stav2", "Neuloženo: " + error.message, true);
      await nactiUcitel(); cteni(zakId, c);
    });
    const zr = document.getElementById("ct-zrusit");
    if (zr) zr.addEventListener("click", async () => {
      const { error } = await c2.from("denik_vyjimky").delete().eq("zak_id", zakId).eq("cislo", c);
      if (error) return st("ct-stav2", "Nepodařilo se: " + error.message, true);
      await nactiUcitel(); cteni(zakId, c);
    });
  }

  function textOdpovedi(qs, odp) {
    odp = odp || {};
    return qs.map((q, i) => `<section><h3><span class="dn-qn">${i + 1}.</span> ${esc(q.text)}</h3>${(odp[q.id] || "").trim() ? `<p>${esc(odp[q.id])}</p>` : '<p class="muted">Bez odpovědi.</p>'}</section>`).join("");
  }

  /* --- Otázky a termíny --- */
  function spravaZapisu() {
    A().main.innerHTML = `
    <div class="wrap">
      <div class="page-head"><div><h1>Otázky a termíny</h1><p class="lead">Každý zápis má vlastní otázky a vlastní termín pro každou třídu. Žák vidí otázky tak, jak jsou tady uložené, změny se projeví hned.</p></div></div>
      ${ucitelHlava("otazky")}
      <p class="hint">Když otázku změníte nebo smažete, odpovědi, které už žáci napsali, zůstanou uložené i s původním zněním otázky.</p>
      <div id="zap-list">${u.zapisy.map(kartaZapisu).join("")}</div>
      <p><button type="button" class="btn ghost" id="novy-zapis">Přidat zápis</button></p>
    </div>`;
    u.zapisy.forEach(bindKarta);
    document.getElementById("novy-zapis").addEventListener("click", async () => {
      const c = (u.zapisy.reduce((m, x) => Math.max(m, x.cislo), 0) || 0) + 1;
      const c2 = S().client;
      const { error } = await c2.from("denik_zapisy").insert({ cislo: c, nazev: `Zápis ${c}`, otazky: [{ id: nid(), text: "", napoveda: "" }] });
      if (error) return alertStav(null, "Zápis se nepodařilo přidat: " + error.message);
      await c2.from("denik_terminy").insert(TRIDY.map((tr) => ({ cislo: c, trida: tr })));
      await nactiUcitel(); spravaZapisu();
      const el = document.getElementById("zap-" + c); if (el) el.scrollIntoView({ block: "start" });
    });
  }
  function alertStav(c, t, chyba) {
    const el = document.getElementById(c ? "zs-" + c : "zap-list");
    if (el && c) { el.textContent = t; el.classList.toggle("err", chyba !== false); }
  }

  function terminRadek(c, tr) {
    const t = tU(c, tr) || {};
    const od = d(t.hodina_od), hdo = d(t.hodina_do), uz = d(t.uzaverka);
    return `<div class="term" data-tr="${tr}">
      <span class="term-tr">${tr}</span>
      <label><span>Den hodiny</span><input type="date" data-f="den" value="${datum(od)}"></label>
      <label><span>Hodina od</span><input type="time" data-f="od" value="${hm(od)}"></label>
      <label><span>do</span><input type="time" data-f="do" value="${hm(hdo)}"></label>
      <label class="term-uz"><span>Psát lze do</span><input type="datetime-local" data-f="uz" value="${lokal(uz)}"></label>
      <button type="button" class="mini" data-dvacet>Do 20:00 téhož dne</button>
    </div>`;
  }

  function kartaZapisu(x) {
    const odpovedi = u.denik.filter((r) => r.cislo === x.cislo).length;
    return `<section class="ed-sec zap" id="zap-${x.cislo}" data-c="${x.cislo}">
      <div class="zap-head"><span class="pri-n">${x.cislo}</span>
        <div class="fld grow"><label for="zn-${x.cislo}">Název zápisu</label><input type="text" id="zn-${x.cislo}" data-f="nazev" value="${esc(x.nazev)}" maxlength="120"></div></div>
      <div class="fld"><label for="zu-${x.cislo}">Úvod (nepovinné)</label><textarea id="zu-${x.cislo}" data-f="uvod" rows="2" maxlength="2000">${esc(x.uvod || "")}</textarea></div>
      <div class="fld"><span class="lbl">Otázky</span>
        <ol class="q-edit">${(x.otazky || []).map((q, i, arr) => `<li data-id="${esc(q.id)}">
          <div class="q-f"><textarea data-q="text" rows="2" maxlength="600" placeholder="Znění otázky" aria-label="Otázka ${i + 1}">${esc(q.text)}</textarea>
          <input type="text" data-q="napoveda" maxlength="400" value="${esc(q.napoveda || "")}" placeholder="Nápověda pod otázkou (nepovinné)" aria-label="Nápověda k otázce ${i + 1}"></div>
          <span class="k-move"><button type="button" class="mini" data-qup${i === 0 ? " disabled" : ""} aria-label="Posunout výš">↑</button><button type="button" class="mini" data-qdown${i === arr.length - 1 ? " disabled" : ""} aria-label="Posunout níž">↓</button><button type="button" class="mini danger" data-qdel>Odebrat</button></span>
        </li>`).join("")}</ol>
        <button type="button" class="mini" data-qadd>Přidat otázku</button></div>
      <div class="fld"><span class="lbl">Termíny</span><p class="hint">Psát lze od začátku hodiny do zadaného času. Konec hodiny určuje, zda bylo odevzdáno „v hodině“.</p>
        ${TRIDY.map((tr) => terminRadek(x.cislo, tr)).join("")}</div>
      <div class="zap-foot"><button type="button" class="btn small" data-save>Uložit zápis</button><span class="p-stav" id="zs-${x.cislo}" role="status"></span>
        <span class="grow"></span>${odpovedi ? `<span class="hint">Napsáno ${odpovedi}× – zápis nejde smazat</span>` : '<button type="button" class="mini danger" data-del>Smazat zápis</button>'}</div>
    </section>`;
  }

  function bindKarta(x) {
    const el = document.getElementById("zap-" + x.cislo);
    if (!el) return;
    const ol = el.querySelector(".q-edit");
    const precti = () => Array.from(ol.querySelectorAll("li")).map((li) => ({ id: li.dataset.id, text: li.querySelector('[data-q="text"]').value.trim(), napoveda: li.querySelector('[data-q="napoveda"]').value.trim() }));
    const prekresli = (qs) => { x.otazky = qs; const nove = document.createElement("div"); nove.innerHTML = kartaZapisu(Object.assign({}, x, { nazev: el.querySelector('[data-f="nazev"]').value, uvod: el.querySelector('[data-f="uvod"]').value })); const n = nove.firstElementChild;
      // zachovat neuložené termíny
      el.querySelectorAll(".term").forEach((t) => { const nt = n.querySelector(`.term[data-tr="${t.dataset.tr}"]`); t.querySelectorAll("input").forEach((inp) => { nt.querySelector(`[data-f="${inp.dataset.f}"]`).value = inp.value; }); });
      el.replaceWith(n); bindKarta(x); zmena(); };
    const zmena = () => { const s = document.getElementById("zs-" + x.cislo); if (s) { s.textContent = "Neuložené změny"; s.classList.remove("err"); } };
    el.addEventListener("input", zmena);
    ol.querySelectorAll("li").forEach((li, i) => {
      const b = (sel, fn) => { const k = li.querySelector(sel); if (k) k.addEventListener("click", fn); };
      b("[data-qup]", () => { const q = precti(); [q[i - 1], q[i]] = [q[i], q[i - 1]]; prekresli(q); });
      b("[data-qdown]", () => { const q = precti(); [q[i + 1], q[i]] = [q[i], q[i + 1]]; prekresli(q); });
      b("[data-qdel]", () => { const q = precti(); q.splice(i, 1); prekresli(q); });
    });
    el.querySelector("[data-qadd]").addEventListener("click", () => { const q = precti(); q.push({ id: nid(), text: "", napoveda: "" }); prekresli(q); const t = document.querySelectorAll(`#zap-${x.cislo} .q-edit textarea`); if (t.length) t[t.length - 1].focus(); });
    el.querySelectorAll("[data-dvacet]").forEach((b) => b.addEventListener("click", () => {
      const row = b.closest(".term"), dn = row.querySelector('[data-f="den"]').value;
      if (!dn) { const s = document.getElementById("zs-" + x.cislo); s.textContent = "Nejdřív vyplňte den hodiny."; s.classList.add("err"); return; }
      row.querySelector('[data-f="uz"]').value = dn + "T20:00"; zmena();
    }));
    el.querySelector("[data-save]").addEventListener("click", async () => {
      const s = document.getElementById("zs-" + x.cislo);
      const qs = precti().filter((q) => q.text);
      if (!qs.length) { s.textContent = "Zápis musí mít aspoň jednu otázku."; s.classList.add("err"); return; }
      const terminy = [];
      for (const row of el.querySelectorAll(".term")) {
        const g = (f) => row.querySelector(`[data-f="${f}"]`).value;
        const dn = g("den"), od = g("od"), dd = g("do"), uz = g("uz");
        if (!dn && !od && !dd && !uz) { terminy.push({ cislo: x.cislo, trida: row.dataset.tr, hodina_od: null, hodina_do: null, uzaverka: null }); continue; }
        if (!dn || !od || !dd || !uz) { s.textContent = `${row.dataset.tr}: vyplňte den, začátek a konec hodiny a do kdy lze psát.`; s.classList.add("err"); return; }
        const tOd = new Date(`${dn}T${od}`), tDo = new Date(`${dn}T${dd}`), tUz = new Date(uz);
        if (!(tOd < tDo && tDo <= tUz)) { s.textContent = `${row.dataset.tr}: hodina musí začít dřív, než skončí, a psaní nesmí skončit dřív než hodina.`; s.classList.add("err"); return; }
        terminy.push({ cislo: x.cislo, trida: row.dataset.tr, hodina_od: tOd.toISOString(), hodina_do: tDo.toISOString(), uzaverka: tUz.toISOString() });
      }
      s.textContent = "Ukládám…"; s.classList.remove("err");
      const c2 = S().client;
      const a = await c2.from("denik_zapisy").update({ nazev: el.querySelector('[data-f="nazev"]').value.trim() || `Zápis ${x.cislo}`, uvod: el.querySelector('[data-f="uvod"]').value.trim() || null, otazky: qs }).eq("cislo", x.cislo);
      const b = await c2.from("denik_terminy").upsert(terminy, { onConflict: "cislo,trida" });
      if (a.error || b.error) { s.textContent = "Neuloženo: " + (a.error || b.error).message; s.classList.add("err"); return; }
      await nactiUcitel();
      const nx = u.zapisy.find((y) => y.cislo === x.cislo); Object.assign(x, nx);
      s.textContent = "Uloženo";
    });
    const del = el.querySelector("[data-del]");
    if (del) del.addEventListener("click", async () => {
      if (!del.dataset.sure) { del.dataset.sure = "1"; del.textContent = "Opravdu smazat?"; setTimeout(() => { if (del.isConnected) { delete del.dataset.sure; del.textContent = "Smazat zápis"; } }, 3000); return; }
      const { error } = await S().client.from("denik_zapisy").delete().eq("cislo", x.cislo);
      if (error) { const s = document.getElementById("zs-" + x.cislo); s.textContent = "Nepodařilo se smazat: " + error.message; s.classList.add("err"); return; }
      await nactiUcitel(); spravaZapisu();
    });
  }

  /* ================= REGISTRACE ================= */
  window.EXTRA_PAGES = Object.assign(window.EXTRA_PAGES || {}, {
    denik: { title: "Deník aktéra", render: renderDenik, update: renderDenik },
    deniky: { title: "Deníky aktéra", render: renderDeniky, update: renderDeniky }
  });
  document.addEventListener("DOMContentLoaded", () => {
    if (window.SIM && window.SIM.authPages) window.SIM.authPages.push("denik", "deniky");
  });
})();
