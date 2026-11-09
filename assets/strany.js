/* Strany: přehled, profil strany a editor profilu pro členy strany.
   Data: tabulky strany, profily_stran, zaci, nastaveni, profily_historie; obrázky v úložišti "strany". */
(function () {
  "use strict";

  const A = () => window.APP;
  const S = () => window.SIM;
  const esc = (s) => A().esc(s == null ? "" : s);
  const TRIDY = ["L1B", "L1C"];
  const ROLE = ["Lídr(ka)", "Programový expert", "Volební manažer", "Mluvčí", "Analytik"];
  const BARVY = ["#2F6DB5", "#3E9A5D", "#E07B39", "#8A5BC2", "#C2457A", "#2BA3A3", "#B8920A", "#6B7689"];
  const POLE = {
    nazev: "název", zkratka: "zkratka", slogan: "slogan", barva: "barva", logo_path: "logo", plakat_path: "plakát", spot_url: "spot",
    osa_lp: "pozice na osách", osa_lk: "pozice na osách", osy_zduvodneni: "zdůvodnění pozice",
    p1: "priorita 1", p1_popis: "priorita 1", p2: "priorita 2", p2_popis: "priorita 2", p3: "priorita 3", p3_popis: "priorita 3",
    zakon_nazev: "vlajkový zákon", zakon_problem: "vlajkový zákon", zakon_reseni: "vlajkový zákon", zakon_koho: "vlajkový zákon",
    zakon_naklady: "vlajkový zákon", zakon_pravomoc: "vlajkový zákon", zakon_typ: "vlajkový zákon", kandidatka: "kandidátní listina"
  };

  const st = { strany: [], zaci: [], uzaverka: null, nacteno: 0 };

  /* ---------- data ---------- */
  async function nacti() {
    const c = S().client;
    const [s, z, n] = await Promise.all([
      c.from("strany").select("id, trida, nazev, poradi, stav_uprav, created_at, profily_stran(*)").order("poradi").order("created_at"),
      c.from("zaci").select("id, jmeno, trida, strana_id, role_ve_strane").eq("ucitel", false).order("jmeno"),
      c.from("nastaveni").select("uzaverka_stran").eq("id", 1).maybeSingle()
    ]);
    if (s.error) throw new Error(s.error.message);
    st.strany = (s.data || []).map((r) => Object.assign(r, { p: (Array.isArray(r.profily_stran) ? r.profily_stran[0] : r.profily_stran) || {} }));
    st.zaci = z.data || [];
    st.uzaverka = n.data ? new Date(n.data.uzaverka_stran) : null;
    st.nacteno = Date.now();
  }

  const najdi = (id) => st.strany.find((x) => x.id === id);
  const obrazek = (path) => (path ? S().client.storage.from("strany").getPublicUrl(path).data.publicUrl : null);
  const jeUcitel = () => !!(S().profil && S().profil.ucitel);
  const mojeStrana = () => (S().profil && !S().profil.ucitel ? S().profil.strana_id : null);

  function muzeUpravovat(s) {
    if (jeUcitel()) return true;
    if (mojeStrana() !== s.id) return false;
    if (s.stav_uprav === "odemceno") return true;
    if (s.stav_uprav === "zamceno") return false;
    return !st.uzaverka || new Date() < st.uzaverka;
  }

  function clenove(s) {
    const lid = st.zaci.filter((z) => z.strana_id === s.id);
    const k = Array.isArray(s.p.kandidatka) ? s.p.kandidatka : [];
    const out = [];
    k.forEach((r) => { const z = lid.find((x) => x.id === r.id); if (z) out.push({ id: z.id, jmeno: z.jmeno, role: r.role || "" }); });
    lid.forEach((z) => { if (!out.find((x) => x.id === z.id)) out.push({ id: z.id, jmeno: z.jmeno, role: "" }); });
    return out;
  }

  function hotovo(s) {
    const p = s.p, cl = clenove(s);
    const role = new Set(cl.flatMap((c) => (c.role || "").split(", ").filter(Boolean)));
    return [
      ["Název a slogan", !!(s.nazev && p.slogan)],
      ["Logo", !!p.logo_path],
      ["Pozice na osách", p.osa_lp != null && p.osa_lk != null && !!(p.osy_zduvodneni || "").trim()],
      ["3 priority", !!(p.p1 && p.p2 && p.p3)],
      ["Vlajkový zákon", !!(p.zakon_nazev && p.zakon_problem && p.zakon_reseni && p.zakon_koho && p.zakon_naklady && p.zakon_typ)],
      ["Kandidátní listina a role", cl.length > 0 && cl.every((c) => c.role) && ROLE.every((r) => role.has(r))],
      ["Plakát", !!p.plakat_path]
    ];
  }

  const dny = ["ne", "po", "út", "st", "čt", "pá", "so"];
  function kdy(d) { return `${dny[d.getDay()]} ${d.getDate()}. ${d.getMonth() + 1}. ${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`; }
  function stavText(s) {
    if (s.stav_uprav === "zamceno") return "Profil je uzamčený.";
    if (s.stav_uprav === "odemceno") return "Učitel profil odemkl, můžete ho upravovat i po uzávěrce.";
    if (!st.uzaverka) return "";
    return new Date() < st.uzaverka ? `Profil můžete upravovat do ${kdy(st.uzaverka)}.` : `Uzávěrka byla ${kdy(st.uzaverka)}, profil je uzamčený.`;
  }

  function monogram(s, cls) {
    const url = obrazek(s.p.logo_path);
    if (url) return `<img class="${cls}" src="${esc(url)}" alt="Logo strany ${esc(s.nazev)}">`;
    const zk = (s.p.zkratka || s.nazev || "?").replace(/[^\p{L}\p{N}]/gu, "").slice(0, 3).toUpperCase();
    return `<span class="${cls} mono" style="background:${esc(s.p.barva)}" aria-hidden="true">${esc(zk)}</span>`;
  }

  /* ---------- graf dvou os ---------- */
  function kompas(body, opts) {
    const o = Object.assign({ size: 420, mini: false }, opts || {});
    const m = o.mini ? 16 : 26, W = o.size, inner = W - 2 * m, H = W + (o.mini ? 2 : 6);
    const sx = (v) => m + ((v + 5) / 10) * inner, sy = (v) => m + ((5 - v) / 10) * inner;
    let g = "";
    for (let i = -5; i <= 5; i++) {
      const c = i === 0 ? "ax" : "gl";
      g += `<line class="${c}" x1="${sx(i)}" y1="${m}" x2="${sx(i)}" y2="${m + inner}"/><line class="${c}" x1="${m}" y1="${sy(i)}" x2="${m + inner}" y2="${sy(i)}"/>`;
    }
    const fs = o.mini ? 10 : 12.5, c0 = W / 2;
    const labels = `
      <text class="kl" x="${m + 5}" y="${c0 - 6}" font-size="${fs}">Levice</text>
      <text class="kl" x="${m + inner - 5}" y="${c0 - 6}" font-size="${fs}" text-anchor="end">Pravice</text>
      <text class="kl" x="${c0}" y="${m - 5}" font-size="${fs}" text-anchor="middle">Konzervativní</text>
      <text class="kl" x="${c0}" y="${m + inner + fs + 3}" font-size="${fs}" text-anchor="middle">Liberální</text>`;
    const skup = {};
    body.forEach((b) => { const k = b.x + "|" + b.y; (skup[k] = skup[k] || []).push(b); });
    let dots = "";
    Object.values(skup).forEach((arr) => arr.forEach((b, i) => {
      const off = (i - (arr.length - 1) / 2) * (o.mini ? 0 : 20);
      const cx = sx(b.x) + off, cy = sy(b.y), r = o.mini ? 7 : 9;
      const inner2 = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${esc(b.barva)}" class="dot"/>` +
        (b.label ? `<text class="dl" x="${cx}" y="${cy - r - 5 - (arr.length > 1 ? (i % 2) * 12 : 0)}" text-anchor="middle">${esc(b.label)}</text>` : "") +
        `<title>${esc(b.title || b.label || "")}</title>`;
      dots += b.href ? `<a href="${esc(b.href)}">${inner2}</a>` : `<g>${inner2}</g>`;
    }));
    return `<svg class="kompas${o.mini ? " mini" : ""}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Pozice stran na osách levice–pravice a liberální–konzervativní">${g}<rect class="frame" x="${m}" y="${m}" width="${inner}" height="${inner}"/>${labels}${dots}</svg>`;
  }

  /* ---------- čekání a chyby ---------- */
  function hlaska(nadpis, text) {
    A().main.innerHTML = `<div class="wrap narrow"><div class="page-head"><div><h1>${esc(nadpis)}</h1><p class="lead">${text}</p></div></div></div>`;
  }
  async function pripravit(nadpis) {
    if (!S().ready) { hlaska(nadpis, "Načítám…"); return false; }
    if (!S().profil) { hlaska(nadpis, 'Profily stran uvidíš po přihlášení, protože obsahují jména spolužáků. <a class="inl" href="#ucet">Přihlásit se</a>'); return false; }
    try { await nacti(); } catch (e) { hlaska(nadpis, "Strany se nepodařilo načíst: " + esc(e.message) + ". Zkus obnovit stránku."); return false; }
    return true;
  }

  /* ================= PŘEHLED A PROFIL ================= */
  let tridaVyber = null;

  async function renderStrany(arg) {
    clearInterval(ed.timer);
    if (!(await pripravit("Strany"))) return;
    if (arg) return detail(arg);
    prehled();
  }

  function prehled() {
    const ja = S().profil;
    const vlastni = ja.trida || null;
    const paralelni = vlastni ? TRIDY.find((t) => t !== vlastni) : null;
    if (!tridaVyber) tridaVyber = paralelni || A().store.get("trida", "L1B");
    const T = tridaVyber;
    const strany = st.strany.filter((s) => s.trida === T);
    const moje = mojeStrana() ? najdi(mojeStrana()) : null;
    const pos = strany.filter((s) => s.p.osa_lp != null && s.p.osa_lk != null);

    A().main.innerHTML = `
    <div class="wrap">
      <div class="page-head"><div>
        <h1>Strany</h1>
        <p class="lead">Profily stran, které kandidují ve volbách 4.–5. 12. L1B volí strany z L1C a L1C strany z L1B.</p>
      </div></div>
      ${moje ? `<div class="mine" style="--pc:${esc(moje.p.barva)}">
        ${monogram(moje, "mine-logo")}
        <div><p class="mine-t">Tvoje strana: <b>${esc(moje.nazev)}</b></p><p class="mine-s">${esc(stavText(moje))}</p></div>
        <div class="mine-a">${muzeUpravovat(moje) ? '<a class="btn" href="#strana">Upravit profil strany</a>' : ""}<a class="btn ghost" href="#strany-${moje.id}">Zobrazit profil</a></div>
      </div>` : ""}
      <div class="toolbar">
        <div class="seg" id="s-trida">${TRIDY.map((t) => `<button type="button" data-t="${t}" aria-pressed="${t === T}">Strany ${t}</button>`).join("")}</div>
        <span class="tb-label">${T === paralelni ? "Tyto strany volíš ty." : T === vlastni ? "Strany tvé třídy. Volí je paralelní třída." : ""}</span>
      </div>
      ${strany.length ? `
      <div class="strany-grid">
        <div class="pcards">${strany.map(karta).join("")}</div>
        <figure class="kompas-box">
          ${kompas(pos.map((s) => ({ x: s.p.osa_lp, y: s.p.osa_lk, barva: s.p.barva, label: s.p.zkratka || s.nazev, title: s.nazev, href: "#strany-" + s.id })))}
          <figcaption>${pos.length === strany.length ? "Pozice stran na dvou osách. Klikni na tečku pro profil strany." : `Pozice stran na dvou osách. ${strany.length - pos.length === 1 ? "Jedna strana" : `${strany.length - pos.length} strany`} zatím pozici nezadala.`}</figcaption>
        </figure>
      </div>` : `<div class="empty-state"><h2>Zatím tu nejsou žádné strany</h2><p>Strany vzniknou v hodině 23. 11. Pak se tu objeví jejich profily: program, vlajkový zákon, kandidátní listina a plakát.</p></div>`}
    </div>`;
    document.querySelectorAll("#s-trida button").forEach((b) => b.addEventListener("click", () => { tridaVyber = b.dataset.t; prehled(); }));
  }

  function karta(s) {
    const p = s.p, h = hotovo(s), done = h.filter((x) => x[1]).length;
    const pri = [p.p1, p.p2, p.p3].filter(Boolean);
    return `<a class="pcard" href="#strany-${s.id}" style="--pc:${esc(p.barva)}">
      <div class="pc-top">${monogram(s, "pc-logo")}<div><h3>${esc(s.nazev)}</h3>${p.slogan ? `<p class="pc-slogan">${esc(p.slogan)}</p>` : ""}</div></div>
      ${pri.length ? `<ul class="pc-pri">${pri.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : '<p class="pc-empty">Program zatím chybí.</p>'}
      ${jeUcitel() ? `<p class="pc-done${done === h.length ? " ok" : ""}">Hotovo ${done} ze ${h.length}${done < h.length ? `: chybí ${esc(h.filter((x) => !x[1]).map((x) => x[0].toLowerCase()).join(", "))}` : ""}</p>` : ""}
    </a>`;
  }

  async function detail(id) {
    const s = najdi(id);
    if (!s) return hlaska("Strana nenalezena", 'Tahle strana neexistuje nebo ji učitel smazal. <a class="inl" href="#strany">Zpět na strany</a>');
    const p = s.p, cl = clenove(s);
    const prazdne = '<p class="muted">Strana zatím nevyplnila.</p>';
    const plakat = obrazek(p.plakat_path);
    const pri = [1, 2, 3].map((i) => [p["p" + i], p["p" + i + "_popis"]]).filter((x) => x[0] || x[1]);
    const zakon = [["Jaký problém řeší", p.zakon_problem], ["Jak ho řeší", p.zakon_reseni], ["Koho se týká", p.zakon_koho], ["Kolik bude stát", p.zakon_naklady], ["Patří do pravomoci Parlamentu?", p.zakon_pravomoc]].filter((x) => x[1]);
    A().main.innerHTML = `
    <div class="wrap">
      <p class="crumb"><a class="inl" href="#strany">Všechny strany</a></p>
      <header class="phero" style="--pc:${esc(p.barva)}">
        ${monogram(s, "ph-logo")}
        <div class="ph-t">
          <p class="ph-meta">Strana z ${esc(s.trida)}${p.zkratka ? `, zkratka ${esc(p.zkratka)}` : ""}</p>
          <h1>${esc(s.nazev)}</h1>
          ${p.slogan ? `<p class="ph-slogan">${esc(p.slogan)}</p>` : ""}
        </div>
        ${muzeUpravovat(s) ? `<a class="btn" href="${jeUcitel() ? "#strana-" + s.id : "#strana"}">Upravit profil</a>` : ""}
      </header>
      <div class="pdetail">
        <div class="pd-main">
          <section class="pd-sec"><h2>Program</h2>
            ${pri.length ? `<ol class="pd-pri">${pri.map((x) => `<li><h3>${esc(x[0] || "")}</h3>${x[1] ? `<p>${esc(x[1])}</p>` : ""}</li>`).join("")}</ol>` : prazdne}
          </section>
          <section class="pd-sec zakon-card"><h2>Vlajkový zákon</h2>
            ${p.zakon_nazev || zakon.length ? `
              ${p.zakon_nazev ? `<p class="zk-name">${esc(p.zakon_nazev)}</p>` : ""}
              ${p.zakon_typ ? `<p class="zk-typ"><a class="chip" href="#zakon">${p.zakon_typ === "ustavni" ? "Ústavní zákon: potřebuje 3/5 v obou komorách" : "Běžný zákon"}</a></p>` : ""}
              <dl class="facts">${zakon.map((x) => `<dt>${esc(x[0])}</dt><dd>${esc(x[1])}</dd>`).join("")}</dl>` : prazdne}
          </section>
          <section class="pd-sec"><h2>Kde strana stojí</h2>
            ${p.osa_lp != null && p.osa_lk != null ? `<div class="pd-osy">${kompas([{ x: p.osa_lp, y: p.osa_lk, barva: p.barva }], { size: 240, mini: true })}
              <div><p class="osy-cisla">${osaText(p.osa_lp, "levice", "pravice")}, ${osaText(p.osa_lk, "liberální", "konzervativní")}</p>${p.osy_zduvodneni ? `<p>${esc(p.osy_zduvodneni)}</p>` : ""}</div></div>` : prazdne}
          </section>
        </div>
        <aside class="pd-side">
          <section class="pd-sec"><h2>Plakát</h2>
            ${plakat ? `<a href="${esc(plakat)}" target="_blank" rel="noopener"><img class="plakat" src="${esc(plakat)}" alt="Volební plakát strany ${esc(s.nazev)}"></a>` : prazdne}
            ${p.spot_url ? `<p><a class="btn ghost spot" href="${esc(p.spot_url)}" target="_blank" rel="noopener">Pustit volební spot</a></p>` : ""}
          </section>
          <section class="pd-sec"><h2>Kandidátní listina</h2>
            ${cl.length ? `<ol class="kandidatka">${cl.map((c) => `<li><span class="kn">${esc(c.jmeno)}</span>${c.role ? `<span class="kr">${esc(c.role)}</span>` : ""}</li>`).join("")}</ol>` : '<p class="muted">Strana zatím nemá členy.</p>'}
          </section>
          ${jeUcitel() ? `<section class="pd-sec"><h2>Historie úprav</h2><div id="historie"><p class="muted">Načítám…</p></div></section>` : ""}
        </aside>
      </div>
    </div>`;
    if (jeUcitel()) {
      const { data } = await S().client.from("profily_historie").select("jmeno, cas, pole").eq("strana_id", s.id).order("cas", { ascending: false }).limit(60);
      const box = document.getElementById("historie");
      if (box) box.innerHTML = data && data.length
        ? `<ul class="hist">${data.map((h) => `<li><b>${esc(h.jmeno || "učitel")}</b> <span class="muted">${esc(kdy(new Date(h.cas)))}</span><br>${esc([...new Set(h.pole.map((x) => POLE[x] || x))].join(", "))}</li>`).join("")}</ul>`
        : '<p class="muted">Zatím nikdo nic neupravil.</p>';
    }
  }

  function osaText(v, a, b) {
    if (v === 0) return `střed mezi ${a} a ${b}`;
    const sila = Math.abs(v) >= 4 ? "výrazně " : Math.abs(v) <= 1 ? "mírně " : "";
    return sila + (v < 0 ? a : b) + ` (${v > 0 ? "+" : ""}${v})`;
  }

  /* ================= EDITOR ================= */
  const ed = { id: null, dirty: new Set(), pending: 0, timers: {}, timer: null };

  async function renderEditor(arg) {
    clearInterval(ed.timer);
    if (!(await pripravit("Profil strany"))) return;
    const id = arg && jeUcitel() ? arg : mojeStrana();
    if (!id) return hlaska("Profil strany", jeUcitel() ? 'Vyberte stranu v <a class="inl" href="#ucitel">učitelském panelu</a>.' : "Do strany tě učitel zařadí v hodině 23. 11. Pak tu budete společně vyplňovat profil.");
    const s = najdi(id);
    if (!s) return hlaska("Profil strany", "Strana nenalezena.");
    ed.id = id; ed.dirty.clear();
    kresliEditor(s);
    ed.timer = setInterval(obnov, 20000);
  }

  function kresliEditor(s) {
    const p = s.p, lze = muzeUpravovat(s), dis = lze ? "" : " disabled";
    const cl = clenove(s);
    const h = hotovo(s);
    const inp = (col, label, o) => {
      o = o || {};
      const v = col === "nazev" ? s.nazev : p[col];
      const id = "f-" + col;
      const tag = o.area
        ? `<textarea id="${id}" data-col="${col}" rows="${o.rows || 3}" maxlength="${o.max || 1500}"${dis}>${esc(v || "")}</textarea>`
        : `<input id="${id}" type="text" data-col="${col}" value="${esc(v || "")}" maxlength="${o.max || 160}"${dis}${o.ph ? ` placeholder="${esc(o.ph)}"` : ""}>`;
      return `<div class="fld"><label for="${id}">${esc(label)}</label>${o.hint ? `<p class="hint">${o.hint}</p>` : ""}${tag}</div>`;
    };
    const slider = (col, a, b) => `<div class="fld osa">
        <label for="f-${col}">${esc(a)} – ${esc(b)}</label>
        <div class="osa-row"><span>${esc(a)}</span><input id="f-${col}" type="range" min="-5" max="5" step="1" data-col="${col}" value="${p[col] == null ? 0 : p[col]}"${dis}><span>${esc(b)}</span></div>
        <p class="osa-val" id="v-${col}">${p[col] == null ? "Zatím nezadáno, posuň jezdcem." : osaText(p[col], a.toLowerCase(), b.toLowerCase())}</p>
      </div>`;
    A().main.innerHTML = `
    <div class="wrap">
      <p class="crumb"><a class="inl" href="#strany-${s.id}">Zobrazit profil, jak ho uvidí voliči</a></p>
      <div class="page-head"><div>
        <h1>${esc(s.nazev)}</h1>
        <p class="lead">${esc(stavText(s))} Vše se ukládá samo, můžete na profilu pracovat všichni najednou.</p>
      </div></div>
      ${lze ? "" : '<p class="locked">Profil je uzamčený, úpravy už nejdou uložit. Pokud potřebujete něco opravit, řekněte učiteli.</p>'}
      <div class="ed-grid">
        <nav class="ed-nav" aria-label="Části profilu">
          <ul>${[["zaklad", "Název a logo"], ["osy", "Pozice na osách"], ["program", "3 priority"], ["zakon", "Vlajkový zákon"], ["kandidatka", "Kandidátní listina"], ["kampan", "Plakát a spot"]].map((x) => `<li><a href="#strana${jeUcitel() ? "-" + s.id : ""}" data-jump="${x[0]}">${x[1]}</a></li>`).join("")}</ul>
          <div class="ed-check"><p>Hotovo ${h.filter((x) => x[1]).length} ze ${h.length}</p><ul id="checklist">${checklist(h)}</ul>
          <p class="hint">Odpovědi do volební kalkulačky přibudou samostatně.</p></div>
        </nav>
        <div class="ed-forms">
          <section class="ed-sec" id="sec-zaklad"><h2>Název a logo</h2>
            <div class="two">${inp("nazev", "Název strany", { max: 80 })}${inp("zkratka", "Zkratka", { max: 8, ph: "např. SZL", hint: "Nejvýš 8 znaků, objeví se v grafech." })}</div>
            ${inp("slogan", "Slogan", { max: 140 })}
            <div class="fld"><span class="lbl">Barva strany</span><div class="swatches" role="radiogroup" aria-label="Barva strany">${BARVY.map((b) => `<button type="button" role="radio" class="sw" data-barva="${b}" style="background:${b}" aria-checked="${b.toLowerCase() === (p.barva || "").toLowerCase()}" aria-label="Barva ${b}"${dis}></button>`).join("")}</div></div>
            ${upload("logo", "Logo", p.logo_path, lze, "Čtvercový obrázek PNG nebo JPG. Zmenší se na 600 px.")}
          </section>

          <section class="ed-sec" id="sec-osy"><h2>Pozice na osách</h2>
            <div class="osy-grid"><div>
              ${slider("osa_lp", "Levice", "Pravice")}
              ${slider("osa_lk", "Liberální", "Konzervativní")}
            </div><div id="osy-nahled">${kompas([{ x: p.osa_lp == null ? 0 : p.osa_lp, y: p.osa_lk == null ? 0 : p.osa_lk, barva: p.barva }], { size: 220, mini: true })}</div></div>
            ${inp("osy_zduvodneni", "Proč stojíte právě tady?", { area: true, rows: 4, hint: "Opřete se o pojmy z hodiny: role státu v ekonomice, svoboda jednotlivce, tradice." })}
          </section>

          <section class="ed-sec" id="sec-program"><h2>3 priority</h2>
            <p class="hint">Priority musí sedět s vaší pozicí na osách.</p>
            ${[1, 2, 3].map((i) => `<div class="pri-blk"><span class="pri-n">${i}</span><div>${inp("p" + i, "Priorita " + i, { max: 120 })}${inp("p" + i + "_popis", "Co konkrétně uděláte", { area: true, rows: 2, max: 600 })}</div></div>`).join("")}
          </section>

          <section class="ed-sec" id="sec-zakon"><h2>Vlajkový zákon</h2>
            ${inp("zakon_nazev", "Název zákona", { max: 160, ph: "např. Zákon o zákazu mobilů ve školách" })}
            ${inp("zakon_problem", "Jaký problém řeší", { area: true })}
            ${inp("zakon_reseni", "Jak ho řeší", { area: true })}
            <div class="two">${inp("zakon_koho", "Koho se týká", { area: true, rows: 2, max: 1000 })}${inp("zakon_naklady", "Kolik bude stát a kdo to zaplatí", { area: true, rows: 2, max: 1000 })}</div>
            ${inp("zakon_pravomoc", "Patří do pravomoci Parlamentu?", { area: true, rows: 2, max: 1000, hint: 'Může o tom rozhodnout Parlament, nebo to patří obcím, krajům či EU? Nezasahuje do práv z Listiny?' })}
            <div class="fld"><span class="lbl">Typ zákona</span><div class="radios">
              ${[["bezny", "Běžný zákon"], ["ustavni", "Ústavní zákon (mění Ústavu)"]].map((o) => `<label class="radio"><input type="radio" name="zakon_typ" value="${o[0]}" data-col="zakon_typ"${p.zakon_typ === o[0] ? " checked" : ""}${dis}> ${o[1]}</label>`).join("")}
            </div><p class="hint">Rozdíl najdete na stránce <a class="inl" href="#zakon">Cesta zákona</a>.</p></div>
          </section>

          <section class="ed-sec" id="sec-kandidatka"><h2>Kandidátní listina</h2>
            <p class="hint">Seřaďte kandidáty a rozdělte si role. Jeden člověk může mít víc rolí. Pořadí určuje, kdo dostane mandát jako první.</p>
            ${cl.length ? `<ol class="k-edit" id="k-edit">${cl.map((c, i) => `<li data-id="${c.id}">
              <span class="k-n">${i + 1}.</span><span class="k-j">${esc(c.jmeno)}</span>
              <span class="k-role">${ROLE.map((r) => `<label class="chiprole"><input type="checkbox" value="${esc(r)}"${(c.role || "").split(", ").includes(r) ? " checked" : ""}${dis}> ${esc(r)}</label>`).join("")}</span>
              <span class="k-move"><button type="button" class="mini" data-up="${i}" aria-label="Posunout výš"${i === 0 || !lze ? " disabled" : ""}>↑</button><button type="button" class="mini" data-down="${i}" aria-label="Posunout níž"${i === cl.length - 1 || !lze ? " disabled" : ""}>↓</button></span>
            </li>`).join("")}</ol>` : '<p class="muted">Strana zatím nemá členy. Do stran žáky zařazuje učitel.</p>'}
          </section>

          <section class="ed-sec" id="sec-kampan"><h2>Plakát a spot</h2>
            ${upload("plakat", "Plakát", p.plakat_path, lze, "Obrázek JPG nebo PNG na výšku. Zmenší se na 1800 px.")}
            ${inp("spot_url", "Odkaz na spot (nepovinné)", { max: 400, ph: "https://youtu.be/…", hint: "Video nahrajte na YouTube (neveřejné) nebo na Google Disk se sdílením přes odkaz a vložte sem odkaz." })}
          </section>
        </div>
      </div>
      <p class="savebar" id="savebar" role="status" aria-live="polite"></p>
    </div>`;
    bindEditor(s);
  }

  function checklist(h) { return h.map((x) => `<li class="${x[1] ? "ok" : ""}">${esc(x[0])}</li>`).join(""); }

  function upload(co, label, path, lze, hint) {
    const url = obrazek(path);
    return `<div class="fld up" data-up="${co}"><span class="lbl">${esc(label)}</span><p class="hint">${esc(hint)}</p>
      <div class="up-row">${url ? `<img class="up-prev ${co}" src="${esc(url)}" alt="">` : `<span class="up-prev ${co} none">Zatím nenahráno</span>`}
      ${lze ? `<label class="btn small ghost up-btn">${url ? "Nahrát jiný" : "Nahrát obrázek"}<input type="file" accept="image/png,image/jpeg,image/webp" data-file="${co}" hidden></label>${url ? `<button type="button" class="mini danger" data-rmimg="${co}">Odebrat</button>` : ""}` : ""}</div></div>`;
  }

  function savebar(t, chyba) {
    const el = document.getElementById("savebar");
    if (!el) return;
    el.textContent = t;
    el.classList.toggle("err", !!chyba);
    el.classList.toggle("on", !!t);
  }

  async function ulozSloupec(s, col, val) {
    const c = S().client;
    ed.pending++;
    savebar("Ukládám…");
    const res = col === "nazev"
      ? await c.from("strany").update({ nazev: String(val).trim() || s.nazev }).eq("id", s.id).select("id")
      : await c.from("profily_stran").update({ [col]: val }).eq("strana_id", s.id).select("strana_id");
    ed.pending--;
    if (res.error || !res.data || !res.data.length) {
      const zamek = !res.error && (!res.data || !res.data.length);
      savebar(zamek ? "Neuloženo: profil je uzamčený (uplynula uzávěrka)." : "Neuloženo: " + res.error.message, true);
      return false;
    }
    if (col === "nazev") s.nazev = val; else s.p[col] = val;
    ed.dirty.delete(col);
    const d = new Date();
    if (!ed.pending) savebar(`Uloženo ${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`);
    const ch = document.getElementById("checklist");
    if (ch) { const h = hotovo(s); ch.innerHTML = checklist(h); ch.previousElementSibling.textContent = `Hotovo ${h.filter((x) => x[1]).length} ze ${h.length}`; }
    return true;
  }

  function bindEditor(s) {
    const root = A().main;
    const later = (col, fn) => { clearTimeout(ed.timers[col]); ed.timers[col] = setTimeout(fn, 900); };

    root.querySelectorAll("[data-jump]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); const t = document.getElementById("sec-" + a.dataset.jump); if (t) t.scrollIntoView({ behavior: "smooth", block: "start" }); }));

    root.querySelectorAll("input[type=text][data-col], textarea[data-col]").forEach((el) => {
      el.addEventListener("input", () => {
        const col = el.dataset.col;
        ed.dirty.add(col);
        savebar("Neuložené změny…");
        later(col, () => {
          let v = el.value;
          if (col === "spot_url") {
            v = v.trim();
            if (v && !/^https:\/\//.test(v)) { savebar("Odkaz na spot musí začínat https://", true); return; }
          }
          ulozSloupec(s, col, v.trim() === "" ? null : v);
        });
      });
      el.addEventListener("blur", () => { if (ed.dirty.has(el.dataset.col) && ed.timers[el.dataset.col]) { /* uloží časovač */ } });
    });

    root.querySelectorAll("input[type=range][data-col]").forEach((el) => {
      const col = el.dataset.col, [a, b] = col === "osa_lp" ? ["levice", "pravice"] : ["liberální", "konzervativní"];
      el.addEventListener("input", () => {
        document.getElementById("v-" + col).textContent = osaText(+el.value, a, b);
        const lp = +document.getElementById("f-osa_lp").value, lk = +document.getElementById("f-osa_lk").value;
        document.getElementById("osy-nahled").innerHTML = kompas([{ x: lp, y: lk, barva: s.p.barva }], { size: 220, mini: true });
      });
      el.addEventListener("change", () => ulozSloupec(s, col, +el.value));
    });

    root.querySelectorAll("input[type=radio][data-col]").forEach((el) => el.addEventListener("change", () => ulozSloupec(s, el.dataset.col, el.value)));

    root.querySelectorAll(".sw[data-barva]").forEach((b) => b.addEventListener("click", async () => {
      if (await ulozSloupec(s, "barva", b.dataset.barva)) {
        root.querySelectorAll(".sw").forEach((x) => x.setAttribute("aria-checked", String(x === b)));
      }
    }));

    // kandidátní listina
    const kList = () => Array.from(root.querySelectorAll("#k-edit li")).map((li) => ({
      id: li.dataset.id,
      role: Array.from(li.querySelectorAll(".chiprole input:checked")).map((x) => x.value).join(", ")
    }));
    root.querySelectorAll("#k-edit input[type=checkbox]").forEach((x) => x.addEventListener("change", () => ulozSloupec(s, "kandidatka", kList())));
    const presun = async (i, j) => {
      const arr = kList(); const [it] = arr.splice(i, 1); arr.splice(j, 0, it);
      if (await ulozSloupec(s, "kandidatka", arr)) kresliEditorZachovej(s, "sec-kandidatka");
    };
    root.querySelectorAll("[data-up]").forEach((b) => b.addEventListener("click", () => presun(+b.dataset.up, +b.dataset.up - 1)));
    root.querySelectorAll("[data-down]").forEach((b) => b.addEventListener("click", () => presun(+b.dataset.down, +b.dataset.down + 1)));

    // obrázky
    root.querySelectorAll("input[data-file]").forEach((inp) => inp.addEventListener("change", async () => {
      const f = inp.files && inp.files[0];
      if (!f) return;
      const co = inp.dataset.file, col = co + "_path";
      try {
        savebar("Nahrávám obrázek…");
        const blob = co === "logo" ? await zmensi(f, 600, "image/png") : await zmensi(f, 1800, "image/jpeg");
        const path = `${s.id}/${co}-${Date.now()}.${co === "logo" ? "png" : "jpg"}`;
        const { error } = await S().client.storage.from("strany").upload(path, blob, { contentType: blob.type, upsert: false });
        if (error) throw new Error(error.message);
        const stara = s.p[col];
        if (await ulozSloupec(s, col, path)) {
          if (stara) S().client.storage.from("strany").remove([stara]);
          kresliEditorZachovej(s, co === "logo" ? "sec-zaklad" : "sec-kampan");
        } else {
          S().client.storage.from("strany").remove([path]);
        }
      } catch (e) {
        savebar("Obrázek se nepodařilo nahrát: " + (e.message || "nepodporovaný formát") + ". Zkuste JPG nebo PNG.", true);
      }
    }));
    root.querySelectorAll("[data-rmimg]").forEach((b) => b.addEventListener("click", async () => {
      const col = b.dataset.rmimg + "_path", stara = s.p[col];
      if (await ulozSloupec(s, col, null)) {
        if (stara) S().client.storage.from("strany").remove([stara]);
        kresliEditorZachovej(s, b.dataset.rmimg === "logo" ? "sec-zaklad" : "sec-kampan");
      }
    }));
  }

  function kresliEditorZachovej(s, secId) {
    const y = window.scrollY;
    kresliEditor(s);
    window.scrollTo(0, y);
    void secId;
  }

  async function zmensi(file, max, typ) {
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const w = Math.round(bmp.width * k), h = Math.round(bmp.height * k);
    const cv = document.createElement("canvas");
    cv.width = w; cv.height = h;
    const ctx = cv.getContext("2d");
    if (typ === "image/jpeg") { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h); }
    ctx.drawImage(bmp, 0, 0, w, h);
    const blob = await new Promise((r) => cv.toBlob(r, typ, 0.86));
    if (!blob) throw new Error("obrázek nejde zpracovat");
    if (blob.size > 6 * 1024 * 1024) throw new Error("obrázek je i po zmenšení moc velký");
    return blob;
  }

  // Načte změny od spolustraníků, nepřepíše rozepsaná pole
  async function obnov() {
    if (A().currentPage() !== "strana" || document.hidden || ed.pending || ed.dirty.size) return;
    const act = document.activeElement;
    if (act && act.dataset && act.dataset.col) return;
    try { await nacti(); } catch (e) { return; }
    const s = najdi(ed.id);
    if (s) kresliEditorZachovej(s);
  }
  document.addEventListener("visibilitychange", () => { if (!document.hidden) obnov(); });

  /* ================= REGISTRACE ================= */
  window.EXTRA_PAGES = Object.assign(window.EXTRA_PAGES || {}, {
    strany: { title: "Strany", render: renderStrany, update: renderStrany },
    strana: { title: "Profil strany", render: renderEditor, update: renderEditor }
  });
  document.addEventListener("DOMContentLoaded", () => {
    if (window.SIM && window.SIM.authPages) window.SIM.authPages.push("strany", "strana");
  });
})();
