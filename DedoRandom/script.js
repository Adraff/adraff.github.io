let winnersCount = 1;
let touches = {};
let started = false;
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let countdownEl;

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

// ==========================
// DETECCIÓN DE DEDOS CORRECTA
// ==========================

canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();

  for (let touch of e.changedTouches) {
    touches[touch.identifier] = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
      active: false
    };
  }

  draw();

  if (!started) {
    started = true;
    startCountdown();
  }
});

canvas.addEventListener("touchmove", (e) => {
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
  for (let touch of e.changedTouches) {
    delete touches[touch.identifier];
  }

  draw();
});

// ==========================
// DIBUJO CORRECTO
// ==========================

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let id in touches) {
    let t = touches[id];

    ctx.beginPath();
    ctx.arc(t.x, t.y, 70, 0, Math.PI * 2); // MAS GRANDE
    ctx.lineWidth = 6;

    if (t.active) {
      ctx.fillStyle = "white";
      ctx.fill();
    } else {
      ctx.strokeStyle = "white";
      ctx.stroke();
    }
  }
}

// ==========================
// CUENTA REGRESIVA
// ==========================

function startCountdown() {
  let count = 5;

  countdownEl = document.createElement("div");
  countdownEl.style.position = "absolute";
  countdownEl.style.top = "50%";
  countdownEl.style.left = "50%";
  countdownEl.style.transform = "translate(-50%, -50%)";
  countdownEl.style.fontSize = "120px";
  countdownEl.style.fontWeight = "bold";
  countdownEl.style.color = "white";
  document.body.appendChild(countdownEl);

  let interval = setInterval(() => {
    countdownEl.textContent = count;
    count--;

    if (count < 0) {
      clearInterval(interval);
      countdownEl.remove();
      startRoulette();
    }
  }, 1000);
}

// ==========================
// RULETA REAL CON DESACELERACIÓN
// ==========================

function startRoulette() {
  let keys = Object.keys(touches);

  if (keys.length === 0) return;

  let index = 0;
  let speed = 80;

  function spin() {
    keys.forEach(k => touches[k].active = false);

    touches[keys[index]].active = true;
    draw();

    index = (index + 1) % keys.length;

    speed += 15; // desacelera

    if (speed < 500) {
      setTimeout(spin, speed);
    } else {
      chooseWinner(keys);
    }
  }

  spin();
}

// ==========================
// ELECCIÓN FINAL
// ==========================

function chooseWinner(keys) {
  keys.forEach(k => touches[k].active = false);

  let shuffled = keys.sort(() => 0.5 - Math.random());
  let winners = shuffled.slice(0, winnersCount);

  winners.forEach(k => touches[k].active = true);

  draw();

  navigator.vibrate && navigator.vibrate([200, 100, 200]);
}
