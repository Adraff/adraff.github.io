let winnersCount = 1;

let liveTouches = {};      // antes de congelar
let frozenTouches = {};    // después de congelar

let gameStarted = false;
let rouletteStarted = false;
let gameFinished = false;

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  draw();
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

//
// DETECCIÓN DE DEDOS (solo antes de congelar)
//

canvas.addEventListener("touchstart", (e) => {
  if (rouletteStarted) return;

  e.preventDefault();
  const rect = canvas.getBoundingClientRect();

  for (let touch of e.changedTouches) {
    liveTouches[touch.identifier] = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
      winner: false,
      pulse: 0
    };
  }

  draw();

  if (!gameStarted) {
    gameStarted = true;
    startCountdown();
  }
});

canvas.addEventListener("touchmove", (e) => {
  if (rouletteStarted) return;

  const rect = canvas.getBoundingClientRect();

  for (let touch of e.changedTouches) {
    if (liveTouches[touch.identifier]) {
      liveTouches[touch.identifier].x = touch.clientX - rect.left;
      liveTouches[touch.identifier].y = touch.clientY - rect.top;
    }
  }

  draw();
});

canvas.addEventListener("touchend", (e) => {
  if (rouletteStarted) return;

  for (let touch of e.changedTouches) {
    delete liveTouches[touch.identifier];
  }

  draw();
});

//
// DIBUJO
//

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const source = rouletteStarted ? frozenTouches : liveTouches;

  for (let id in source) {
    let t = source[id];

    ctx.beginPath();
    ctx.arc(t.x, t.y, 70 + (t.pulse || 0), 0, Math.PI * 2);
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

//
// CUENTA REGRESIVA
//

function startCountdown() {
  let count = 5;

  let el = document.createElement("div");
  el.style.position = "absolute";
  el.style.top = "50%";
  el.style.left = "50%";
  el.style.transform = "translate(-50%, -50%)";
  el.style.fontSize = "120px";
  el.style.fontWeight = "bold";
  el.style.color = "white";
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

//
// CONGELAR JUGADORES
//

function freezePlayers() {
  frozenTouches = JSON.parse(JSON.stringify(liveTouches));
  rouletteStarted = true;
}

//
// RULETA CON DESACELERACIÓN
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
    speed += 25;

    if (speed < 600) {
      setTimeout(spin, speed);
    } else {
      chooseWinner(keys);
    }
  }

  spin();
}

//
// ELECCIÓN FINAL
//

function chooseWinner(keys) {
  keys.forEach(k => frozenTouches[k].winner = false);

  let shuffled = [...keys].sort(() => 0.5 - Math.random());
  let winners = shuffled.slice(0, winnersCount);

  winners.forEach(k => frozenTouches[k].winner = true);

  animateWinner(winners);
  navigator.vibrate && navigator.vibrate([200, 100, 200]);
}

//
// ANIMACIÓN GANADOR
//

function animateWinner(winners) {
  let frame = 0;
  gameFinished = false;

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

//
// TEXTO GANADOR
//

function showWinnerText() {
  let el = document.createElement("div");
  el.textContent = "GANADOR";
  el.style.position = "absolute";
  el.style.top = "20%";
  el.style.left = "50%";
  el.style.transform = "translateX(-50%)";
  el.style.fontSize = "40px";
  el.style.fontWeight = "bold";
  el.style.color = "white";
  document.body.appendChild(el);
}

//
// BOTÓN REINICIAR
//

function showRestartButton() {
  setTimeout(() => {
    let btn = document.createElement("button");
    btn.textContent = "Reiniciar";
    btn.style.position = "absolute";
    btn.style.bottom = "40px";
    btn.style.left = "50%";
    btn.style.transform = "translateX(-50%)";
    btn.style.padding = "15px 30px";
    btn.style.fontSize = "18px";
    btn.style.borderRadius = "10px";
    btn.style.border = "none";
    btn.style.background = "white";
    btn.style.color = "black";
    btn.style.opacity = "0";
    btn.style.transition = "opacity 0.6s ease";

    btn.onclick = () => location.reload();

    document.body.appendChild(btn);

    setTimeout(() => {
      btn.style.opacity = "1";
    }, 50);

  }, 3000);
}
