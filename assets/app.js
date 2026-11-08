/* Politický systém ČR – aplikace (bez knihoven a bez sestavování). */
(function () {
  "use strict";

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const SVGNS = "http://www.w3.org/2000/svg";
  const main = $("#main");

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* [[id|text]] → odkaz. id s lomítkem nebo název stránky vede na stránku, jinak na instituci v mapě. */
  function md(s) {
    return esc(s).replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, (m, id, text) => {
      const page = id.includes("/") || id === "volby" || id === "zakon" || id === "mapa";
      const href = page ? "#" + id.replace("/", "-") : "#mapa-" + id;
      const pw = !page && INST[id] ? " c-" + INST[id].power : "";
      return '<a class="inl' + pw + '" href="' + href + '">' + text + "</a>";
    });
  }

  const store = {
    get(k, d) { try { const v = localStorage.getItem("psc." + k); return v === null ? d : v; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("psc." + k, v); } catch (e) { /* bez úložiště */ } }
  };

  $$("[data-stav]").forEach((el) => (el.textContent = STAV));

  /* ================= ROUTER ================= */
  let current = null;

  /* Adresy: #mapa, #mapa-ps, #vztah-rozpust, #volby, #volby-senat, #zakon */
  /* Stránky: studijní jsou tady, simulační si zaregistruje sim.js do window.EXTRA_PAGES. */
  function pages() {
    return Object.assign({
      mapa: { title: "Dělba moci", render: () => renderMapPage() },
      volby: { title: "Volby", render: () => renderVolby() },
      zakon: { title: "Cesta zákona", render: () => renderZakon() }
    }, window.EXTRA_PAGES || {});
  }

  function parse() {
    const h = (location.hash || "").replace(/^#\/?/, "");
    if (!h) return { page: "mapa" };
    if (h.startsWith("vztah-")) return { page: "mapa", a: "vztah", b: h.slice(6) };
    const m = h.match(/^([a-z]+)(?:-(.+))?$/);
    if (!m || !pages()[m[1]]) return null;
    return { page: m[1], a: m[2] || null };
  }

  function route() {
    const r = parse();
    if (!r) { if (!current) { location.replace("#mapa"); } return; }
    const page = r.page, P = pages()[page];
    $$(".tabs a").forEach((a) => a.setAttribute("aria-current", a.dataset.page === page ? "page" : "false"));
    if (current !== page) {
      current = page;
      document.title = P.title + " | Politický systém ČR";
      P.render(r.a);
      window.scrollTo(0, 0);
    } else if (P.update) P.update(r.a);
    if (page === "mapa") {
      if (r.a === "vztah" && r.b) selectMap({ type: "edge", id: r.b });
      else if (r.a && INST[r.a]) selectMap({ type: "node", id: r.a });
      else selectMap(null);
    }
    if (page === "volby") showVolba(r.a);
  }
  window.APP = {
    $, $$, esc, md, store, main,
    rerender() { current = null; route(); },
    currentPage: () => current
  };
  window.addEventListener("hashchange", route);

  /* ================= DĚLBA MOCI (schéma) ================= */
  const W = 1120;
  const NODE_TEXT = {
    parlament: { lines: ["Parlament ČR"] },
    ps: { lines: ["Poslanecká", "sněmovna"], sub: "200 poslanců" },
    senat: { lines: ["Senát"], sub: "81 senátorů" },
    prezident: { lines: ["Prezident"], sub: "hlava státu" },
    vlada: { lines: ["Vláda"], sub: "premiér a ministři" },
    us: { lines: ["Ústavní soud"], sub: "15 soudců" },
    soudy: { lines: ["Soustava soudů"], sub: "obecné soudy, NS, NSS" },
    nku: { lines: ["NKÚ"], sub: "kontrola hospodaření" },
    cnb: { lines: ["ČNB"], sub: "centrální banka" },
    ombudsman: { lines: ["Ombudsman"], sub: "veřejný ochránce práv" },
    media: { lines: ["ČT a ČRo"], sub: "média veřejné služby" },
    obcane: { lines: ["Občané"], sub: "zdroj veškeré státní moci (čl. 2 Ústavy)" },
    obce: { lines: ["Obce"], sub: "zastupitelstvo, starosta" },
    kraje: { lines: ["Kraje"], sub: "zastupitelstvo, hejtman" }
  };

  function layout(mode) {
    const full = mode === "full";
    const yPeople = full ? 530 : 420;
    const yLocal = yPeople + 85;
    const n = {
      parlament: { x: 40, y: 140, w: 440, h: 200 },
      senat: { cx: 140, cy: 250, w: 170, h: 96 },
      ps: { cx: 380, cy: 250, w: 170, h: 96 },
      vlada: { cx: 630, cy: 190, w: 220, h: 76 },
      prezident: { cx: 630, cy: 320, w: 220, h: 76 },
      us: { cx: 930, cy: 190, w: 240, h: 76 },
      soudy: { cx: 930, cy: 320, w: 240, h: 76 },
      obcane: { x: 40, y: yPeople, w: 1050, h: 60 },
      obce: { cx: 440, cy: yLocal + 45, w: 180, h: 56 },
      kraje: { cx: 680, cy: yLocal + 45, w: 180, h: 56 }
    };
    if (full) {
      Object.assign(n, {
        ombudsman: { cx: 250, cy: 470, w: 170, h: 64 },
        nku: { cx: 495, cy: 470, w: 170, h: 64 },
        media: { cx: 795, cy: 470, w: 170, h: 64 },
        cnb: { cx: 990, cy: 470, w: 150, h: 64 }
      });
    }
    for (const k in n) {
      const b = n[k];
      if (b.cx !== undefined) { b.x = b.cx - b.w / 2; b.y = b.cy - b.h / 2; }
      else { b.cx = b.x + b.w / 2; b.cy = b.y + b.h / 2; }
    }
    const zones = [
      { cls: "leg", x: 30, y: 40, w: 460, h: 345, t: "Zákonodárná moc", n: "přijímá zákony" },
      { cls: "exec", x: 505, y: 40, w: 250, h: 345, t: "Výkonná moc", n: "řídí stát" },
      { cls: "jud", x: 770, y: 40, w: 320, h: 345, t: "Soudní moc", n: "rozhoduje spory" },
      { cls: "local", x: 220, y: yLocal, w: 680, h: 90, t: "Samospráva", n: "" }
    ];
    if (full) zones.push({ cls: "indep", x: 30, y: 400, w: 1060, h: 112, t: "Nezávislé instituce", n: "kontrolují moc" });
    return { H: yLocal + 105, nodes: n, zones };
  }

  const map = {
    mode: store.get("mode", "core"),
    view: store.get("view", window.innerWidth < 720 ? "list" : "schema"),
    kinds: new Set(["vznik", "brzda", "spol"]),
    sel: null
  };

  function members(id) { return id === "parlament" ? ["parlament"] : (id === "ps" || id === "senat") ? [id, "parlament"] : [id]; }
  function edgesOf(id) { const m = members(id); return EDGES.filter((e) => m.includes(e.from) || m.includes(e.to)); }
  function visibleEdge(e) { return (map.mode === "full" || e.core) && map.kinds.has(e.kind); }
  function shortName(id) { const i = INST[id]; return i.short || i.name; }

  function renderMapPage() {
    main.innerHTML = `
    <div class="wrap">
      <div class="page-head">
        <div>
          <h1>Dělba moci</h1>
          <p class="lead">Kdo v Česku jakou moc drží, jak se do funkce dostane a kdo ho může zastavit. Klikni na instituci nebo na šipku.</p>
        </div>
      </div>
      <div class="toolbar" role="group" aria-label="Nastavení schématu">
        <div class="seg" id="seg-mode">
          <button type="button" data-mode="core">Jádro z hodiny</button>
          <button type="button" data-mode="full">Celé schéma</button>
        </div>
        <div class="kinds" id="kinds">
          ${Object.keys(KINDS).map((k) => `<button type="button" class="kind" data-kind="${k}" aria-pressed="true" title="${esc(KINDS[k].hint)}">${kindSample(k)}${esc(KINDS[k].name)}</button>`).join("")}
        </div>
        <div class="seg" id="seg-view">
          <button type="button" data-view="schema">Schéma</button>
          <button type="button" data-view="list">Seznam</button>
        </div>
      </div>
      <div class="map-grid">
        <div>
          <div id="map-holder"></div>
          <p class="map-note" id="map-note"></p>
        </div>
        <aside class="aside idle" id="aside" aria-live="polite"></aside>
      </div>
    </div>
    <section class="section" id="pojistky">
      <div class="wrap">
        <h2>Pojistky demokracie</h2>
        <p class="sub">Co brání tomu, aby jeden člověk, strana nebo instituce získali všechnu moc. Každá pojistka vede na instituci, která ji drží.</p>
        <ul class="pojistky">${POJISTKY.map((p) => `<li><h3>${esc(p.t)}</h3><p>${md(p.d)}</p></li>`).join("")}</ul>
      </div>
    </section>`;

    $$("#seg-mode button").forEach((b) => b.addEventListener("click", () => { map.mode = b.dataset.mode; store.set("mode", map.mode); drawMap(); }));
    $$("#seg-view button").forEach((b) => b.addEventListener("click", () => { map.view = b.dataset.view; store.set("view", map.view); drawMap(); }));
    $$("#kinds .kind").forEach((b) => b.addEventListener("click", () => {
      const k = b.dataset.kind;
      if (map.kinds.has(k)) { if (map.kinds.size > 1) map.kinds.delete(k); } else map.kinds.add(k);
      drawMap();
    }));
    drawMap();
  }

  function kindSample(k) {
    const dash = k === "spol" ? ' stroke-dasharray="5 3"' : "";
    const bar = k === "brzda" ? '<line x1="27" y1="1" x2="27" y2="11" stroke-width="2.2"/>' : "";
    return `<svg viewBox="0 0 30 12" aria-hidden="true" class="ks-${k}" style="stroke:var(--k-${k});fill:var(--k-${k})"><line x1="1" y1="6" x2="21" y2="6" stroke-width="2"${dash}/><path d="M18 2 L25 6 L18 10 Z" stroke="none"/>${bar}</svg>`;
  }

  function drawMap() {
    $$("#seg-mode button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === map.mode)));
    $$("#seg-view button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.view === map.view)));
    $$("#kinds .kind").forEach((b) => b.setAttribute("aria-pressed", String(map.kinds.has(b.dataset.kind))));
    const holder = $("#map-holder");
    if (!holder) return;
    if (map.sel && map.sel.type === "node" && !INST[map.sel.id].core && map.mode === "core") map.mode = "full";
    if (map.view === "list") { holder.innerHTML = renderList(); bindList(); $("#map-note").textContent = ""; }
    else { holder.innerHTML = '<div class="map-box"></div>'; $(".map-box", holder).appendChild(buildSvg()); }
    $("#map-note").textContent = map.view === "schema"
      ? (map.mode === "core"
        ? "Jádro z hodiny 4.4: šest ústavních institucí, občané a samospráva. Písmena A–H odpovídají klíči ze schématu z hodiny. Další instituce a vztahy ukáže Celé schéma."
        : "Celé schéma: přibyly nezávislé instituce a další vztahy. Když je šipek moc, vyber si jednu instituci a zbytek se ztlumí.")
      : "";
    applySel();
    renderAside();
  }

  function renderList() {
    const order = ["leg", "exec", "jud", "indep", "people", "local"];
    return '<div class="list-view">' + order.map((p) => {
      const items = Object.keys(INST).filter((id) => INST[id].power === p && (map.mode === "full" || INST[id].core));
      if (!items.length) return "";
      return `<div class="lv-group"><h3 class="c-${p === "people" ? "people" : p}">${esc(POWERS[p].name)}</h3><div class="lv-cards">` +
        items.map((id) => `<button type="button" class="lv-card" data-id="${id}" style="border-left-color:var(--${p === "people" ? "ink" : p})"><b>${esc(INST[id].name)}</b><span>${esc(INST[id].lead)}</span></button>`).join("") +
        "</div></div>";
    }).join("") + "</div>";
  }
  function bindList() { $$(".lv-card").forEach((b) => b.addEventListener("click", () => (location.hash = "#mapa-" + b.dataset.id))); }

  /* --- geometrie --- */
  function rayRect(b, px, py, dx, dy) {
    // průsečík paprsku z bodu (px,py) uvnitř obdélníku se stranou obdélníku
    let t = Infinity;
    if (dx > 0) t = Math.min(t, (b.x + b.w - px) / dx);
    if (dx < 0) t = Math.min(t, (b.x - px) / dx);
    if (dy > 0) t = Math.min(t, (b.y + b.h - py) / dy);
    if (dy < 0) t = Math.min(t, (b.y - py) / dy);
    if (!isFinite(t)) t = 0;
    return [px + dx * t, py + dy * t];
  }
  function anchor(id, b, tx, ty, ox, oy) {
    if (INST[id].bar) {
      if (ty > b.y && ty < b.y + b.h) return [tx > b.cx ? b.x + b.w : b.x, ty];
      const x = Math.max(b.x + 24, Math.min(b.x + b.w - 24, tx + (ox || 0)));
      return [x, ty < b.cy ? b.y : b.y + b.h];
    }
    const px = b.cx + (ox || 0), py = b.cy + (oy || 0);
    const dx = tx + (ox || 0) - px, dy = ty + (oy || 0) - py;
    const len = Math.hypot(dx, dy) || 1;
    return rayRect(b, px, py, dx / len, dy / len);
  }
  function pullBack(p, q, d) { const dx = p[0] - q[0], dy = p[1] - q[1], l = Math.hypot(dx, dy) || 1; return [p[0] - dx / l * d, p[1] - dy / l * d]; }
  function roundedPath(pts, r) {
    let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const p = pts[i], a = pts[i - 1], c = pts[i + 1];
      const l1 = Math.hypot(p[0] - a[0], p[1] - a[1]), l2 = Math.hypot(c[0] - p[0], c[1] - p[1]);
      const rr = Math.min(r, l1 / 2, l2 / 2);
      const s = [p[0] + (a[0] - p[0]) / l1 * rr, p[1] + (a[1] - p[1]) / l1 * rr];
      const e = [p[0] + (c[0] - p[0]) / l2 * rr, p[1] + (c[1] - p[1]) / l2 * rr];
      d += ` L${s[0].toFixed(1)},${s[1].toFixed(1)} Q${p[0]},${p[1]} ${e[0].toFixed(1)},${e[1].toFixed(1)}`;
    }
    const last = pts[pts.length - 1];
    return d + ` L${last[0].toFixed(1)},${last[1].toFixed(1)}`;
  }

  function el(tag, attrs, parent) {
    const e = document.createElementNS(SVGNS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  function buildSvg() {
    const L = layout(map.mode);
    const svg = el("svg", { viewBox: `0 0 ${W} ${L.H}`, class: "map " + map.mode, role: "group", "aria-label": "Dělba moci: ústavní instituce a jejich vztahy" });
    const defs = el("defs", {}, svg);
    for (const k of ["vznik", "spol", "brzda"]) {
      const m = el("marker", { id: "ar-" + k, viewBox: "0 0 14 12", refX: k === "brzda" ? 13 : 11, refY: 6, markerWidth: 14, markerHeight: 12, markerUnits: "userSpaceOnUse", orient: "auto" }, defs);
      el("path", { d: k === "brzda" ? "M1,1 L10,6 L1,11 Z" : "M1,1 L11,6 L1,11 Z", class: "mk-" + k }, m);
      if (k === "brzda") el("rect", { x: 11.2, y: 0, width: 2.4, height: 12, class: "mk-brzda" }, m);
    }

    const gz = el("g", {}, svg);
    for (const z of L.zones) {
      const g = el("g", { class: "zone z-" + z.cls }, gz);
      el("rect", { x: z.x, y: z.y, width: z.w, height: z.h, rx: 16 }, g);
      const t = el("text", { x: z.x + 16, y: z.y + 24 }, g);
      const t1 = el("tspan", {}, t); t1.textContent = z.t;
      if (z.n) { const t2 = el("tspan", { class: "zn", dx: 8 }, t); t2.textContent = z.n; }
    }

    // vztahy
    const ge = el("g", { class: "edges" }, svg);
    const pairs = {};
    const shown = EDGES.filter((e) => (map.mode === "full" || e.core) && L.nodes[e.from] && L.nodes[e.to]);
    shown.forEach((e) => { if (e.via) return; const k = [e.from, e.to].sort().join("|"); (pairs[k] = pairs[k] || []).push(e); });

    for (const e of shown) {
      const A = L.nodes[e.from], B = L.nodes[e.to];
      let pts;
      if (e.via) {
        const v0 = e.via[0], v1 = e.via[e.via.length - 1];
        const p1 = anchor(e.from, A, v0[0], v0[1]);
        let p2 = anchor(e.to, B, v1[0], v1[1]);
        p2 = pullBack(p2, v1, 1.5);
        pts = [p1, ...e.via, p2];
      } else {
        const key = [e.from, e.to].sort().join("|");
        const grp = pairs[key], i = grp.indexOf(e), n = grp.length;
        const gap = n >= 3 ? 20 : 14;
        const off = (i - (n - 1) / 2) * gap;
        // normála podle abecedního pořadí, aby souběžné šipky nesplývaly
        const [s, t] = [e.from, e.to].sort();
        const S = L.nodes[s], T = L.nodes[t];
        let nx = -(T.cy - S.cy), ny = T.cx - S.cx; const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
        const ox = nx * off, oy = ny * off;
        const p1 = anchor(e.from, A, B.cx, B.cy, ox, oy);
        let p2 = anchor(e.to, B, A.cx, A.cy, ox, oy);
        if (INST[e.from].bar) { p1[0] = Math.max(A.x + 24, Math.min(A.x + A.w - 24, B.cx + ox)); }
        if (INST[e.from].bar) p2 = [p1[0], p2[1]];
        p2 = pullBack(p2, p1, 1.5);
        pts = [p1, p2];
      }
      const d = roundedPath(pts, 12);
      const g = el("g", { class: `edge k-${e.kind}${e.core ? "" : " extra"}`, "data-id": e.id, tabindex: -1 }, ge);
      el("path", { d, class: "ln", "marker-end": `url(#ar-${e.kind})` }, g);
      const hit = el("path", { d, class: "hit" }, g);
      const tt = el("title", {}, hit); tt.textContent = `${shortName(e.from)} ${e.verb} → ${shortName(e.to)}`;
      g.addEventListener("click", (ev) => { ev.stopPropagation(); location.hash = "#vztah-" + e.id; });
      if (!map.kinds.has(e.kind)) g.classList.add("hidden");
      g._pts = pts; g._edge = e;
    }

    // instituce
    const gn = el("g", { class: "nodes" }, svg);
    const order = ["parlament", ...Object.keys(L.nodes).filter((k) => k !== "parlament")];
    for (const id of order) {
      const b = L.nodes[id], inst = INST[id], tx = NODE_TEXT[id];
      const cls = inst.group ? "n-group" : "n-" + inst.power;
      const g = el("g", { class: `node ${cls}`, "data-id": id, tabindex: 0, role: "button", "aria-label": inst.name }, gn);
      el("rect", { x: b.x, y: b.y, width: b.w, height: b.h, rx: inst.group ? 14 : 10, class: "box" }, g);
      if (inst.group) {
        const t = el("text", { x: b.x + 14, y: b.y + 20, class: "nm" }, g); t.textContent = tx.lines[0];
      } else {
        const lines = tx.lines, hasSub = !!tx.sub;
        const lh = 21, total = lines.length * lh + (hasSub ? 19 : 0);
        let y = b.cy - total / 2 + 16;
        for (const ln of lines) { const t = el("text", { x: b.cx, y, "text-anchor": "middle", class: "nm" }, g); t.textContent = ln; y += lh; }
        if (hasSub) { const t = el("text", { x: b.cx, y: y + 1, "text-anchor": "middle", class: "sb" }, g); t.textContent = tx.sub; }
      }
      g.addEventListener("click", (ev) => { ev.stopPropagation(); location.hash = (map.sel && map.sel.type === "node" && map.sel.id === id) ? "#mapa" : "#mapa-" + id; });
      g.addEventListener("keydown", (ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); location.hash = "#mapa-" + id; } });
    }
    const glabels = el("g", { class: "labels" }, svg);
    svg.addEventListener("click", () => { if (map.sel) location.hash = "#mapa"; });
    svg._glabels = glabels;
    return svg;
  }

  function placeLabels(svg) {
    const gl = svg._glabels; if (!gl) return;
    gl.innerHTML = "";
    const focus = !!map.sel;
    $$(".edge", svg).forEach((g) => {
      if (g.classList.contains("hidden")) return;
      const e = g._edge, path = $("path.ln", g);
      const len = path.getTotalLength();
      if (focus && g.classList.contains("on")) {
        const frac = e.via ? 0.5 : 0.5;
        const p = path.getPointAtLength(len * frac);
        const w = e.verb.length * 7.2 + 16;
        const lg = el("g", { class: "lbl k-" + e.kind }, gl);
        el("rect", { x: p.x - w / 2, y: p.y - 11, width: w, height: 22, rx: 11 }, lg);
        const t = el("text", { x: p.x, y: p.y + 4.5, "text-anchor": "middle" }, lg); t.textContent = e.verb;
      } else if (!focus && map.mode === "core" && e.key) {
        const p = path.getPointAtLength(len * 0.5);
        const kg = el("g", { class: "key k-" + e.kind }, gl);
        el("circle", { cx: p.x, cy: p.y, r: 10 }, kg);
        const t = el("text", { x: p.x, y: p.y + 4, "text-anchor": "middle" }, kg); t.textContent = e.key;
      }
    });
  }

  function selectMap(sel) {
    if (sel && sel.type === "edge" && !EDGES.find((e) => e.id === sel.id)) sel = null;
    map.sel = sel;
    if (!$("#map-holder")) return;
    // vybraná věc musí být vidět
    if (sel && map.mode === "core") {
      const needFull = sel.type === "node" ? !INST[sel.id].core : !EDGES.find((e) => e.id === sel.id).core;
      if (needFull) { map.mode = "full"; drawMap(); return; }
    }
    if (sel && sel.type === "edge") {
      const e = EDGES.find((x) => x.id === sel.id);
      if (!map.kinds.has(e.kind)) { map.kinds.add(e.kind); drawMap(); return; }
    }
    applySel();
    renderAside();
  }

  function applySel() {
    const svg = $("svg.map");
    const sel = map.sel;
    if (svg) {
      svg.classList.toggle("focus", !!sel);
      let onEdges = new Set(), nearNodes = new Set();
      if (sel && sel.type === "node") {
        edgesOf(sel.id).forEach((e) => { onEdges.add(e.id); nearNodes.add(e.from); nearNodes.add(e.to); });
        members(sel.id).forEach((m) => nearNodes.add(m));
        if (sel.id === "parlament") { nearNodes.add("ps"); nearNodes.add("senat"); }
      } else if (sel && sel.type === "edge") {
        const e = EDGES.find((x) => x.id === sel.id);
        onEdges.add(e.id); nearNodes.add(e.from); nearNodes.add(e.to);
        if (e.from === "parlament" || e.to === "parlament") { nearNodes.add("ps"); nearNodes.add("senat"); }
      }
      $$(".edge", svg).forEach((g) => { const on = onEdges.has(g.dataset.id); g.classList.toggle("on", on); g.classList.toggle("off", !!sel && !on); });
      $$(".node", svg).forEach((g) => {
        const id = g.dataset.id;
        g.classList.toggle("sel", !!sel && sel.type === "node" && sel.id === id);
        g.classList.toggle("dim", !!sel && !nearNodes.has(id));
      });
      placeLabels(svg);
    }
    $$(".lv-card").forEach((c) => c.setAttribute("aria-current", String(!!sel && sel.type === "node" && sel.id === c.dataset.id)));
  }

  function renderAside() {
    const a = $("#aside"); if (!a) return;
    const sel = map.sel;
    a.classList.toggle("idle", !sel);
    a.classList.toggle("open", !!sel);
    const close = '<button type="button" class="close" id="aside-close">Zavřít</button>';
    if (!sel) { a.innerHTML = asideIdle(); return; }
    a.innerHTML = close + (sel.type === "node" ? asideNode(sel.id) : asideEdge(sel.id));
    a.scrollTop = 0;
    $("#aside-close").addEventListener("click", () => (location.hash = "#mapa"));
    $$(".rel", a).forEach((b) => b.addEventListener("click", () => (location.hash = "#vztah-" + b.dataset.edge)));
    $$(".chip", a).forEach((b) => b.addEventListener("click", () => (location.hash = "#mapa-" + b.dataset.id)));
  }

  function asideIdle() {
    const keys = [["A", "vznik", "volí"], ["B", "vznik", "jmenuje"], ["C", "spol", "navrhuje"], ["D", "brzda", "kontroluje (důvěra)"], ["E", "brzda", "rozpouští"], ["F", "brzda", "vrací zákon"], ["G", "spol", "souhlasí"], ["H", "brzda", "ruší zákony"]];
    return `<div class="how-read">
      <h2>Jak číst schéma</h2>
      <p>Barva rámečku říká, ke které moci instituce patří. Šipky ukazují tři druhy vztahů:</p>
      <ul class="rels">${Object.keys(KINDS).map((k) => `<li><div class="rel" style="cursor:default">${kindSample(k)}<span><b>${esc(KINDS[k].name)}</b><br><span style="color:var(--muted)">${esc(KINDS[k].hint)}</span></span></div></li>`).join("")}</ul>
      <p style="margin-top:12px">Brzdy končí kolmou čárkou: instituce na konci šipky může být zastavena.</p>
      ${map.mode === "core" ? `<h3>Klíč A–H z hodiny</h3><ul class="keylist">${keys.map((k) => `<li><span class="kl" style="border-color:var(--k-${k[1]});color:var(--k-${k[1]})">${k[0]}</span><span>${esc(k[2])}</span></li>`).join("")}</ul>` : ""}
      <p style="margin-top:14px">Klikni na instituci a uvidíš, kdo ji ustavuje, koho brzdí a kdo může zastavit ji.</p>
    </div>`;
  }

  function relItem(e) {
    return `<li><button type="button" class="rel" data-edge="${e.id}">${kindSample(e.kind)}<span><b>${esc(e.verb)}</b><br>${esc(shortName(e.from))} → ${esc(shortName(e.to))}</span></button></li>`;
  }

  function asideNode(id) {
    const i = INST[id], p = i.power;
    const pw = POWERS[p];
    const m = members(id);
    const es = edgesOf(id);
    const isIn = (e) => m.includes(e.to), isOut = (e) => m.includes(e.from);
    const groups = [
      ["Kdo ji ustavuje", es.filter((e) => e.kind === "vznik" && isIn(e))],
      ["Koho ustavuje", es.filter((e) => e.kind === "vznik" && isOut(e))],
      ["Kdo ji může zastavit", es.filter((e) => e.kind === "brzda" && isIn(e))],
      ["Koho brzdí", es.filter((e) => e.kind === "brzda" && isOut(e))],
      ["S kým spolupracuje", es.filter((e) => e.kind === "spol")]
    ].filter((g) => g[1].length);
    const facts = (i.facts || []).map((f) => `<dt>${esc(f[0])}</dt><dd>${md(f[1])}</dd>`).join("");
    return `
      <p class="pw c-${p === "people" ? "people" : p}">${esc(pw.name)}</p>
      <h2>${esc(i.name)}</h2>
      ${i.sub ? `<p class="ref" style="margin:-2px 0 10px">${esc(i.sub)}</p>` : ""}
      <p class="lead2">${md(i.lead)}</p>
      ${facts ? `<dl class="facts">${facts}</dl>` : ""}
      ${i.does ? `<h3>Co dělá</h3><ul>${i.does.map((d) => `<li>${md(d)}</li>`).join("")}</ul>` : ""}
      ${i.stop ? `<div class="stop"><h3>Kdo ji může zastavit a čím</h3><ul>${i.stop.map((d) => `<li>${md(d)}</li>`).join("")}</ul></div>` : ""}
      ${groups.map((g) => `<h3>${g[0]}</h3><ul class="rels">${g[1].map(relItem).join("")}</ul>`).join("")}
      ${i.now ? `<div class="now"><b>Ve funkci (stav k ${STAV})</b><br>${i.now.map(esc).join("<br>")}</div>` : ""}
      ${i.ustava ? `<p class="ref">Ústava ČR: ${esc(i.ustava)}</p>` : ""}`;
  }

  function asideEdge(id) {
    const e = EDGES.find((x) => x.id === id);
    const chip = (nid) => { const p = INST[nid].power; return `<button type="button" class="chip c-${p === "people" ? "people" : p}" data-id="${nid}">${esc(shortName(nid))}</button>`; };
    const linkName = { "volby/ps": "volby do Sněmovny", "volby/senat": "volby do Senátu", "volby/prezident": "volba prezidenta", "volby/obce": "obecní volby", "volby/kraje": "krajské volby", zakon: "cesta zákona" };
    return `
      <a class="btn-back" href="#mapa">Zpět na přehled</a>
      <p class="pw" style="color:var(--k-${e.kind})">${esc(KINDS[e.kind].name)}${e.key ? `, šipka ${e.key}` : ""}</p>
      <p class="verb">${esc(e.verb)}</p>
      <div class="edge-route">${chip(e.from)}<span aria-hidden="true">→</span>${chip(e.to)}</div>
      <p class="lead2">${md(e.text)}</p>
      ${e.link ? `<p>Víc: ${md("[[" + e.link + "|" + linkName[e.link] + "]]")}</p>` : ""}
      ${e.ref ? `<p class="ref">Ústava ČR: ${esc(e.ref)}</p>` : ""}`;
  }

  /* ================= VOLBY ================= */
  let volbaSel = "ps";

  function renderVolby() {
    main.innerHTML = `
    <div class="wrap">
      <div class="page-head"><div>
        <h1>Volby</h1>
        <p class="lead">Kam všude v Česku volíme, podle jakých pravidel a co z voleb vzejde. Vyber volby a uvidíš podrobnosti.</p>
      </div></div>
      <div class="ballots" role="tablist" aria-label="Druhy voleb">
        ${VOLBY.map((v) => `<a class="ballot b-${v.power}" role="tab" href="#volby-${v.id}" data-id="${v.id}"><b>${esc(v.name)}</b><span>${esc(v.big)} ${esc(v.bigLabel)}</span><span>${esc(v.system)} systém</span></a>`).join("")}
      </div>
      <div id="vdetail"></div>
    </div>

    <section class="section"><div class="wrap">
      <h2>Volební kalendář</h2>
      <p class="sub">Volby se konají v pevných termínech. Mimořádné volby do Sněmovny přijdou jen tehdy, když ji prezident rozpustí.</p>
      <ol class="timeline">${KALENDAR.map((y) => `<li class="ty${y.now ? " now" : ""}" style="list-style:none"><div class="yr">${y.y}${y.now ? " <small>letos</small>" : ""}</div><ul>${y.items.length ? y.items.map((it) => { const v = VOLBY.find((x) => x.id === it[0]); return `<li style="border-left-color:var(--${v.power})"><a href="#volby-${v.id}">${esc(it[1])}</a></li>`; }).join("") : '<li class="empty">bez řádných voleb</li>'}</ul></li>`).join("")}</ol>
    </div></section>

    <section class="section"><div class="wrap">
      <h2>Principy volebního práva</h2>
      <p class="sub">Podle čl. 18 Ústavy se volí na základě všeobecného, rovného a přímého volebního práva tajným hlasováním. Svobodu voleb zaručuje Ústava i Listina.</p>
      <ul class="principles">${PRINCIPY.map((p) => `<li><h3>${esc(p.t)}</h3><p>${esc(p.d)}</p><p class="x">${esc(p.x)}</p></li>`).join("")}</ul>
    </div></section>

    <section class="section"><div class="wrap">
      <h2>Poměrný, nebo většinový systém?</h2>
      <p class="sub">Obě rodiny volebních systémů mají své výhody. Česko používá obě: do Senátu a na prezidenta většinový, všude jinde poměrný.</p>
      <div class="compare">
        <div class="cmp"><h3>Poměrný systém</h3><p class="tag">Sněmovna, kraje, obce, Evropský parlament</p><dl>
          <dt>Jak funguje</dt><dd>Strany dostanou zhruba tolik procent křesel, kolik procent hlasů získaly. Obvody mají víc mandátů.</dd>
          <dt>Výhody</dt><dd>Sněmovna odráží názory voličů. Šanci mají i menší strany a málo hlasů propadne.</dd>
          <dt>Nevýhody</dt><dd>Často vzniká mnoho stran, vláda musí být koaliční a voliči předem nevědí, jaká vláda z jejich hlasu vzejde.</dd>
        </dl></div>
        <div class="cmp"><h3>Většinový systém</h3><p class="tag">Senát, prezident</p><dl>
          <dt>Jak funguje</dt><dd>V každém obvodu se volí jeden zástupce a vyhrává ten, kdo má nejvíc hlasů, v Česku nadpoloviční většinu, případně ve druhém kole.</dd>
          <dt>Výhody</dt><dd>Jasný vítěz a přímá vazba mezi voliči a jejich zástupcem v obvodu.</dd>
          <dt>Nevýhody</dt><dd>Hlasy pro poražené kandidáty propadnou a malé strany mají jen malou šanci.</dd>
        </dl></div>
      </div>
    </div></section>

    <section class="section" id="prepocet"><div class="wrap">
      <h2>Z hlasů na mandáty</h2>
      <p class="sub">Vyzkoušej si, jak se hlasy přepočítávají na křesla d'Hondtovou metodou. Stejně si po volebním víkendu přepočtete mandáty ve třídní simulaci (200 křesel, hranice 5 %).</p>
      <div class="calc" id="calc"></div>
    </div></section>`;
    initCalc();
  }

  function showVolba(id) {
    if (current !== "volby") return;
    if (id && VOLBY.find((v) => v.id === id)) volbaSel = id;
    const v = VOLBY.find((x) => x.id === volbaSel);
    $$(".ballot").forEach((b) => b.setAttribute("aria-current", String(b.dataset.id === volbaSel)));
    const facts = v.facts.map((f) => `<dt>${esc(f[0])}</dt><dd>${esc(f[1])}</dd>`).join("");
    $("#vdetail").innerHTML = `
      <div class="vdetail" role="tabpanel">
        <div>
          <p class="pw c-${v.power}" style="font-family:var(--sans);font-weight:700;font-size:13px;margin:0 0 6px">${v.inst ? esc(POWERS[INST[v.inst].power].name) : "Evropská unie"}</p>
          <h2>${esc(v.name)}</h2>
          <p class="lead" style="font-size:16.5px;margin-bottom:18px">${esc(v.lead)}</p>
          <dl class="facts">${facts}</dl>
        </div>
        <div>
          <h3>Jak to probíhá</h3>
          <ul>${v.how.map((h) => `<li>${md(h)}</li>`).join("")}</ul>
          <div class="result"><p>${md(v.result)}</p></div>
          ${v.inst ? `<p style="margin-top:16px">${md("[[" + v.inst + "|Ukázat ve schématu dělby moci]]")}</p>` : ""}
          ${v.system === "poměrný" ? `<p>${md("[[volby/" + v.id + "|Vyzkoušet přepočet hlasů]]").replace('href="#volby-' + v.id + '"', 'href="#volby-' + v.id + '" data-jump="1"')}</p>` : ""}
        </div>
      </div>`;
    const j = $("[data-jump]");
    if (j) j.addEventListener("click", (ev) => { ev.preventDefault(); presetCalc(v.id); $("#prepocet").scrollIntoView({ behavior: "smooth" }); });
  }

  /* --- kalkulačka mandátů --- */
  const PARTY_COLORS = ["#2F6DB5", "#3E9A5D", "#E07B39", "#8A5BC2", "#7A8696", "#D9B200", "#C2457A", "#2BA3A3"];
  const calc = {
    seats: 200, thr: 5, method: "dhondt",
    parties: [
      { n: "Modrá strana", v: 312 }, { n: "Zelené hnutí", v: 248 }, { n: "Oranžová aliance", v: 171 },
      { n: "Fialoví", v: 129 }, { n: "Šedá unie", v: 98 }, { n: "Žlutá strana", v: 42 }
    ],
    showQ: false
  };
  const PRESETS = {
    ps: { seats: 200, thr: 5, method: "dhondt" },
    kraje: { seats: 55, thr: 5, method: "kraje" },
    obce: { seats: 27, thr: 5, method: "dhondt" },
    ep: { seats: 21, thr: 5, method: "dhondt" }
  };
  function presetCalc(id) { const p = PRESETS[id]; if (!p) return; Object.assign(calc, p); initCalc(); }

  function allocate() {
    const total = calc.parties.reduce((s, p) => s + Math.max(0, +p.v || 0), 0);
    const res = calc.parties.map((p, i) => ({ i, n: p.n, v: Math.max(0, +p.v || 0), pct: total ? (Math.max(0, +p.v || 0) / total) * 100 : 0, seats: 0 }));
    res.forEach((r) => (r.ok = total > 0 && r.pct >= calc.thr && r.v > 0));
    const elig = res.filter((r) => r.ok);
    const S = Math.max(1, Math.min(1000, Math.floor(+calc.seats || 0)));
    const div = (k) => (calc.method === "kraje" && k === 0 ? 1.42 : k + 1);
    const q = [];
    elig.forEach((r) => { for (let k = 0; k < S; k++) q.push({ r, k, q: r.v / div(k) }); });
    q.sort((a, b) => b.q - a.q || b.r.v - a.r.v);
    const won = q.slice(0, S);
    won.forEach((x) => { x.r.seats++; x.won = true; });
    const tie = q.length > S && Math.abs(q[S - 1].q - q[S].q) < 1e-9;
    return { total, res, elig, S, q, won, tie, div };
  }

  function initCalc() {
    const box = $("#calc"); if (!box) return;
    box.innerHTML = `
      <div>
        <div class="settings">
          <label><span>Počet mandátů</span><input type="number" min="1" max="1000" id="c-seats" value="${calc.seats}"></label>
          <label><span>Hranice (%)</span><input type="number" min="0" max="50" step="0.5" id="c-thr" value="${calc.thr}"></label>
          <label><span>Metoda</span><select id="c-method">
            <option value="dhondt"${calc.method === "dhondt" ? " selected" : ""}>d'Hondt (1, 2, 3…)</option>
            <option value="kraje"${calc.method === "kraje" ? " selected" : ""}>krajská (1,42, 2, 3…)</option>
          </select></label>
        </div>
        <table><thead><tr><th style="width:18px"></th><th>Strana</th><th class="num">Hlasy</th><th class="num">%</th><th class="num">Mandáty</th><th style="width:28px"></th></tr></thead>
        <tbody id="c-rows">${calc.parties.map((p, i) => `<tr data-i="${i}"><td><span class="sw" style="background:${PARTY_COLORS[i % PARTY_COLORS.length]}"></span></td>
          <td><input type="text" value="${esc(p.n)}" data-f="n" aria-label="Název strany"></td>
          <td style="width:96px"><input type="number" min="0" value="${p.v}" data-f="v" aria-label="Hlasy"></td>
          <td class="num" data-o="pct"></td><td class="num" data-o="seats"></td>
          <td><button type="button" class="rm" data-rm="${i}" aria-label="Odebrat stranu">×</button></td></tr>`).join("")}</tbody></table>
        <button type="button" class="add" id="c-add">Přidat stranu</button>
      </div>
      <div id="c-out"></div>`;
    $("#c-seats").addEventListener("input", (e) => { calc.seats = e.target.value; updCalc(); });
    $("#c-thr").addEventListener("input", (e) => { calc.thr = +e.target.value || 0; updCalc(); });
    $("#c-method").addEventListener("change", (e) => { calc.method = e.target.value; updCalc(); });
    $$("#c-rows input").forEach((inp) => inp.addEventListener("input", () => {
      const i = +inp.closest("tr").dataset.i; calc.parties[i][inp.dataset.f] = inp.dataset.f === "v" ? inp.value : inp.value; updCalc();
    }));
    $$("#c-rows .rm").forEach((b) => b.addEventListener("click", () => { if (calc.parties.length > 1) { calc.parties.splice(+b.dataset.rm, 1); initCalc(); } }));
    $("#c-add").addEventListener("click", () => { if (calc.parties.length < 8) { calc.parties.push({ n: "Nová strana", v: 50 }); initCalc(); } });
    updCalc();
  }

  function updCalc() {
    const R = allocate();
    R.res.forEach((r) => {
      const tr = $(`#c-rows tr[data-i="${r.i}"]`); if (!tr) return;
      tr.classList.toggle("out", !r.ok);
      $('[data-o="pct"]', tr).textContent = r.pct.toLocaleString("cs-CZ", { maximumFractionDigits: 1, minimumFractionDigits: 1 });
      $('[data-o="seats"]', tr).textContent = r.ok ? r.seats : "0";
    });
    const out = $("#c-out");
    if (!R.elig.length) { out.innerHTML = '<p class="qnote">Žádná strana nepřekročila hranici, mandáty nejde rozdělit. Sniž hranici nebo uprav počty hlasů.</p>'; return; }
    const maj = Math.floor(R.S / 2) + 1;
    const big = R.res.filter((r) => r.seats > 0).sort((a, b) => b.seats - a.seats);
    const majParty = big.find((r) => r.seats >= maj);
    const shown = Math.min(10, R.S);
    const rowsQ = [];
    for (let k = 0; k < Math.min(8, R.S); k++) rowsQ.push(k);
    out.innerHTML = `
      ${hemicycle(R)}
      <p class="hemi-cap">Většina: <b>${maj}</b> z ${R.S} mandátů. ${majParty ? `${esc(majParty.n)} má většinu sama.` : "Žádná strana nemá většinu sama, vládu musí sestavit koalice."}</p>
      ${R.tie ? '<p class="qnote">Pozor: o posledním mandátu rozhoduje shodný podíl. Ve skutečnosti by se postupovalo podle zákona (například losem).</p>' : ""}
      <p class="qnote">Postup: hlasy každé strany nad hranicí se postupně dělí čísly ${calc.method === "kraje" ? "1,42, 2, 3, 4…" : "1, 2, 3, 4…"} Mandáty dostanou nejvyšší podíly. Prvních ${shown} mandátů připadlo na podíly zvýrazněné v tabulce.</p>
      <p style="margin:8px 0 0"><button type="button" class="steps-toggle" id="c-q">${calc.showQ ? "Skrýt tabulku podílů" : "Ukázat tabulku podílů"}</button></p>
      ${calc.showQ ? `<div class="qtable"><table><thead><tr><th>Dělitel</th>${R.elig.map((r) => `<th class="num">${esc(r.n)}</th>`).join("")}</tr></thead><tbody>
        ${rowsQ.map((k) => `<tr><td>${String(R.div(k)).replace(".", ",")}</td>${R.elig.map((r) => { const x = R.q.find((y) => y.r === r && y.k === k); const order = R.won.indexOf(x); return `<td class="num${order > -1 && order < shown ? " won" : ""}">${(r.v / R.div(k)).toLocaleString("cs-CZ", { maximumFractionDigits: 1 })}${order > -1 && order < shown ? ` <small>(${order + 1}.)</small>` : ""}</td>`; }).join("")}</tr>`).join("")}
      </tbody></table></div>` : ""}`;
    $("#c-q").addEventListener("click", () => { calc.showQ = !calc.showQ; updCalc(); });
  }

  function hemicycle(R) {
    const N = R.S;
    const rows = Math.max(2, Math.ceil(Math.sqrt(N / 3.2)));
    const r0 = rows <= 2 ? 0.55 : 0.38;
    const radii = []; for (let i = 0; i < rows; i++) radii.push(r0 + (1 - r0) * (rows === 1 ? 1 : i / (rows - 1)));
    const sumR = radii.reduce((a, b) => a + b, 0);
    let counts = radii.map((r) => Math.round((N * r) / sumR));
    let diff = N - counts.reduce((a, b) => a + b, 0);
    counts[rows - 1] += diff;
    const seats = [];
    radii.forEach((r, i) => {
      const c = counts[i];
      for (let j = 0; j < c; j++) {
        const th = c === 1 ? Math.PI / 2 : Math.PI * (1 - j / (c - 1));
        seats.push({ x: r * Math.cos(th), y: r * Math.sin(th), th, r });
      }
    });
    seats.sort((a, b) => b.th - a.th || a.r - b.r);
    const spacing = Math.min(...radii.map((r, i) => (Math.PI * r) / Math.max(1, counts[i] - 1)), (1 - r0) / Math.max(1, rows - 1));
    const dot = Math.min(0.06, spacing * 0.42);
    const order = R.res.filter((r) => r.seats > 0);
    let idx = 0, circles = "";
    order.forEach((p) => { for (let s = 0; s < p.seats; s++) { const st = seats[idx++]; if (!st) break; circles += `<circle cx="${st.x.toFixed(4)}" cy="${(-st.y).toFixed(4)}" r="${dot.toFixed(4)}" fill="${PARTY_COLORS[p.i % PARTY_COLORS.length]}"><title>${esc(p.n)}: ${p.seats}</title></circle>`; } });
    const legend = order.map((p) => `<span><i style="background:${PARTY_COLORS[p.i % PARTY_COLORS.length]}"></i>${esc(p.n)} <b>${p.seats}</b></span>`).join("");
    return `<svg class="hemi" viewBox="-1.08 -1.08 2.16 1.14" role="img" aria-label="Rozdělení mandátů"><g>${circles}</g>
      <text x="0" y="-0.03" text-anchor="middle" font-size="0.18" font-family="Merriweather, serif" font-weight="900" fill="currentColor">${N}</text></svg>
      <div class="hemi-legend">${legend}</div>`;
  }

  /* ================= CESTA ZÁKONA ================= */
  const z = { typ: "bezny", senat: "schvali", ps: "prehlasuje", prez: "podpis", veto: "prehlasuje" };

  function renderZakon() {
    main.innerHTML = `
    <div class="wrap">
      <div class="page-head"><div>
        <h1>Cesta zákona</h1>
        <p class="lead">Od návrhu po Sbírku zákonů. Vyber, o jaký zákon jde, a na rozcestích rozhodni, co udělá Senát, Sněmovna a prezident. Cesta se podle toho překreslí.</p>
      </div></div>
      <div class="typy" id="typy">${Object.keys(ZAKON.typy).map((k) => `<button type="button" class="typ" data-typ="${k}"><b>${esc(ZAKON.typy[k].name)}</b><span>${esc(ZAKON.typy[k].note)}</span></button>`).join("")}</div>
      <div class="zakon-grid">
        <ol class="path" id="path"></ol>
        <div class="zakon-side" id="zside"></div>
      </div>
    </div>
    <section class="section"><div class="wrap">
      <h2>Zvláštní případy</h2>
      <p class="sub">Některé zákony mají přísnější pravidla, aby je nešlo prosadit jen těsnou většinou.</p>
      <ul class="zvl">${ZAKON.zvlastni.map((x) => `<li><h3>${esc(x.t)}</h3><p>${esc(x.d)}</p></li>`).join("")}</ul>
    </div></section>`;
    $$("#typy .typ").forEach((b) => b.addEventListener("click", () => { z.typ = b.dataset.typ; drawPath(); }));
    drawPath();
  }

  function drawPath() {
    $$("#typy .typ").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.typ === z.typ)));
    const K = ZAKON.kroky, t = z.typ;
    const steps = [];
    const add = (key, body, extra) => steps.push(Object.assign({ key, t: K[key].t, inst: K[key].inst, body: [body], ref: K[key].ref }, extra || {}));
    const pick = (name, opts) => { if (!opts.find((o) => o[0] === z[name])) z[name] = opts[0][0]; return { name, opts }; };
    let fail = null, notes = [];

    add("navrh", t === "rozpocet" ? K.navrh.rozpocet : K.navrh.body);
    add("cteni1", K.cteni1.body);
    add("vybory", K.vybory.body);
    add("cteni2", K.cteni2.body);
    add("cteni3", K.cteni3.body);
    if (t === "ustavni") steps[steps.length - 1].body.push(K.cteni3.ustavni);

    if (t === "rozpocet") add("senatSkip", K.senatSkip.body);
    else {
      const opts = t === "bezny"
        ? [["schvali", "Schválí"], ["nic", "Nevyjádří se do 30 dní"], ["zamitne", "Zamítne"], ["vrati", "Vrátí s pozměňovacími návrhy"]]
        : [["schvali", "Schválí"], ["zamitne", "Zamítne"], ["vrati", "Vrátí s pozměňovacími návrhy"]];
      add("senat", K.senat.body, { choice: Object.assign(pick("senat", opts), { q: "Co udělá Senát?" }) });
      if (K.senat[t]) steps[steps.length - 1].body.push(K.senat[t]);
      if (z.senat === "nic") notes.push("Senát se zákonem nezabýval, takže platí, jako by ho schválil.");
      if (z.senat === "zamitne" || z.senat === "vrati") {
        if (t === "bezny") {
          const o = z.senat === "zamitne"
            ? [["prehlasuje", "Přehlasuje (aspoň 101)"], ["ne", "Nesežene 101 hlasů"]]
            : [["senatni", "Přijme verzi Senátu"], ["puvodni", "Schválí původní verzi (101)"], ["ne", "Neschválí ani jednu"]];
          add("psZnovu", K.psZnovu[z.senat], { choice: Object.assign(pick("ps", o), { q: "Co udělá Sněmovna?" }) });
          if (z.ps === "ne") fail = z.senat === "zamitne" ? "Senát zákon zamítl a Sněmovna nesehnala 101 hlasů, aby ho přehlasovala." : "Sněmovna nepřijala verzi Senátu a pro svou původní verzi nesehnala 101 hlasů.";
          else if (z.ps === "senatni") notes.push("Zákon platí ve znění, které navrhl Senát.");
          else if (z.senat === "zamitne") notes.push("Sněmovna přehlasovala Senát.");
          else notes.push("Sněmovna prosadila svou původní verzi 101 hlasy.");
        } else if (z.senat === "zamitne") {
          add("psZnovu", K.psZnovu.bezPrehlasovani);
          fail = t === "ustavni" ? "Senát ústavní zákon neschválil. Bez souhlasu 3/5 přítomných senátorů nemůže Ústava změnit." : "Senát volební zákon zamítl. Sněmovna ho přehlasovat nemůže, volební pravidla musí odsouhlasit obě komory.";
        } else {
          add("psZnovu", K.psZnovu.bezPrehlasovani + (t === "ustavni" ? " Sněmovna může verzi Senátu přijmout, znovu ale potřebuje 120 hlasů." : " Sněmovna může verzi Senátu přijmout."), { choice: Object.assign(pick("ps", [["senatni", "Přijme verzi Senátu"], ["ne", "Trvá na své verzi"]]), { q: "Co udělá Sněmovna?" }) });
          if (z.ps === "ne") fail = "Komory se neshodly na stejném textu. U tohoto typu zákona Sněmovna nemůže Senát přehlasovat, takže zákon nevznikne.";
          else notes.push("Zákon platí ve znění, které navrhl Senát.");
        }
      }
    }

    if (!fail) {
      if (t === "ustavni") add("prezident", K.prezident.body, {}), steps[steps.length - 1].body.push(K.prezident.ustavni);
      else {
        add("prezident", K.prezident.body, { choice: Object.assign(pick("prez", [["podpis", "Podepíše"], ["nic", "Neudělá nic"], ["veto", "Vrátí zákon (veto)"]]), { q: "Co udělá prezident?" }) });
        if (z.prez === "nic") notes.push("Prezident zákon nepodepsal ani nevrátil. Zákon platí i bez jeho podpisu.");
        if (z.prez === "veto") {
          add("psVeto", K.psVeto.body, { choice: Object.assign(pick("veto", [["prehlasuje", "Přehlasuje (aspoň 101)"], ["ne", "Nesežene 101 hlasů"]]), { q: "Co udělá Sněmovna?" }) });
          if (z.veto === "ne") fail = "Prezident zákon vetoval a Sněmovna nesehnala 101 hlasů, aby veto přehlasovala.";
          else notes.push("Sněmovna přehlasovala prezidentovo veto.");
        }
      }
    }
    if (!fail) add("vyhlaseni", K.vyhlaseni.body);

    const instCls = (id) => { const p = INST[id].power; return p === "leg" ? "k-leg" : p === "exec" ? "k-exec" : "k-jud"; };
    let html = steps.map((s) => `
      <li class="krok ${instCls(s.inst)}"><div class="krok-body">
        <p class="who c-${INST[s.inst].power}">${esc(K[s.key].who || shortName(s.inst))}</p>
        <h3>${esc(s.t)}</h3>
        ${s.body.map((b) => `<p>${md(b)}</p>`).join("")}
        ${s.choice ? `<div class="choice"><p class="q">${esc(s.choice.q)}</p><div class="opts">${s.choice.opts.map((o) => `<button type="button" class="opt" data-c="${s.choice.name}" data-v="${o[0]}" aria-pressed="${z[s.choice.name] === o[0]}">${esc(o[1])}</button>`).join("")}</div></div>` : ""}
        ${s.ref ? `<p class="ref">${esc(s.ref.startsWith("čl.") ? "Ústava ČR: " + s.ref : s.ref)}</p>` : ""}
      </div></li>`).join("");
    html += fail
      ? `<li class="krok outcome fail"><div class="krok-body"><h3>Zákon nevznikl</h3><p>${esc(fail)}</p></div></li>`
      : `<li class="krok outcome ok"><div class="krok-body"><h3>Zákon platí</h3>${notes.length ? notes.map((n) => `<p>${esc(n)}</p>`).join("") : "<p>Zákon prošel bez zádrhelů.</p>"}</div></li>
         <li class="krok after k-jud"><div class="krok-body"><p class="who c-jud">Ústavní soud</p><h3>${esc(K.us.t)}</h3><p>${md(K.us.body)}</p><p class="ref">Ústava ČR: ${esc(K.us.ref)}</p></div></li>`;
    $("#path").innerHTML = html;
    $$("#path .opt").forEach((b) => b.addEventListener("click", () => { z[b.dataset.c] = b.dataset.v; drawPath(); }));

    const need = {
      bezny: [["Sněmovna schvaluje", "většina přítomných"], ["Senát", "30 dní, může zamítnout"], ["Přehlasování Senátu", "101 poslanců"], ["Veto prezidenta", "ano"], ["Přehlasování veta", "101 poslanců"]],
      ustavni: [["Sněmovna schvaluje", "120 poslanců (3/5 všech)"], ["Senát schvaluje", "3/5 přítomných"], ["Přehlasování Senátu", "nejde"], ["Veto prezidenta", "není"]],
      volebni: [["Sněmovna schvaluje", "většina přítomných"], ["Senát", "musí souhlasit"], ["Přehlasování Senátu", "nejde"], ["Veto prezidenta", "ano"], ["Přehlasování veta", "101 poslanců"]],
      rozpocet: [["Navrhuje", "jen vláda"], ["Sněmovna schvaluje", "většina přítomných"], ["Senát", "neprojednává"], ["Veto prezidenta", "ano"], ["Přehlasování veta", "101 poslanců"]]
    }[t];
    $("#zside").innerHTML = `
      <div class="box"><h3>${esc(ZAKON.typy[t].name)}: kolik hlasů je potřeba</h3><div class="tally">${need.map((r) => `<span>${esc(r[0])}</span><b>${esc(r[1])}</b>`).join("")}</div></div>
      <div class="box"><h3>Proč zrovna 101?</h3><p>Sněmovna má 200 poslanců. Na běžné hlasování stačí většina přítomných, ale přehlasovat Senát nebo prezidenta lze jen nadpoloviční většinou všech poslanců, tedy 101 hlasy. Kdo chce zákon prosadit proti druhé komoře nebo hlavě státu, potřebuje pevnou většinu.</p></div>
      <div class="box"><h3>V simulaci</h3><p>Stejnou cestou projde vlajkový zákon vaší vlády: tři čtení ve Sněmovně, Senát s váženým hlasem, prezident a možná i Ústavní soud.</p></div>
      <div class="box"><h3>Skutečné zákony</h3><p>Každý návrh zákona dostane číslo sněmovního tisku. Jeho cestu krok za krokem najdeš na <a href="https://www.psp.cz/sqw/tisky.sqw" rel="noopener">psp.cz</a>.</p></div>`;
  }

  document.addEventListener("DOMContentLoaded", route);
})();
