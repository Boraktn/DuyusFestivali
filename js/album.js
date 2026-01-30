import { auth, db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  increment,
  query,
  orderBy,
  doc
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

function formatDate(date) {
  if (!date) return "";
  const d = date.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}
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
  const normalizedArtist =
    album.Artists?.length > 1
      ? album.Artists.join(", ")
      : album.Artists?.[0] || album.Artist || "";
  //KULLANICIN ALBUMS KOLEKSİYONUNA ALBÜMÜ TÜM BİLGİLERİYLE KAYDEDİYORUZ
  try {
    const albumsRef = collection(db, "users", username, "albums");

    await addDoc(albumsRef, {
      album: album.Album,
      artist: normalizedArtist,
      image: album.Image,
      releaseYear: album.Release_Year,
      duration: album.Duration_Minutes,
      spotifyUrl: album.spotifyUrl,
      createdAt: new Date(),
      score: null
    });

    console.log("Albüm eklendi:", album.Album);
    //KULLANICIYA AİT ALBUMCOUNT'IN DEĞERİNİ ARTTIRIYORUZ.
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
  if (!spotifyUrl) return null;

  const cleaned = spotifyUrl.trim();

  // spotify:album:ID formatı (özellikle mobilde çıkabiliyor)
  const uriMatch = cleaned.match(/spotify:album:([a-zA-Z0-9]+)/);
  if (uriMatch) return uriMatch[1];

  // https://open.spotify.com/.../album/ID formatı
  const urlMatch = cleaned.match(/\/album\/([a-zA-Z0-9]+)/);
  if (urlMatch) return urlMatch[1];

  return null;
}

/*export async function handleSpotifyAlbumSubmit(spotifyUrl) {
  //FONKSİYON ÇAĞRILINCA ÖNCE SPOTIFY URL'SİNİN IP KISMINI ALMAK İÇİN
  //EXTRACTALBUMID FONKSİYONU ÇAĞRILIR. EĞER ALBÜM ID BOŞ İŞE UYARI VERİLİR.
  const albumId = extractAlbumId(spotifyUrl);
  if (!albumId) {
    alert("Geçerli bir Spotify albüm linki gir.");
    return;
  }
  //BACK-END İLE İLETİŞİM KURULAN KISIM: ROUTE FONKSİYONU ALBUM ID GİRDİSİYLE ÇAĞRILIR
  try {
    const res = await fetch(
      `https://duyusfestivali-backend.vercel.app/api/route?albumId=${albumId}`
    );
    if (!res.ok) throw new Error("Spotify'dan veri alınamadı");

    //GELEN ÇIKTI JSON FORMATINDA DATA DEĞİŞKENİNE ATANIR.
    const data = await res.json();
    console.log("Albüm:", data);
    //ALBÜM BİLGİSİ KULLANICININ VERİTABANINA EKLENİR VE 
    // YENİ ALBÜMÜN DE GÖRÜNMESİ İÇİN ALBÜM KOLEKSİYONU EKRANI TEKRAR YÜKLENİR.
    await addAlbumForUser(data);
    await loadUserAlbumsGrid();
  } catch (e) {
    console.error(e);
    alert("Albüm verisi alınırken hata oluştu.");
  }
}*/
export async function handleSpotifyAlbumSubmit(spotifyUrl) {
  const albumId = extractAlbumId(spotifyUrl);
  if (!albumId) {
    alert("Geçerli bir Spotify albüm linki gir.");
    return;
  }

  try {
    const url = `https://duyusfestivali-backend.vercel.app/api/route?albumId=${encodeURIComponent(albumId)}`;
    const res = await fetch(url);

    const raw = await res.text(); // önce text al
    if (!res.ok) {
      console.error("Backend error:", res.status, raw);
      alert(`Albüm verisi alınamadı. (HTTP ${res.status})`);
      return;
    }

    const data = JSON.parse(raw);
    await addAlbumForUser(data);
    await loadUserAlbumsGrid();
  } catch (e) {
    console.error("Fetch/parsing error:", e);
    alert("Albüm verisi alınırken hata oluştu.");
  }
}

//GÖRÜNÜM DEĞİŞKENİ
let viewMode = "grid";

//GÖRÜNÜMÜN AYARLANDIĞI VE GÜNCELLEME İÇİN ALBÜM KOLEKSİYONU EKRANININ TEKRAR YÜKLENDİĞİ FONKSİYON
export function setViewMode(mode, username) {
  //EĞER VIEWMODE ZATEN İSTENEN MODE İSE FONKSİYON GERİ GÖNDERİLİR.
  if (mode === viewMode) return;
  viewMode = mode;
  loadUserAlbumsGrid(username);
}
//ALBÜM PUANLAMA/YORUM YAPMA EKRANI BİLGİLERİ
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
const albumDeleteBtn = document.getElementById("albumDeleteBtn");
//------------------GRID -> LİSTE KARTI POPUP------------------
const albumPreviewModal = document.getElementById("albumPreviewModal");
const albumPreviewInner = albumPreviewModal?.querySelector(".album-preview-modal__inner");

function openAlbumPreviewModal(albumData, editable) {
  if (!albumPreviewModal || !albumPreviewInner) return;

  albumPreviewInner.innerHTML = "";

  const card = document.createElement("div");
  card.classList.add("box", "box--wide");

  const photoDiv = document.createElement("div");
  photoDiv.classList.add("photo");

  const img = document.createElement("img");
  img.src = albumData.image;
  img.alt = albumData.album;
  photoDiv.appendChild(img);

  const scoreBox = document.createElement("div");
  scoreBox.classList.add("score-box");

  const scoreText = document.createElement("span");
  scoreText.classList.add("score-text");

  const scoreInt = parseInt(albumData.score);
  const hasScore = !isNaN(scoreInt);

  scoreText.textContent = hasScore ? scoreInt : "N/A";
  scoreBox.appendChild(scoreText);
  scoreBox.style.backgroundColor = computeScoreColor(hasScore ? scoreInt : NaN);

  const leftCol = document.createElement("div");
  leftCol.classList.add("left-col");
  leftCol.appendChild(photoDiv);
  leftCol.appendChild(scoreBox);

  const middleCol = document.createElement("div");
  middleCol.classList.add("middle-col");

  const albumDiv = document.createElement("div");
  albumDiv.classList.add("album");
  albumDiv.textContent = albumData.album;

  const artistDiv = document.createElement("div");
  artistDiv.classList.add("artist");
  artistDiv.textContent = albumData.artist || "";

  const dateDiv = document.createElement("div");
  dateDiv.classList.add("added-date");
  dateDiv.textContent = formatDate(albumData.createdAt);

  const commentDiv = document.createElement("div");
  commentDiv.classList.add("comment");
  commentDiv.textContent = albumData.comment || "";

  middleCol.appendChild(albumDiv);
  middleCol.appendChild(artistDiv);
  middleCol.appendChild(dateDiv);
  middleCol.appendChild(commentDiv);

  const placeholder = document.createElement("div");
  placeholder.classList.add("box--wide", "placeholder");

  card.appendChild(leftCol);
  card.appendChild(middleCol);
  card.appendChild(placeholder);

  if (albumData.spotifyUrl) {
    const spotifyBtn = document.createElement("a");
    spotifyBtn.className = "spotify-btn";
    spotifyBtn.href = albumData.spotifyUrl;
    spotifyBtn.target = "_blank";
    spotifyBtn.rel = "noopener noreferrer";
    spotifyBtn.setAttribute("aria-label", "Spotify’da aç");

    const spotifyImg = document.createElement("img");
    spotifyImg.src = "img/spotify-logo.png";
    spotifyImg.alt = "Spotify";
    spotifyImg.className = "spotify-icon";
    spotifyBtn.appendChild(spotifyImg);

    card.appendChild(spotifyBtn);
  }

  if (editable) {
    const editBtn = document.createElement("button");
    editBtn.className = "album-edit-btn";
    editBtn.type = "button";
    editBtn.innerHTML = "✎";
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeAlbumPreviewModal();
      openAlbumEditModal({
        id: albumData.id,
        album: albumData.album,
        artist: albumData.artist,
        image: albumData.image,
        score: hasScore ? scoreInt : "",
        comment: albumData.comment || ""
      });
    });
    card.appendChild(editBtn);
  }

  albumPreviewInner.appendChild(card);

  albumPreviewModal.classList.remove("album-preview-modal--hidden");
  albumPreviewModal.setAttribute("aria-hidden", "false");
}

