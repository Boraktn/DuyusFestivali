import { auth, db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";


export async function addAlbumForUser(album) {
  console.log("addAlbumforUser çalışıyor.");
  const grid = document.getElementById("grid");

    const user = auth.currentUser;
  
  const username = localStorage.getItem("username");

  if (!user) {
    alert("Albüm eklemek için önce giriş yapmalısın.");
    return;
  }
  if (!username) {
    alert("Kullanıcı adı bulunamadı. Lütfen tekrar giriş yap.");
    return;
  }
  console.log("username in LS:", username);
  try {
    const albumsRef = collection(db, "users", username, "albums");

    await addDoc(albumsRef, {
      album: album.Album,                 // "Altüst"
      artist: album.Artist,              // "Athena"
      image: album.Image,                // kapak URL
      releaseYear: album.Release_Year,   // 2014
      duration: album.Duration_Minutes,  // 62
      spotifyUrl: album.spotifyUrl,      // open.spotify.com/album/...
      createdAt: new Date()              // veya serverTimestamp()
      // country / score artık backend'den gelmiyor;
      // puanlamayı kullanıcı sonra senin arayüzünden yapar
    });

    console.log("Albüm eklendi:", album.Album);
  } catch (err) {
    console.error("Albüm eklenirken hata:", err);
    alert("Albüm eklenirken bir hata oluştu.");
  }
}

export function extractAlbumId(spotifyUrl) {
  try {
    const url = new URL(spotifyUrl.trim());
    const parts = url.pathname.split("/");
    const albumIndex = parts.indexOf("album");
    if (albumIndex === -1 || albumIndex + 1 >= parts.length) return null;
    return parts[albumIndex + 1]; // 3RQQmkQEvNCY4prGKE6oc5
  } catch {
    return null;
  }
}
export async function handleSpotifyAlbumSubmit(spotifyUrl) {
  const albumId = extractAlbumId(spotifyUrl);
  if (!albumId) {
    alert("Geçerli bir Spotify albüm linki gir.");
    return;
  }

  try {
    const res = await fetch(
      `https://duyusfestivali-backend.vercel.app/api/route?albumId=${albumId}`
    );
    if (!res.ok) throw new Error("Spotify'dan veri alınamadı");

    const data = await res.json();
    console.log("Albüm:", data);
        await addAlbumForUser(data);
        await loadUserAlbumsGrid();


    // Firestore’a bu şekilde kaydedebilirsin:
    // await setDoc(doc(db, "albums", albumId), {
    //   Album: data.Album,
    //   Artist: data.Artist,
    //   Image: data.Image,
    //   Release_Year: data.Release_Year,
    //   Duration: data.Duration_Minutes,
    //   spotifyUrl: data.spotifyUrl,
    // });

  } catch (e) {
    console.error(e);
    alert("Albüm verisi alınırken hata oluştu.");
  }
}
export async function loadUserAlbumsGrid() {
  console.log("GRID YUKLENIYOR");
    const grid = document.getElementById("grid");
  if (!grid) return;

  const username = localStorage.getItem("username");
  if (!username) {
    console.warn("username yok, albümler yüklenemedi.");
    return;
  }

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
    box.dataset.score   = album.score   ?? "";  // puan alanı varsa
    box.dataset.year    = album.releaseYear ?? "";
    box.dataset.genre   = album.genre   || "";
    box.dataset.duration = album.duration ?? "";
    box.dataset.id      = docSnap.id; // doc id, istersen kullanırsın

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