#target illustrator

// Control de notificaciones: poner a true para reactivar alertas emergentes
var SHOW_ALERTS = false;

function notify(msg) {
    if (SHOW_ALERTS) {
        alert(msg);
    } else {
        try { $.writeln(msg); } catch (e) { /* entorno sin consola */ }
    }
}

function main() {
    var doc = app.activeDocument;
    var sel = doc.selection;

    if (!sel || sel.length === 0) {
        notify("Selecciona al menos un texto.");
        return;
    }

    // --- UI WINDOW ---
    var win = new Window("dialog", "Seleccionar textos");
    win.orientation = "column";
    win.alignChildren = "fill";

    win.add("statictext", undefined, "Seleccionar textos que coincidan en:");

    var checkSize = win.add("checkbox", undefined, "Tamaño (pt)");
    var checkWeight = win.add("checkbox", undefined, "Peso (Bold/Regular)");
    var checkFont = win.add("checkbox", undefined, "Tipografía");
    var checkColor = win.add("checkbox", undefined, "Color");
    var checkContent = win.add("checkbox", undefined, "Contenido (mismo texto)");

    var btnGroup = win.add("group");
    btnGroup.alignment = "center";
    var btnOK = btnGroup.add("button", undefined, "Seleccionar");
    var btnCancel = btnGroup.add("button", undefined, "Cancelar");

    btnOK.onClick = function () {
        win.close(1);
    };
    btnCancel.onClick = function () {
        win.close(0);
    };

    if (win.show() !== 1) return;

    // --- Primera selección como referencia ---
    var key = getTextItem(sel[0]);
    if (!key) {
        notify("El primer elemento seleccionado no es un texto.");
        return;
    }

    // Propiedades del texto clave
    var keySize = key.textRange.characterAttributes.size;
    var keyFont = key.textRange.characterAttributes.textFont;
    var keyWeight = key.textRange.characterAttributes.textFont.style;
    var keyContents = key.contents;
    var keyColor = getColorString(key.textRange.characterAttributes.fillColor);

    // --- Resultados ---
    var result = [];

    for (var i = 0; i < doc.textFrames.length; i++) {
        var t = doc.textFrames[i];

        var sizeMatch = !checkSize.value || t.textRange.characterAttributes.size === keySize;
        var fontMatch = !checkFont.value || t.textRange.characterAttributes.textFont.name === keyFont.name;
        var weightMatch = !checkWeight.value || t.textRange.characterAttributes.textFont.style === keyWeight;
        var contentMatch = !checkContent.value || t.contents === keyContents;
        var colorMatch = !checkColor.value || (getColorString(t.textRange.characterAttributes.fillColor) === keyColor);

        if (sizeMatch && fontMatch && weightMatch && contentMatch && colorMatch) {
            result.push(t);
        }
    }

    if (result.length > 0) {
        doc.selection = result;
        notify("Se seleccionaron " + result.length + " textos.");
    } else {
        notify("No se encontraron textos que coincidan con los criterios elegidos.");
    }
}

// --- Helpers ---

function getTextItem(item) {
    if (item.typename === "TextFrame") return item;
    return null;
}

function getColorString(color) {
    if (color.typename === "RGBColor") {
        return "RGB(" + color.red + "," + color.green + "," + color.blue + ")";
    }
    if (color.typename === "CMYKColor") {
        return "CMYK(" + color.cyan + "," + color.magenta + "," + color.yellow + "," + color.black + ")";
    }
    if (color.typename === "GrayColor") {
        return "GRAY(" + color.gray + ")";
    }
    return "UNKNOWN";
}

main();
