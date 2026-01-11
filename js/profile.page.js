import { setViewMode, loadUserAlbumsGrid, handleSpotifyAlbumSubmit } from "./album.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { auth, db } from "./firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";


const DEFAULT_AVATAR = "img/avatars/default.webp";

async function loadProfileHeader(usernameToLoad) {
  const usernameEl = document.getElementById("profileUsername");
  const avatarEl = document.getElementById("avatar");
  const bioTextEl = document.getElementById("profileBio");

  if (usernameEl) usernameEl.textContent = usernameToLoad;

  const userRef = doc(db, "users", usernameToLoad);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    const data = snap.data();

    const avatarSrc = data.avatar || DEFAULT_AVATAR;
    if (avatarEl) {
      avatarEl.innerHTML = `<img src="${avatarSrc}" alt="Avatar" />`;
    }
    if (bioTextEl) {
      bioTextEl.textContent = data.bio || "";
    }
  }
}
const toggleScoresBtn = document.getElementById("toggleScores");

if (toggleScoresBtn) {
  toggleScoresBtn.addEventListener("click", () => {
    const isActive = document.body.classList.toggle("show-scores");
    toggleScoresBtn.classList.toggle("active", isActive);
  });
}
function disableToggleScores() {
  if (!toggleScoresBtn) return;

  // aktifse kapat
  document.body.classList.remove("show-scores");
  toggleScoresBtn.classList.remove("active");

  // pasifleştir
  toggleScoresBtn.classList.add("is-disabled");
  toggleScoresBtn.disabled = true;
}
function enableToggleScores() {
  if (!toggleScoresBtn) return;

  toggleScoresBtn.classList.remove("is-disabled");
  toggleScoresBtn.disabled = false;
}

let targetUsername;
document.addEventListener("DOMContentLoaded", () => {
  //HERHANGİ BİR KULLANICININ PROFİLİNE GÖZ ATMAK İÇİN 
  // U PARAMETRESİNDE KULLANICI ADIYLA BİRLİKTE PROFILE.HTML SAYFASINA YÖNLENDİRİLİR.
  const params = new URLSearchParams(window.location.search);
  targetUsername = params.get("u");


  const grid = document.getElementById("grid");
  if (!grid) return;

  const openAddAlbumBtn = document.getElementById("openAddAlbumModal");
  const albumAddModal = document.getElementById("albumAddModal");
  const albumAddClose = document.getElementById("albumAddClose");
  const albumAddCancel = document.getElementById("albumAddCancel");
  const albumAddForm = document.getElementById("albumAddForm");
  const albumAddInput = document.getElementById("albumAddInput");

  const viewGridBtn = document.getElementById("viewGrid");
  const viewWideBtn = document.getElementById("viewWide");

  function openAddModal() {
    if (!albumAddModal) return;
    albumAddModal.classList.remove("album-edit-modal--hidden");
    if (albumAddInput) albumAddInput.focus();
  }

  function closeAddModal() {
    if (!albumAddModal) return;
    albumAddModal.classList.add("album-edit-modal--hidden");
    if (albumAddForm) albumAddForm.reset();
  }

  if (openAddAlbumBtn) {
    openAddAlbumBtn.addEventListener("click", openAddModal);
  }
  if (albumAddClose) {
    albumAddClose.addEventListener("click", closeAddModal);
  }
  if (albumAddCancel) {
    albumAddCancel.addEventListener("click", closeAddModal);
  }
  if (albumAddModal) {
    albumAddModal.addEventListener("click", (e) => {
      if (e.target === albumAddModal) closeAddModal();
    });
  }

  if (albumAddForm && albumAddInput) {
    albumAddForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const url = albumAddInput.value;
      await handleSpotifyAlbumSubmit(url);
      closeAddModal();
    });
  }

  function setActiveViewButton(mode) {
    if (!viewGridBtn || !viewWideBtn) return;

    if (mode === "grid") {
      viewGridBtn.classList.add("is-active");
      viewWideBtn.classList.remove("is-active");
    } else if (mode === "wide") {
      viewWideBtn.classList.add("is-active");
      viewGridBtn.classList.remove("is-active");

    }
  }
  if (viewGridBtn) {
    viewGridBtn.addEventListener("click", () => {
      setViewMode("grid", targetUsername);
      setActiveViewButton("grid");
      enableToggleScores();
    });
  }

  if (viewWideBtn) {
    viewWideBtn.addEventListener("click", () => {
      setViewMode("wide", targetUsername);
      setActiveViewButton("wide");
      disableToggleScores();
    });
  }



});

onAuthStateChanged(auth, async (user) => {
  const currentUsername = user?.displayName || null;
  const isSelf = currentUsername && targetUsername === currentUsername;

  const openAddAlbumBtn = document.getElementById("openAddAlbumModal");
  if (openAddAlbumBtn) {
    openAddAlbumBtn.style.display = isSelf ? "inline-flex" : "none";
  }
  const editProfileBtn = document.getElementById("editProfileBtn");
  if (editProfileBtn) {
    editProfileBtn.style.display = isSelf ? "inline-flex" : "none";
  }

  // Profil kimin profiliyse onu yükle
  const usernameToLoad = targetUsername || currentUsername;
  if (!usernameToLoad) {
    window.location.href = "login.html";
    return;
  }

  await loadProfileHeader(usernameToLoad);

  if (targetUsername) {
    loadUserAlbumsGrid(targetUsername);
  } else {
    loadUserAlbumsGrid();
  }
});
const downloadBtn = document.getElementById("downloadGridBtn");

downloadBtn?.addEventListener("click", async () => {
  const gridEl = document.getElementById("grid"); // ✅ profil sayfasındaki gerçek grid
  if (!gridEl || gridEl.children.length === 0) {
    console.warn("Grid henüz yüklenmemiş.");
    return;
  }

  const clone = gridEl.cloneNode(true);
  clone.id = "";                 // aynı id olmasın
  clone.classList.add("export-grid"); // 9 sütun zorlayacağın class

  const exportArea = document.createElement("div");
  exportArea.id = "exportArea";
  exportArea.appendChild(clone);
  document.body.appendChild(exportArea);

  const canvas = await html2canvas(clone, {
    scale: 2,
    backgroundColor: "#1b1b1b",
    useCORS: true,
  });

  const link = document.createElement("a");
  link.download = "duyus-festivali-listem.png";
  link.href = canvas.toDataURL("image/png");
  link.click();

  exportArea.remove();
});
