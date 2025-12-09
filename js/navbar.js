import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  // NAVBAR BÜTÜN SAYFALARA PARTIALS/NAVBAR.HTML DOSYASINDAN EKLENİYOR.
  const target = document.getElementById("navbar");
  if (!target) return;

  fetch("partials/navbar.html")
    .then(res => res.text())
    .then(html => {
      target.innerHTML = html;

      // → navbar.html DOM'a eklendikten SONRA id'yi al
      const navActions = document.getElementById("navActions");
      const profileLink = document.getElementById("profile-btn");
      if (!navActions || !profileLink) {
        return;
      }

      onAuthStateChanged(auth, (user) => {
        navActions.innerHTML = "";

        if (user) {
          // PROFİL linki görünür
          profileLink.style.display = "inline-block";

          // Çıkış butonu
          const logoutBtn = document.createElement("button");
          logoutBtn.className = "nav-btn";
          logoutBtn.textContent = "Çıkış Yap";
          logoutBtn.onclick = async () => {
            await signOut(auth);
            window.location.href = "index.html";
          };
          navActions.appendChild(logoutBtn);

        } else {
          // PROFİL linki gizlenir
          profileLink.style.display = "none";

          // Giriş yap butonu sağda gösterilir
          const loginBtn = document.createElement("button");
          loginBtn.className = "nav-btn";
          loginBtn.textContent = "Giriş Yap";
          loginBtn.onclick = () => {
            window.location.href = "login.html";
          };
          navActions.appendChild(loginBtn);
        }
      });
    })
    .catch(err => console.error("Navbar yüklenemedi:", err));
});
