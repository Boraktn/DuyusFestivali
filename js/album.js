import { auth, db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  increment
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

//ALBÜMÜ VERİTABANINA EKLEME
export async function addAlbumForUser(album) {

  //ŞU ANDA KULLANICI AKTİF Mİ DİYE BAKIYORUZ
  //EĞER DEĞİLSE GİRİŞ YAP SAYFASINA YÖNLENDİRİYORUZ
  const user = auth.currentUser;
  if (!user) {
    alert("Albüm eklemek için önce giriş yapmalısın.");
    window.location.href = "login.html";
    return;
  }

  const username = user.displayName;
  if (!username) {
    alert("Kullanıcı adı bulunamadı. Lütfen tekrar giriş yap.");
    window.location.href = "login.html";
    return;
  }
  console.log("username in LS:", username);
  //KULLANICIN ALBUMS KOLEKSİYONUNA ALBÜMÜ TÜM BİLGİLERİYLE KAYDEDİYORUZ
  try {
    const albumsRef = collection(db, "users", username, "albums");

    await addDoc(albumsRef, {
      album: album.Album,
      artist: album.Artist,
      image: album.Image,
      releaseYear: album.Release_Year,
      duration: album.Duration_Minutes,
      spotifyUrl: album.spotifyUrl,
      createdAt: new Date(),
      score: null
    });

    console.log("Albüm eklendi:", album.Album);
    await updateDoc(doc(db, "users", username), {
      albumCount: increment(1)
    });
  } catch (err) {
    console.error("Albüm eklenirken hata:", err);
    alert("Albüm eklenirken bir hata oluştu.");
  }
}
//ALBÜM LİNKİNDEN SPOTIFY IP KISMINI ALMA
export function extractAlbumId(spotifyUrl) {
  try {
    const url = new URL(spotifyUrl.trim());
    const parts = url.pathname.split("/");
    const albumIndex = parts.indexOf("album");
    if (albumIndex === -1 || albumIndex + 1 >= parts.length) return null;
    return parts[albumIndex + 1];
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
  } catch (e) {
    console.error(e);
    alert("Albüm verisi alınırken hata oluştu.");
  }
}

let viewMode = "grid"; // "grid" veya "wide"

export function setViewMode(mode) {
  viewMode = mode;
  loadUserAlbumsGrid(); // mevcut fonksiyonun; mode değişince yeniden çiz
}

export async function loadUserAlbumsGrid() {
  console.log("GRID YUKLENIYOR");
  const grid = document.getElementById("grid");
  if (!grid) return;

  const user = auth.currentUser;
  if (!user) return;

  const username = user.displayName;
  if (!username) return;

  // GRID class'ı: mod'a göre
  grid.classList.toggle("grid--wide", viewMode === "wide");

  grid.innerHTML = "";
  let albumCount = 0;

  const albumsRef = collection(db, "users", username, "albums");
  const snap = await getDocs(albumsRef);

  snap.forEach((docSnap) => {
    const album = docSnap.data();
    if (!album.album) return;
    albumCount++;
    const box = document.createElement("div");
    box.classList.add("box");
    if (viewMode === "wide") {
      box.classList.add("box--wide");
    }

    box.dataset.country = album.country || "";
    box.dataset.score = album.score ?? "";
    box.dataset.year = album.releaseYear ?? "";
    box.dataset.genre = album.genre || "";
    box.dataset.duration = album.duration ?? "";
    box.dataset.id = docSnap.id;

    const photoDiv = document.createElement("div");
    photoDiv.classList.add("photo");

    const img = document.createElement("img");
    img.src = album.image;
    img.alt = album.album;

    const scoreSpan = document.createElement("span");
    scoreSpan.classList.add("score");
    scoreSpan.textContent = album.score ?? "";

    photoDiv.appendChild(img);
    photoDiv.appendChild(scoreSpan);
    const scoreBox = document.createElement("div");
    scoreBox.classList.add("score-box");

    const scoreText = document.createElement("span");
    scoreText.classList.add("score-text");

    // sayısal değeri hesapla
    const scoreInt = parseInt(album.score);
    const hasScore = !isNaN(scoreInt);

    // N/A veya gerçek skor
    scoreText.textContent = hasScore ? scoreInt : "N/A";

    scoreBox.appendChild(scoreText);
    // METİN KISMI
    const albumDiv = document.createElement("div");
    albumDiv.classList.add("album");
    albumDiv.textContent = album.album;

    const artistDiv = document.createElement("div");
    artistDiv.classList.add("artist");
    artistDiv.textContent = album.artist;

    // Kullanıcı yorumu (Firestore'da album.comment varsayıyorum)
    const commentDiv = document.createElement("div");
    commentDiv.classList.add("comment");
    commentDiv.textContent = album.comment || "";

    if (viewMode === "wide") {
      const infoDiv = document.createElement("div");
      infoDiv.classList.add("info");

      const topTexts = document.createElement("div");
      topTexts.appendChild(albumDiv);
      topTexts.appendChild(artistDiv);

      infoDiv.appendChild(topTexts);
      infoDiv.appendChild(commentDiv);

      // SOL KOLON: kapak + score kare
      const leftCol = document.createElement("div");
      leftCol.classList.add("left-col");
      leftCol.appendChild(photoDiv);
      leftCol.appendChild(scoreBox);

      box.appendChild(leftCol);
      box.appendChild(infoDiv);
    } else {
      box.appendChild(photoDiv);
      box.appendChild(albumDiv);
      box.appendChild(artistDiv);
    }


    // RENK HESABI (aynen kalsın)
    const scoreIntForColor = parseInt(album.score);
    const isNaNScore = isNaN(scoreIntForColor);

    let color;
    if (isNaNScore) {
      color = "rgba(0, 0, 0, 0.8)";
    } else {
      const r = Math.round(255 * (100 - scoreIntForColor) / 100);
      const g = Math.round(255 * scoreIntForColor / 100);
      color = `rgba(${r}, ${g}, 0, 0.8)`;
    }

    if (viewMode === "wide") {
      // kare score kutusunun rengi
      scoreBox.style.backgroundColor = color;
    } else {
      // eski overlay davranışı
      photoDiv.style.setProperty("--overlay-color", color);
    }
    grid.appendChild(box);
  });
  if (viewMode !== "wide") {
      const TOTAL_POLAROIDS = 52;
      const placeholderCount = Math.max(0, TOTAL_POLAROIDS - albumCount);
      console.log(TOTAL_POLAROIDS)

      for (let i = 0; i < placeholderCount; i++) {
        const box = document.createElement("div");
        box.classList.add("box", "box--empty");

        const photoDiv = document.createElement("div");
        photoDiv.classList.add("photo", "photo--empty");

        const albumDiv = document.createElement("div");
        albumDiv.classList.add("album", "album--empty");
        albumDiv.textContent = ""; // sadece yer tutsun

        const artistDiv = document.createElement("div");
        artistDiv.classList.add("artist", "artist--empty");
        artistDiv.textContent = "";

        box.appendChild(photoDiv);
        box.appendChild(albumDiv);
        box.appendChild(artistDiv);

        grid.appendChild(box);
      }
    }
}
