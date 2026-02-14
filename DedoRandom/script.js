let winnersCount = 1;
let touches = {};
let started = false;
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
  }, 2000);
}

// Detectar dedos
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();

  for (let touch of e.changedTouches) {
    touches[touch.identifier] = {
      x: touch.clientX,
      y: touch.clientY,
      active: false
    };
  }

  draw();
  
  if (!started) {
    started = true;
    setTimeout(startRoulette, 5000);
  }
});

canvas.addEventListener("touchmove", (e) => {
  for (let touch of e.changedTouches) {
    if (touches[touch.identifier]) {
      touches[touch.identifier].x = touch.clientX;
      touches[touch.identifier].y = touch.clientY;
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

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let id in touches) {
    let t = touches[id];
    ctx.beginPath();
    ctx.arc(t.x, t.y, 40, 0, Math.PI * 2);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 4;

    if (t.active) {
      ctx.fillStyle = "white";
      ctx.fill();
    } else {
      ctx.stroke();
    }
  }
}

function startRoulette() {
  let keys = Object.keys(touches);

  if (keys.length === 0) return;

  let interval = setInterval(() => {
    keys.forEach(k => touches[k].active = false);

    let random = keys[Math.floor(Math.random() * keys.length)];
    touches[random].active = true;

    draw();
  }, 100);

  setTimeout(() => {
    clearInterval(interval);

    keys.forEach(k => touches[k].active = false);

    let shuffled = keys.sort(() => 0.5 - Math.random());
    let winners = shuffled.slice(0, winnersCount);

    winners.forEach(k => touches[k].active = true);

    draw();
  }, 3000);
}
