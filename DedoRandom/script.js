let winnersCount = 1;

let liveTouches = {};
let frozenTouches = {};

let rouletteStarted = false;
let gameFinished = false;
let countdownStarted = false;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const waitingText = document.getElementById("waiting");
const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");
const restartBtn = document.getElementById("restartBtn");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  draw();
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

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
// DETECCIÓN (POINTER EVENTS)
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

  if (!countdownStarted) {
    countdownStarted = true;
    startCountdown();
  }
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
      ctx.strokeStyle = "black";
      if (t.winner) {
        ctx.fillStyle = "black";
        ctx.fill();
      } else {
        ctx.stroke();
      }
    } else {
      ctx.strokeStyle = "white";
      if (t.winner) {
        ctx.fillStyle = "white";
        ctx.fill();
      } else {
        ctx.stroke();
      }
    }
  }
}

//
// CUENTA REGRESIVA
//

function startCountdown() {
  let count = 5;

  let interval = setInterval(() => {
    count--;
    if (count <= 0) {
      clearInterval(interval);
      freezePlayers();
      startRoulette();
    }
  }, 1000);
}

function freezePlayers() {
  frozenTouches = JSON.parse(JSON.stringify(liveTouches));
  rouletteStarted = true;
}

//
// RULETA
//

function startRoulette() {
  let keys = Object.keys(frozenTouches);
  if (keys.length === 0) return;

  let index = 0;
  let speed = 80;

  function spin() {
    keys.forEach(k => frozenTouches[k].winner = false);

    frozenTouches[keys[index]].winner = true;
    draw();

    index = (index + 1) % keys.length;
    speed += 30;

    if (speed < 600) {
      setTimeout(spin, speed);
    } else {
      chooseWinner(keys[index]);
    }
  }

  spin();
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

function showRestart() {
  setTimeout(() => {
    restartBtn.style.display = "block";
  }, 3000);
}

restartBtn.addEventListener("click", () => location.reload());
