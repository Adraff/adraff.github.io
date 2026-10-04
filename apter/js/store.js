/* APTER · Persistencia local de evaluaciones (localStorage, con respaldo en memoria). */
(function (A) {
  var KEY = "apter2.evaluaciones.v1";
  var memory = null;

  function readAll() {
    if (memory) return memory;
    try {
      var raw = window.localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      memory = [];
      return memory;
    }
  }

  function writeAll(list) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(list));
    } catch (e) {
      memory = list;
    }
  }

  A.store = {
    list: function () {
      return readAll().slice();
    },
    get: function (id) {
      var found = readAll().find(function (e) { return e.id === id; });
      return found ? JSON.parse(JSON.stringify(found)) : null;
    },
    save: function (ev) {
      var list = readAll();
      var i = list.findIndex(function (e) { return e.id === ev.id; });
      var copy = JSON.parse(JSON.stringify(ev));
      if (i >= 0) list[i] = copy; else list.push(copy);
      writeAll(list);
    },
    remove: function (id) {
      writeAll(readAll().filter(function (e) { return e.id !== id; }));
    },
    exists: function (id) {
      return readAll().some(function (e) { return e.id === id; });
    }
  };
})((window.APTER = window.APTER || {}));
