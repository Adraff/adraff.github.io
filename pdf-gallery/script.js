const { jsPDF } = window.jspdf;

let sections = []; // Array de secciones, cada una con { id, name, coverImage, images: [] }
let sectionIdCounter = 0;
let backgroundImage = null;
let globalCoverImage = null; // Portada global para todas las secciones
let orientation = "portrait"; // 'portrait' o 'landscape'

// Elementos del DOM
const sectionsContainer = document.getElementById("sectionsContainer");
const addSectionBtn = document.getElementById("addSection");
const generateBtn = document.getElementById("generatePDF");
const portraitCheck = document.getElementById("portraitCheck");
const landscapeCheck = document.getElementById("landscapeCheck");
const backgroundInput = document.getElementById("backgroundImage");
const backgroundPreview = document.getElementById("backgroundPreview");
const backgroundImg = document.getElementById("backgroundImg");
const removeBackgroundBtn = document.getElementById("removeBackground");
const imagesPerRowInput = document.getElementById("imagesPerRow");
const imagesPerRowValue = document.getElementById("imagesPerRowValue");
const pageSizeSelect = document.getElementById("pageSize");
const customSizeOptions = document.getElementById("customSizeOptions");
const orientationControl = document.getElementById("orientationControl");
const customUnit = document.getElementById("customUnit");
const customWidth = document.getElementById("customWidth");
const customHeight = document.getElementById("customHeight");

// Drag and Drop - Ahora se maneja por sección
// (El código de drag and drop se movió a las funciones de sección)

// Imagen de fondo
backgroundInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      backgroundImage = event.target.result;
      backgroundImg.src = backgroundImage;
      backgroundPreview.style.display = "block";
    };
    reader.readAsDataURL(file);
  }
});

// Eliminar imagen de fondo
removeBackgroundBtn.addEventListener("click", () => {
  backgroundImage = null;
  backgroundInput.value = "";
  backgroundPreview.style.display = "none";
  backgroundImg.src = "";
});

// Toggle orientación con checkboxes
portraitCheck.addEventListener("change", () => {
  if (portraitCheck.checked) {
    landscapeCheck.checked = false;
    orientation = "portrait";
  } else {
    landscapeCheck.checked = true;
    orientation = "landscape";
  }
});

landscapeCheck.addEventListener("change", () => {
  if (landscapeCheck.checked) {
    portraitCheck.checked = false;
    orientation = "landscape";
  } else {
    portraitCheck.checked = true;
    orientation = "portrait";
  }
});

// Validar número de imágenes por fila (slider)
imagesPerRowInput.addEventListener("input", () => {
  imagesPerRowValue.textContent = imagesPerRowInput.value;
});

// Agregar nueva sección
addSectionBtn.addEventListener("click", () => {
  const sectionId = sectionIdCounter++;
  const section = {
    id: sectionId,
    name: `Sección ${sections.length + 1}`,
    coverImage: null,
    coverDescription: "",
    images: [],
    collapsed: false,
    // Configuración de la portada
    titleColor: "#FFFFFF",
    descColor: "#000000",
    marginTop: 30, // Porcentaje
    marginLeft: 3, // Porcentaje
    gapTitleDesc: 2.5, // Multiplicador del tamaño de fuente del título
  };

  // Colapsar todas las secciones anteriores
  sections.forEach((s) => (s.collapsed = true));

  sections.push(section);
  renderSections();
  updateGenerateButton();
});

