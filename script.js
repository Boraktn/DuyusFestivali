const box = document.getElementById("popup");

let offsetX = 0, offsetY = 0;
let dragging = false;

function startDrag(x, y) {
  dragging = true;
  box.classList.add("dragging");
  offsetX = x - box.offsetLeft;
  offsetY = y - box.offsetTop;
}

function doDrag(x, y) {
  if (!dragging) return;
  box.style.left = x - offsetX + "px";
  box.style.top = y - offsetY + "px";
}

function endDrag() {
  dragging = false;
  box.classList.remove("dragging");
}

// Fare olayları
box.addEventListener("mousedown", (e) => startDrag(e.clientX, e.clientY));
document.addEventListener("mousemove", (e) => doDrag(e.clientX, e.clientY));
document.addEventListener("mouseup", endDrag);

// Dokunma olayları
box.addEventListener("touchstart", (e) => {
  const touch = e.touches[0];
  startDrag(touch.clientX, touch.clientY);
});
document.addEventListener("touchmove", (e) => {
  const touch = e.touches[0];
  doDrag(touch.clientX, touch.clientY);
});
document.addEventListener("touchend", endDrag);

document.querySelectorAll('.box').forEach(box => {
  const scoreEl = box.querySelector('.score');
  const overlay = box.querySelector('.photo');
  console.log(scoreEl.textContent);
  let score = parseInt(scoreEl.textContent);

  let r = Math.round(255 * (100 - score) / 100);
  let g = Math.round(255 * score / 100);

  overlay.style.setProperty('--overlay-color', `rgba(${r}, ${g}, 0, 0.8)`);
});