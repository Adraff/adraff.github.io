if (app.documents.length === 0) {
    alert("No hay ningún documento abierto.");
    exit();
}

var doc = app.activeDocument;

if (doc.selection.length === 0) {
    alert("No hay objetos seleccionados.");
    exit();
}

// Guardar la selección en un array independiente
var items = [];
for (var i = 0; i < doc.selection.length; i++) {
    items.push(doc.selection[i]);
}

// ---------- Ventana ScriptUI ----------
var win = new Window("dialog", "Nueva capa");
win.orientation = "column";
win.alignChildren = ["fill", "top"];
win.spacing = 10;
win.margins = 15;

var input = win.add("edittext", undefined, "Nueva capa");
input.characters = 25;
input.active = true;

var btnGroup = win.add("group");
btnGroup.alignment = "right";

var okBtn = btnGroup.add("button", undefined, "OK", { name: "ok" });
var cancelBtn = btnGroup.add("button", undefined, "Cancelar", { name: "cancel" });

if (win.show() !== 1) {
    exit();
}

var layerName = input.text;

if (!layerName) {
    exit();
}

// ---------- Crear capa ----------
var newLayer = doc.layers.add();
newLayer.name = layerName;

// ---------- Mover objetos ----------
for (var j = items.length - 1; j >= 0; j--) {
    items[j].moveToBeginning(newLayer);
}
