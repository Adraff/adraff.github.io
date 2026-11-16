const addBtn = document.getElementById("addBtn");
const subBtn = document.getElementById("subBtn");

const addBtnBajos = document.getElementById("addBtnBajos");
const subBtnBajos = document.getElementById("subBtnBajos");

const addBtnAumentos = document.getElementById("addBtnAumentos");
const subBtnAumentos = document.getElementById("subBtnAumentos");

const puntosDobles = document.getElementById("puntosDobles");

const puntosBajos = document.getElementById("puntosBajos");

const puntosAumentos = document.getElementById("puntosAumentos");

addBtn.addEventListener("click", () => {
    let numero = parseInt(puntosDobles.textContent);

    numero++;

    puntosDobles.textContent = numero;

    

});

subBtn.addEventListener("click", () => {
    let numero = parseInt(puntosDobles.textContent);

    if (numero > 0) {
        numero--;
        puntosDobles.textContent = numero;
    }


    
});

//--------------------------------------------------

addBtnBajos.addEventListener("click", () => {
    let numero = parseInt(puntosBajos.textContent);

    numero++;

    puntosBajos.textContent = numero;

    

});

subBtnBajos.addEventListener("click", () => {
    let numero = parseInt(puntosBajos.textContent);

    if (numero > 0) {
        numero--;
        puntosBajos.textContent = numero;
    }

    

});

//------------------------------------------------------

addBtnAumentos.addEventListener("click", () => {
    let numero = parseInt(puntosAumentos.textContent);

    numero++;

    puntosAumentos.textContent = numero;

    

});

subBtnAumentos.addEventListener("click", () => {
    let numero = parseInt(puntosAumentos.textContent);

    if (numero > 0) {
    numero--;
    puntosAumentos.textContent = numero;
    }

    

});
