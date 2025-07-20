const addBtn = document.getElementById("addBtn");
const subBtn = document.getElementById("subBtn");
const puntosDobles = document.getElementById("puntosDobles");

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