document.addEventListener("DOMContentLoaded", async () => {
  //FOOTER BÜTÜN SAYFALARA PARTIALS/FOOTER.HTML DOSYASINDAN EKLENİYOR.
  const placeholder = document.getElementById("footer");
  if (!placeholder) return;

  try {
    const res = await fetch("partials/footer.html");
    const html = await res.text();
    placeholder.innerHTML = html;
    
  } catch (err) {
    console.error("Footer yüklenemedi:", err);
  }
});
