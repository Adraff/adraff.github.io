/* APTER (Web2) · Aplicación: vistas, navegación, accesibilidad y eventos. El contenido viene de data/evaluacion.js */
(function (A) {
  var D = A.data, M = A.model, S = A.store;

  /* Debe coincidir con el breakpoint móvil de css/styles.css */
  var mobileMq = window.matchMedia("(max-width: 899px)");
  var navOrientation = function () { return mobileMq.matches ? "h" : "v"; };

  var viewEl = document.getElementById("view");
  var overlayRoot = document.getElementById("overlay-root");
  var srStatus = document.getElementById("sr-status");

  var state = { tab: "evaluacion", mode: "welcome", /* welcome | eval | finish */ ev: null, key: null, review: false };

  /* ───────── utilidades ───────── */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function paragraphs(text) {
    return String(text || "").split(/\n\n+/).map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("");
  }
  function fmtDate(ts) {
    var d = new Date(ts), p = function (n) { return String(n).padStart(2, "0"); };
    return p(d.getDate()) + "/" + p(d.getMonth() + 1) + "/" + d.getFullYear() + " " + p(d.getHours()) + ":" + p(d.getMinutes());
  }
  function announce(msg) {
    srStatus.textContent = "";
    setTimeout(function () { srStatus.textContent = msg; }, 60);
  }
  function svg(path, extra) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"' + (extra || "") + '><path d="' + path + '" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
  var ICON = {
    back: svg("M15 5 8 12l7 7"),
    fwd: svg("m9 5 7 7-7 7"),
    check: svg("m5 12.5 4.5 4.5L19 7.5"),
    trash: svg("M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"),
    help: svg("M9.5 9a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1 1-1.1 1.8M12 17h.01"),
    guided: svg("M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"),
    manual: svg("M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4"),
    tick: svg("m5 12.5 4.5 4.5L19 7.5")
  };

  /* ───────── preferencias de accesibilidad ───────── */
  var PREF_KEY = "apter2.a11y";
  var prefs = { text: "md", contrast: "normal", motion: "auto" };
  try { Object.assign(prefs, JSON.parse(localStorage.getItem(PREF_KEY)) || {}); } catch (e) { /* sin almacenamiento */ }
  function applyPrefs() {
    var r = document.documentElement;
    r.dataset.text = prefs.text;
    r.dataset.contrast = prefs.contrast;
    r.dataset.motion = prefs.motion;
    try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch (e) { /* sin almacenamiento */ }
  }
  applyPrefs();

  function openA11y() {
    var sizes = [["md", "Normal"], ["lg", "Grande"], ["xl", "Muy grande"]];
    openModal(
      "<h2 id=\"modal-title\">Opciones de accesibilidad</h2>" +
      '<fieldset class="pref-group"><legend>Tamaño del texto</legend><div class="pref-row">' +
      sizes.map(function (s) {
        return '<label class="pref-choice"><input type="radio" name="pref-text" value="' + s[0] + '"' + (prefs.text === s[0] ? " checked" : "") + "><span>" + s[1] + "</span></label>";
      }).join("") + "</div></fieldset>" +
      '<label class="pref-switch"><input type="checkbox" id="pref-contrast"' + (prefs.contrast === "high" ? " checked" : "") + '><span class="pref-box" aria-hidden="true">' + ICON.tick + '</span><span><strong>Alto contraste</strong><small>Colores más oscuros y bordes más marcados.</small></span></label>' +
      '<label class="pref-switch"><input type="checkbox" id="pref-motion"' + (prefs.motion === "reduce" ? " checked" : "") + '><span class="pref-box" aria-hidden="true">' + ICON.tick + '</span><span><strong>Reducir animaciones</strong><small>Quita transiciones y movimientos.</small></span></label>' +
      '<div class="modal-actions"><button type="button" class="btn btn-primary" data-close data-autofocus>Listo</button></div>',
      function (m) {
        m.querySelectorAll('input[name="pref-text"]').forEach(function (r) {
          r.addEventListener("change", function () { prefs.text = r.value; applyPrefs(); });
        });
        $("#pref-contrast", m).addEventListener("change", function (e) { prefs.contrast = e.target.checked ? "high" : "normal"; applyPrefs(); });
        $("#pref-motion", m).addEventListener("change", function (e) { prefs.motion = e.target.checked ? "reduce" : "auto"; applyPrefs(); });
        $("[data-close]", m).addEventListener("click", closeModal);
      }
    );
  }

  /* ───────── persistencia ───────── */
  function persist() {
    var ev = state.ev;
    if (!ev) return;
    if (M.hasContent(ev) || S.exists(ev.id)) {
      ev.updatedAt = Date.now();
      S.save(ev);
    }
  }

  /* ───────── modales (con foco atrapado y retorno de foco) ───────── */
  var modalReturn = null;
  function closeModal() {
    var m = $(".modal", overlayRoot);
    if (m) m.remove();
    document.removeEventListener("keydown", modalKey);
    if (modalReturn && document.contains(modalReturn)) modalReturn.focus({ preventScroll: true });
    modalReturn = null;
  }
  function modalKey(e) {
    if (e.key === "Escape") { closeModal(); return; }
    if (e.key !== "Tab") return;
    var m = $(".modal", overlayRoot);
    if (!m) return;
    var f = m.querySelectorAll("button, input, [href], [tabindex]:not([tabindex='-1'])");
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function openModal(html, onMount) {
    var opener = document.activeElement;
    closeModal();
    modalReturn = opener;
    var m = document.createElement("div");
    m.className = "modal";
    m.innerHTML = '<div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">' + html + "</div>";
    overlayRoot.appendChild(m);
    m.addEventListener("mousedown", function (e) { if (e.target === m) closeModal(); });
    document.addEventListener("keydown", modalKey);
    requestAnimationFrame(function () { m.classList.add("is-in"); });
    if (onMount) onMount(m);
    var first = m.querySelector("[data-autofocus]");
    if (first) first.focus();
  }

  function showHelp(help) {
    if (!help) return;
    var items = (help.items || []).map(function (it) {
      return "<dt>" + esc(it.term) + "</dt><dd>" + esc(it.text) + "</dd>";
    }).join("");
    openModal(
      '<span class="modal-mark" aria-hidden="true">?</span>' +
      '<h2 id="modal-title">' + esc(help.title || "Ayuda") + "</h2>" +
      '<div class="modal-body">' + paragraphs(help.text) + (items ? '<dl class="modal-defs">' + items + "</dl>" : "") + "</div>" +
      '<div class="modal-actions"><button type="button" class="btn btn-primary" data-close data-autofocus>Entendido</button></div>',
      function (m) { $("[data-close]", m).addEventListener("click", closeModal); }
    );
  }

  function confirmModal(title, text, okLabel, onOk) {
    openModal(
      '<h2 id="modal-title">' + esc(title) + "</h2>" +
      '<div class="modal-body"><p>' + esc(text) + "</p></div>" +
      '<div class="modal-actions"><button type="button" class="btn btn-secondary" data-close data-autofocus>Cancelar</button>' +
      '<button type="button" class="btn btn-danger" data-ok>' + esc(okLabel) + "</button></div>",
      function (m) {
        $("[data-close]", m).addEventListener("click", closeModal);
        $("[data-ok]", m).addEventListener("click", function () { closeModal(); onOk(); });
      }
    );
  }

  /* Ayuda por ruta: "step:<id>", "section:<stepId>/<secId>", "field:<id>" */
  function helpFor(path) {
    var kind = path.split(":")[0], id = path.slice(kind.length + 1), found = null;
    D.steps.forEach(function (step) {
      if (kind === "step" && step.id === id) found = step.help;
      if (step.type === "category") step.sections.forEach(function (sec) {
        if (kind === "section" && step.id + "/" + sec.id === id) found = sec.help;
      });
      if (step.type === "form") M.allFields(step).forEach(function (f) {
        if (kind === "field" && f.id === id) found = f.help;
      });
    });
    return found;
  }
  function bindHelp(root) {
    root.querySelectorAll("[data-help]").forEach(function (b) {
      b.addEventListener("click", function () { showHelp(helpFor(b.getAttribute("data-help"))); });
    });
  }
  function helpBtn(path, label, text) {
    return '<button type="button" class="help-btn" data-help="' + esc(path) + '"' + (text ? "" : ' aria-label="' + esc(label) + '"') + ">" +
      '<span class="help-ico" aria-hidden="true">?</span>' + (text ? "<span>" + esc(text) + "</span>" : "") + "</button>";
  }

  /* ───────── pestañas y render ───────── */
  function setTab(tab) {
    /* Una evaluación terminada nunca se vuelve a mostrar: se vuelve a la bienvenida. */
    if (state.mode === "finish") {
      A.tour.suspend();
      state.ev = null;
      state.mode = "welcome";
    }
    if (state.tab === "evaluacion" && tab !== "evaluacion") A.tour.suspend();
    state.tab = tab;
    render(true);
  }

  function paintTabs() {
    document.querySelectorAll(".tab").forEach(function (t) {
      var on = t.getAttribute("data-tab") === state.tab;
      t.classList.toggle("is-active", on);
      if (on) t.setAttribute("aria-current", "page"); else t.removeAttribute("aria-current");
    });
  }

  function render(moveFocus) {
    closeModal();
    paintTabs();
    viewEl.className = "view view-" + state.tab;
    viewEl.innerHTML = "";
    if (state.tab === "evaluacion") {
      if (state.mode === "eval" && state.ev) renderEval();
      else if (state.mode === "finish" && state.ev) renderFinish();
      else renderWelcome();
    } else if (state.tab === "control") renderControl();
    else renderPlain(state.tab);

    var h = viewEl.querySelector("h1");
    if (h) {
      announce(h.textContent);
      if (moveFocus) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
    }
  }

  /* ───────── bienvenida ───────── */
  function renderWelcome() {
    var w = D.app.welcome;
    viewEl.innerHTML =
      '<section class="welcome enter" aria-labelledby="welcome-title">' +
      '<div class="welcome-copy">' +
      (w.eyebrow ? '<p class="eyebrow">' + esc(w.eyebrow) + "</p>" : "") +
      '<h1 id="welcome-title">' + esc(w.title) + "</h1>" +
      "<p class=\"lead\">" + esc(w.text) + "</p>" +
      (w.points ? '<ul class="points">' + w.points.map(function (p) { return "<li>" + ICON.check + "<span>" + esc(p) + "</span></li>"; }).join("") + "</ul>" : "") +
      "</div>" +
      '<div class="welcome-card"><h2>' + esc(w.question) + "</h2>" +
      '<button type="button" class="choice choice-primary" id="start-guided"><span class="choice-ico">' + ICON.guided + '</span><span class="choice-text"><strong>' + esc(w.guided) + "</strong><small>" + esc(w.guidedDesc || "") + "</small></span>" + ICON.fwd + "</button>" +
      '<button type="button" class="choice" id="start-manual"><span class="choice-ico">' + ICON.manual + '</span><span class="choice-text"><strong>' + esc(w.manual) + "</strong><small>" + esc(w.manualDesc || "") + "</small></span>" + ICON.fwd + "</button>" +
      "</div></section>";
    $("#start-guided").addEventListener("click", function () { startEvaluation(true); });
    $("#start-manual").addEventListener("click", function () { startEvaluation(false); });
  }

  function startEvaluation(guided) {
    if (guided) A.tour.start(); else A.tour.stop();
    state.review = false;
    state.ev = M.create();
    state.key = M.screens(state.ev)[0].key;
    state.mode = "eval";
    state.tab = "evaluacion";
    render(true);
  }

  function openEvaluation(id, key) {
    var ev = S.get(id);
    if (!ev) return;
    A.tour.stop();
    state.review = false;
    state.ev = ev;
    var list = M.screens(ev);
    state.key = key || (M.isFinished(ev) ? list[0].key : ev.pos) || list[0].key;
    state.mode = "eval";
    state.tab = "evaluacion";
    render(true);
  }

  /* ───────── evaluación ───────── */
  var ui = {};

  function renderEval() {
    viewEl.innerHTML =
      '<section class="eval">' +
      '<div class="stage">' +
      '<div class="stage-head" id="stage-head"></div>' +
      '<div class="section-card" id="section-card" hidden></div>' +
      '<div class="card" id="card"></div>' +
      '<div class="actions"><button type="button" class="btn btn-secondary" id="btn-prev">' + ICON.back + "<span>Anterior</span></button>" +
      '<button type="button" class="btn btn-primary btn-next" id="btn-next"><span id="btn-next-label">Siguiente</span>' + ICON.fwd + "</button></div>" +
      "</div>" +
      '<aside class="nav-wrap" id="nav" aria-labelledby="nav-title"><h2 class="nav-title" id="nav-title">Tu progreso</h2><div id="nav-body"></div></aside>' +
      "</section>";
    ui = {
      root: $(".eval"), head: $("#stage-head"), section: $("#section-card"), card: $("#card"),
      prev: $("#btn-prev"), next: $("#btn-next"), nextLabel: $("#btn-next-label"), nav: $("#nav"), navBody: $("#nav-body")
    };
    ui.prev.addEventListener("click", goPrev);
    ui.next.addEventListener("click", goNext);
    A.nav.mount(ui.navBody, null, { orientation: navOrientation(), onGo: goTo });
    showScreen();
  }

  function currentScreens() {
    var list = M.screens(state.ev);
    var idx = list.findIndex(function (s) { return s.key === state.key; });
    if (idx < 0) idx = 0;
    return { list: list, idx: idx, sc: list[idx] };
  }

  function goTo(key) { state.key = key; showScreen(); }
  function goPrev() {
    var c = currentScreens();
    if (c.idx > 0) goTo(c.list[c.idx - 1].key);
  }

  function goNext() {
    var c = currentScreens(), ev = state.ev, last = c.list.length - 1;
    var others = [];
    c.list.forEach(function (sc, i) { if (i !== c.idx && !M.isComplete(sc, ev)) others.push(i); });
    var curDone = M.isComplete(c.sc, ev);

    if (state.review) {
      /* Revisión: salta entre las preguntas que faltan hasta completarlas todas. */
      if (!others.length) { if (curDone) finish(); else needAnswer(); return; }
      var t = others.filter(function (i) { return i > c.idx; })[0];
      goTo(c.list[t === undefined ? others[0] : t].key);
      return;
    }
    if (c.idx < last) { goTo(c.list[c.idx + 1].key); return; }
    /* Última pregunta: si falta algo, vuelve a la primera sin responder. */
    if (!others.length && curDone) finish();
    else if (others.length) {
      state.review = true;
      announce("Faltan preguntas por responder. Volvemos a la primera sin responder.");
      goTo(c.list[M.firstIncomplete(ev, c.list)].key);
    } else needAnswer();
  }

  function needAnswer() {
    announce("Responde esta pregunta para poder finalizar.");
    ui.next.classList.remove("shake");
    void ui.next.offsetWidth;
    ui.next.classList.add("shake");
  }

  function finish() {
    state.ev.finished = true;
    persist();
    state.mode = "finish";
    render(true);
    A.tour.trigger("fin");
  }

  function updateButtons() {
    var c = currentScreens();
    ui.prev.hidden = c.idx === 0;
    var ready = M.firstIncomplete(state.ev, c.list) === -1 && (state.review || c.idx === c.list.length - 1);
    ui.nextLabel.textContent = ready ? "Finalizar" : "Siguiente";
  }

  function updateNav() {
    var c = currentScreens();
    var showNav = c.sc.type === "question";
    ui.nav.hidden = !showNav;
    ui.root.classList.toggle("no-nav", !showNav);
    A.nav.update(ui.navBody, showNav ? M.navModel(state.ev, c.sc) : null);
  }

  function showScreen() {
    var c = currentScreens(), sc = c.sc;
    state.key = sc.key;
    state.ev.pos = sc.key;
    persist();

    var counter = '<p class="eyebrow">Paso ' + (c.idx + 1) + " de " + c.list.length + "</p>";
    ui.head.innerHTML = counter + '<h1 class="stage-title">' + esc(sc.step.title) + "</h1>" +
      (sc.step.help ? helpBtn("step:" + sc.step.id, "", sc.step.help.title || "Más información") : "");

    if (sc.type === "question") {
      var sec = sc.sec, path = "section:" + sc.step.id + "/" + sec.id;
      ui.section.hidden = false;
      ui.section.innerHTML =
        '<span class="sc-letter" aria-hidden="true">' + M.letter(sc.ci) + "</span>" +
        '<div class="sc-text"><h2><span class="sr-only">Sección ' + M.letter(sc.ci) + ": </span>" + esc(sec.title) + "</h2>" +
        (sec.help ? helpBtn(path, "", sec.help.title || "Más información") : "") + "</div>";
    } else {
      ui.section.hidden = true;
      ui.section.innerHTML = "";
    }

    ui.card.className = "card " + (sc.type === "form" ? "card-form" : "card-q");
    ui.card.id = sc.type === "form" ? "card" : "question-card";
    ui.card.innerHTML = sc.type === "form" ? formHTML(sc.step) : questionHTML(sc);
    ui.card.classList.remove("enter");
    void ui.card.offsetWidth;
    ui.card.classList.add("enter");

    bindHelp(ui.head); bindHelp(ui.section); bindHelp(ui.card);
    if (sc.type === "form") bindForm(sc.step); else bindQuestion(sc);
    updateButtons();
    updateNav();

    announce("Paso " + (c.idx + 1) + " de " + c.list.length + ". " + (sc.type === "question" ? sc.q.text : sc.step.title));

    if (sc.type === "form") {
      A.tour.trigger("datos");
    } else {
      A.tour.trigger("primera-pregunta");
      if (c.idx > 1) A.tour.trigger("segunda-pregunta");
      if (sc.ci > 0 && sc.n === 1) A.tour.trigger("nueva-seccion");
    }
  }

  /* Formulario de datos */
  function formHTML(step) {
    return '<form class="form" autocomplete="off" novalidate>' + step.groups.map(function (g) {
      var inner = '<div class="fgrid">' + g.fields.map(fieldHTML).join("") + "</div>";
      return g.title
        ? '<fieldset class="fgroup" data-group="' + esc(g.id) + '"><legend>' + esc(g.title) + "</legend>" + inner + "</fieldset>"
        : '<div class="fgroup" data-group="' + esc(g.id) + '">' + inner + "</div>";
    }).join("") + "</form>";
  }

  function fieldHTML(f) {
    var v = state.ev.fields[f.id] || "";
    return '<div class="field' + (f.wide ? " field-wide" : "") + '" data-field="' + esc(f.id) + '">' +
      '<div class="field-top"><label for="f-' + esc(f.id) + '">' + esc(f.label) + "</label>" +
      (f.help ? helpBtn("field:" + f.id, "Ayuda: " + f.label) : "") + "</div>" +
      '<input type="text" id="f-' + esc(f.id) + '" name="' + esc(f.id) + '" value="' + esc(v) + '" placeholder="' + esc(f.placeholder || "") + '"' +
      (f.mask ? ' inputmode="numeric" maxlength="' + f.mask.length + '"' : "") + "></div>";
  }

  function applyMask(value, mask) {
    var digits = value.replace(/\D/g, ""), out = "", di = 0;
    for (var i = 0; i < mask.length && di < digits.length; i++) {
      if (mask.charAt(i) === "#") out += digits.charAt(di++); else out += mask.charAt(i);
    }
    return out;
  }

  function bindForm(step) {
    var fields = M.allFields(step);
    $(".form", ui.card).addEventListener("submit", function (e) { e.preventDefault(); });
    fields.forEach(function (f, i) {
      var input = $("#f-" + f.id);
      input.addEventListener("input", function () {
        if (f.mask) {
          var masked = applyMask(input.value, f.mask);
          if (masked !== input.value) input.value = masked;
        }
        state.ev.fields[f.id] = input.value;
        state.ev.finished = state.ev.finished && M.firstIncomplete(state.ev) === -1;
        persist(); updateButtons(); updateNav();
      });
      input.addEventListener("keydown", function (e) {
        if (e.key !== "Enter") return;
        e.preventDefault();
        var nf = fields[i + 1];
        if (nf) $("#f-" + nf.id).focus(); else goNext();
      });
    });
  }

  /* Pregunta */
  function questionHTML(sc) {
    var answer = state.ev.answers[sc.q.id];
    return '<h2 class="q-title" id="q-title"><span class="q-num" aria-hidden="true">' + sc.n + '</span><span><span class="sr-only">Pregunta ' + sc.n + ": </span>" + esc(sc.q.text) + "</span></h2>" +
      '<div class="options" role="radiogroup" aria-labelledby="q-title">' +
      M.options(sc.q).map(function (o) {
        return '<label class="opt"><input type="radio" name="q" value="' + esc(o.value) + '"' + (o.value === answer ? " checked" : "") + ">" +
          '<span class="opt-radio" aria-hidden="true"></span><span class="opt-label">' + esc(o.label) + "</span></label>";
      }).join("") + "</div>";
  }

  function bindQuestion(sc) {
    ui.card.querySelectorAll('input[name="q"]').forEach(function (r) {
      r.addEventListener("change", function () {
        state.ev.answers[sc.q.id] = r.value;
        M.pruneHidden(state.ev);
        state.ev.finished = state.ev.finished && M.firstIncomplete(state.ev) === -1;
        persist(); updateButtons(); updateNav();
      });
    });
  }

  /* ───────── evaluación finalizada ───────── */
  function renderFinish() {
    viewEl.innerHTML =
      '<section class="finish enter"><div class="card card-done">' +
      '<div class="done-icon">' + ICON.check + "</div>" +
      "<h1>Evaluación finalizada</h1>" +
      "<p>" + esc(evName(state.ev)) + " quedó guardada. Podés revisarla o editarla cuando quieras desde Control de Evaluaciones.</p>" +
      '<div class="btn-row"><button type="button" class="btn btn-primary" id="go-control">Ir al Control de Evaluaciones</button>' +
      '<button type="button" class="btn btn-secondary" id="go-new">Nueva evaluación</button></div>' +
      "</div></section>";
    $("#go-control").addEventListener("click", function () { setTab("control"); });
    $("#go-new").addEventListener("click", newFromScratch);
  }

  function newFromScratch() {
    A.tour.suspend();
    state.ev = null;
    state.mode = "welcome";
    state.tab = "evaluacion";
    render(true);
  }

  /* ───────── control de evaluaciones ───────── */
  function evName(ev) {
    var t = (ev.fields.titular || "").trim();
    return t ? "La evaluación de " + t : "La evaluación sin titular";
  }
  function evTitle(ev) { return (ev.fields.titular || "").trim() || "Evaluación sin titular"; }
  function evMeta(ev) {
    var f = ev.fields, bits = [];
    if ((f.nc || "").trim()) bits.push("NC " + f.nc.trim());
    var addr = [f.calle, f.numero].map(function (x) { return (x || "").trim(); }).filter(Boolean).join(" ");
    if (addr) bits.push(addr);
    if ((f.departamento || "").trim()) bits.push(f.departamento.trim());
    return bits.length ? bits.join(" · ") : "Sin datos del terreno todavía";
  }

  function renderControl() {
    var list = S.list().sort(function (a, b) { return b.updatedAt - a.updatedAt; });
    var pending = list.filter(function (e) { return !M.isFinished(e); }).length;
    var sub = list.length
      ? list.length + (list.length === 1 ? " evaluación" : " evaluaciones") + " · " + pending + " sin terminar"
      : "Todavía no hay evaluaciones guardadas";

    var html = '<section class="control enter"><div class="stage">' +
      '<div class="stage-head stage-head-row"><div><h1 class="stage-title">Control de evaluaciones</h1>' +
      '<p class="stage-sub">' + esc(sub) + "</p></div>" +
      '<button type="button" class="btn btn-primary" id="ctl-new">Nueva evaluación</button></div>';

    if (!list.length) {
      html += '<div class="card card-empty"><h2>No hay evaluaciones todavía</h2>' +
        "<p>Cuando empieces una evaluación se guardará automáticamente y aparecerá acá para que puedas retomarla o editarla.</p></div>";
    } else {
      html += '<ul class="ev-list" tabindex="0" aria-label="Lista de evaluaciones">' + list.map(evCardHTML).join("") + "</ul>";
    }
    viewEl.innerHTML = html + "</div></section>";

    $("#ctl-new").addEventListener("click", newFromScratch);
    list.forEach(function (ev) {
      var card = viewEl.querySelector('.ev-card[data-id="' + ev.id + '"]');
      var navEl = card.querySelector(".ev-nav-bar");
      if (navEl) {
        var cur = M.screens(ev).find(function (s) { return s.key === ev.pos; });
        A.nav.mount(navEl, M.navModel(ev, cur || null), { orientation: "h", onGo: function (key) { openEvaluation(ev.id, key); } });
      }
      $('[data-act="open"]', card).addEventListener("click", function () { openEvaluation(ev.id); });
      $('[data-act="delete"]', card).addEventListener("click", function () {
        confirmModal("Eliminar evaluación", "¿Querés eliminar «" + evTitle(ev) + "»? Esta acción no se puede deshacer.", "Eliminar", function () {
          S.remove(ev.id);
          if (state.ev && state.ev.id === ev.id) { state.ev = null; state.mode = "welcome"; }
          renderControl();
          announce("Evaluación eliminada");
        });
      });
    });
  }

  function evCardHTML(ev) {
    var done = M.isFinished(ev), p = M.progress(ev), name = evTitle(ev);
    var navPart = done
      ? '<p class="ev-done-note">' + ICON.check + "<span>Todas las secciones respondidas</span></p>"
      : '<div class="ev-nav"><span class="ev-where">Recorrido</span><div class="ev-nav-bar"></div></div>';
    return '<li class="ev-card ' + (done ? "is-done" : "is-progress") + '" data-id="' + esc(ev.id) + '">' +
      '<div class="ev-top"><div class="ev-info"><h2 class="ev-name">' + esc(name) + "</h2>" +
      '<p class="ev-meta">' + esc(evMeta(ev)) + "</p>" +
      '<p class="ev-dates">Iniciada ' + fmtDate(ev.createdAt) + " · Última edición " + fmtDate(ev.updatedAt) + "</p></div>" +
      '<span class="badge ' + (done ? "badge-done" : "badge-progress") + '">' + (done ? ICON.check + "Completa" : "En curso · " + p.done + " de " + p.total) + "</span>" +
      '<div class="ev-actions"><button type="button" class="btn btn-primary btn-sm" data-act="open" aria-label="' + (done ? "Editar" : "Retomar") + " " + esc(name) + '">' + (done ? "Editar" : "Retomar") + "</button>" +
      '<button type="button" class="btn btn-ghost btn-sm" data-act="delete" aria-label="Eliminar ' + esc(name) + '">' + ICON.trash + "<span>Eliminar</span></button></div></div>" +
      navPart + "</li>";
  }

  /* ───────── información / manual ───────── */
  function renderPlain(tab) {
    var c = D.app[tab] || {};
    viewEl.innerHTML =
      '<section class="plain enter"><div class="stage"><div class="stage-head"><h1 class="stage-title">' + esc(c.title) + "</h1></div>" +
      '<div class="card card-plain">' + paragraphs(c.text) + "</div></div></section>";
  }

  /* ───────── arranque ───────── */
  function syncNavOrientation() {
    var el = document.getElementById("nav-body");
    if (!el) return;
    var h = navOrientation() === "h";
    el.classList.toggle("nav-h", h);
    el.classList.toggle("nav-v", !h);
  }
  if (mobileMq.addEventListener) mobileMq.addEventListener("change", syncNavOrientation);

  document.getElementById("tabs").addEventListener("click", function (e) {
    var t = e.target.closest(".tab");
    if (t) setTab(t.getAttribute("data-tab"));
  });
  document.getElementById("brand").addEventListener("click", function (e) { e.preventDefault(); setTab("evaluacion"); });
  document.getElementById("a11y-btn").addEventListener("click", openA11y);

  render(false);
})((window.APTER = window.APTER || {}));
