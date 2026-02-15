let winnersCount = 1;

let liveTouches = {};
let frozenTouches = {};

let countdownStarted = false;
let rouletteStarted = false;
let gameFinished = false;

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

const waitingText = document.getElementById("waiting");
const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");
const restartBtn = document.getElementById("restartBtn");

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  draw();
}

//
// MENÚ
//

menuBtn.addEventListener("click", () => {
  menu.style.display = menu.style.display === "block" ? "none" : "block";
});

function setWinners(n) {
  winnersCount = n;
  menu.style.display = "none";
}

function customWinners() {
  let n = prompt("Ingrese número de ganadores:");
  winnersCount = parseInt(n) || 1;
  menu.style.display = "none";
}

//
// POINTER EVENTS
//

canvas.addEventListener("pointerdown", (e) => {
  if (rouletteStarted) return;

  waitingText.style.display = "none";
  menuBtn.style.display = "none";
  menu.style.display = "none";

  liveTouches[e.pointerId] = {
    x: e.clientX,
    y: e.clientY,
    winner: false
  };

  draw();

  if (!countdownStarted) startCountdown();
});

canvas.addEventListener("pointermove", (e) => {
  if (rouletteStarted) return;

  if (liveTouches[e.pointerId]) {
    liveTouches[e.pointerId].x = e.clientX;
    liveTouches[e.pointerId].y = e.clientY;
    draw();
  }
});

canvas.addEventListener("pointerup", (e) => {
  if (rouletteStarted) return;

  delete liveTouches[e.pointerId];
  draw();
});

//
// DIBUJO
//

function draw(backgroundWhite = false) {
  ctx.fillStyle = backgroundWhite ? "white" : "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const source = rouletteStarted ? frozenTouches : liveTouches;

  for (let id in source) {
    let t = source[id];

    ctx.beginPath();
    ctx.arc(t.x, t.y, 70, 0, Math.PI * 2);
    ctx.lineWidth = 6;

    if (gameFinished) {
      // ESTADO FINAL (invertido)
      ctx.strokeStyle = "black";
      if (t.winner) {
        ctx.fillStyle = "black";
        ctx.fill();
      } else {
        ctx.stroke();
      }

    } else if (rouletteStarted) {
      // 🔥 DURANTE RULETA (ahora sí se ve)
      ctx.strokeStyle = "white";
      if (t.winner) {
        ctx.fillStyle = "white";
        ctx.fill();
      } else {
        ctx.stroke();
      }

    } else {
      // ANTES DE RULETA
      ctx.strokeStyle = "white";
      ctx.stroke();
    }
  }
}


//
// CONTADOR
//

function startCountdown() {
  countdownStarted = true;

  let duration = 5000; // 5 segundos
  let startTime = null;

  function animate(timestamp) {
    if (!startTime) startTime = timestamp;

    let elapsed = timestamp - startTime;
    let remaining = Math.max(0, duration - elapsed);
    let seconds = Math.ceil(remaining / 1000);

    draw();

    ctx.fillStyle = "white";
    ctx.font = "bold 140px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(seconds, canvas.width / 2, canvas.height / 2);

    if (remaining > 0) {
      requestAnimationFrame(animate);
    } else {
      freezePlayers();
      startRoulette();
    }
  }

  requestAnimationFrame(animate);
}

function freezePlayers() {
  rouletteStarted = true;
  frozenTouches = JSON.parse(JSON.stringify(liveTouches));
}

//
// RULETA
//

function startRoulette() {
  let keys = Object.keys(frozenTouches);
  if (keys.length === 0) return;

  let duration = 7000; // duración fija real
  let startTime = null;

  // 🎲 ganador real
  let winnerIndex = Math.floor(Math.random() * keys.length);

  // 🎲 vueltas variables (esto cambia la percepción)
  let extraRounds = 6 + Math.floor(Math.random() * 6); 
  // entre 6 y 11 vueltas completas

  let totalSteps = keys.length * extraRounds + winnerIndex;

  // 🎲 punto donde empieza a desacelerar fuerte
  let slowPoint = 0.5 + Math.random() * 0.3; 
  // entre 50% y 80% del tiempo

  function spin(timestamp) {
    if (!startTime) startTime = timestamp;

    let elapsed = timestamp - startTime;
    let progress = Math.min(elapsed / duration, 1);

    let adjustedProgress;

    if (progress < slowPoint) {
      // fase rápida casi lineal
      adjustedProgress = progress / slowPoint * 0.7;
    } else {
      // fase lenta fuerte easing
      let slowProgress = (progress - slowPoint) / (1 - slowPoint);
      adjustedProgress = 0.7 + (1 - Math.pow(1 - slowProgress, 4)) * 0.3;
    }

    let currentStep = Math.floor(adjustedProgress * totalSteps);
    let currentIndex = currentStep % keys.length;

    keys.forEach(k => frozenTouches[k].winner = false);
    frozenTouches[keys[currentIndex]].winner = true;

    draw();

    if (progress < 1) {
      requestAnimationFrame(spin);
    } else {
      // 🔥 FORZAMOS que el último frame sea exactamente el ganador
      keys.forEach(k => frozenTouches[k].winner = false);
      frozenTouches[keys[winnerIndex]].winner = true;
      draw();

      // pequeña pausa dramática antes de expandir
      setTimeout(() => {
        chooseWinner(keys[winnerIndex]);
      }, 300);
    }
  }

  requestAnimationFrame(spin);
}




//
// FINAL
//

function chooseWinner(winnerKey) {
  Object.keys(frozenTouches).forEach(k => {
    frozenTouches[k].winner = (k === winnerKey);
  });

  expandWhiteCircle(frozenTouches[winnerKey]);
}

function expandWhiteCircle(winner) {
  let radius = 0;
  let maxRadius = Math.max(canvas.width, canvas.height) * 1.5;

  function animate() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.arc(winner.x, winner.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();

    radius += 40;

    if (radius < maxRadius) {
      requestAnimationFrame(animate);
    } else {
      gameFinished = true;
      draw(true);
      showRestart();
    }
  }

  animate();
}

//
// REINICIAR
//

function showRestart() {
  setTimeout(() => {
    restartBtn.style.display = "block";
  }, 3000);
}

restartBtn.addEventListener("click", () => location.reload());





