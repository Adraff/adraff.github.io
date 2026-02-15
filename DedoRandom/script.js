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

  let duration = 2500; // duración total en ms
  let startTime = null;
  let index = 0;

  function spin(timestamp) {
    if (!startTime) startTime = timestamp;

    let elapsed = timestamp - startTime;
    let progress = elapsed / duration;

    // easing de desaceleración suave
    let easeOut = 1 - Math.pow(1 - progress, 3);

    // velocidad inicial alta que baja progresivamente
    let speedFactor = Math.floor(easeOut * keys.length * 20);

    index = speedFactor % keys.length;

    keys.forEach(k => frozenTouches[k].winner = false);
    frozenTouches[keys[index]].winner = true;

    draw();

    if (progress < 1) {
      requestAnimationFrame(spin);
    } else {
      chooseWinner(keys[index]);
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


