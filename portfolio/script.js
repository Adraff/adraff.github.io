document.addEventListener('DOMContentLoaded', function() {
    const video1 = document.getElementById('video1');
    const video2 = document.getElementById('video2');

    // Pausar ambos videos al cargar la página
    video1.pause();
    video1.currentTime = 0;
    video2.pause();
    video2.currentTime = 0;

    let video1HasPlayed = false; // Controla si el video 1 ha sido reproducido
    let video2HasPlayed = false; // Controla si el video 2 ha sido reproducido

    // Configuración de Intersection Observer para la sección 3
    const observerSection3 = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (!video2HasPlayed) {
                    video1.style.display = 'block';
                    video2.style.display = 'none';

                    // Reproducir video1 hasta el 50%
                    if (video1.paused) {
                        video1.play();
                        video1.onseeked = () => {
                            if (video1.currentTime >= video1.duration / 2) {
                                video1.pause();
                            }
                        };
                    }
                }
            }
        });
    }, {
        threshold: 0.5
    });

    observerSection3.observe(document.querySelector('.section_3'));

    // Configuración de Intersection Observer para la sección 4
    const observerSection4 = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                video1.style.display = 'none';
                video2.style.display = 'block';

                // Reproducir video2 desde el principio
                if (!video2HasPlayed) {
                    video2.currentTime = 0;
                    video2.play();
                    video2HasPlayed = true; // Marcar que el video 2 ha sido reproducido
                }
            }
        });
    }, {
        threshold: 0.5
    });

    observerSection4.observe(document.querySelector('.section_4'));

    // Configuración de Intersection Observer para la sección 1
    const observerSection1 = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Reiniciar video1 y ocultar video2
                video1.style.display = 'block';
                video1.currentTime = 0;
                video1.pause(); // Asegúrate de que se mantenga pausado

                video2.style.display = 'none';
                video2.pause();
                video2.currentTime = 0;

                // Restablecer las banderas de reproducción
                video1HasPlayed = false;
                video2HasPlayed = false;
            }
        });
    }, {
        threshold: 0.5
    });

    observerSection1.observe(document.querySelector('.section_1'));
});

// scroll suave
document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('.section_container > section');
    let isScrolling = false; // Controla si se está realizando el desplazamiento
    let scrollTimeout; // Almacena el temporizador para evitar múltiples desplazamientos

    // Manejar el evento de scroll
    window.addEventListener('wheel', function(event) {
        if (isScrolling) return; // Si ya se está realizando el desplazamiento, salir

        clearTimeout(scrollTimeout); // Limpiar el temporizador si existe

        // Controlar el desplazamiento de una sección a la vez
        isScrolling = true;
        const delta = event.deltaY;
        let targetSectionIndex;

        // Determinar la dirección del desplazamiento
        if (delta > 0) { // Scroll hacia abajo
            targetSectionIndex = getCurrentSectionIndex() + 1;
        } else { // Scroll hacia arriba
            targetSectionIndex = getCurrentSectionIndex() - 1;
        }

        // Asegurarse de que el índice esté dentro del rango válido
        targetSectionIndex = Math.max(0, Math.min(targetSectionIndex, sections.length - 1));

        // Desplazarse a la sección objetivo
        scrollToSection(sections[targetSectionIndex]);

        // Esperar a que el desplazamiento esté completo antes de permitir otro
        scrollTimeout = setTimeout(() => {
            isScrolling = false;
        }, 800); // Ajusta el tiempo según la duración del desplazamiento suave
    });

    // Función para desplazarse a una sección específica
    function scrollToSection(section) {
        window.scrollTo({
            top: section.offsetTop,
            behavior: 'smooth'
        });
    }

    // Obtener el índice de la sección actual visible
    function getCurrentSectionIndex() {
        const currentScrollY = window.scrollY;
        let index = 0;

        sections.forEach((section, i) => {
            if (section.offsetTop <= currentScrollY + window.innerHeight / 2) {
                index = i;
            }
        });

        return index;
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');

    // Mostrar el botón cuando se hace scroll hacia abajo
    window.addEventListener('scroll', function() {
        if (window.scrollY > 0) { // Si se ha hecho scroll hacia abajo
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
    });

    // Función para desplazarse hacia arriba al hacer clic en el botón
    scrollToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Desplazamiento suave
        });
    });
});
