/*
 * APTER · Definición del cuestionario
 * ---------------------------------------------------------------
 * Este archivo es la ÚNICA fuente de contenido de la evaluación.
 * La página no tiene ninguna pregunta escrita en el código: para agregar,
 * quitar o cambiar pasos, secciones, preguntas o respuestas se edita aquí.
 *
 * Estructura:
 *   steps[]                    Pasos ("ventanas") de la evaluación, en orden.
 *     type: "form"             Formulario de campos (sin barra de navegación).
 *       groups[].fields[]        id, label, placeholder (ejemplo), mask?, required?, help?
 *     type: "category"         Categoría con secciones A, B, C... (letras automáticas)
 *       sections[]               id, title, help?
 *         questions[]            id, text, options[] (máx. 3), showIf?, help?
 *           showIf: { question: "<id>", in: ["<valor>", ...] }  → la pregunta solo aparece
 *                                si la respuesta de otra pregunta está en esa lista.
 *   help: { title?, text?, items?: [{ term, text }] }   → contenido del popup "?"
 *   tour[]                     Popups de la visita guiada (ver más abajo).
 *
 * Para pasar a leer esto desde un servidor/JSON basta con reemplazar la
 * asignación de window.APTER_DATA por un fetch() en js/app.js.
 */
window.APTER_DATA = {
  app: {
    name: "APTER",
    welcome: {
      title: "Bienvenida/o a APTER",
      text:
        "APTER es una herramienta para evaluar la aptitud territorial de terrenos ofrecidos para el " +
        "desarrollo de nuevos barrios y proyectos urbanos. A partir de la información del predio y de " +
        "una serie de variables críticas, la evaluación va construyendo un informe técnico y una matriz " +
        "multicriterio con un semáforo que indica la viabilidad del terreno. Podés guardar tu avance en " +
        "cualquier momento y retomarlo después desde el Control de Evaluaciones.",
      question: "¿Cómo querés realizar la evaluación?",
      guided: "Evaluación guiada",
      guidedDesc: "Te acompañamos paso a paso con avisos que explican cada parte.",
      manual: "Evaluación manual",
      manualDesc: "Completás los datos por tu cuenta y a tu propio ritmo.",
      eyebrow: "Aptitud territorial",
      points: [
        "Tu avance se guarda automáticamente.",
        "Podés retomar o editar evaluaciones cuando quieras.",
        "Cada término técnico tiene una ayuda a un toque."
      ]
    },
    info: {
      title: "Información",
      text:
        "APTER es un instrumento desarrollado por la FAUD (UNSJ) junto al IRPHa – CONICET para evaluar la " +
        "aptitud territorial de predios destinados a nuevos desarrollos urbanos en el Área Metropolitana de San Juan."
    },
    manual: {
      title: "Manual de uso",
      text: "Aquí se publicará el manual de ayuda en formato PDF."
    }
  },

  steps: [
    /* ───────── Ventana 1 · I – Datos del terreno ───────── */
    {
      id: "terreno",
      type: "form",
      title: "Datos del terreno",
      groups: [
        {
          id: "identificacion",
          title: null,
          fields: [
            {
              id: "nc",
              label: "NC",
              placeholder: "XX-XX-XXXXXX",
              mask: "##-##-######",
              required: true,
              wide: true,
              help: {
                title: "NC · Nomenclatura Catastral",
                text: "Número que identifica la parcela en el catastro. Se compone de dos dígitos, dos dígitos y seis dígitos: XX-XX-XXXXXX."
              }
            }
          ]
        },
        {
          id: "ubicacion",
          title: "Ubicación",
          fields: [
            { id: "calle", label: "Calle", placeholder: "Ej: Av. Libertador (calle frentista)", required: true },
            { id: "numero", label: "Número", placeholder: "Ej: 1250 (altura)", required: true },
            { id: "laterales", label: "Calles laterales", placeholder: "Ej: Mendoza y Laprida", required: true },
            { id: "departamento", label: "Departamento", placeholder: "Ej: Rivadavia", required: true },
            { id: "coordX", label: "Coordenada X", placeholder: "Ej: 2.545.300", required: true },
            { id: "coordY", label: "Coordenada Y", placeholder: "Ej: 6.516.800", required: true }
          ]
        },
        {
          id: "propiedad",
          title: "Propiedad",
          fields: [
            { id: "titular", label: "Titular", placeholder: "Ej: Pérez, Juan Carlos", required: true },
            { id: "contacto", label: "Contacto", placeholder: "Ej: 264 555-1234 o correo@ejemplo.com", required: true }
          ]
        }
      ]
    },

    /* ───────── Ventana 2 · II – Variables críticas ───────── */
    {
      id: "criticas",
      type: "category",
      title: "Variables críticas",
      help: {
        title: "¿Qué son las variables críticas?",
        text:
          "Las variables críticas constituyen el conjunto de variables y criterios evaluativos de carácter primario " +
          "que determinan el primer filtro vinculante en la evaluación de la aptitud territorial de un predio. Su función " +
          "principal es constatar de forma preliminar y excluyente la viabilidad técnica y ambiental de un terreno para el " +
          "desarrollo de nuevos barrios o proyectos urbanos.\n\n" +
          "A diferencia de otras categorías analíticas, la verificación de los indicadores en esta categoría permite establecer " +
          "de manera inmediata si un territorio cuenta con las condiciones mínimas indispensables o si, por el contrario, " +
          "presenta restricciones absolutas (como la falta de factibilidad de servicios técnicos, la afección a suelos " +
          "productivos protegidos u otras limitaciones irreversibles) que impiden la continuidad del análisis técnico."
      },
      sections: [
        {
          id: "agro",
          title: "Capacidad agroproductiva del suelo",
          help: {
            title: "¿Qué es la capacidad agroproductiva del suelo?",
            text:
              "Evalúa la presencia y el valor productivo de terrenos destinados a actividades agrícolas, pecuarias o " +
              "agroindustriales localizados fuera del límite urbano del Área Metropolitana de San Juan, considerando que " +
              "estos constituyen un recurso estratégico, limitado y no renovable cuya transformación por procesos de " +
              "urbanización implica pérdidas ambientales, económicas y territoriales de carácter irreversible."
          },
          questions: [
            {
              id: "agro_limite",
              text: "¿El terreno está dentro del límite del AMSJ?",
              options: [
                { value: "si", label: "Sí" },
                { value: "no", label: "No" }
              ]
            },
            {
              id: "agro_afectacion",
              text: "El terreno está fuera del límite del AMSJ: ¿qué afectación presenta?",
              showIf: { question: "agro_limite", in: ["no"] },
              options: [
                { value: "sin", label: "Sin afectación de suelo agroproductivo" },
                { value: "parcial", label: "Afectación parcial de suelo agroproductivo" },
                { value: "alta", label: "Alta afectación de suelo agroproductivo" }
              ]
            }
          ]
        },
        {
          id: "factibilidad",
          title: "Condición de factibilidad",
          help: {
            title: "¿Qué es la condición de factibilidad?",
            text:
              "Evalúa la viabilidad técnica, administrativa y legal requerida por un nuevo desarrollo urbano, considerando " +
              "los organismos: Obras Sanitarias Sociedad del Estado San Juan (OSSE San Juan), Secretaría de Estado de " +
              "Ambiente y Desarrollo Sustentable, Hidráulica, Dirección de Planeamiento y Desarrollo Urbano y la Dirección " +
              "de Arbolado Urbano, que depende de la Secretaría de Estado de Ambiente y Desarrollo Sustentable.",
            items: [
              {
                term: "Factibilidad favorable",
                text: "El organismo competente ha emitido factibilidad positiva o existen condiciones objetivas para su otorgamiento."
              },
              {
                term: "Factibilidad condicionada",
                text: "Existen requerimientos técnicos, ampliaciones de infraestructura o estudios complementarios previos al otorgamiento."
              },
              {
                term: "Sin factibilidad",
                text: "El organismo competente niega la posibilidad técnica de provisión de infraestructura o servicios."
              }
            ]
          },
          questions: [
            { id: "fact_osse", text: "¿Cuenta con la factibilidad de OSSE?", options: "@factibilidad" },
            { id: "fact_seayds", text: "¿Cuenta con la factibilidad de la Secretaría de Estado de Ambiente y Desarrollo Sustentable?", options: "@factibilidad" },
            { id: "fact_hidraulica", text: "¿Cuenta con la factibilidad de Hidráulica?", options: "@factibilidad" },
            { id: "fact_dpdu", text: "¿Cuenta con la factibilidad de DPDU?", options: "@factibilidad" },
            { id: "fact_arbolado", text: "¿Cuenta con la factibilidad de la Dirección de Arbolado Urbano – SEAyDS?", options: "@factibilidad" }
          ]
        }
      ]
    }
  ],

  /* Conjuntos de respuestas reutilizables. Una pregunta las usa con options: "@nombre". */
  optionSets: {
    factibilidad: [
      { value: "favorable", label: "Factibilidad favorable" },
      { value: "condicionada", label: "Factibilidad condicionada" },
      { value: "sin", label: "Sin factibilidad" }
    ]
  },

  /*
   * Visita guiada. Cada paso se muestra UNA vez, la primera vez que ocurre su "trigger":
   *   "datos"            al entrar a la pantalla de datos del terreno
   *   "primera-pregunta" al ver la primera pregunta
   *   "segunda-pregunta" al avanzar a la segunda pregunta (aparece el botón "atrás")
   *   "nueva-seccion"    al pasar a una nueva sección (la anterior se colapsa)
   *   "fin"              al finalizar la evaluación
   * target: selector CSS del elemento a resaltar (sin target = popup centrado).
   * place: top | bottom | left | right (opcional, se ajusta automáticamente).
   */
  tour: [
    {
      trigger: "datos",
      title: "¡Empecemos!",
      text: "Te voy a acompañar a lo largo de la evaluación con pequeños avisos como este. Podés omitir la visita cuando quieras."
    },
    {
      trigger: "datos",
      target: '[data-field="nc"]',
      place: "bottom",
      title: "Cada campo tiene un ejemplo",
      text: "El texto gris dentro de cada campo te muestra qué tipo de dato va ahí. Este, por ejemplo, tiene el formato de la nomenclatura catastral. El signo “?” te explica los términos técnicos."
    },
    {
      trigger: "datos",
      target: '[data-group="ubicacion"]',
      place: "right",
      title: "Ubicación del predio",
      text: "Indicá la calle frentista, la altura, las calles laterales más próximas, el departamento y las coordenadas."
    },
    {
      trigger: "datos",
      target: '[data-group="propiedad"]',
      place: "top",
      title: "Datos del propietario",
      text: "Registrá el titular del terreno y un medio de contacto (celular o correo)."
    },
    {
      trigger: "datos",
      target: "#btn-next",
      place: "top",
      title: "Siguiente",
      text: "Cuando completes todos los campos, este botón se habilita para continuar. Siempre está en el mismo lugar."
    },
    {
      trigger: "primera-pregunta",
      target: "#section-card",
      place: "bottom",
      title: "Sección actual",
      text: "Las evaluaciones se dividen en categorías, y cada categoría en secciones identificadas con letras (A, B, C…). Tocá el “?” para ver su definición."
    },
    {
      trigger: "primera-pregunta",
      target: "#question-card",
      place: "top",
      title: "Preguntas y respuestas",
      text: "Dentro de cada sección vas a responder preguntas numeradas. Elegí una de las opciones disponibles (hasta tres)."
    },
    {
      trigger: "primera-pregunta",
      target: "#nav",
      place: "left",
      title: "Barra de navegación",
      text: "Muestra en qué sección estás y las preguntas que tiene, con puntos. Las secciones completas se marcan en azul y podés volver a ellas tocándolas."
    },
    {
      trigger: "segunda-pregunta",
      target: "#btn-prev",
      place: "top",
      title: "Volver atrás",
      text: "Con este botón regresás a la pregunta anterior para revisar o cambiar tu respuesta. Tu avance se guarda automáticamente."
    },
    {
      trigger: "nueva-seccion",
      target: "#nav",
      place: "left",
      title: "Sección completada",
      text: "Al terminar una sección, esta se colapsa y se despliega la siguiente. Podés retomarla o cerrar la evaluación en cualquier momento desde “Control de Evaluaciones”."
    },
    {
      trigger: "fin",
      title: "¡Evaluación finalizada!",
      text: "Tu evaluación quedó guardada. Podés revisarla, editarla o retomar otras desde la pestaña “Control de Evaluaciones”."
    }
  ]
};
