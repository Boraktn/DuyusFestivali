
const CSV_URL = 'data.csv'; // CSV dosyanın adı veya yolu
const grid = document.getElementById("grid");

const box = document.getElementById("popup");

Papa.parse(CSV_URL, {
  download: true,
  header: true,
  dynamicTyping: true,
  complete: ({ data }) => {
    // Her satırdan bir "box" oluştur
    data.forEach(album => {
      if (!album.Album) return; // Boş satır varsa atla

      // BOX oluştur
      const box = document.createElement("div");
      box.classList.add("box");

      // 📎 KÜNYE bilgilerini data-* attribute olarak ekliyoruz
      box.dataset.country = album.Country;
      box.dataset.score = album.Score;
      box.dataset.year = album.Release_Year;
      box.dataset.genre = album.Genre;
      box.dataset.duration = album.Duration;
      box.dataset.index = album.Index;

      // GÖRSEL kısım
      const photoDiv = document.createElement("div");
      photoDiv.classList.add("photo");
      const img = document.createElement("img");
      img.src = album.Image;
      img.alt = album.Album;
      const score = document.createElement("span");
      score.classList.add("score");
      score.textContent = album.Score;

      photoDiv.appendChild(img);
      photoDiv.appendChild(score);

      // ALBUM ve ARTIST bilgileri
      const albumDiv = document.createElement("div");
      albumDiv.classList.add("album");
      albumDiv.textContent = album.Album;

      const artistDiv = document.createElement("div");
      artistDiv.classList.add("artist");
      artistDiv.textContent = album.Artist;

      // Her şeyi box’a ekle
      box.appendChild(photoDiv);
      box.appendChild(albumDiv);
      box.appendChild(artistDiv);

      let scoreint = parseInt(score.textContent);
      if (isNaN(scoreint)) {
        photoDiv.style.setProperty('--overlay-color', `rgba(0, 0, 0, 0.8)`);
      }
      else {
        let r = Math.round(255 * (100 - scoreint) / 100);
        let g = Math.round(255 * scoreint / 100);
        photoDiv.style.setProperty('--overlay-color', `rgba(${r}, ${g}, 0, 0.8)`);
      }
      // Grid'e ekle
      grid.appendChild(box);
    });

  }
});
let offsetX = 0, offsetY = 0;
let dragging = false;
const sortSelect = document.getElementById("sortSelect");

sortSelect.addEventListener("change", () => {
  const boxes = Array.from(document.querySelectorAll(".box"));
  const sortBy = sortSelect.value;

  boxes.sort((a, b) => {
    if (sortBy === "index") {
      return parseInt(a.dataset.index) - parseInt(b.dataset.index);
    } else if (sortBy === "score") {
      return parseFloat(b.dataset.score) - parseFloat(a.dataset.score);
    } else if (sortBy === "year") {
      return parseInt(b.dataset.year) - parseInt(a.dataset.year);
    } else if (sortBy === "duration") {
      return parseFloat(b.dataset.duration) - parseFloat(a.dataset.duration);
    }
  });

  // Grid içeriğini temizleyip yeniden sırayla ekle
  boxes.forEach(box => grid.appendChild(box));
});

const filterSelect = document.getElementById("filterSelect"); // Ülke
const decadeSelect = document.getElementById("decadeSelect"); // On yıl

function applyFilters() {
  const selectedCountry = filterSelect.value;
  const selectedDecade = decadeSelect.value;
  const boxes = document.querySelectorAll(".box");

  boxes.forEach(box => {
    const country = box.dataset.country;
    const year = parseInt(box.dataset.year);

    // Ülke koşulu
    const matchCountry = (selectedCountry === "Tümü" || country === selectedCountry);

    // On yıl koşulu
    const matchDecade = (() => {
      if (selectedDecade === "Tümü") return true;
      const start = parseInt(selectedDecade);
      const end = start + 9;
      return year >= start && year <= end;
    })();

    // İkisi de sağlanıyorsa görünür
    if (matchCountry && matchDecade) {
      box.style.display = "block"; // veya flex
    } else {
      box.style.display = "none";
    }
  });
}

// Her iki filtre değiştiğinde tetikle
filterSelect.addEventListener("change", applyFilters);
decadeSelect.addEventListener("change", applyFilters);


function startDrag(x, y) {
  dragging = true;
  box.classList.add("dragging");
  offsetX = x - box.offsetLeft;
  offsetY = y - box.offsetTop;
}

function doDrag(x, y) {
  if (!dragging) return;
  box.style.left = x - offsetX + "px";
  box.style.top = y - offsetY + "px";
}

function endDrag() {
  dragging = false;
  box.classList.remove("dragging");
}

// Fare olayları
box.addEventListener("mousedown", (e) => startDrag(e.clientX, e.clientY));
document.addEventListener("mousemove", (e) => doDrag(e.clientX, e.clientY));
document.addEventListener("mouseup", endDrag);

// Dokunma olayları
box.addEventListener("touchstart", (e) => {
  const touch = e.touches[0];
  startDrag(touch.clientX, touch.clientY);
});
document.addEventListener("touchmove", (e) => {
  const touch = e.touches[0];
  doDrag(touch.clientX, touch.clientY);
});
document.addEventListener("touchend", endDrag);

document.querySelectorAll('.box').forEach(box => {
  const scoreEl = box.querySelector('.score');
  const overlay = box.querySelector('.photo');
  console.log(scoreEl.textContent);
  let score = parseInt(scoreEl.textContent);
  if (isNaN(score)) {
    overlay.style.setProperty('--overlay-color', `rgba(0, 0, 0, 0.8)`);
  }
  else {
    let r = Math.round(255 * (100 - score) / 100);
    let g = Math.round(255 * score / 100);
    overlay.style.setProperty('--overlay-color', `rgba(${r}, ${g}, 0, 0.8)`);
  }
});
document.getElementById("btn").addEventListener("click", async () => {
  let newWindow = window.open("", "_blank");

  try {
    const res = await fetch("https://duyusfestivali-backend.vercel.app/api/random-track");
    const data = await res.json();

    if (data.url) {
      newWindow.location.href = data.url;
    } else {
      newWindow.close();
      alert("URL bulunamadı!");
    }
  } catch (err) {
    newWindow.close();
    alert("Hata: " + err);
  }
});