// Renderizar todas las secciones
function renderSections() {
  sectionsContainer.innerHTML = "";

  sections.forEach((section, index) => {
    const sectionCard = document.createElement("div");
    sectionCard.className = "section-card";
    sectionCard.dataset.sectionId = section.id;

    const collapsedClass = section.collapsed ? "collapsed" : "";
    const contentDisplay = section.collapsed ? 'style="display: none;"' : "";

    sectionCard.innerHTML = `
      <div class="section-header ${collapsedClass}" data-section-id="${section.id}">
        <div class="section-header-content">
          <span class="section-toggle" data-section-id="${section.id}">
            ${section.collapsed ? "▶" : "▼"}
          </span>
          <input type="text" class="section-title-input" value="${section.name}" 
                 data-section-id="${section.id}" placeholder="Nombre de la sección"
                 ${section.collapsed ? "readonly" : ""}>
        </div>
        <div class="section-actions" ${contentDisplay}>
          <button class="delete-section-btn" data-section-id="${section.id}">🗑️ Eliminar</button>
        </div>
      </div>
      
      <div class="section-content" ${contentDisplay}>
        <div class="section-cover-area">
          ${
            globalCoverImage && index !== 0
              ? `
          <div class="global-cover-indicator">
            <span class="material-symbols-outlined">check_circle</span>
            <span>Configuración global de portada activada</span>
          </div>
          `
              : ""
          }
          
          <label class="section-cover-label">📄 Configuración de portada:</label>
          
          ${
            index === 0
              ? `
          <div class="global-cover-option" style="margin-bottom: 15px;">
            <label class="checkbox-label">
              <input type="checkbox" id="useAsGlobalCover" class="use-as-global-cover">
              🌐 Usar esta configuración en todas las portadas
            </label>
          </div>
          `
              : ""
          }
          
          <!-- Previsualizador de portada -->
          <div class="cover-preview-container" id="coverPreviewContainer-${section.id}">
            <canvas id="coverCanvas-${section.id}" class="cover-canvas"></canvas>
            <button class="remove-cover-img-btn" id="removeCoverImg-${section.id}" 
                    data-section-id="${section.id}" 
                    style="display: ${section.coverImage ? "block" : "none"};">
              Eliminar imagen de portada
            </button>
          </div>
          
          <!-- Selector de imagen de portada -->
          <div class="cover-image-selector">
            <input type="file" class="cover-file-input" id="coverInput-${section.id}" 
                   accept="image/*" data-section-id="${section.id}">
            <label for="coverInput-${section.id}" class="section-file-label">
              ${section.coverImage ? "Cambiar imagen de portada" : "Seleccionar imagen de portada"}
            </label>
          </div>
          
          <!-- Configuración de colores -->
          <div class="cover-config-grid">
            <div class="config-item">
              <label>Color del título:</label>
              <div class="color-picker-group">
                <input type="color" class="title-color-input" id="titleColor-${section.id}" 
                       value="${section.titleColor}" data-section-id="${section.id}">
                <span class="color-value">${section.titleColor}</span>
              </div>
            </div>
            
            <div class="config-item">
              <label>Color de descripción:</label>
              <div class="color-picker-group">
                <input type="color" class="desc-color-input" id="descColor-${section.id}" 
                       value="${section.descColor}" data-section-id="${section.id}">
                <span class="color-value">${section.descColor}</span>
              </div>
            </div>
            
            <div class="config-item">
              <label>Margen superior (%):</label>
              <input type="number" class="margin-top-input" id="marginTop-${section.id}" 
                     value="${section.marginTop}" min="0" max="50" step="1" 
                     data-section-id="${section.id}">
            </div>
            
            <div class="config-item">
              <label>Margen izquierdo (%):</label>
              <input type="number" class="margin-left-input" id="marginLeft-${section.id}" 
                     value="${section.marginLeft}" min="0" max="50" step="1" 
                     data-section-id="${section.id}">
            </div>
            
            <div class="config-item">
              <label>Gap título-descripción:</label>
              <input type="number" class="gap-input" id="gap-${section.id}" 
                     value="${section.gapTitleDesc}" min="0" max="10" step="0.5" 
                     data-section-id="${section.id}">
            </div>
          </div>
          
          <div class="cover-description-area" id="descArea-${section.id}">
            <label class="section-cover-label">📝 Descripción de la portada:</label>
            <textarea class="cover-description-input" id="coverDesc-${section.id}" 
                      data-section-id="${section.id}" 
                      placeholder="Escribe una descripción para la portada..."
                      rows="3">${section.coverDescription || ""}</textarea>
          </div>
        </div>
        
        <div class="section-drop-zone" id="dropZone-${section.id}" data-section-id="${section.id}">
          <p>Arrastra y suelta las imágenes y videos aquí</p>
          <p>o</p>
          <input type="file" class="section-file-input" id="fileInput-${section.id}" 
                 accept="image/*,video/*" multiple data-section-id="${section.id}">
          <label for="fileInput-${section.id}" class="section-file-label">Seleccionar imágenes y videos</label>
        </div>
        
        <div class="section-images" id="images-${section.id}"></div>
        <div class="section-image-count" id="count-${section.id}">0 imágenes</div>
      </div>
    `;

    sectionsContainer.appendChild(sectionCard);

    // Renderizar las imágenes de esta sección
    renderSectionImages(section.id);
  });

  // Agregar event listeners
  attachSectionEventListeners();
}

