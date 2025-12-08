import { addAlbumForUser, handleSpotifyAlbumSubmit, loadUserAlbumsGrid, setViewMode } from "./album.js";
import { auth } from "./firebase.js";
import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logoutBtn");
    //ÇIKIŞ
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            await signOut(auth);
            //ÇIKIŞ YAPAN KULLANICI GİRİŞ YAP SAYFASINA YÖNLENDİRİLİR.
            window.location.href = "login.html";
        });
    }
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
            await handleSpotifyAlbumSubmit(url); // veritabanına ekliyor + grid yeniliyor
            closeAddModal();
        });
    }
    const gridViewBtn = document.getElementById("viewGrid");
    const wideViewBtn = document.getElementById("viewWide");

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
    if (gridViewBtn) {
        gridViewBtn.addEventListener("click", () => {
            setViewMode("grid");
            setActiveViewButton("grid");
        });
    }

    if (wideViewBtn) {
        wideViewBtn.addEventListener("click", () => {
            setViewMode("wide");
            setActiveViewButton("wide");
        });
    }
});
//KULLANICI
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "login.html";
    } else {
        window.currentUser = user;
        console.log("KULLANICI:", user.displayName);
        loadUserAlbumsGrid();
    }
});