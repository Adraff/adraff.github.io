// Función para hacer scroll suave a una sección específica
function scrollToSection(target) {
    var targetSection = document.querySelector(target);
    if (targetSection) {
        window.scrollTo({
            top: targetSection.offsetTop,
            behavior: "smooth"
        });
    }
}

// Agregar un evento de clic a todos los botones de desplazamiento a secciones
document.querySelectorAll(".scrollToSectionBtn").forEach(function(button) {
    button.addEventListener("click", function() {
        var target = this.getAttribute("data-target");
        scrollToSection(target); // Llama a la función para hacer scroll suave a la sección específica
    });
});

// Función para mostrar u ocultar el botón de scroll hacia arriba
function toggleScrollToTopButton() {
    var scrollToTopBtn = document.getElementById("scrollToTopBtn");
    if (window.scrollY > 0) {
        scrollToTopBtn.style.display = "block";
    } else {
        scrollToTopBtn.style.display = "none";
    }
}

// Agregar un evento de scroll al documento
window.addEventListener("scroll", function() {
    toggleScrollToTopButton();
});

// Función para hacer scroll suave hacia arriba
document.getElementById("scrollToTopBtn").addEventListener("click", function() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

// Función para desplazar el scroll verticalmente de forma suave a una posición específica en el DOM
function scrollVerticallyToPosition(positionPercent) {
    const scrollHeight = document.documentElement.scrollHeight;
    const targetPosition = scrollHeight * (positionPercent / 100);
    
    window.scrollTo({
        top: targetPosition, // Desplaza a la posición específica en el DOM
        behavior: 'smooth' // Desplazamiento suave
    });
}

// Botón para desplazar el scroll verticalmente a una posición específica en el DOM 1
document.getElementById("scrollButton1").addEventListener("click", function() {
    scrollVerticallyToPosition(5.45); // Desplaza verticalmente al 50% del DOM
});

// Botón para desplazar el scroll verticalmente a una posición específica en el DOM 2
document.getElementById("scrollButton2").addEventListener("click", function() {
    scrollVerticallyToPosition(12); // Desplaza verticalmente al 50% del DOM
});

// Botón para desplazar el scroll verticalmente a una posición específica en el DOM 3
document.getElementById("scrollButton3").addEventListener("click", function() {
    scrollVerticallyToPosition(38); // Desplaza verticalmente al 50% del DOM
});

// Botón para desplazar el scroll verticalmente a una posición específica en el DOM 4
document.getElementById("scrollButton4").addEventListener("click", function() {
    scrollVerticallyToPosition(54); // Desplaza verticalmente al 50% del DOM
});

document.getElementById('toggleGrillaButton').addEventListener('click', function() {
    var grilla = document.getElementById('grilla');
    if (grilla.style.display === 'none' || grilla.style.display === '') {
        grilla.style.display = 'block';
        this.textContent = 'Ocultar grilla';
    } else {
        grilla.style.display = 'none';
        this.textContent = 'Mostrar grilla';
    }
});