// Agregar event listeners a las secciones
function attachSectionEventListeners() {
  // Toggle colapsar/expandir sección
  document.querySelectorAll(".section-toggle").forEach((toggle) => {
    toggle.addEventListener("click", (e) => {
      const sectionId = parseInt(e.target.dataset.sectionId);
      const section = sections.find((s) => s.id === sectionId);
      if (section) {
        section.collapsed = !section.collapsed;
        renderSections();
      }
    });
  });

  // Click en header para expandir si está colapsado
  document.querySelectorAll(".section-header.collapsed").forEach((header) => {
    header.addEventListener("click", (e) => {
      if (!e.target.classList.contains("delete-section-btn")) {
        const sectionId = parseInt(header.dataset.sectionId);
        const section = sections.find((s) => s.id === sectionId);
        if (section) {
          section.collapsed = false;
          renderSections();
        }
      }
    });
  });

  // Cambio de nombre
  document.querySelectorAll(".section-title-input").forEach((input) => {
    input.addEventListener("input", (e) => {
      const sectionId = parseInt(e.target.dataset.sectionId);
      const section = sections.find((s) => s.id === sectionId);
      if (section) {
        section.name = e.target.value;
        updateCoverPreview(sectionId);
      }
    });

    // Prevenir que el click en el input colapse la sección
    input.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  });

  // Cambio de descripción de portada
  document.querySelectorAll(".cover-description-input").forEach((textarea) => {
    textarea.addEventListener("input", (e) => {
      const sectionId = parseInt(e.target.dataset.sectionId);
      const section = sections.find((s) => s.id === sectionId);
      if (section) {
        section.coverDescription = e.target.value;
        updateCoverPreview(sectionId);
      }
    });
  });

  // Eliminar sección
  document.querySelectorAll(".delete-section-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const sectionId = parseInt(e.target.dataset.sectionId);
      if (confirm("¿Estás seguro de que quieres eliminar esta sección?")) {
        sections = sections.filter((s) => s.id !== sectionId);
        renderSections();
        updateGenerateButton();
      }
    });
  });

  // Portada de sección
  document.querySelectorAll(".cover-file-input").forEach((input) => {
    input.addEventListener("change", (e) => {
      const sectionId = parseInt(e.target.dataset.sectionId);
      handleCoverImage(e.target.files[0], sectionId);
    });
  });

  // Checkbox de portada global
  const globalCoverCheckbox = document.getElementById("useAsGlobalCover");
  if (globalCoverCheckbox) {
    globalCoverCheckbox.addEventListener("change", (e) => {
      if (e.target.checked && sections.length > 0) {
        // Copiar configuración de la primera sección a todas las demás
        globalCoverImage = sections[0].coverImage;
        const globalConfig = {
          coverImage: sections[0].coverImage,
          titleColor: sections[0].titleColor,
          descColor: sections[0].descColor,
          marginTop: sections[0].marginTop,
          marginLeft: sections[0].marginLeft,
          gapTitleDesc: sections[0].gapTitleDesc,
        };

        sections.forEach((section, index) => {
          if (index > 0) {
            section.titleColor = globalConfig.titleColor;
            section.descColor = globalConfig.descColor;
            section.marginTop = globalConfig.marginTop;
            section.marginLeft = globalConfig.marginLeft;
            section.gapTitleDesc = globalConfig.gapTitleDesc;
          }
        });

        renderSections();
      } else {
        globalCoverImage = null;
      }
    });

    // Marcar el checkbox si ya hay una portada global
    if (globalCoverImage && sections.length > 0 && sections[0].coverImage === globalCoverImage) {
      globalCoverCheckbox.checked = true;
    }
  }

  // Eliminar portada
  document.querySelectorAll(".remove-cover-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const sectionId = parseInt(e.target.dataset.sectionId);
      const section = sections.find((s) => s.id === sectionId);
      if (section) {
        section.coverImage = null;
        section.coverDescription = "";

        // Si era la portada global, limpiarla
        const globalCheckbox = document.getElementById("useAsGlobalCover");
        if (globalCheckbox && globalCheckbox.checked) {
          globalCoverImage = null;
        }

        renderSections();
      }
    });
  });

  // Eliminar imagen de portada (nuevo botón)
  document.querySelectorAll(".remove-cover-img-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const sectionId = parseInt(e.target.dataset.sectionId);
      const section = sections.find((s) => s.id === sectionId);
      if (section) {
        section.coverImage = null;

        // Si era la portada global, limpiarla
        const globalCheckbox = document.getElementById("useAsGlobalCover");
        if (globalCheckbox && globalCheckbox.checked) {
          globalCoverImage = null;
        }

        renderSections();
      }
    });
  });

  // Selectores de color del título
  document.querySelectorAll(".title-color-input").forEach((input) => {
    input.addEventListener("input", (e) => {
      const sectionId = parseInt(e.target.dataset.sectionId);
      const section = sections.find((s) => s.id === sectionId);
      if (section) {
        section.titleColor = e.target.value;
        e.target.nextElementSibling.textContent = e.target.value.toUpperCase();
        updateCoverPreview(sectionId);
      }
    });
  });

  // Selectores de color de descripción
  document.querySelectorAll(".desc-color-input").forEach((input) => {
    input.addEventListener("input", (e) => {
      const sectionId = parseInt(e.target.dataset.sectionId);
      const section = sections.find((s) => s.id === sectionId);
      if (section) {
        section.descColor = e.target.value;
        e.target.nextElementSibling.textContent = e.target.value.toUpperCase();
        updateCoverPreview(sectionId);
      }
    });
  });

  // Margen superior
  document.querySelectorAll(".margin-top-input").forEach((input) => {
    input.addEventListener("input", (e) => {
      const sectionId = parseInt(e.target.dataset.sectionId);
      const section = sections.find((s) => s.id === sectionId);
      if (section) {
        section.marginTop = parseFloat(e.target.value);
        updateCoverPreview(sectionId);
      }
    });
  });

  // Margen izquierdo
  document.querySelectorAll(".margin-left-input").forEach((input) => {
    input.addEventListener("input", (e) => {
      const sectionId = parseInt(e.target.dataset.sectionId);
      const section = sections.find((s) => s.id === sectionId);
      if (section) {
        section.marginLeft = parseFloat(e.target.value);
        updateCoverPreview(sectionId);
      }
    });
  });

  // Gap entre título y descripción
  document.querySelectorAll(".gap-input").forEach((input) => {
    input.addEventListener("input", (e) => {
      const sectionId = parseInt(e.target.dataset.sectionId);
      const section = sections.find((s) => s.id === sectionId);
      if (section) {
        section.gapTitleDesc = parseFloat(e.target.value);
        updateCoverPreview(sectionId);
      }
    });
  });

  // Actualizar previsualizaciones iniciales
  sections.forEach((section) => {
    updateCoverPreview(section.id);
  });

  // Drag and drop para imágenes de sección
  document.querySelectorAll(".section-drop-zone").forEach((zone) => {
    const sectionId = parseInt(zone.dataset.sectionId);

    zone.addEventListener("dragover", (e) => {
      e.preventDefault();
      zone.classList.add("drag-over");
    });

    zone.addEventListener("dragleave", () => {
      zone.classList.remove("drag-over");
    });

    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      zone.classList.remove("drag-over");
      handleSectionFiles(e.dataTransfer.files, sectionId);
    });
  });

  // Selección de archivos para sección
  document.querySelectorAll(".section-file-input").forEach((input) => {
    input.addEventListener("change", (e) => {
      const sectionId = parseInt(e.target.dataset.sectionId);
      handleSectionFiles(e.target.files, sectionId);
    });
  });
}

