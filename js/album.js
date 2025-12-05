import { auth, db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  increment,
  doc
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

export function setViewMode(mode,username) {
  viewMode = mode;
  loadUserAlbumsGrid(username); // mevcut fonksiyonun; mode değişince yeniden çiz
}
let currentEditAlbumId = null;

const albumEditModal = document.getElementById("albumEditModal");
const albumEditClose = document.getElementById("albumEditClose");
const albumEditCancel = document.getElementById("albumEditCancel");
const albumEditForm = document.getElementById("albumEditForm");
const editScoreInput = document.getElementById("editScore");
const editCommentInput = document.getElementById("editComment");

const editImage = document.getElementById("editModalImage");
const editAlbumTitle = document.getElementById("editModalAlbumTitle");
const editArtist = document.getElementById("editModalArtist");
const editScoreText = document.getElementById("editModalScoreText");
const editScoreBox = document.getElementById("editModalScoreBox");
const editCommentPreview = document.getElementById("editModalCommentPreview");

function computeScoreColor(score) {
  const s = parseInt(score, 10);
  if (isNaN(s)) return "rgba(0, 0, 0, 0.8)";
  const r = Math.round(255 * (100 - s) / 100);
  const g = Math.round(255 * s / 100);
  return `rgba(${r}, ${g}, 0, 0.8)`;
}

function updateModalScorePreview(score) {
  const s = parseInt(score, 10);
  const valid = !isNaN(s) && s >= 1 && s <= 100;

  if (editScoreText) {
    editScoreText.textContent = valid ? s : "N/A";
  }
  if (editScoreBox) {
    editScoreBox.style.backgroundColor = computeScoreColor(valid ? s : NaN);
  }
}

function openAlbumEditModal(albumData) {
  if (!albumEditModal) return;
  currentEditAlbumId = albumData.id;

  if (editImage) {
    editImage.src = albumData.image;
    editImage.alt = albumData.album;
  }
  if (editAlbumTitle) editAlbumTitle.textContent = albumData.album;
  if (editArtist) editArtist.textContent = albumData.artist;

  const scoreVal = albumData.score ?? "";
  const commentVal = albumData.comment ?? "";

  if (editScoreInput) editScoreInput.value = scoreVal;
  if (editCommentInput) editCommentInput.value = commentVal;
  if (editCommentPreview) editCommentPreview.textContent = commentVal;

  updateModalScorePreview(scoreVal);

  albumEditModal.classList.remove("album-edit-modal--hidden");
}

function closeAlbumEditModal() {
  if (!albumEditModal) return;
  albumEditModal.classList.add("album-edit-modal--hidden");
  currentEditAlbumId = null;
}

// --- Modal eventleri ---
if (albumEditClose) {
  albumEditClose.addEventListener("click", closeAlbumEditModal);
}
if (albumEditCancel) {
  albumEditCancel.addEventListener("click", closeAlbumEditModal);
}
if (albumEditModal) {
  albumEditModal.addEventListener("click", (e) => {
    if (e.target === albumEditModal) {
      closeAlbumEditModal();
    }
  });
}

if (editScoreInput) {
  editScoreInput.addEventListener("input", () => {
    updateModalScorePreview(editScoreInput.value);
  });
}

if (editCommentInput && editCommentPreview) {
  editCommentInput.addEventListener("input", () => {
    editCommentPreview.textContent = editCommentInput.value;
  });
}

// Kaydet butonu
if (albumEditForm) {
  albumEditForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentEditAlbumId) return;

    const rawScore = (editScoreInput.value || "").trim();
    const scoreInt = parseInt(rawScore, 10);

    if (isNaN(scoreInt) || scoreInt < 1 || scoreInt > 100) {
      alert("Puan 1 ile 100 arasında olmalı.");
      return;
    }

    const comment = (editCommentInput.value || "").trim();

    const user = auth.currentUser;
    if (!user || !user.displayName) return;

    try {
      const ref = doc(db, "users", user.displayName, "albums", currentEditAlbumId);
      await updateDoc(ref, {
        score: scoreInt,
        comment: comment
      });

      closeAlbumEditModal();
      await loadUserAlbumsGrid();
    } catch (err) {
      console.error("Albüm güncellenirken hata:", err);
      alert("Albüm güncellenirken bir hata oluştu.");
    }
  });
}

export async function loadUserAlbumsGrid(targetUsername) {
  console.log("GRID YUKLENIYOR");
  const grid = document.getElementById("grid");
  if (!grid) return;

  const currentUser = auth.currentUser;

  let usernameToLoad = targetUsername || null;
  let editable = false;

  if (!usernameToLoad) {
    // Parametre yoksa: kendi sayfamız
    if (!currentUser || !currentUser.displayName) return;
    usernameToLoad = currentUser.displayName;
    editable = true;
  } else {
    // Parametre varsa: profil sayfası olabilir
    if (currentUser && currentUser.displayName === usernameToLoad) {
      editable = true;   // kendi profilin
      console.log("editable");
    } else {
      editable = false;  // başkasının profili → sadece read-only
      console.log("non-editable");
    }
  }

  // GRID class'ı: mod'a göre
  grid.classList.toggle("grid--wide", viewMode === "wide");

  grid.innerHTML = "";
  let albumCount = 0;

  const albumsRef = collection(db, "users", usernameToLoad, "albums");
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
    scoreSpan.textContent = album.score ?? "n/a";

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

        if (editable) {
          console.log("for real editable")
      const editBtn = document.createElement("button");
      editBtn.className = "album-edit-btn";
      editBtn.type = "button";
      editBtn.innerHTML = "✎";
      editBtn.addEventListener("click", () => {
        const scoreIntEdit = parseInt(album.score);
        const hasScoreEdit = !isNaN(scoreIntEdit);

        openAlbumEditModal({
          id: docSnap.id,
          album: album.album,
          artist: album.artist,
          image: album.image,
          score: hasScoreEdit ? scoreIntEdit : "",
          comment: album.comment || ""
        });
      });

      box.appendChild(editBtn);
    }
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
