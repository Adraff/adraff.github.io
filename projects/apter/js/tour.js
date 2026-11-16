/*
 * APTER · Visita guiada.
 * Muestra popups (definidos en data/evaluacion.js → tour) que resaltan elementos
 * de la pantalla. Cada grupo de pasos aparece una sola vez, cuando ocurre su "trigger".
 */
(function (A) {
  var steps = (A.data && A.data.tour) || [];
  var active = false;
  var seen = {};
  var queue = [];
  var current = null;
  var timer = null;
  var root = null;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function cleanup() {
    clearTimeout(timer);
    if (root) { root.remove(); root = null; }
    document.removeEventListener("keydown", onKey);
  }

  function onKey(e) {
    if (e.key === "Escape") stop();
  }

  function start() {
    active = true;
    seen = {};
    queue = [];
    current = null;
    cleanup();
  }

  function stop() {
    active = false;
    queue = [];
    current = null;
    cleanup();
  }

  /* Oculta lo visible sin marcar la visita como terminada (p. ej. al cambiar de pestaña). */
  function suspend() {
    queue = [];
    current = null;
    cleanup();
  }

  function trigger(name) {
    if (!active || seen[name]) return;
    seen[name] = true;
    var group = steps.filter(function (s) { return s.trigger === name; });
    group.forEach(function (s, i) {
      queue.push(Object.assign({}, s, { _i: i + 1, _n: group.length }));
    });
    if (!current) next();
  }

  function next() {
    current = queue.shift() || null;
    if (!current) { cleanup(); return; }
    clearTimeout(timer);
    /* Espera a que termine la animación de entrada de la pantalla. */
    timer = setTimeout(function () { render(current); }, 420);
  }

  function visible(el) {
    if (!el) return false;
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden";
  }

  function render(step) {
    if (!step) return;
    var host = document.getElementById("overlay-root");
    if (!root) {
      root = document.createElement("div");
      root.className = "tour";
      root.innerHTML = '<div class="tour-block"></div><div class="tour-hole"></div><div class="tour-pop" role="dialog" aria-modal="true" aria-labelledby="tour-title"></div>';
      host.appendChild(root);
      document.addEventListener("keydown", onKey);
      window.addEventListener("resize", reposition);
    }
    var last = !queue.length || queue[0]._i === 1;
    var counter = step._n > 1 ? '<span class="tour-count">' + step._i + " de " + step._n + "</span>" : "";
    var pop = root.querySelector(".tour-pop");
    pop.innerHTML =
      '<h3 class="tour-title" id="tour-title">' + esc(step.title) + "</h3>" +
      '<p class="tour-text">' + esc(step.text) + "</p>" +
      '<div class="tour-foot">' + counter +
      '<button type="button" class="tour-skip">Omitir visita</button>' +
      '<button type="button" class="btn btn-primary btn-sm tour-next">' + (last ? "Entendido" : "Siguiente") + "</button></div>";
    pop.querySelector(".tour-skip").addEventListener("click", stop);
    pop.querySelector(".tour-next").addEventListener("click", next);
    reposition();
    pop.classList.add("is-in");
    pop.querySelector(".tour-next").focus({ preventScroll: true });
  }

  function reposition() {
    if (!root || !current) return;
    var pop = root.querySelector(".tour-pop");
    var hole = root.querySelector(".tour-hole");
    var block = root.querySelector(".tour-block");
    var vw = window.innerWidth, vh = window.innerHeight, gap = 16, margin = 12;
    var target = current.target ? document.querySelector(current.target) : null;
    var pw = pop.offsetWidth, ph = pop.offsetHeight;

    if (!visible(target)) {
      block.classList.add("is-dim");
      hole.style.display = "none";
      pop.style.left = Math.round((vw - pw) / 2) + "px";
      pop.style.top = Math.round((vh - ph) / 2) + "px";
      return;
    }
    block.classList.remove("is-dim");
    var r = target.getBoundingClientRect();
    var pad = 8;
    hole.style.display = "block";
    hole.style.left = r.left - pad + "px";
    hole.style.top = r.top - pad + "px";
    hole.style.width = r.width + pad * 2 + "px";
    hole.style.height = r.height + pad * 2 + "px";

    var spots = {
      bottom: { left: r.left + r.width / 2 - pw / 2, top: r.bottom + pad + gap },
      top: { left: r.left + r.width / 2 - pw / 2, top: r.top - pad - gap - ph },
      right: { left: r.right + pad + gap, top: r.top + r.height / 2 - ph / 2 },
      left: { left: r.left - pad - gap - pw, top: r.top + r.height / 2 - ph / 2 }
    };
    var order = [current.place || "bottom", "bottom", "top", "right", "left"];
    var pick = null;
    for (var i = 0; i < order.length && !pick; i++) {
      var s = spots[order[i]];
      if (s.left >= margin && s.top >= margin && s.left + pw <= vw - margin && s.top + ph <= vh - margin) pick = s;
    }
    if (!pick) pick = { left: (vw - pw) / 2, top: Math.max(margin, vh - ph - margin) };
    pop.style.left = Math.round(Math.min(Math.max(margin, pick.left), vw - pw - margin)) + "px";
    pop.style.top = Math.round(Math.min(Math.max(margin, pick.top), vh - ph - margin)) + "px";
  }

  A.tour = {
    start: start, stop: stop, suspend: suspend, trigger: trigger,
    isActive: function () { return active; }
  };
})((window.APTER = window.APTER || {}));