// Manejar imagen de portada
function handleCoverImage(file, sectionId) {
  if (!file || !file.type.startsWith("image/")) {
    alert("Por favor selecciona una imagen válida");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const section = sections.find((s) => s.id === sectionId);
    if (section) {
      section.coverImage = { src: e.target.result, name: file.name };
      renderSections();
    }
  };
  reader.readAsDataURL(file);
}

// Obtener dimensiones de la página configurada
function getPageDimensions() {
  const pageSize = pageSizeSelect.value;

  if (pageSize === "custom") {
    const unit = customUnit.value;
    let width = parseFloat(customWidth.value);
    let height = parseFloat(customHeight.value);

    if (!width || !height || width <= 0 || height <= 0) {
      // Valores por defecto si no son válidos
      return { width: 1920 * 0.75, height: 1080 * 0.75 };
    }

    // Si la unidad es píxeles, convertir a puntos (pt)
    if (unit === "px") {
      return { width: width * 0.75, height: height * 0.75 };
    } else {
      // Para mm, convertir a puntos (1 mm = 2.834645669 pt)
      return { width: width * 2.834645669, height: height * 2.834645669 };
    }
  } else {
    // Tamaños estándar en mm, convertir a puntos
    const sizes = {
      a4: { width: 210, height: 297 },
      a3: { width: 297, height: 420 },
    };

    const size = sizes[pageSize] || sizes["a4"];

    // Aplicar orientación
    if (orientation === "landscape") {
      return {
        width: size.height * 2.834645669,
        height: size.width * 2.834645669,
      };
    } else {
      return {
        width: size.width * 2.834645669,
        height: size.height * 2.834645669,
      };
    }
  }
}

