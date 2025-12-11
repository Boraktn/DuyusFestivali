// js/users.page.js
import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const usersList = document.getElementById("usersList");
  if (!usersList) return;

  loadUsers();

  async function loadUsers() {
    usersList.innerHTML = "Yükleniyor...";

    try {
      // createdAt'e göre sıralı kullanıcılar
      const usersRef = collection(db, "users");
      const q = query(usersRef, orderBy("createdAt", "desc"));
      const snap = await getDocs(q);

      if (snap.empty) {
        usersList.innerHTML = "<li>Henüz kullanıcı yok.</li>";
        return;
      }

      usersList.innerHTML = "";

      snap.forEach((docSnap) => {
        const data = docSnap.data();
        const username = docSnap.id;
        const avatarUrl = data.avatar || "img/avatars/default.webp";

        const li = document.createElement("li");
        li.className = "user-card";
        li.innerHTML = `
          <div class="user-card-main">
          <img
        class="user-avatar"
        src="${avatarUrl}"
        alt="${username} profil fotoğrafı"
      />
            <span class="user-username">@${username}</span>
            <span class="user-albums">
              ${data.albumCount ?? 0} albüm
            </span>
          </div>
          <a class="user-link" href="profile.html?u=${encodeURIComponent(username)}">
            Listeyi gör
          </a>
        `;

        usersList.appendChild(li);
      });
    } catch (err) {
      console.error("Kullanıcılar yüklenirken hata:", err);
      usersList.innerHTML = "<li>Bir hata oluştu, lütfen tekrar dene.</li>";
    }
  }
}
);
