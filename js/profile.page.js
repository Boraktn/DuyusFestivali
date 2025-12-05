// js/profile.page.js
import { db } from "./firebase.js";
import { loadUserAlbumsGrid, setViewMode } from "./album.js";

import {
  doc,
  getDoc,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const username = params.get("u");

  const usernameEl = document.getElementById("profileUsername");
  const errorEl = document.getElementById("profileError");
  const grid = document.getElementById("grid");

  if (!grid) return;

  if (!username) {
    if (errorEl) {
      errorEl.textContent = "Kullanıcı adı belirtilmemiş.";
      errorEl.style.display = "block";
    }
    grid.innerHTML = "";
    return;
  }

  if (usernameEl) usernameEl.textContent = `@${username}`;
    setViewMode("grid", username);
  // Profil sayfası daima liste (wide) modda olsun:
  const gridViewBtn = document.getElementById("viewGrid");
    const wideViewBtn = document.getElementById("viewWide");

    if (gridViewBtn) {
        gridViewBtn.addEventListener("click", () => {
            setViewMode("grid",username);
        });
    }

    if (wideViewBtn) {
        wideViewBtn.addEventListener("click", () => {
            setViewMode("wide", username);
        });
    }
});