// Actualizar previsualizador de portada
async function updateCoverPreview(sectionId) {
  const section = sections.find((s) => s.id === sectionId);
  if (!section) return;

  const canvas = document.getElementById(`coverCanvas-${sectionId}`);
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  // Obtener dimensiones reales de la página configurada
  const pageDimensions = getPageDimensions();

  // Calcular tamaño del canvas manteniendo la proporción de la página
  const maxCanvasWidth = 300;
  const pageAspectRatio = pageDimensions.width / pageDimensions.height;

  let canvasWidth, canvasHeight;
  if (pageAspectRatio > 1) {
    // Página horizontal
    canvasWidth = maxCanvasWidth;
    canvasHeight = maxCanvasWidth / pageAspectRatio;
  } else {
    // Página vertical
    canvasHeight = maxCanvasWidth;
    canvasWidth = maxCanvasWidth * pageAspectRatio;
  }

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // Limpiar canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Dibujar fondo blanco
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Dibujar imagen de fondo si existe
  if (backgroundImage) {
    try {
      const bgImg = await loadImageForCanvas(backgroundImage);
      ctx.drawImage(bgImg, 0, 0, canvasWidth, canvasHeight);
    } catch (e) {
      console.error("Error al cargar imagen de fondo:", e);
    }
  }

  // Dibujar imagen de portada si existe
  if (section.coverImage) {
    try {
      const coverImg = await loadImageForCanvas(section.coverImage.src);
      const imgAspectRatio = coverImg.width / coverImg.height;
      const canvasAspectRatio = canvasWidth / canvasHeight;

      let imgWidth, imgHeight, imgX, imgY;

      if (imgAspectRatio > canvasAspectRatio) {
        imgHeight = canvasHeight;
        imgWidth = canvasHeight * imgAspectRatio;
        imgX = -(imgWidth - canvasWidth) / 2;
        imgY = 0;
      } else {
        imgWidth = canvasWidth;
        imgHeight = canvasWidth / imgAspectRatio;
        imgX = 0;
        imgY = -(imgHeight - canvasHeight) / 2;
      }

      ctx.drawImage(coverImg, imgX, imgY, imgWidth, imgHeight);
    } catch (e) {
      console.error("Error al cargar imagen de portada:", e);
    }
  }

  // Calcular márgenes en escala del canvas
  const marginLeft = (section.marginLeft / 100) * canvasWidth;
  const marginTop = (section.marginTop / 100) * canvasHeight;

  // Dibujar título
  const titleFontSize = 16; // Escala para el canvas
  ctx.font = `bold ${titleFontSize}px Helvetica`;
  ctx.fillStyle = section.titleColor;
  ctx.textBaseline = "top";

  const maxTextWidth = canvasWidth - marginLeft * 2;
  const titleLines = wrapText(ctx, section.name, maxTextWidth);

  let currentY = marginTop;
  const titleLineHeight = titleFontSize * 1.4;

  titleLines.forEach((line) => {
    ctx.fillText(line, marginLeft, currentY);
    currentY += titleLineHeight;
  });

  // Dibujar descripción si existe
  if (section.coverDescription && section.coverDescription.trim()) {
    const gapBetweenTitleAndDesc = titleFontSize * section.gapTitleDesc;
    currentY += gapBetweenTitleAndDesc;

    const descFontSize = 8; // Escala para el canvas
    ctx.font = `${descFontSize}px Helvetica`;
    ctx.fillStyle = section.descColor;

    const maxDescWidth = canvasWidth * 0.3;
    const descLines = wrapText(ctx, section.coverDescription, maxDescWidth);
    const descLineHeight = descFontSize * 1.2;

    descLines.forEach((line) => {
      ctx.fillText(line, marginLeft, currentY);
      currentY += descLineHeight;
    });
  }
}

// Cargar imagen para canvas
function loadImageForCanvas(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Función auxiliar para dividir texto en líneas
function wrapText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const testLine = currentLine + " " + words[i];
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth) {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  lines.push(currentLine);
  return lines;
}

// Manejar archivos de una sección (imágenes y videos)
function handleSectionFiles(files, sectionId) {
  const section = sections.find((s) => s.id === sectionId);
  if (!section) return;

  const filesArray = Array.from(files).filter((file) => {
    return file.type.startsWith("image/") || file.type.startsWith("video/");
  });

  // Ordenar alfabéticamente
  filesArray.sort((a, b) => a.name.localeCompare(b.name));

  let processedCount = 0;

  filesArray.forEach((file) => {
    if (file.type.startsWith("image/")) {
      // Manejar imagen
      const reader = new FileReader();
      reader.onload = (e) => {
        section.images.push({ src: e.target.result, name: file.name, isVideo: false });
        processedCount++;
        renderSectionImages(sectionId);
        updateGenerateButton();
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith("video/")) {
      // Manejar video - extraer miniatura
      const reader = new FileReader();
      reader.onload = (e) => {
        extractVideoThumbnail(e.target.result, file.name, (thumbnail) => {
          section.images.push({ src: thumbnail, name: file.name, isVideo: true });
          processedCount++;
          renderSectionImages(sectionId);
          updateGenerateButton();
        });
      };
      reader.readAsDataURL(file);
    }
  });

  if (filesArray.length < files.length) {
    alert("Algunos archivos no son imágenes ni videos y fueron ignorados.");
  }
}

// Extraer miniatura de video (frame del medio)
function extractVideoThumbnail(videoDataUrl, videoName, callback) {
  const video = document.createElement("video");
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  video.onloadedmetadata = () => {
    // Ir al frame del medio del video
    video.currentTime = video.duration / 2;
  };

  video.onseeked = () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    const thumbnail = canvas.toDataURL("image/jpeg");
    callback(thumbnail);
  };

  video.onerror = () => {
    console.error("Error al cargar video:", videoName);
    alert(`Error al extraer miniatura del video: ${videoName}`);
  };

  video.src = videoDataUrl;
}

