let winnersCount = 1;
let touches = {};
let frozenTouches = {};
let started = false;
let gameFinished = false;

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function setWinners(n) {
  winnersCount = n;
  goToWaiting();
}

function customWinners() {
  let n = prompt("Ingrese número de ganadores:");
  winnersCount = parseInt(n) || 1;
  goToWaiting();
}

function goToWaiting() {
  document.getElementById("screen1").classList.remove("active");
  document.getElementById("screen2").classList.add("active");

  setTimeout(() => {
    document.getElementById("screen2").classList.remove("active");
    document.getElementById("game").classList.add("active");
  }, 1500);
}

// ============================
// DETECCIÓN (solo antes de congelar)
// ============================

canvas.addEventListener("touchstart", (e) => {
  if (started) return;

  e.preventDefault();
  const rect = canvas.getBoundingClientRect();

  for (let touch of e.changedTouches) {
    touches[touch.identifier] = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
      active: false,
      winner: false,
      pulse: 0
    };
  }

  draw();

  if (!started) {
    started = true;
    startCountdown();
  }
});

canvas.addEventListener("touchmove", (e) => {
  if (started) return;

  const rect = canvas.getBoundingClientRect();

  for (let touch of e.changedTouches) {
    if (touches[touch.identifier]) {
      touches[touch.identifier].x = touch.clientX - rect.left;
      touches[touch.identifier].y = touch.clientY - rect.top;
    }
  }

  draw();
});

canvas.addEventListener("touchend", (e) => {
  if (started) return;

  for (let touch of e.changedTouches) {
    delete touches[touch.identifier];
  }

  draw();
});

// ============================
// DIBUJO
// ============================

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let id in frozenTouches) {
    let t = frozenTouches[id];

    ctx.beginPath();
    ctx.arc(t.x, t.y, 70 + t.pulse, 0, Math.PI * 2);
    ctx.lineWidth = 6;

    if (t.winner) {
      ctx.fillStyle = "white";
      ctx.fill();
    } else {
      ctx.strokeStyle = "white";
      ctx.stroke();
    }
  }
}

// ============================
// CUENTA REGRESIVA
// ============================

function startCountdown() {
  let count = 5;

  let el = document.createElement("div");
  el.style.position = "absolute";
  el.style.top = "50%";
  el.style.left = "50%";
  el.style.transform = "translate(-50%, -50%)";
  el.style.fontSize = "120px";
  el.style.fontWeight = "bold";
  document.body.appendChild(el);

  let interval = setInterval(() => {
    el.textContent = count;
    count--;

    if (count < 0) {
      clearInterval(interval);
      el.remove();
      freezePlayers();
      startRoulette();
    }
  }, 1000);
}

// ============================
// CONGELAR JUGADORES
// ============================

function freezePlayers() {
  frozenTouches = JSON.parse(JSON.stringify(touches));
}

// ============================
// RULETA
// ============================

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
    speed += 20;

    if (speed < 500) {
      setTimeout(spin, speed);
    } else {
      chooseWinner(keys);
    }
  }

  spin();
}

// ============================
// ELECCIÓN FINAL
// ============================

function chooseWinner(keys) {
  keys.forEach(k => frozenTouches[k].winner = false);

  let shuffled = keys.sort(() => 0.5 - Math.random());
  let winners = shuffled.slice(0, winnersCount);

  winners.forEach(k => frozenTouches[k].winner = true);

  animateWinner(winners);
  navigator.vibrate && navigator.vibrate([200, 100, 200]);
}

// ============================
// ANIMACIÓN GANADOR
// ============================

function animateWinner(winners) {
  let frame = 0;

  function pulse() {
    frame += 0.1;

    winners.forEach(k => {
      frozenTouches[k].pulse = Math.sin(frame) * 10;
    });

    draw();

    if (!gameFinished) {
      requestAnimationFrame(pulse);
    }
  }

  pulse();

  showWinnerText();
  showRestartButton();
  gameFinished = true;
}

// ============================
// TEXTO GANADOR
// ============================

function showWinnerText() {
  let el = document.createElement("div");
  el.textContent = "GANADOR";
  el.style.position = "absolute";
  el.style.top = "20%";
  el.style.left = "50%";
  el.style.transform = "translateX(-50%)";
  el.style.fontSize = "40px";
  el.style.fontWeight = "bold";
  document.body.appendChild(el);
}

// ============================
// BOTÓN REINICIAR
// ============================

function showRestartButton() {
  setTimeout(() => {
    let btn = document.createElement("button");
    btn.id = "restartBtn";
    btn.textContent = "Reiniciar";
    btn.onclick = resetGame;

    document.body.appendChild(btn);

    setTimeout(() => {
      btn.style.opacity = "1";
    }, 50);
  }, 3000);
}

function resetGame() {
  location.reload();
}
