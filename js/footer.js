// js/footer.partial.js
document.addEventListener("DOMContentLoaded", async () => {
  const placeholder = document.getElementById("footer-placeholder");
  if (!placeholder) return;

  try {
    const res = await fetch("partials/footer.html");
    const html = await res.text();
    placeholder.innerHTML = html;

    const buttons = placeholder.querySelectorAll(".footer-btn");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.target;
        if (target === "about") {
          window.location.href = "about.html";          // Hakkında sayfan
        } else if (target === "duyus") {
          window.location.href = "legacy/index.html"; // Ana sayfada bölüm vs.
        }
      });
    });
  } catch (err) {
    console.error("Footer yüklenemedi:", err);
  }
});
