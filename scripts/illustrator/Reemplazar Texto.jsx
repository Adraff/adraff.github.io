#target illustrator
// Reemplazar_Textos_Sin_Avisos.jsx
// Versión segura sin ventanas emergentes de aviso.
// Solo muestra la ventana para ingresar el texto nuevo.

function main() {
    if (!documents.length) return;

    var doc = app.activeDocument;
    var sel = doc.selection;
    if (!sel || sel.length === 0) return;

    // Recolectar solo TextFrames (incluye dentro de grupos)
    var textFrames = [];
    for (var i = 0; i < sel.length; i++) {
        collectTextFrames(sel[i], textFrames);
    }
    if (textFrames.length === 0) return;

    // --- Ventana para ingresar el texto ---
    var win = new Window("dialog", "Reemplazar texto");
    win.orientation = "column";
    win.alignChildren = "fill";

    win.add("statictext", undefined, "Nuevo texto para los textos seleccionados:");
    var input = win.add("edittext", undefined, "", { multiline: true });
    input.minimumSize.height = 60;

    var g = win.add("group");
    g.alignment = "center";
    g.add("button", undefined, "Reemplazar", { name: "ok" });
    g.add("button", undefined, "Cancelar", { name: "cancel" });

    if (win.show() !== 1) return;

    var newText = input.text;
    if (newText === "") return;

    // Reemplazo seguro
    for (var j = 0; j < textFrames.length; j++) {
        var tf = textFrames[j];
        try {
            if (!isValidTextFrame(tf)) continue;

            // Copiar atributos del primer carácter
            var ca = tf.textRange.characterAttributes;
            var attr = {
                size: ca.size,
                textFont: ca.textFont,
                tracking: ca.tracking,
                leading: ca.leading,
                capitalization: ca.capitalization,
                kern: ca.kern,
                baselineShift: ca.baselineShift,
                horizontalScale: ca.horizontalScale,
                verticalScale: ca.verticalScale,
                fillColor: cloneColor(ca.fillColor)
            };

            tf.contents = newText;

            var r = tf.textRange;
            r.characterAttributes.size = attr.size;
            try { r.characterAttributes.textFont = attr.textFont; } catch(e){}
            try { r.characterAttributes.fillColor = attr.fillColor; } catch(e){}

            try { r.characterAttributes.tracking = attr.tracking; } catch(e){}
            try { r.characterAttributes.leading = attr.leading; } catch(e){}
            try { r.characterAttributes.capitalization = attr.capitalization; } catch(e){}
            try { r.characterAttributes.kern = attr.kern; } catch(e){}
            try { r.characterAttributes.baselineShift = attr.baselineShift; } catch(e){}
            try { r.characterAttributes.horizontalScale = attr.horizontalScale; } catch(e){}
            try { r.characterAttributes.verticalScale = attr.verticalScale; } catch(e){}
        } catch (err) {
            // Ignorar fallos individuales para mayor robustez
        }
    }
}

// --- Helpers ---

function collectTextFrames(item, arr) {
    try {
        if (item.typename === "TextFrame") {
            arr.push(item);
            return;
        }
        if (item.typename === "GroupItem" || item.typename === "Layer") {
            for (var i = 0; i < item.pageItems.length; i++) {
                collectTextFrames(item.pageItems[i], arr);
            }
        }
        if (item.typename === "SymbolItem" && item.definition && item.definition.pageItems) {
            for (var s = 0; s < item.definition.pageItems.length; s++) {
                collectTextFrames(item.definition.pageItems[s], arr);
            }
        }
    } catch (e) {}
}

function isValidTextFrame(tf) {
    return tf && tf.typename === "TextFrame";
}

function cloneColor(c) {
    if (!c) return null;
    try {
        if (c.typename === "RGBColor") {
            var r = new RGBColor();
            r.red = c.red; r.green = c.green; r.blue = c.blue;
            return r;
        }
        if (c.typename === "CMYKColor") {
            var m = new CMYKColor();
            m.cyan = c.cyan; m.magenta = c.magenta; m.yellow = c.yellow; m.black = c.black;
            return m;
        }
        if (c.typename === "GrayColor") {
            var g = new GrayColor();
            g.gray = c.gray;
            return g;
        }
    } catch (e) {}
    return c;
}

try { main(); } catch(e){}
