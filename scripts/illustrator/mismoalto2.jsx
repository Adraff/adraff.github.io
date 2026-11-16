#target illustrator

(function () {
    if (app.documents.length === 0) return;

    var doc = app.activeDocument;
    var sel = doc.selection;

    if (!sel || sel.length < 2) return;

    // El último seleccionado es el elemento base
    var baseItem = sel[sel.length - 1];
    var baseBounds = baseItem.geometricBounds;

    // Altura del elemento base
    var baseHeight = Math.abs(baseBounds[3] - baseBounds[1]);

    for (var i = 0; i < sel.length - 1; i++) {
        var item = sel[i];
        var bounds = item.geometricBounds;

        var itemHeight = Math.abs(bounds[3] - bounds[1]);
        if (itemHeight === 0) continue;

        // Factor de escala en porcentaje
        var scaleFactor = (baseHeight / itemHeight) * 100;

        // Guardar posición original
        var centerX = (bounds[0] + bounds[2]) / 2;
        var centerY = (bounds[1] + bounds[3]) / 2;

        // Escalar proporcionalmente desde el centro
        item.resize(
            scaleFactor,
            scaleFactor,
            true,  // changePositions
            true,  // changeFillPatterns
            true,  // changeFillGradients
            true,  // changeStrokePattern
            scaleFactor
        );

        // Reposicionar para mantener el centro original
        var newBounds = item.geometricBounds;
        var newCenterX = (newBounds[0] + newBounds[2]) / 2;
        var newCenterY = (newBounds[1] + newBounds[3]) / 2;

        item.translate(centerX - newCenterX, centerY - newCenterY);
    }
})();
