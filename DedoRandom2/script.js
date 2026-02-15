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
  ctx.fillStyle = backgroundWhite ? "white" : "#0a0a0a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const source = rouletteStarted ? frozenTouches : liveTouches;

  for (let id in source) {
    let t = source[id];

    ctx.beginPath();
    ctx.arc(t.x, t.y, 65, 0, Math.PI * 2);
    ctx.lineWidth = 4;

    if (gameFinished) {
      ctx.strokeStyle = "#111";
      if (t.winner) {
        ctx.fillStyle = "#111";
        ctx.fill();
      } else {
        ctx.stroke();
      }

    } else if (rouletteStarted) {

      if (t.winner) {
        // ✨ glow suave moderno
        ctx.shadowColor = "white";
        ctx.shadowBlur = 25;

        ctx.fillStyle = "white";
        ctx.fill();

        ctx.shadowBlur = 0;
      } else {
        ctx.strokeStyle = "rgba(255,255,255,0.5)";
        ctx.stroke();
      }

    } else {
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.stroke();
    }
  }
}



//
// CONTADOR
//

function startCountdown() {
  countdownStarted = true;

  let duration = 5000;
  let startTime = null;

  function animate(timestamp) {
    if (!startTime) startTime = timestamp;

    let elapsed = timestamp - startTime;
    let remaining = Math.max(0, duration - elapsed);
    let seconds = Math.ceil(remaining / 1000);

    let progress = (elapsed % 1000) / 1000;

    draw();

    // efecto escala
    let scale = 1 + progress * 0.4;
    let opacity = 1 - progress;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(scale, scale);
    ctx.globalAlpha = opacity;

    ctx.fillStyle = "white";
    ctx.font = "bold 140px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(seconds, 0, 0);

    ctx.restore();

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

  let duration = 7000;
  let startTime = null;

  // 🎲 ganador real
  let winnerIndex = Math.floor(Math.random() * keys.length);

  // 🎲 vueltas completas variables (cambia percepción)
  let extraRounds = 7 + Math.floor(Math.random() * 5);
  let totalSteps = keys.length * extraRounds + winnerIndex;

  // 🎲 fuerza de desaceleración variable
  // (más alto = frena más al final)
  let decelerationPower = 2.5 + Math.random() * 2; 
  // entre 2.5 y 4.5

  function spin(timestamp) {
    if (!startTime) startTime = timestamp;

    let elapsed = timestamp - startTime;
    let progress = Math.min(elapsed / duration, 1);

    // 🔥 única curva continua (nunca acelera)
    let eased = 1 - Math.pow(1 - progress, decelerationPower);

    let currentStep = Math.floor(eased * totalSteps);
    let currentIndex = currentStep % keys.length;

    keys.forEach(k => frozenTouches[k].winner = false);
    frozenTouches[keys[currentIndex]].winner = true;

    draw();

    if (progress < 1) {
      requestAnimationFrame(spin);
    } else {
      // 🔥 forzar frame final exacto
      keys.forEach(k => frozenTouches[k].winner = false);
      frozenTouches[keys[winnerIndex]].winner = true;
      draw();

      setTimeout(() => {
        pulseWinner(keys[winnerIndex]);
      }, 250);

    }
  }

  requestAnimationFrame(spin);
}

function pulseWinner(key) {
  let winner = frozenTouches[key];
  let scale = 1;
  let growing = true;
  let frames = 0;

  function animate() {
    draw();

    ctx.save();
    ctx.translate(winner.x, winner.y);
    ctx.scale(scale, scale);

    ctx.beginPath();
    ctx.arc(0, 0, 65, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.shadowColor = "white";
    ctx.shadowBlur = 30;
    ctx.fill();

    ctx.restore();

    if (growing) {
      scale += 0.02;
      if (scale >= 1.12) growing = false;
    } else {
      scale -= 0.02;
    }

    frames++;

    if (frames < 20) {
      requestAnimationFrame(animate);
    } else {
      expandWhiteCircle(winner);
    }
  }

  animate();
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
  let startTime = null;
  let duration = 900;

  function animate(timestamp) {
    if (!startTime) startTime = timestamp;

    let progress = Math.min((timestamp - startTime) / duration, 1);
    let ease = 1 - Math.pow(1 - progress, 4);

    let maxRadius = Math.max(canvas.width, canvas.height) * 1.5;
    let radius = ease * maxRadius;

    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.arc(winner.x, winner.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      gameFinished = true;
      draw(true);
      showRestart();
    }
  }

  requestAnimationFrame(animate);
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





