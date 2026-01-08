// js/users.page.js
import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const PAGE_SIZE = 7;

let lastVisibleDoc = null;
let isLoading = false;

document.addEventListener("DOMContentLoaded", () => {
  const usersList = document.getElementById("usersList");
  const loadMoreBtn = document.getElementById("loadMoreUsers");

  // Bu sayfada değilse çık
  if (!usersList || !loadMoreBtn) return;

  async function loadUsersPage() {
    if (isLoading) return;
    isLoading = true;

    // İlk yüklemede "Yükleniyor..." yazısı
    if (!lastVisibleDoc) usersList.innerHTML = "Yükleniyor...";

    try {
      const usersRef = collection(db, "users");

      const q = lastVisibleDoc
        ? query(usersRef, orderBy("createdAt", "desc"), startAfter(lastVisibleDoc), limit(PAGE_SIZE))
        : query(usersRef, orderBy("createdAt", "desc"), limit(PAGE_SIZE));

      const snap = await getDocs(q);

      if (!lastVisibleDoc) {
        // ilk sayfada listeyi temizle
        usersList.innerHTML = "";
      }

      if (snap.empty && !lastVisibleDoc) {
        usersList.innerHTML = "<li>Henüz kullanıcı yok.</li>";
        loadMoreBtn.style.display = "none";
        isLoading = false;
        return;
      }

      snap.forEach((docSnap) => {
        const data = docSnap.data();
        const username = docSnap.id;
        const avatarUrl = data.avatar || "img/avatars/default.webp";

        const li = document.createElement("li");
        li.className = "user-card";
        li.innerHTML = `
          <div class="user-card-main">
            <img class="user-avatar" src="${avatarUrl}" alt="${username} profil fotoğrafı" />
            <span class="user-username">@${username}</span>
            <span class="user-albums">${data.albumCount ?? 0} albüm</span>
          </div>
          <a class="user-link" href="profile.html?u=${encodeURIComponent(username)}">
            Listeyi gör
          </a>
        `;
        usersList.appendChild(li);
      });

      // pagination state
      lastVisibleDoc = snap.docs[snap.docs.length - 1] || lastVisibleDoc;

      // 7 geldiyse "daha fazla" göster, daha az geldiyse bitmiştir
      loadMoreBtn.style.display = (snap.size === PAGE_SIZE) ? "block" : "none";
    } catch (err) {
      console.error("Kullanıcılar yüklenirken hata:", err);
      usersList.innerHTML = "<li>Bir hata oluştu, lütfen tekrar dene.</li>";
      loadMoreBtn.style.display = "none";
    } finally {
      isLoading = false;
    }
  }

  loadMoreBtn.addEventListener("click", loadUsersPage);
  loadUsersPage(); // ilk 7
});