// Renderizar imágenes de una sección
function renderSectionImages(sectionId) {
  const section = sections.find((s) => s.id === sectionId);
  if (!section) return;

  const container = document.getElementById(`images-${sectionId}`);
  const countEl = document.getElementById(`count-${sectionId}`);

  container.innerHTML = "";
  section.images.forEach((imgData, index) => {
    const div = document.createElement("div");
    div.className = "section-image-item";
    const badgeHtml = imgData.isVideo ? '<div class="video-badge">VIDEO</div>' : "";
    div.innerHTML = `
      <img src="${imgData.src}" alt="${imgData.name}">
      ${badgeHtml}
      <button onclick="removeSectionImage(${sectionId}, ${index})">×</button>
    `;
    container.appendChild(div);
  });

  countEl.textContent = `${section.images.length} ${section.images.length === 1 ? "imagen" : "imágenes"}`;
}

// Eliminar imagen de una sección
function removeSectionImage(sectionId, imageIndex) {
  const section = sections.find((s) => s.id === sectionId);
  if (section) {
    section.images.splice(imageIndex, 1);
    renderSectionImages(sectionId);
    updateGenerateButton();
  }
}

// Actualizar botón de generar
function updateGenerateButton() {
  const hasImages = sections.some((s) => s.images.length > 0 || s.coverImage);
  generateBtn.disabled = !hasImages;
}

// Mostrar/ocultar opciones de tamaño personalizado y orientación
pageSizeSelect.addEventListener("change", () => {
  if (pageSizeSelect.value === "custom") {
    customSizeOptions.style.display = "block";
    orientationControl.style.display = "none";
  } else {
    customSizeOptions.style.display = "none";
    orientationControl.style.display = "block";
  }

  // Actualizar todos los previsualizadores cuando cambia el tamaño de página
  sections.forEach((section) => {
    updateCoverPreview(section.id);
  });
});

// Actualizar previsualizadores cuando cambian las dimensiones personalizadas
customWidth.addEventListener("input", () => {
  sections.forEach((section) => {
    updateCoverPreview(section.id);
  });
});

customHeight.addEventListener("input", () => {
  sections.forEach((section) => {
    updateCoverPreview(section.id);
  });
});

customUnit.addEventListener("change", () => {
  sections.forEach((section) => {
    updateCoverPreview(section.id);
  });
});

// Actualizar previsualizadores cuando cambia la orientación
portraitCheck.addEventListener("change", () => {
  if (portraitCheck.checked) {
    landscapeCheck.checked = false;
    orientation = "portrait";
    sections.forEach((section) => {
      updateCoverPreview(section.id);
    });
  }
});

landscapeCheck.addEventListener("change", () => {
  if (landscapeCheck.checked) {
    portraitCheck.checked = false;
    orientation = "landscape";
    sections.forEach((section) => {
      updateCoverPreview(section.id);
    });
  }
});

// Generar PDF
generateBtn.addEventListener("click", async () => {
  try {
    const imagesPerRow = parseInt(imagesPerRowInput.value);
    const pageSize = pageSizeSelect.value;

    let pdfConfig = {};

    // Configurar tamaño de página
    if (pageSize === "custom") {
      const unit = customUnit.value;
      let width = parseFloat(customWidth.value);
      let height = parseFloat(customHeight.value);

      if (!width || !height || width <= 0 || height <= 0) {
        alert("Por favor, ingresa dimensiones válidas para el tamaño personalizado.");
        return;
      }

      // Determinar orientación automáticamente según las dimensiones
      const customOrientation = width > height ? "landscape" : "portrait";

      // Si la unidad es píxeles, convertir a puntos (pt) para jsPDF
      // 1 píxel = 0.75 puntos
      if (unit === "px") {
        pdfConfig.unit = "pt";
        pdfConfig.format = [width * 0.75, height * 0.75];
      } else {
        pdfConfig.unit = unit;
        pdfConfig.format = [width, height];
      }

      pdfConfig.orientation = customOrientation;
    } else {
      pdfConfig.unit = "mm";
      pdfConfig.format = pageSize;
      pdfConfig.orientation = orientation;
    }

    const pdf = new jsPDF(pdfConfig);
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    let isFirstPage = true;

    // Agregar imagen de fondo a la primera página
    if (backgroundImage) {
      await addBackgroundImage(pdf, backgroundImage, pageWidth, pageHeight);
    }

    // Procesar cada sección
    for (const section of sections) {
      // Determinar qué imagen de portada usar (global o específica de la sección)
      const coverToUse = globalCoverImage || section.coverImage;

      // Agregar portada si existe (global o de sección) o si hay descripción
      if (coverToUse || (section.coverDescription && section.coverDescription.trim())) {
        if (!isFirstPage) {
          pdf.addPage();
          if (backgroundImage) {
            await addBackgroundImage(pdf, backgroundImage, pageWidth, pageHeight);
          }
        }

        // Dibujar la portada centrada en la página
        await addCoverPage(
          pdf,
          coverToUse ? coverToUse.src : null,
          section.name,
          section.coverDescription || "",
          pageWidth,
          pageHeight,
          section.titleColor,
          section.descColor,
          section.marginTop,
          section.marginLeft,
          section.gapTitleDesc
        );
        isFirstPage = false;
      }

      // Procesar imágenes de la sección
      if (section.images.length > 0) {
        if (!isFirstPage) {
          pdf.addPage();
          if (backgroundImage) {
            await addBackgroundImage(pdf, backgroundImage, pageWidth, pageHeight);
          }
        }

        await addSectionImages(pdf, section.images, imagesPerRow, pageWidth, pageHeight);
        isFirstPage = false;
      }
    }

    pdf.save("galeria.pdf");
  } catch (error) {
    alert("Error al generar el PDF: " + error.message);
  }
});

