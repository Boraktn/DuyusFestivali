// (opsiyonel) Notlara hafif "float" animasyonu (çok sakin)
document.querySelectorAll(".hero .note").forEach((el, i) => {
  el.style.animation = `floatNote ${3.6 + i * 0.25}s ease-in-out ${i * 0.08}s infinite alternate`;
});

const style = document.createElement("style");
style.textContent = `
@keyframes floatNote {
  from { transform: translateY(0px) rotate(var(--r, 0deg)); }
  to   { transform: translateY(-10px) rotate(var(--r, 0deg)); }
}
`;
document.head.appendChild(style);

// her notanın mevcut rotasyonunu kaybetmemek için data'dan okuyoruz:
document.querySelectorAll(".note").forEach((el) => {
  // computed transform'dan açı okumak yerine: class'taki rotate değerini korumak daha kolay
  // pratik çözüm: elemente CSS custom prop ver
});
