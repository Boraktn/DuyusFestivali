document.addEventListener("DOMContentLoaded", () => {
   //NAVBAR BÜTÜN SAYFALARA PARTIALS/NAVBAR.HTML DOSYASINDAN EKLENİYOR.
  const target = document.getElementById("navbar");
  if (!target) return;

  fetch("partials/navbar.html")
    .then(res => res.text())
    .then(html => {
      target.innerHTML = html;
    })
    .catch(err => console.error("Navbar yüklenemedi:", err));
});
