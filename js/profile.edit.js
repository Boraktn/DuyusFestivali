// js/profile-edit.js
import { auth, db } from "./firebase.js";
import { doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const AVATARS = [
  "img/avatars/default.webp",
  "img/avatars/1.webp",
  "img/avatars/2.webp",
  "img/avatars/3.webp",
  "img/avatars/4.webp"
];

document.addEventListener("DOMContentLoaded", () => {
  const editBtn = document.getElementById("editProfileBtn");   // biyografi edit butonu
  const modal = document.getElementById("profileEditModal");
  const avatarGrid = document.getElementById("avatarGrid");
  const bioTextarea = document.getElementById("bioInput");
  const saveBtn = document.getElementById("saveProfileBtn");
  const closeBtn = document.getElementById("closeProfileModal");

  let selectedAvatar = null;

  if (!editBtn || !modal) return;

  // Avatarları modala çiz
  AVATARS.forEach((src) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "avatar-option";
    btn.innerHTML = `<img src="${src}" alt="Avatar" />`;
    btn.addEventListener("click", () => {
      // seçili class güncelle
      document
        .querySelectorAll(".avatar-option")
        .forEach((b) => b.classList.remove("avatar-option--selected"));
      btn.classList.add("avatar-option--selected");
      selectedAvatar = src;
    });
    avatarGrid.appendChild(btn);
  });

  // Modal açılırken mevcut bilgileri yükle
  editBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user || !user.displayName) return;

    const userRef = doc(db, "users", user.displayName);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const data = snap.data();
      bioTextarea.value = data.bio || "";
      selectedAvatar = data.avatar || null;

      // mevcut avatarı işaretle
      if (selectedAvatar) {
        document
          .querySelectorAll(".avatar-option")
          .forEach((b) => {
            const img = b.querySelector("img");
            if (img && img.src.includes(selectedAvatar)) {
              b.classList.add("avatar-option--selected");
            } else {
              b.classList.remove("avatar-option--selected");
            }
          });
      }
    }

    modal.classList.add("profile-edit-modal--open");
  });

  // Kaydet
  saveBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user || !user.displayName) return;

    const userRef = doc(db, "users", user.displayName);

    await setDoc(
      userRef,
      {
        bio: bioTextarea.value.trim(),
        avatar: selectedAvatar || null
      },
      { merge: true }
    );

    // Profil sayfasındaki avatar ve bio’yu güncelle
    const avatarEl = document.getElementById("avatar");
    const bioViewEl = document.getElementById("profileBio");
    if (avatarEl && selectedAvatar) {
      avatarEl.innerHTML = `<img src="${selectedAvatar}" alt="Avatar" />`;
    }
    if (bioViewEl) {
      bioViewEl.textContent = bioTextarea.value.trim();
    }

    modal.classList.remove("profile-edit-modal--open");
  });

  closeBtn.addEventListener("click", () => {
    modal.classList.remove("profile-edit-modal--open");
  });
});
