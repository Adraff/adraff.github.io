/*
 * APTER · Barra de progreso por secciones/preguntas (Web2).
 * Vertical: stepper con títulos de sección y estado en texto.
 * Horizontal: versión compacta (móvil y Control de Evaluaciones).
 * El estado nunca depende solo del color: hay número, tilde y texto para lectores de pantalla.
 * Se actualiza en el lugar para que las secciones se expandan/colapsen con animación.
 */
(function (A) {
  var CHECK = '<svg class="nav-check" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function signature(model) {
    return model.sections.map(function (s) {
      return s.id + ":" + s.dots.map(function (d) { return d.key; }).join(",");
    }).join("|");
  }

  function build(el, model) {
    var html = '<ol class="nav-list">';
    model.sections.forEach(function (s) {
      html += '<li class="nav-sec" data-sec="' + esc(s.id) + '"><div class="nav-pill">' +
        '<button type="button" class="nav-node nav-letter" data-go="' + esc(s.key) + '">' +
        '<span class="nav-circle" aria-hidden="true">' + s.letter + "</span>" +
        '<span class="nav-text"><span class="nav-label">' + esc(s.title) + '</span><span class="nav-meta"></span></span></button>' +
        '<div class="nav-dots"><ul>';
      s.dots.forEach(function (d, i) {
        html += '<li><button type="button" class="nav-node nav-dot" data-go="' + esc(d.key) + '">' +
          '<span class="nav-circle" aria-hidden="true"><span class="nav-num">' + (i + 1) + "</span>" + CHECK + "</span>" +
          '<span class="nav-text"><span class="nav-label">Pregunta ' + (i + 1) + "</span></span></button></li>";
      });
      html += "</ul></div></div></li>";
    });
    el.innerHTML = html + "</ol>";
  }

  function paint(el, model) {
    var nodes = []; /* nodos visibles, en orden, para pintar los tramos que los unen */
    model.sections.forEach(function (s) {
      var li = el.querySelector('.nav-sec[data-sec="' + s.id + '"]');
      if (!li) return;
      li.classList.remove("is-current", "is-done", "is-pending");
      li.classList.add("is-" + s.state);

      var answered = s.dots.filter(function (d) { return d.answered; }).length;
      var meta = answered + " de " + s.dots.length + (s.dots.length === 1 ? " respondida" : " respondidas");
      var letter = li.querySelector(".nav-letter");
      letter.querySelector(".nav-meta").textContent = meta;
      var status = s.state === "done" ? "completa" : s.state === "current" ? "sección actual" : "pendiente";
      letter.setAttribute("aria-label", "Sección " + s.letter + ": " + s.title + ", " + status + ", " + meta);
      if (s.state === "current") letter.setAttribute("aria-current", "step"); else letter.removeAttribute("aria-current");
      letter.disabled = !s.reachable;
      nodes.push({ btn: letter, filled: s.state !== "pending" });

      var open = s.state === "current";
      li.querySelector(".nav-dots").setAttribute("aria-hidden", open ? "false" : "true");
      s.dots.forEach(function (d, i) {
        var b = li.querySelectorAll(".nav-dot")[i];
        b.classList.toggle("is-answered", d.answered);
        b.classList.toggle("is-current", d.current);
        b.disabled = !d.reachable || !open;
        b.tabIndex = open ? 0 : -1;
        b.setAttribute("aria-label", "Pregunta " + (i + 1) + " de la sección " + s.letter + ", " + (d.answered ? "respondida" : "sin responder"));
        if (d.current) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
        if (open) nodes.push({ btn: b, filled: d.answered });
      });
    });
    nodes.forEach(function (n, i) {
      var last = i === nodes.length - 1;
      n.btn.classList.toggle("is-last", last);
      n.btn.classList.toggle("link-on", !last && n.filled && nodes[i + 1].filled);
    });
  }

  /* orientation: "v" | "h". onGo(key) se llama al activar una sección o pregunta habilitada. */
  function mount(el, model, opts) {
    opts = opts || {};
    el.classList.add("nav", opts.orientation === "h" ? "nav-h" : "nav-v");
    if (!el._navBound) {
      el.addEventListener("click", function (e) {
        var b = e.target.closest("[data-go]");
        if (b && !b.disabled && el._onGo) el._onGo(b.getAttribute("data-go"));
      });
      el._navBound = true;
    }
    el._onGo = opts.onGo;
    update(el, model);
  }

  function update(el, model) {
    if (!model) { el.innerHTML = ""; el._sig = ""; return; }
    var sig = signature(model);
    if (el._sig !== sig) {
      build(el, model);
      el._sig = sig;
      void el.offsetWidth; /* estado inicial antes de pintar, para animar */
    }
    paint(el, model);
  }

  A.nav = { mount: mount, update: update };
})((window.APTER = window.APTER || {}));
