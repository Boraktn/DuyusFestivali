import { addAlbumForUser, handleSpotifyAlbumSubmit, loadUserAlbumsGrid } from "./album.js";
import { auth } from "./firebase.js";
import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {


    const albumForm = document.getElementById("albumForm");
    const albumInput = document.getElementById("albumInput");

    if (albumForm) {
        albumForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            handleSpotifyAlbumSubmit(albumInput.value);
        });
    }

    const logoutBtn = document.getElementById("logoutBtn");
    //ÇIKIŞ
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            await signOut(auth);
            //ÇIKIŞ YAPAN KULLANICI GİRİŞ YAP SAYFASINA YÖNLENDİRİLİR.
            window.location.href = "login.html";
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