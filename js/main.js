import { addAlbumForUser, handleSpotifyAlbumSubmit, loadUserAlbumsGrid } from "./album.js";
import { auth, db } from "./firebase.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";


document.addEventListener("DOMContentLoaded", () => {
  loadUserAlbumsGrid();

  const albumForm = document.getElementById("albumForm");
  const albumInput = document.getElementById("albumInput");

  if (albumForm) {
    albumForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      handleSpotifyAlbumSubmit(albumInput.value);
    });
  }
});




// Kullanıcının albums koleksiyonundan kutuları doldur