function closeAlbumPreviewModal() {
  if (!albumPreviewModal || !albumPreviewInner) return;
  albumPreviewModal.classList.add("album-preview-modal--hidden");
  albumPreviewModal.setAttribute("aria-hidden", "true");
  albumPreviewInner.innerHTML = "";
}

if (albumPreviewModal) {
  albumPreviewModal.addEventListener("click", (e) => {
    if (e.target === albumPreviewModal) closeAlbumPreviewModal();
  });

  // Opsiyonel: ESC ile kapansın
  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      !albumPreviewModal.classList.contains("album-preview-modal--hidden")
    ) {
      closeAlbumPreviewModal();
    }
  });
}

//PUANA GÖRE VERİLEN RENK: 0->KIRMIZI, 100->YEŞİL
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

if (albumEditForm) {
  albumEditForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentEditAlbumId) return;

    const rawScore = (editScoreInput.value || "").trim();
    const scoreInt = parseInt(rawScore, 10);

    if (scoreInt < 1 || scoreInt > 100) {
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
if (albumDeleteBtn) {
  albumDeleteBtn.addEventListener("click", async () => {
    if (!currentEditAlbumId) return;

    const user = auth.currentUser;
    if (!user || !user.displayName) return;


    try {
      // Albümü sil
      const ref = doc(db, "users", user.displayName, "albums", currentEditAlbumId);
      await deleteDoc(ref);

      // albumCount azalt (isteğe bağlı ama tutarlılık için iyi)
      await updateDoc(doc(db, "users", user.displayName), {
        albumCount: increment(-1)
      });

      closeAlbumEditModal();
      await loadUserAlbumsGrid();
    } catch (err) {
      console.error("Albüm silinirken hata:", err);
      alert("Albüm silinirken bir hata oluştu.");
    }
  });
}

//ALBÜM KOLEKSİYONU YÜKLEME FONKSİYONU: BU FONKSİYON BAŞKA KULLANICILARIN SAYFALARINI DA
//KULLANICININ KENDİ SAYFASINI DA YÜKLEYEBİLİR.
export async function loadUserAlbumsGrid(targetUsername) {
  console.log("GRID YUKLENIYOR");
  const grid = document.getElementById("grid");
  if (!grid) return;

  const currentUser = auth.currentUser;

  //EĞER BİR PARAMETRE VARSA O KULLANICI ADINI ALIYORUZ
  let usernameToLoad = targetUsername || null;
  //SAYFA DA EDIT BUTONLARININ GÖZÜKÜP GÖZÜKMEYECEĞİNİ BELİRLEYEN DEĞİŞKEN
  let editable = false;


  if (!usernameToLoad) {
    //PARAMETRE YOK İSE OTURUM SAHİBİNİN KENDİ KULLANICI ADINI KULLANIYORUZ VE SAYFAYI DÜZENLENEBİLİR YAPIYORUZ.
    if (!currentUser || !currentUser.displayName) return;
    usernameToLoad = currentUser.displayName;
    editable = true;
  } else {
    //PARAMETRE VARSA KULLANICI ADI OTURUM SAHİBİNİN Mİ KONTROL EDİP DÜZENLENEBİLİR OLUP OLMAYACAĞINA KARAR VERİYORUZ.
    if (currentUser && currentUser.displayName === usernameToLoad) {
      editable = true;
      console.log("editable");
    } else {
      editable = false;
      console.log("non-editable");
    }
  }

  //EĞER GÖRÜNÜM MODU WIDE İSE GEREKLİ CLASS'I GRID'E EKLİYORUZ.
  grid.classList.toggle("grid--wide", viewMode === "wide");
  //HER ÇAĞRILDIĞINDA GRID'İN İÇİNİ SİLİYORUZ.
  grid.innerHTML = "";

  //ALBUM SAYISINI SAYMAZ İÇİN DEĞİŞKEN
  let albumCount = 0;

  //KULLANICININ ALBÜM BİLGİLERİNE ULAŞIYORUZ.
  const albumsRef = collection(db, "users", usernameToLoad, "albums");
  const q = query(albumsRef, orderBy("createdAt"));
  const snap = await getDocs(q);

  //HER ALBÜM KUTUCUĞUNU BİR BİR OLUŞTURUYORUZ
  snap.forEach((docSnap) => {
    //ALBÜM BİLGİLERİNİ DEĞİŞKENE ATIYORUZ
    const album = docSnap.data();
    //ALBÜM ADI BOŞ İŞE GERİ GÖNDERİYORUZ.
    if (!album.album) return;
    //ALBÜM SAYISINI 1 ARTTIRIYORUZ.
    albumCount++;

    //ALBÜM GÖRÜNÜMÜ WIDE İSE BOX--WIDE CLASS'I EKLENİYOR 
    const box = document.createElement("div");
    box.classList.add("box");
    if (viewMode === "wide") {
      box.classList.add("box--wide");
    }
    //ALBÜM VERİLERİ KAYDEDİLİYOR.
    box.dataset.country = album.country || "";
    box.dataset.score = album.score ?? "";
    box.dataset.year = album.releaseYear ?? "";
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

    const scoreInt = parseInt(album.score);
    const hasScore = !isNaN(scoreInt);
    scoreText.textContent = hasScore ? scoreInt : "N/A";
    scoreBox.appendChild(scoreText);
    const albumDiv = document.createElement("div");
    albumDiv.classList.add("album");
    albumDiv.textContent = album.album;
    const artistDiv = document.createElement("div");
    artistDiv.classList.add("artist");
    artistDiv.textContent = album.artist;

    if (editable && viewMode === "wide") {
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
    const commentDiv = document.createElement("div");
    commentDiv.classList.add("comment");
    commentDiv.textContent = album.comment || "";

    if (viewMode === "wide") {
      if (album.spotifyUrl) {
        const spotifyBtn = document.createElement("a");
        spotifyBtn.className = "spotify-btn";
        spotifyBtn.href = album.spotifyUrl;
        spotifyBtn.target = "_blank";
        spotifyBtn.rel = "noopener noreferrer";
        spotifyBtn.setAttribute("aria-label", "Spotify’da aç");
        const spotifyImg = document.createElement("img");
        spotifyImg.src = "img/spotify-logo.png";
        spotifyImg.alt = "Spotify";
        spotifyImg.className = "spotify-icon";

        spotifyBtn.appendChild(spotifyImg);

        box.appendChild(spotifyBtn);
      }
      // Sol: albüm kapağı
      const leftCol = document.createElement("div");
      leftCol.classList.add("left-col");
      leftCol.appendChild(photoDiv);
      leftCol.appendChild(scoreBox);

      // Orta: albüm adı, sanatçı ve hemen altında yorum
      const middleCol = document.createElement("div");
      middleCol.classList.add("middle-col");
      const dateDiv = document.createElement("div");
      dateDiv.classList.add("added-date");
      dateDiv.textContent = formatDate(album.createdAt);

      middleCol.appendChild(albumDiv);
      middleCol.appendChild(artistDiv);
      middleCol.appendChild(dateDiv);
      middleCol.appendChild(commentDiv);

      const emptyDiv = document.createElement("div");
      emptyDiv.classList.add("box--wide");
      emptyDiv.classList.add("placeholder");

      // Sağ: skor kutusu
      box.appendChild(leftCol);
      box.appendChild(middleCol);
      box.appendChild(emptyDiv);
    } else {
      box.appendChild(photoDiv);
      box.appendChild(albumDiv);
      box.appendChild(artistDiv);
    }

    const scoreIntForColor = parseInt(album.score);

    const color = computeScoreColor(scoreIntForColor);


    if (viewMode === "wide") {
      scoreBox.style.backgroundColor = color;
    } else {
      photoDiv.style.setProperty("--overlay-color", color);
    }
    if (viewMode !== "wide") {
      box.addEventListener("click", () => {
        openAlbumPreviewModal(
          {
            id: docSnap.id,
            album: album.album,
            artist: album.artist,
            image: album.image,
            score: album.score ?? "",
            comment: album.comment || "",
            createdAt: album.createdAt,
            spotifyUrl: album.spotifyUrl || ""
          },
          editable
        );
      });
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
      albumDiv.textContent = "";

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
