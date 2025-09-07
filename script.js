document.querySelectorAll('.box').forEach(box => {
  const scoreEl = box.querySelector('.score');
  const overlay = box.querySelector('.photo');

  let score = parseInt(scoreEl.textContent); // 0 - 100

  // R ve G değerlerini hesapla
  let r = Math.round(255 * (100 - score) / 100);
  let g = Math.round(255 * score / 100);

  // overlay renk stilini uygula
  overlay.style.setProperty('--overlay-color', `rgba(${r}, ${g}, 0, 0.8)`);
});