// Agregar página de portada
async function addCoverPage(
  pdf,
  coverSrc,
  sectionName,
  description,
  pageWidth,
  pageHeight,
  titleColor = "#000000",
  descColor = "#000000",
  marginTopPercent = 8,
  marginLeftPercent = 5,
  gapMultiplier = 2
) {
  // Cargar imagen de portada que ocupa toda la página (si existe)
  if (coverSrc) {
    const img = await loadImage(coverSrc);
    const imgAspectRatio = img.width / img.height;
    const pageAspectRatio = pageWidth / pageHeight;

    let imgWidth, imgHeight, imgX, imgY;

    // Ajustar la imagen para cubrir toda la página sin perder proporción
    if (imgAspectRatio > pageAspectRatio) {
      // La imagen es más ancha que la página
      imgHeight = pageHeight;
      imgWidth = pageHeight * imgAspectRatio;
      imgX = -(imgWidth - pageWidth) / 2;
      imgY = 0;
    } else {
      // La imagen es más alta que la página
      imgWidth = pageWidth;
      imgHeight = pageWidth / imgAspectRatio;
      imgX = 0;
      imgY = -(imgHeight - pageHeight) / 2;
    }

    // Dibujar la imagen de fondo primero
    pdf.addImage(coverSrc, "JPEG", imgX, imgY, imgWidth, imgHeight);
  }

  // Convertir color hexadecimal a RGB para jsPDF
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  };

  // Configurar márgenes y ancho de texto usando los valores de la sección
  const marginLeft = (marginLeftPercent / 100) * pageWidth;
  const marginRight = (marginLeftPercent / 100) * pageWidth; // Mismo margen en ambos lados
  const marginTop = (marginTopPercent / 100) * pageHeight;
  const maxTextWidth = pageWidth - marginLeft - marginRight;

  // Agregar título (H1) - alineado a la izquierda con su propio color
  const titleRgb = hexToRgb(titleColor);
  pdf.setTextColor(titleRgb.r, titleRgb.g, titleRgb.b);
  pdf.setFont("helvetica", "bold");
  const titleFontSize = 32;
  pdf.setFontSize(titleFontSize);

  // Dividir el título en líneas que quepan en el ancho máximo
  const titleLines = pdf.splitTextToSize(sectionName, maxTextWidth);

  let currentY = marginTop;
  const titleLineHeight = titleFontSize * 1.4; // Line height proporcional (140% del tamaño de fuente)

  // Dibujar cada línea del título alineada a la izquierda
  titleLines.forEach((line) => {
    pdf.text(line, marginLeft, currentY); // Alineado a la izquierda
    currentY += titleLineHeight;
  });

  // Agregar descripción (H3) si existe - con su propio color
  if (description && description.trim()) {
    const gapBetweenTitleAndDesc = titleFontSize * gapMultiplier; // Gap usando el multiplicador de la sección
    currentY += gapBetweenTitleAndDesc;

    // Cambiar color para la descripción
    const descRgb = hexToRgb(descColor);
    pdf.setTextColor(descRgb.r, descRgb.g, descRgb.b);
    pdf.setFont("helvetica", "normal");
    const descFontSize = 16;
    pdf.setFontSize(descFontSize);

    // Dividir la descripción en líneas (30% del ancho de página)
    const maxDescWidth = pageWidth * 0.3;
    const descLineHeight = descFontSize * 1.2;

    // Detectar URLs en la descripción
    // Regex simple para URLs (http/https)
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    // Función para dividir una línea en fragmentos de texto y enlaces
    function splitLineWithLinks(line) {
      const parts = [];
      let lastIndex = 0;
      let match;
      while ((match = urlRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push({ text: line.substring(lastIndex, match.index), url: null });
        }
        parts.push({ text: match[0], url: match[0] });
        lastIndex = match.index + match[0].length;
      }
      if (lastIndex < line.length) {
        parts.push({ text: line.substring(lastIndex), url: null });
      }
      return parts;
    }

    // Reemplazar saltos de línea por espacios para un mejor corte
    const descText = description.replace(/\n/g, " ");
    // Detectar y separar en fragmentos de texto y enlaces
    const fragments = splitLineWithLinks(descText);
    // Para cada fragmento, usar splitTextToSize para cortar igual que el método original
    let lines = [];
    fragments.forEach((frag) => {
      const fragLines = pdf.splitTextToSize(frag.text, maxDescWidth);
      fragLines.forEach((line) => {
        lines.push({ text: line, url: frag.url });
      });
    });
    // Dibujar cada línea, usando textWithLink si es enlace
    lines.forEach((lineObj) => {
      if (lineObj.url) {
        pdf.textWithLink(lineObj.text, marginLeft, currentY, { url: lineObj.url });
      } else {
        pdf.text(lineObj.text, marginLeft, currentY);
      }
      currentY += descLineHeight;
    });
  }

  // Resetear color del texto a negro para el resto del documento
  pdf.setTextColor(0, 0, 0);
}

