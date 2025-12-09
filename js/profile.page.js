import { setViewMode, loadUserAlbumsGrid, handleSpotifyAlbumSubmit } from "./album.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { auth } from "./firebase.js";

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
      setViewMode("grid",targetUsername);
      setActiveViewButton("grid");
    });
  }

  if (viewWideBtn) {
    viewWideBtn.addEventListener("click", () => {
      setViewMode("wide",targetUsername);
      setActiveViewButton("wide");
    });
  }

});

onAuthStateChanged(auth, (user) => {
  const currentUsername = user?.displayName || null;

  const isSelf = currentUsername && targetUsername === currentUsername;


  if (!isSelf) {
    const openAddAlbumBtn = document.getElementById("openAddAlbumModal");
    if (openAddAlbumBtn) openAddAlbumBtn.style.display = "none";
  }

  if (targetUsername) {
    
    loadUserAlbumsGrid(targetUsername);
  } else {

    if (!user) {

      window.location.href = "login.html";
      return;
    }
    loadUserAlbumsGrid();
  }
});