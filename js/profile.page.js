// js/profile.page.js
import { db } from "./firebase.js";
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
  const infoEl = document.getElementById("profileInfo");
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

  loadProfile(username);

  async function loadProfile(username) {
    console.log("GRID YUKLENIYOR");
      const grid = document.getElementById("grid");
      if (!grid) return;
    
    //   const user = auth.currentUser;
    //   if (!user) return; // Güvenlik
    
    
      // Eski kutuları temizle
      grid.innerHTML = "";
    
      const albumsRef = collection(db, "users", username, "albums");
      const snap = await getDocs(albumsRef);
    
      snap.forEach((docSnap) => {
        const album = docSnap.data();
        if (!album.album) return; // güvenlik için
    
        // BOX
        const box = document.createElement("div");
        box.classList.add("box");
    
        // data-* attribute'lar (olanları doldur, olmayanları boş geç)
        box.dataset.country = album.country || "";
        box.dataset.score = album.score ?? "";  // puan alanı varsa
        box.dataset.year = album.releaseYear ?? "";
        box.dataset.genre = album.genre || "";
        box.dataset.duration = album.duration ?? "";
        box.dataset.id = docSnap.id; // doc id, istersen kullanırsın
    
        // GÖRSEL
        const photoDiv = document.createElement("div");
        photoDiv.classList.add("photo");
    
        const img = document.createElement("img");
        img.src = album.image;
        img.alt = album.album;
    
        const scoreSpan = document.createElement("span");
        scoreSpan.classList.add("score");
        scoreSpan.textContent = album.score ?? ""; // yoksa boş
    
        photoDiv.appendChild(img);
        photoDiv.appendChild(scoreSpan);
    
        // ALBUM – ARTIST
        const albumDiv = document.createElement("div");
        albumDiv.classList.add("album");
        albumDiv.textContent = album.album;
    
        const artistDiv = document.createElement("div");
        artistDiv.classList.add("artist");
        artistDiv.textContent = album.artist;
    
        // Kutuyu oluştur
        box.appendChild(photoDiv);
        box.appendChild(albumDiv);
        box.appendChild(artistDiv);
    
        // Renk hesaplama (score'a göre)
        const scoreInt = parseInt(scoreSpan.textContent);
        if (isNaN(scoreInt)) {
          photoDiv.style.setProperty(
            "--overlay-color",
            `rgba(0, 0, 0, 0.8)`
          );
        } else {
          const r = Math.round(255 * (100 - scoreInt) / 100);
          const g = Math.round(255 * scoreInt / 100);
          photoDiv.style.setProperty(
            "--overlay-color",
            `rgba(${r}, ${g}, 0, 0.8)`
          );
        }
    
        // Grid'e ekle
        grid.appendChild(box);
    
});
  }
});