// Agregar imágenes de una sección
async function addSectionImages(pdf, images, imagesPerRow, pageWidth, pageHeight) {
  const margin = 10;
  const gapBetweenImages = 5;
  const gapBetweenRows = 10;
  const imageWidth = (pageWidth - margin * 2 - gapBetweenImages * (imagesPerRow - 1)) / imagesPerRow;

  let y = margin;
  let needsNewPage = false;

  // Procesar imágenes por filas
  for (let rowStart = 0; rowStart < images.length; rowStart += imagesPerRow) {
    const rowEnd = Math.min(rowStart + imagesPerRow, images.length);
    const rowImages = images.slice(rowStart, rowEnd);

    // Cargar todas las imágenes de la fila para calcular la altura máxima
    const loadedImages = await Promise.all(rowImages.map((imgData) => loadImage(imgData.src)));

    // Calcular alturas y encontrar la altura máxima de la fila
    const imageHeights = loadedImages.map((img) => {
      const aspectRatio = img.width / img.height;
      return imageWidth / aspectRatio;
    });

    const maxRowHeight = Math.max(...imageHeights);

    // Verificar si la fila cabe en la página actual
    if (y + maxRowHeight + margin > pageHeight) {
      pdf.addPage();
      y = margin;

      if (backgroundImage) {
        await addBackgroundImage(pdf, backgroundImage, pageWidth, pageHeight);
      }
    }

    // Dibujar cada imagen de la fila centrada verticalmente
    let x = margin;
    for (let i = 0; i < rowImages.length; i++) {
      const imgHeight = imageHeights[i];
      const yOffset = (maxRowHeight - imgHeight) / 2;

      pdf.addImage(rowImages[i].src, "JPEG", x, y + yOffset, imageWidth, imgHeight);

      // Dibujar badge "VIDEO" si es un video
      if (rowImages[i].isVideo === true) {
        drawVideoBadge(pdf, x + imageWidth - 35, y + yOffset + imgHeight - 28, 32, 24);
      }

      x += imageWidth + gapBetweenImages;
    }

    y += maxRowHeight + gapBetweenRows;
  }
}

// Dibujar badge "VIDEO" en la esquina inferior derecha
function drawVideoBadge(pdf, x, y, width, height) {
  // Fondo rojo con padding
  const paddingX = 8;
  const paddingY = 2;

  pdf.setFillColor(220, 20, 60); // Rojo oscuro (Crimson)
  pdf.rect(x - paddingX, y - paddingY, width + paddingX * 2, height + paddingY * 2, "F");

  // Borde negro
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(0.5);
  pdf.rect(x - paddingX, y - paddingY, width + paddingX * 2, height + paddingY * 2);

  // Texto "VIDEO"
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("VIDEO", x - paddingX + (width + paddingX * 2) / 2, y - paddingY + (height + paddingY * 2) / 2, { align: "center", baseline: "middle" });

  // Resetear colores
  pdf.setDrawColor(0, 0, 0);
  pdf.setTextColor(0, 0, 0);
}

// Cargar imagen para obtener dimensiones
function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = src;
  });
}

// Agregar imagen de fondo
function addBackgroundImage(pdf, imgSrc, pageWidth, pageHeight) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const imgAspectRatio = img.width / img.height;
      const pageAspectRatio = pageWidth / pageHeight;

      let bgWidth, bgHeight, bgX, bgY;

      // Ajustar la imagen de fondo para cubrir toda la página sin perder proporción
      if (imgAspectRatio > pageAspectRatio) {
        // La imagen es más ancha que la página
        bgHeight = pageHeight;
        bgWidth = pageHeight * imgAspectRatio;
        bgX = -(bgWidth - pageWidth) / 2;
        bgY = 0;
      } else {
        // La imagen es más alta que la página
        bgWidth = pageWidth;
        bgHeight = pageWidth / imgAspectRatio;
        bgX = 0;
        bgY = -(bgHeight - pageHeight) / 2;
      }

      pdf.addImage(imgSrc, "JPEG", bgX, bgY, bgWidth, bgHeight);
      resolve();
    };
    img.src = imgSrc;
  });
}
