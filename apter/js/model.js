/*
 * APTER · Modelo del cuestionario.
 * Convierte la definición de data/evaluacion.js (pasos → secciones → preguntas)
 * en la lista lineal de "pantallas" que recorre el usuario, y calcula el
 * progreso y el modelo de la barra de navegación. No contiene contenido propio.
 */
(function (A) {
  var D = (A.data = window.APTER_DATA);
  var MAX_OPTIONS = 3;

  function letter(i) {
    return String.fromCharCode(65 + i);
  }

  /* Respuestas posibles de una pregunta (máximo 3). Admite "@conjunto" reutilizable. */
  function options(q) {
    var o = q.options;
    if (typeof o === "string" && o.charAt(0) === "@") o = (D.optionSets || {})[o.slice(1)] || [];
    o = o || [];
    if (o.length > MAX_OPTIONS && window.console) {
      console.warn('APTER: la pregunta "' + q.id + '" tiene más de ' + MAX_OPTIONS + " respuestas; se muestran solo las primeras.");
    }
    return o.slice(0, MAX_OPTIONS);
  }

  function isVisible(q, answers) {
    if (!q.showIf) return true;
    return q.showIf.in.indexOf(answers[q.showIf.question]) !== -1;
  }

  function create() {
    var now = Date.now();
    return {
      id: "ev-" + now.toString(36) + Math.random().toString(36).slice(2, 6),
      createdAt: now,
      updatedAt: now,
      fields: {},
      answers: {},
      pos: null,
      finished: false
    };
  }

  /* Lista lineal de pantallas según las respuestas actuales. */
  function screens(ev) {
    var out = [];
    D.steps.forEach(function (step, si) {
      if (step.type === "form") {
        out.push({ key: step.id, type: "form", step: step, si: si });
        return;
      }
      step.sections.forEach(function (sec, ci) {
        var n = 0;
        sec.questions.forEach(function (q) {
          if (!isVisible(q, ev.answers)) return;
          n++;
          out.push({
            key: step.id + "/" + sec.id + "/" + q.id,
            type: "question",
            step: step, si: si, sec: sec, ci: ci, q: q, n: n
          });
        });
      });
    });
    return out;
  }

  function maskDigits(mask) {
    return (mask.match(/#/g) || []).length;
  }

  function fieldValid(f, value) {
    var v = (value || "").trim();
    if (!f.required) return true;
    if (!v) return false;
    if (f.mask) return v.replace(/\D/g, "").length === maskDigits(f.mask);
    return true;
  }

  function allFields(step) {
    return step.groups.reduce(function (acc, g) { return acc.concat(g.fields); }, []);
  }

  function isComplete(sc, ev) {
    if (sc.type === "form") {
      return allFields(sc.step).every(function (f) { return fieldValid(f, ev.fields[f.id]); });
    }
    var a = ev.answers[sc.q.id];
    return options(sc.q).some(function (o) { return o.value === a; });
  }

  /* Índice de la primera pantalla sin completar, o -1 si todo está completo. */
  function firstIncomplete(ev, list) {
    list = list || screens(ev);
    for (var i = 0; i < list.length; i++) if (!isComplete(list[i], ev)) return i;
    return -1;
  }

  function isFinished(ev) {
    return !!ev.finished && firstIncomplete(ev) === -1;
  }

  function progress(ev) {
    var list = screens(ev);
    var done = list.filter(function (s) { return isComplete(s, ev); }).length;
    return { done: done, total: list.length };
  }

  function hasContent(ev) {
    return Object.keys(ev.answers).length > 0 ||
      Object.keys(ev.fields).some(function (k) { return (ev.fields[k] || "").trim() !== ""; });
  }

  /* Elimina respuestas de preguntas que dejaron de ser visibles (dependencias showIf). */
  function pruneHidden(ev) {
    var changed = true;
    while (changed) {
      changed = false;
      D.steps.forEach(function (step) {
        if (step.type !== "category") return;
        step.sections.forEach(function (sec) {
          sec.questions.forEach(function (q) {
            if (!isVisible(q, ev.answers) && ev.answers[q.id] !== undefined) {
              delete ev.answers[q.id];
              changed = true;
            }
          });
        });
      });
    }
  }

  /*
   * Modelo de la barra de navegación para una categoría.
   * cur: pantalla actual (o null). Devuelve secciones con letra, estado y puntos.
   */
  function navModel(ev, cur) {
    var list = screens(ev);
    var reach = function () { return true; }; /* se puede ir a cualquier pregunta */
    var step = cur && cur.type === "question" ? cur.step : D.steps.filter(function (s) { return s.type === "category"; })[0];
    if (!step) return null;

    var sections = [];
    step.sections.forEach(function (sec, ci) {
      var own = list.filter(function (s) { return s.type === "question" && s.step === step && s.sec === sec; });
      if (!own.length) return;
      var complete = own.every(function (s) { return isComplete(s, ev); });
      var isCur = !!(cur && cur.sec === sec);
      sections.push({
        id: sec.id,
        letter: letter(ci),
        title: sec.title,
        key: own[0].key,
        state: isCur ? "current" : complete ? "done" : "pending",
        reachable: reach(own[0].key),
        dots: own.map(function (s) {
          return {
            key: s.key,
            answered: isComplete(s, ev),
            current: !!(cur && s.key === cur.key),
            reachable: reach(s.key)
          };
        })
      });
    });
    return { step: step, sections: sections };
  }

  A.model = {
    letter: letter, options: options, isVisible: isVisible, create: create, screens: screens,
    allFields: allFields, fieldValid: fieldValid, isComplete: isComplete, firstIncomplete: firstIncomplete,
    isFinished: isFinished, progress: progress, hasContent: hasContent, pruneHidden: pruneHidden,
    navModel: navModel, maskDigits: maskDigits
  };
})((window.APTER = window.APTER || {}));
