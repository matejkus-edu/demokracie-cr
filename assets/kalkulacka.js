/* Volební kalkulačka: odpovědi stran (#kalkulacka-strana), vyplnění voličem (#kalkulacka-volic)
   a přehled pro učitele (#kalkulacka). Odpovědi stran: -2 nesouhlas … +2 souhlas. */
(function () {
  "use strict";

  const A = () => window.APP;
  const S = () => window.SIM;
  const esc = (s) => A().esc(s == null ? "" : s);
  const TRIDY = ["L1B", "L1C"];
  const ODP = [[2, "Souhlas"], [1, "Spíš souhlas"], [0, "Neutrální"], [-1, "Spíš nesouhlas"], [-2, "Nesouhlas"]];
  const odpText = (v) => (ODP.find((x) => x[0] === v) || [null, "–"])[1];
  const odpZnak = (v) => ({ 2: "++", 1: "+", 0: "0", "-1": "−", "-2": "−−" }[v] ?? "");
  const DNY = ["ne", "po", "út", "st", "čt", "pá", "so"];
  const kdy = (x) => `${DNY[x.getDay()]} ${x.getDate()}. ${x.getMonth() + 1}. ${x.getHours()}:${String(x.getMinutes()).padStart(2, "0")}`;

  let tU = "L1B";
  const k = { vyroky: [], strany: [], odpovedi: [], klic: [], uzaverky: {}, otevreno: {}, odkryt: false, vyplneni: [], zaci: [] };

  async function nacti(proUcitele) {
    const c = S().client;
    const q = [
      c.from("vyroky").select("*").order("cislo"),
      c.from("strany").select("id, trida, nazev, poradi, stav_kalk, created_at, profily_stran(zkratka, barva, logo_path), pozice_stran(osa_lp, osa_lk)").order("poradi").order("created_at"),
      c.from("odpovedi_stran").select("*"),
      c.from("nastaveni").select("odkryt_body").eq("id", 1).maybeSingle(),
      c.from("vyroky_klic").select("*"),
      c.from("tridy").select("id, kalk_uzaverka, kalk_otevreno")
    ];
    if (proUcitele) q.push(c.from("kalk_vyplneni").select("*"), c.from("zaci").select("id, jmeno, trida").eq("ucitel", false).order("jmeno"));
    const r = await Promise.all(q);
    const err = r.find((x) => x.error);
    if (err) throw new Error(err.error.message);
    k.vyroky = r[0].data; k.odpovedi = r[2].data; k.klic = r[4].data || [];
    const jeden = (x) => (Array.isArray(x) ? x[0] : x) || {};
    k.strany = r[1].data.map((s) => Object.assign(s, { p: Object.assign({}, jeden(s.profily_stran), jeden(s.pozice_stran)) }));
    k.uzaverky = {};
    k.otevreno = {};
    (r[5].data || []).forEach((t) => { k.uzaverky[t.id] = t.kalk_uzaverka ? new Date(t.kalk_uzaverka) : null; k.otevreno[t.id] = !!t.kalk_otevreno; });
    if (S().nastavTridy) S().nastavTridy(r[5].data || []);
    k.odkryt = !!(r[3].data && r[3].data.odkryt_body);
    if (proUcitele) { k.vyplneni = r[6].data; k.zaci = r[7].data; }
  }

  const jeUcitel = () => !!(S().profil && S().profil.ucitel);
  /* Každá třída má vlastní uzávěrku odpovědí stran. Voličům se kalkulačka otevře,
     když uplyne uzávěrka paralelní třídy (strany, které volí, mají odpovědi uzamčené). */
  const uzTridy = (t) => k.uzaverky[t] || null;
  const uzavreno = (t) => !!uzTridy(t) && new Date() >= uzTridy(t);
  const paralelniK = (t) => TRIDY.find((x) => x !== t);
  // kalkulačku za stranu zpřístupní učitel ručně (na začátku hodiny 30. 11. / 1. 12.)
  const proStrany = (t) => !!k.otevreno[t];
  const odpStrany = (id) => k.odpovedi.filter((x) => x.strana_id === id);
  const odp1 = (id, c) => k.odpovedi.find((x) => x.strana_id === id && x.cislo === c);
  function muzeUpravovat(s) {
    if (jeUcitel()) return true;
    if (!S().profil || S().profil.strana_id !== s.id) return false;
    if (s.stav_kalk === "odemceno") return true;
    if (s.stav_kalk === "zamceno") return false;
    return proStrany(s.trida) && !uzavreno(s.trida);
  }

  /* Bod strany podle klíče: průměr (odpověď × směr) zvlášť pro obě osy, převedeno na škálu −5 až +5 */
  function bodStrany(id) {
    if (!k.klic.length) return null;
    const osa = (o) => {
      const ks = k.klic.filter((x) => x.osa === o);
      if (!ks.length) return null;
      const sum = ks.reduce((a, x) => { const r = odp1(id, x.cislo); return a + (r && r.odpoved != null ? r.odpoved * x.smer : 0); }, 0);
      return Math.round((sum / ks.length) * 2.5 * 10) / 10;
    };
    if (!odpStrany(id).length) return null;
    return { x: osa("ekon"), y: osa("spol") };
  }

  function stats(id) {
    const o = odpStrany(id);
    return {
      odpovezeno: o.filter((x) => x.odpoved != null).length,
      zduvodneno: o.filter((x) => (x.zduvodneni || "").trim()).length,
      neutralni: o.filter((x) => x.odpoved === 0).length
    };
  }

  const lokal = (d) => { if (!d) return ""; const p2 = (x) => String(x).padStart(2, "0"); return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}T${p2(d.getHours())}:${p2(d.getMinutes())}`; };

  function hlaska(nadpis, text) {
    A().main.innerHTML = `<div class="wrap narrow"><div class="page-head"><div><h1>${esc(nadpis)}</h1><p class="lead">${text}</p></div></div></div>`;
  }

  async function render(arg) {
    clearInterval(ed.timer);
    if (!S().ready) return hlaska("Volební kalkulačka", "Načítám…");
    if (!S().profil) return hlaska("Volební kalkulačka", 'Kalkulačku vyplníš po přihlášení kódem z lístečku. <a class="inl" href="#ucet">Přihlásit se</a>');
    try { await nacti(jeUcitel()); } catch (e) { return hlaska("Volební kalkulačka", "Nepodařilo se načíst: " + esc(e.message)); }
    const ja = S().profil;
    const zatimNe = () => hlaska("Volební kalkulačka", "Kalkulačku za stranu začnete vyplňovat společně v hodině 30. 11. (L1C) a 1. 12. (L1B). Učitel ji zpřístupní na začátku hodiny.");
    if (arg === "strana") {
      if (!jeUcitel() && ja.strana_id) { const s = k.strany.find((x) => x.id === ja.strana_id); if (s && !proStrany(ja.trida) && s.stav_kalk !== "odemceno") return zatimNe(); }
      return editorStrany(jeUcitel() ? null : ja.strana_id);
    }
    if (arg && arg.startsWith("strana-") && jeUcitel()) return editorStrany(arg.slice(7));
    if (arg === "volic") return volic();
    if (jeUcitel()) return ucitel();
    // žák: do uzávěrky své třídy odpovídá za stranu, pak volí
    if (ja.strana_id && !uzavreno(ja.trida)) {
      const s = k.strany.find((x) => x.id === ja.strana_id);
      if (proStrany(ja.trida) || (s && s.stav_kalk === "odemceno")) return editorStrany(ja.strana_id);
      if (!uzavreno(paralelniK(ja.trida))) return zatimNe();
    }
    return volic();
  }

  /* ================= ODPOVĚDI STRANY ================= */
  const ed = { timer: null, dirty: new Set(), timers: {} };

  function editorStrany(id) {
    if (!id) return hlaska("Odpovědi strany", jeUcitel() ? 'Vyberte stranu v <a class="inl" href="#kalkulacka">přehledu kalkulačky</a>.' : "Do strany tě učitel zařadí v hodině 23. 11.");
    const s = k.strany.find((x) => x.id === id);
    if (!s) return hlaska("Odpovědi strany", "Strana nenalezena.");
    const lze = muzeUpravovat(s), dis = lze ? "" : " disabled";
    const st = stats(id);
    const uz = uzTridy(s.trida), par = paralelniK(s.trida);
    const termin = s.stav_kalk === "zamceno" ? "Odpovědi jsou uzamčené." : s.stav_kalk === "odemceno" ? "Učitel vám odpovědi odemkl i po uzávěrce." : uz ? (uzavreno(s.trida) ? `Uzávěrka byla ${kdy(uz)}, odpovědi jsou uzamčené.` : `Odpovědi můžete měnit do ${kdy(uz)}. Pak se uzamknou a kalkulačka se otevře voličům z ${par}.`) : "Termín uzávěrky zatím učitel nestanovil.";
    A().main.innerHTML = `
    <div class="wrap">
      <p class="crumb"><a class="inl" href="${jeUcitel() ? "#kalkulacka" : "#strany"}">${jeUcitel() ? "Přehled kalkulačky" : "Strany"}</a></p>
      <div class="page-head"><div>
        <h1>Odpovědi do kalkulačky</h1>
        <p class="lead">Strana <b>${esc(s.nazev)}</b>. ${esc(termin)} Odpovídejte jako strana, ne za sebe. Každá změna se hned uloží a vidí ji celá strana.</p>
      </div></div>
      <div class="kk-rules">
        <p><b>Pravidla:</b> nejvýš 3 neutrální odpovědi. U výroků z vašich priorit a vlajkového zákona nesmí odpověď odporovat programu. U ostatních smíte taktizovat, ale odpověď musíte umět obhájit. Zdůvodnění (1–2 věty, co prosazujete) uvidí voliči. Nepište, na jaké straně os stojíte.</p>
      </div>
      <div class="kk-stats" id="kk-stats">${statsHtml(st)}</div>
      ${!jeUcitel() && uzavreno(par) ? `<p class="hint">Strany z ${par} už mají odpovědi uzamčené, kalkulačku můžeš vyplnit i jako volič. <a class="inl" href="#kalkulacka-volic">Vyplnit kalkulačku</a></p>` : ""}
      <ol class="kk-list">${k.vyroky.map((v) => { const r = odp1(id, v.cislo) || {};
        return `<li class="kk-item" data-c="${v.cislo}">
          <div class="kk-top"><span class="kk-n">${v.cislo}</span><div><p class="kk-obl">${esc(v.oblast)}</p><h3>${esc(v.text)}</h3>
          <details><summary>Vysvětlení pro voliče</summary><p>${esc(v.vysvetleni || "")}</p></details></div></div>
          <div class="kk-scale" role="radiogroup" aria-label="Odpověď na výrok ${v.cislo}">${ODP.map((o) => `<label class="kk-opt o${o[0]}"><input type="radio" name="o${v.cislo}" value="${o[0]}"${r.odpoved === o[0] ? " checked" : ""}${dis}><span>${o[1]}</span></label>`).join("")}</div>
          <div class="fld"><label for="z${v.cislo}">Zdůvodnění pro voliče</label><textarea id="z${v.cislo}" rows="2" maxlength="600" data-c="${v.cislo}"${dis} placeholder="Souhlasíme. Prosazujeme…">${esc(r.zduvodneni || "")}</textarea></div>
          <p class="kk-st" id="st${v.cislo}" role="status"></p>
        </li>`; }).join("")}</ol>
    </div>`;
    if (!lze) return;
    const c = S().client;
    async function uloz(cislo, pole) {
      const st = document.getElementById("st" + cislo);
      st.textContent = "Ukládám…"; st.classList.remove("err");
      const row = Object.assign({ strana_id: id, cislo }, pole);
      const { data, error } = await c.from("odpovedi_stran").upsert(row, { onConflict: "strana_id,cislo" }).select().maybeSingle();
      if (error || !data) { st.textContent = "Neuloženo" + (error ? ": " + error.message : ": odpovědi jsou uzamčené."); st.classList.add("err"); return; }
      const i = k.odpovedi.findIndex((x) => x.strana_id === id && x.cislo === cislo);
      if (i >= 0) k.odpovedi[i] = data; else k.odpovedi.push(data);
      ed.dirty.delete(cislo);
      st.textContent = "Uloženo";
      document.getElementById("kk-stats").innerHTML = statsHtml(stats(id));
    }
    A().main.querySelectorAll(".kk-scale input").forEach((inp) => inp.addEventListener("change", () => uloz(+inp.closest(".kk-item").dataset.c, { odpoved: +inp.value })));
    A().main.querySelectorAll(".kk-item textarea").forEach((ta) => ta.addEventListener("input", () => {
      const cislo = +ta.dataset.c; ed.dirty.add(cislo);
      document.getElementById("st" + cislo).textContent = "Neuložené změny…";
      clearTimeout(ed.timers[cislo]);
      ed.timers[cislo] = setTimeout(() => uloz(cislo, { zduvodneni: ta.value.trim() || null }), 1000);
    }));
    // změny od spolustraníků
    ed.timer = setInterval(async () => {
      if (A().currentPage() !== "kalkulacka" || document.hidden || ed.dirty.size) return;
      const act = document.activeElement;
      if (act && act.tagName === "TEXTAREA") return;
      const { data } = await c.from("odpovedi_stran").select("*").eq("strana_id", id);
      if (!data) return;
      k.odpovedi = k.odpovedi.filter((x) => x.strana_id !== id).concat(data);
      data.forEach((r) => {
        const li = A().main.querySelector(`.kk-item[data-c="${r.cislo}"]`); if (!li) return;
        li.querySelectorAll("input").forEach((x) => { x.checked = +x.value === r.odpoved; });
        const ta = li.querySelector("textarea"); if (ta && ta.value !== (r.zduvodneni || "")) ta.value = r.zduvodneni || "";
      });
      document.getElementById("kk-stats").innerHTML = statsHtml(stats(id));
    }, 20000);
  }

  function statsHtml(st) {
    const n = k.vyroky.length;
    return `<span class="${st.odpovezeno === n ? "ok" : ""}">Odpovězeno ${st.odpovezeno} z ${n}</span>
      <span class="${st.zduvodneno === n ? "ok" : ""}">Se zdůvodněním ${st.zduvodneno} z ${n}</span>
      <span class="${st.neutralni > 3 ? "bad" : "ok"}">Neutrálních ${st.neutralni} (nejvýš 3)</span>`;
  }

  /* ================= VOLIČ ================= */
  const v = { odp: {}, krok: 0, hotovo: false, trida: null };
  const klicUloz = () => "kalk-" + (S().profil ? S().profil.id : "x");
  function nactiStav() { try { const o = JSON.parse(localStorage.getItem(klicUloz()) || "null"); if (o) { v.odp = o.odp || {}; v.krok = o.krok || 0; v.hotovo = !!o.hotovo; } } catch (e) { /* bez úložiště */ } }
  function ulozStav() { try { localStorage.setItem(klicUloz(), JSON.stringify({ odp: v.odp, krok: v.krok, hotovo: v.hotovo })); } catch (e) { /* bez úložiště */ } }

  function volic() {
    const ja = S().profil;
    const paralelni = ja.trida ? TRIDY.find((t) => t !== ja.trida) : null;
    v.trida = jeUcitel() ? tU : (paralelni || "L1C");
    if (!jeUcitel() && !uzavreno(v.trida)) {
      const uz = uzTridy(v.trida);
      const vlastni = ja.strana_id && !uzavreno(ja.trida) && proStrany(ja.trida) ? ' Do té doby můžete doplňovat <a class="inl" href="#kalkulacka-strana">odpovědi vaší strany</a>.' : "";
      return hlaska("Volební kalkulačka", `Kalkulačka se otevře, až strany z ${esc(v.trida)} uzavřou své odpovědi${uz ? `, ${esc(kdy(uz))}` : ""}.${vlastni}`);
    }
    nactiStav();
    v.strany = k.strany.filter((s) => s.trida === v.trida);
    if (!v.strany.length) return hlaska("Volební kalkulačka", `Ve třídě ${esc(v.trida)} zatím nejsou žádné strany.`);
    if (v.hotovo) return vysledky();
    krok();
  }

  function krok() {
    const n = k.vyroky.length, i = Math.min(v.krok, n - 1), vy = k.vyroky[i], a = v.odp[vy.cislo] || {};
    A().main.innerHTML = `
    <div class="wrap kk-wrap">
      <div class="page-head"><div>
        <h1>Volební kalkulačka</h1>
        <p class="lead">${n} výroků. U každého vyber, jak moc souhlasíš. Kalkulačka pak ukáže, jak se shoduješ se stranami${jeUcitel() ? "" : " z paralelní třídy"} ${esc(v.trida)}.${jeUcitel() ? " (Náhled učitele, nic se neukládá.)" : ""}</p>
      </div></div>
      <div class="kk-progress" aria-hidden="true"><span style="width:${(i / n) * 100}%"></span></div>
      <article class="kk-card">
        <p class="kk-meta">Výrok ${i + 1} z ${n}, ${esc(vy.oblast)}</p>
        <h2>${esc(vy.text)}</h2>
        ${vy.vysvetleni ? `<p class="kk-vys">${esc(vy.vysvetleni)}</p>` : ""}
        <div class="kk-choices">${ODP.map((o) => `<button type="button" class="kk-ch o${o[0]}" data-v="${o[0]}" aria-pressed="${a.v === o[0]}">${o[1]}</button>`).join("")}</div>
        <label class="kk-imp"><input type="checkbox" id="kk-dul"${a.d ? " checked" : ""}> Tohle je pro mě důležité (počítá se dvakrát)</label>
        <div class="kk-nav">
          <button type="button" class="btn ghost small" id="kk-zpet"${i === 0 ? " disabled" : ""}>Zpět</button>
          <button type="button" class="mini" id="kk-skip">Přeskočit</button>
        </div>
      </article>
    </div>`;
    const dal = () => { v.krok = i + 1; if (v.krok >= n) { v.hotovo = true; ulozStav(); dokonceno(); vysledky(); } else { ulozStav(); krok(); } };
    A().main.querySelectorAll(".kk-ch").forEach((b) => b.addEventListener("click", () => {
      v.odp[vy.cislo] = { v: +b.dataset.v, d: document.getElementById("kk-dul").checked };
      dal();
    }));
    document.getElementById("kk-dul").addEventListener("change", (e) => { if (v.odp[vy.cislo]) { v.odp[vy.cislo].d = e.target.checked; ulozStav(); } });
    document.getElementById("kk-skip").addEventListener("click", () => { v.odp[vy.cislo] = { v: null, d: false }; dal(); });
    document.getElementById("kk-zpet").addEventListener("click", () => { v.krok = Math.max(0, i - 1); ulozStav(); krok(); });
  }

  async function dokonceno() {
    if (jeUcitel()) return;
    await S().client.from("kalk_vyplneni").upsert({ zak_id: S().profil.id }, { onConflict: "zak_id" });
  }

  function shoda(stranaId) {
    let sum = 0, w = 0, pocet = 0;
    k.vyroky.forEach((vy) => {
      const a = v.odp[vy.cislo], r = odp1(stranaId, vy.cislo);
      if (!a || a.v == null || !r || r.odpoved == null) return;
      const vaha = a.d ? 2 : 1;
      sum += vaha * (1 - Math.abs(a.v - r.odpoved) / 4); w += vaha; pocet++;
    });
    return { proc: w ? Math.round((sum / w) * 100) : null, pocet };
  }

  function vysledky() {
    const ranky = v.strany.map((s) => Object.assign({ s }, shoda(s.id))).sort((a, b) => (b.proc ?? -1) - (a.proc ?? -1));
    const top = ranky.find((r) => r.proc != null);
    if (top && !jeUcitel()) { try { localStorage.setItem("kalk-vysledek-" + S().profil.id, top.s.id); } catch (e) { /* bez úložiště */ } }
    const odpovezeno = Object.values(v.odp).filter((a) => a && a.v != null).length;
    A().main.innerHTML = `
    <div class="wrap">
      <div class="page-head"><div>
        <h1>Tvoje shoda se stranami</h1>
        <p class="lead">Odpověděl(a) jsi na ${odpovezeno} z ${k.vyroky.length} výroků. Kalkulačka je jen jeden z podkladů pro rozhodnutí: podívej se i na profily stran, jejich program a kampaň.</p>
      </div></div>
      <ol class="kk-res">${ranky.map((r) => `<li style="--pc:${esc(r.s.p.barva || "#6B7689")}">
        <details>
          <summary><span class="kr-name"><b>${esc(r.s.nazev)}</b>${r.s.p.zkratka ? ` <span class="muted">${esc(r.s.p.zkratka)}</span>` : ""}</span>
            <span class="kr-bar"><span style="width:${r.proc ?? 0}%"></span></span><span class="kr-pct">${r.proc == null ? "bez odpovědí" : r.proc + " %"}</span></summary>
          <div class="kr-detail">
            <p class="hint">Porovnání tvých odpovědí s odpověďmi strany. <a class="inl" href="#strany-${r.s.id}">Profil strany</a></p>
            <table class="kr-tab"><thead><tr><th>Výrok</th><th>Ty</th><th>Strana a její zdůvodnění</th></tr></thead><tbody>
            ${k.vyroky.map((vy) => { const a = v.odp[vy.cislo] || {}, o = odp1(r.s.id, vy.cislo) || {};
              const shodne = a.v != null && o.odpoved != null ? Math.abs(a.v - o.odpoved) : null;
              return `<tr><td><b>${vy.cislo}.</b> ${esc(vy.kratce)}${a.d ? ' <span class="pill wait">důležité</span>' : ""}</td>
                <td class="kr-a">${a.v == null ? '<span class="muted">přeskočeno</span>' : esc(odpText(a.v))}</td>
                <td><span class="kr-o${shodne === 0 ? " same" : shodne != null && shodne >= 3 ? " far" : ""}">${o.odpoved == null ? "bez odpovědi" : esc(odpText(o.odpoved))}</span>${o.zduvodneni ? `<span class="kr-z">${esc(o.zduvodneni)}</span>` : ""}</td></tr>`; }).join("")}
            </tbody></table>
          </div>
        </details></li>`).join("")}</ol>
      <p class="btnrow"><button type="button" class="btn ghost" id="kk-znovu">Vyplnit znovu</button><a class="btn ghost" href="#strany">Profily stran</a></p>
      ${k.odkryt ? bodySekce() : ""}
    </div>`;
    document.getElementById("kk-znovu").addEventListener("click", () => { v.odp = {}; v.krok = 0; v.hotovo = false; ulozStav(); krok(); });
  }

  function bodySekce() {
    const tridy = jeUcitel() ? TRIDY : [S().profil.trida, TRIDY.find((t) => t !== S().profil.trida)].filter(Boolean);
    return `<section class="section"><h2>Kde strany stojí podle svých odpovědí</h2>
      <p class="sub">Plná tečka je pozice, kterou si strana sama zvolila. Kroužek je bod spočítaný z odpovědí do kalkulačky. Čím delší čára, tím víc strana v odpovědích taktizovala nebo se od své pozice vzdálila.</p>
      <div class="kk-body">${tridy.map((t) => `<figure class="kompas-box"><figcaption><b>${t}</b></figcaption>${kompasBodu(t)}</figure>`).join("")}</div></section>`;
  }

  function kompasBodu(t) {
    const body = [];
    k.strany.filter((s) => s.trida === t).forEach((s) => {
      const b = bodStrany(s.id), dek = s.p.osa_lp != null && s.p.osa_lk != null ? { x: s.p.osa_lp, y: s.p.osa_lk } : null;
      if (dek) body.push({ x: dek.x, y: dek.y, barva: s.p.barva, label: s.p.zkratka || s.nazev, title: s.nazev + ": zvolená pozice" });
      if (b && b.x != null && b.y != null) body.push({ x: b.x, y: b.y, barva: s.p.barva, ring: true, od: dek, title: `${s.nazev}: podle odpovědí ${b.x}, ${b.y}` });
    });
    return window.KOMPAS ? window.KOMPAS(body) : "";
  }

  /* ================= UČITEL ================= */
  function ucitel() {
    const strany = k.strany.filter((s) => s.trida === tU);
    const zaci = k.zaci.filter((z) => z.trida === tU);
    const vypl = zaci.filter((z) => k.vyplneni.find((x) => x.zak_id === z.id));
    A().main.innerHTML = `
    <div class="wrap">
      <div class="page-head"><div>
        <h1>Volební kalkulačka</h1>
        <p class="lead">Odpovědi stran, body stran podle klíče a kdo už kalkulačku vyplnil jako volič. Každá třída má vlastní uzávěrku odpovědí. Až uplyne, kalkulačka se otevře voličům z paralelní třídy.</p>
      </div></div>
      <div class="toolbar">
        <div class="seg" id="kk-tr">${TRIDY.map((t) => `<button type="button" data-t="${t}" aria-pressed="${t === tU}">Strany ${t}</button>`).join("")}</div>
        <a class="btn small ghost" href="#kalkulacka-volic">Vyzkoušet jako volič</a>
        <label class="kk-odkryt"><input type="checkbox" id="kk-odkryt"${k.odkryt ? " checked" : ""}> Ukázat žákům body stran podle odpovědí (4.7)</label>
        <span class="p-stav" id="kk-stav" role="status"></span>
      </div>
      <div class="kk-uz">
        <label class="kk-zpr"><input type="checkbox" id="kk-zpr"${proStrany(tU) ? " checked" : ""}> <span><b>Zpřístupnit kalkulačku stranám ${tU}</b><br><span class="muted">${proStrany(tU) ? "Strany z " + tU + " teď kalkulačku vidí a mohou odpovídat." : "Strany z " + tU + " kalkulačku zatím nevidí. Zapněte to na začátku hodiny " + (tU === "L1C" ? "30. 11." : "1. 12.") + "."}</span></span></label>
        <label class="uzaverka"><span>Uzávěrka odpovědí stran ${tU}</span><input type="datetime-local" id="kk-uz" value="${lokal(uzTridy(tU))}"></label>
        <button type="button" class="btn small ghost" id="kk-uz-ted"${uzavreno(tU) ? " disabled" : ""}>Uzavřít odpovědi ${tU} teď</button>
        <p class="kk-uz-stav">${uzTridy(tU) ? (uzavreno(tU) ? `<b>Uzavřeno</b> od ${esc(kdy(uzTridy(tU)))}. Voliči z ${paralelniK(tU)} kalkulačku vyplňují.` : `<b>Uzávěrka</b> ${esc(kdy(uzTridy(tU)))}. Pak se odpovědi stran uzamknou a kalkulačka se otevře voličům z ${paralelniK(tU)}.`) : "Uzávěrka není nastavená, odpovědi jsou otevřené."}</p>
      </div>
      ${strany.length ? `<div class="tbl-wrap"><table class="kk-tab">
        <thead><tr><th>Výrok</th>${strany.map((s) => `<th style="--pc:${esc(s.p.barva)}"><a class="inl" href="#kalkulacka-strana-${s.id}">${esc(s.p.zkratka || s.nazev)}</a></th>`).join("")}</tr></thead>
        <tbody>${k.vyroky.map((vy) => { const kl = k.klic.find((x) => x.cislo === vy.cislo) || {};
          return `<tr><th scope="row"><b>${vy.cislo}.</b> ${esc(vy.kratce)}<span class="th-s">${kl.osa ? `${kl.osa === "ekon" ? "ekonomická" : "společenská"}, souhlas = ${kl.osa === "ekon" ? (kl.smer > 0 ? "pravice" : "levice") : (kl.smer > 0 ? "konzervativní" : "liberální")}` : "mimo osy"}</span></th>
          ${strany.map((s) => { const o = odp1(s.id, vy.cislo); return `<td><span class="kz o${o && o.odpoved != null ? o.odpoved : "x"}" title="${esc(o ? odpText(o.odpoved) + (o.zduvodneni ? ": " + o.zduvodneni : "") : "bez odpovědi")}">${o && o.odpoved != null ? odpZnak(o.odpoved) : "·"}</span>${o && !(o.zduvodneni || "").trim() ? '<i class="udot" title="chybí zdůvodnění"></i>' : ""}</td>`; }).join("")}</tr>`; }).join("")}</tbody>
        <tfoot>
          <tr><th>Odpovězeno / zdůvodněno</th>${strany.map((s) => { const st = stats(s.id); return `<td>${st.odpovezeno} / ${st.zduvodneno}</td>`; }).join("")}</tr>
          <tr><th>Neutrálních (nejvýš 3)</th>${strany.map((s) => { const st = stats(s.id); return `<td class="${st.neutralni > 3 ? "c-bad" : ""}">${st.neutralni}</td>`; }).join("")}</tr>
          <tr><th>Bod podle odpovědí (ekon., spol.)</th>${strany.map((s) => { const b = bodStrany(s.id); return `<td>${b ? `${b.x}, ${b.y}` : "–"}</td>`; }).join("")}</tr>
          <tr><th>Zvolená pozice</th>${strany.map((s) => `<td>${s.p.osa_lp != null ? `${s.p.osa_lp}, ${s.p.osa_lk}` : "–"}</td>`).join("")}</tr>
          <tr><th>Úpravy odpovědí</th>${strany.map((s) => `<td><select class="kk-zamek" data-kalk="${s.id}" aria-label="Úpravy odpovědí: ${esc(s.nazev)}">${[["auto", "do uzávěrky"], ["zamceno", "zamčeno"], ["odemceno", "odemčeno"]].map((o) => `<option value="${o[0]}"${o[0] === (s.stav_kalk || "auto") ? " selected" : ""}>${o[1]}</option>`).join("")}</select></td>`).join("")}</tr>
        </tfoot></table></div>
        <p class="hint dn-legend">++ souhlas, + spíš souhlas, 0 neutrální, − spíš nesouhlas, −− nesouhlas. <i class="udot"></i> chybí zdůvodnění. Body jsou na stejné škále jako graf stran (−5 až +5).</p>
        <div class="kk-body"><figure class="kompas-box"><figcaption>Plná tečka: zvolená pozice, kroužek: bod podle odpovědí</figcaption>${kompasBodu(tU)}</figure></div>`
      : `<div class="empty-state"><h2>Ve třídě ${tU} zatím nejsou strany</h2><p>Strany přidáte v <a class="inl" href="#ucitel">učitelském panelu</a>.</p></div>`}
      <section class="section"><h2>Kdo vyplnil kalkulačku jako volič (${tU})</h2>
        <p class="sub">Ukládá se jen to, že žák kalkulačku dokončil, ne jeho odpovědi. Vyplnilo ${vypl.length} z ${zaci.length}.</p>
        <ul class="kk-vyp">${zaci.map((z) => { const x = k.vyplneni.find((y) => y.zak_id === z.id); return `<li class="${x ? "ok" : ""}">${esc(z.jmeno)}<span>${x ? esc(kdy(new Date(x.vyplneno_at))) : "zatím ne"}</span></li>`; }).join("")}</ul>
      </section>
    </div>`;
    A().main.querySelectorAll("#kk-tr button").forEach((b) => b.addEventListener("click", () => { tU = b.dataset.t; ucitel(); }));
    const hlas = (t, chyba) => { const st = document.getElementById("kk-stav"); st.textContent = t; st.classList.toggle("err", !!chyba); };
    async function ulozUz(d) {
      const { data, error } = await S().client.from("tridy").update({ kalk_uzaverka: d.toISOString() }).eq("id", tU).select();
      if (error || !data || !data.length) return hlas("Uzávěrku se nepodařilo uložit" + (error ? ": " + error.message : ""), true);
      k.uzaverky[tU] = d; ucitel(); hlas("Uzávěrka uložena");
    }
    document.getElementById("kk-uz").addEventListener("change", (e) => { if (e.target.value) ulozUz(new Date(e.target.value)); });
    document.getElementById("kk-zpr").addEventListener("change", async (e) => {
      const v = e.target.checked;
      const { data, error } = await S().client.from("tridy").update({ kalk_otevreno: v }).eq("id", tU).select("id, kalk_uzaverka, kalk_otevreno");
      if (error || !data || !data.length) { e.target.checked = !v; return hlas("Nepodařilo se uložit" + (error ? ": " + error.message : ""), true); }
      k.otevreno[tU] = v; ucitel(); hlas(v ? `Kalkulačka je zpřístupněná stranám ${tU}` : `Kalkulačka je pro strany ${tU} skrytá`);
    });
    const ted = document.getElementById("kk-uz-ted");
    ted.addEventListener("click", () => {
      if (ted.dataset.potvrd) return ulozUz(new Date());
      ted.dataset.potvrd = "1"; ted.textContent = "Opravdu uzavřít? Klikněte znovu";
      setTimeout(() => { if (document.body.contains(ted)) { delete ted.dataset.potvrd; ted.textContent = `Uzavřít odpovědi ${tU} teď`; } }, 4000);
    });
    A().main.querySelectorAll("[data-kalk]").forEach((sel) => sel.addEventListener("change", async () => {
      const { error } = await S().client.from("strany").update({ stav_kalk: sel.value }).eq("id", sel.dataset.kalk);
      if (!error) { const s = k.strany.find((x) => x.id === sel.dataset.kalk); if (s) s.stav_kalk = sel.value; }
      hlas(error ? "Nepodařilo se uložit: " + error.message : "Uloženo", !!error);
    }));
    document.getElementById("kk-odkryt").addEventListener("change", async (e) => {
      const { error } = await S().client.from("nastaveni").update({ odkryt_body: e.target.checked }).eq("id", 1);
      const st = document.getElementById("kk-stav");
      st.textContent = error ? "Neuloženo: " + error.message : e.target.checked ? "Body jsou žákům vidět" : "Body jsou skryté";
      st.classList.toggle("err", !!error);
      if (!error) k.odkryt = e.target.checked;
    });
  }

  window.EXTRA_PAGES = Object.assign(window.EXTRA_PAGES || {}, {
    kalkulacka: { title: "Volební kalkulačka", render, update: render }
  });
  document.addEventListener("DOMContentLoaded", () => {
    if (window.SIM && window.SIM.authPages) window.SIM.authPages.push("kalkulacka");
  });
})();
