import { db } from "./firebase.js";
import {
  collectionGroup,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// profile.page.js içindeki default avatar ile aynı path
const DEFAULT_AVATAR = "img/avatars/default.webp"; // :contentReference[oaicite:5]{index=5}

function formatDate(date) {
  if (!date) return "";
  const d = date.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// album.js ile aynı renk fonksiyonu mantığı
function computeScoreColor(score) {
  const s = parseInt(score, 10);
  if (isNaN(s)) return "rgba(0, 0, 0, 0.8)";
  const r = Math.round((255 * (100 - s)) / 100);
  const g = Math.round((255 * s) / 100);
  return `rgba(${r}, ${g}, 0, 0.8)`;
}

// kullanıcı doc cache (avatar için)
const userCache = new Map(); // username -> { avatar }

async function getUserMeta(username) {
  if (userCache.has(username)) return userCache.get(username);

  try {
    const ref = doc(db, "users", username);
    const snap = await getDoc(ref);
    const data = snap.exists() ? snap.data() : {};
    const meta = { avatar: data.avatar || DEFAULT_AVATAR };
    userCache.set(username, meta);
    return meta;
  } catch (e) {
    const meta = { avatar: DEFAULT_AVATAR };
    userCache.set(username, meta);
    return meta;
  }
}

/**
 * CollectionGroup: users/{username}/albums/{albumId}
 * owner username = docSnap.ref.parent.parent.id
 */
function getOwnerUsernameFromAlbumDoc(docSnap) {
  return docSnap.ref?.parent?.parent?.id || null;
}

/**
 * Wide kartı (profile wide ile aynı) üretir.
 * Dış katmana user badge ekler.
 */
function buildLatestItem({ ownerUsername, ownerAvatar, albumDoc }) {
  const album = albumDoc;

  // Wrapper
  const wrapper = document.createElement("div");
  wrapper.className = "latest-item";

  // User badge
  const userRow = document.createElement("div");
  userRow.className = "latest-user";

  const avatarImg = document.createElement("img");
  avatarImg.className = "latest-user__avatar";
  avatarImg.src = ownerAvatar || DEFAULT_AVATAR;
  avatarImg.alt = `${ownerUsername} avatar`;

  const userLink = document.createElement("a");
  userLink.className = "latest-user__name";
  userLink.href = `profile.html?u=${encodeURIComponent(ownerUsername)}`;
  userLink.textContent = ownerUsername;

  userRow.appendChild(avatarImg);
  userRow.appendChild(userLink);

  // Wide box (profile.page wide ile birebir class’lar)
  const box = document.createElement("div");
  box.classList.add("box", "box--wide");

  const photoDiv = document.createElement("div");
  photoDiv.classList.add("photo");

  const img = document.createElement("img");
  img.src = album.image;
  img.alt = album.album;

  // wide modda .score gizleniyor ama yapı aynı kalsın
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

  const commentDiv = document.createElement("div");
  commentDiv.classList.add("comment");
  commentDiv.textContent = album.comment || "";

  const leftCol = document.createElement("div");
  leftCol.classList.add("left-col");
  leftCol.appendChild(photoDiv);
  leftCol.appendChild(scoreBox);

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
  emptyDiv.classList.add("box--wide", "placeholder");

  // Spotify butonu (profile wide ile aynı davranış)
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

  // box içi yerleşim
  box.appendChild(leftCol);
  box.appendChild(middleCol);
  box.appendChild(emptyDiv);

  // skor rengi (wide’de scoreBox’a basılıyor)
  const color = computeScoreColor(parseInt(album.score));
  scoreBox.style.backgroundColor = color;

  // birleştir
  wrapper.appendChild(userRow);
  wrapper.appendChild(box);

  return wrapper;
}

let latestCursor = null;
let latestLimit = 8;

async function loadLatestAlbums({ append = false } = {}) {
  const grid = document.getElementById("latestGrid");
  if (!grid) return;

  if (!append) grid.innerHTML = "";

  // Tüm kullanıcıların albums subcollection’larını tek query
  const base = query(
    collectionGroup(db, "albums"),
    orderBy("createdAt", "desc"),
    limit(latestLimit)
  );

  const q = latestCursor
    ? query(
        collectionGroup(db, "albums"),
        orderBy("createdAt", "desc"),
        startAfter(latestCursor),
        limit(latestLimit)
      )
    : base;

  const snap = await getDocs(q);
  if (snap.empty) return;

  latestCursor = snap.docs[snap.docs.length - 1];

  // Render
  for (const docSnap of snap.docs) {
    const albumDoc = docSnap.data();
    if (!albumDoc?.album) continue;

    const ownerUsername = getOwnerUsernameFromAlbumDoc(docSnap);
    if (!ownerUsername) continue;

    const meta = await getUserMeta(ownerUsername);

    const node = buildLatestItem({
      ownerUsername,
      ownerAvatar: meta.avatar,
      albumDoc,
    });

    grid.appendChild(node);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadLatestAlbums({ append: false });

  const moreBtn = document.getElementById("latestLoadMore");
  if (moreBtn) {
    moreBtn.addEventListener("click", () => loadLatestAlbums({ append: true }));
  }
});
// (opsiyonel) Notlara hafif "float" animasyonu (çok sakin)
document.querySelectorAll(".hero .note").forEach((el, i) => {
  el.style.animation = `floatNote ${3.6 + i * 0.25}s ease-in-out ${i * 0.08}s infinite alternate`;
});

const style = document.createElement("style");
style.textContent = `
@keyframes floatNote {
  from { transform: translateY(0px) rotate(var(--r, 0deg)); }
  to   { transform: translateY(-10px) rotate(var(--r, 0deg)); }
}
`;
document.head.appendChild(style);

// her notanın mevcut rotasyonunu kaybetmemek için data'dan okuyoruz:
document.querySelectorAll(".note").forEach((el) => {
  // computed transform'dan açı okumak yerine: class'taki rotate değerini korumak daha kolay
  // pratik çözüm: elemente CSS custom prop ver
});


