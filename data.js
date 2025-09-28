const chartColors = [
  "#36A2EB", // 1) Pembe - kırmızımsı
  "#ff1c1cff", // 2) Mavi
  "#FFCE56", // 3) Sarı
  "#4BC0C0", // 4) Turkuaz
  "#9966FF", // 5) Mor
  "#FF9F40", // 6) Turuncu
  "#8BC34A", // 7) Yeşil
  "#950032ff"  // 8) Fuşya
];
/** CSV dosyanın yolu/adı — gerekirse değiştir **/
const CSV_URL = 'data.csv';

Papa.parse(CSV_URL, {
  download: true,
  header: true,
  dynamicTyping: true,
  complete: ({ data }) => {
    // Temiz veri satırları: gerekli kolonlar dolu olanlar
function fillAlbums(list, containerId) {
  const container = document.getElementById(containerId);
  const cards = container.querySelectorAll(".album-card");

  list.forEach((album, i) => {
    if (cards[i]) {
      const img = cards[i].querySelector("img");
      const title = cards[i].querySelector(".albumdata");
      const artist = cards[i].querySelector(".artistdata");
      const score = cards[i].querySelector(".album-score");


      img.src = album.Image || "https://via.placeholder.com/100";
      img.alt = album.Album;
      title.textContent = album.Album;
      artist.textContent = album.Artist;
      score.textContent = album.Score;
      
      let r = Math.round(255 * (100 - parseInt(album.Score)) / 100);
      let g = Math.round(255 * parseInt(album.Score) / 100);
    score.style.setProperty('background-color',`rgba(${r}, ${g}, 0, 0.8)`);
    }
  });
}

    const rows = data.filter(r => r && r.Score != null && r.Release_Year != null && r.Duration != null && r.Country)
    .map(r => ({
      Index: Number(r.Index),
      Album: String(r.Album || '').trim(),
      Artist: String(r.Artist || '').trim(),
      Image: String(r.Image || '').trim(),
      Country: String(r.Country || '').trim(),
      Score: Number(r.Score),
      Release_Year: Number(r.Release_Year),
      Duration: Number(r.Duration)
    }));
    /** 1) Pie: Country -> adet **/
    const countryCounts = {};
    rows.forEach(r => {
      countryCounts[r.Country] = (countryCounts[r.Country] || 0) + 1;
    });
    const countryLabels = Object.keys(countryCounts);
    const countryValues = countryLabels.map(k => countryCounts[k]);

    new Chart(document.getElementById('pieCountry'), {
      type: 'pie',
      data: {
        labels: countryLabels,
        datasets: [{ data: countryValues,
          backgroundColor: chartColors,
        }]
      },
      options: {
        plugins: {
          legend: { position: 'right' }
        }
      }
    });
    
    /** Ülkelere göre ortalama puan **/
const countryScoreAgg = {};
let totalSum = 0;
let totalN = 0;

rows.forEach(r => {
  if (!countryScoreAgg[r.Country]) {
    countryScoreAgg[r.Country] = { sum: 0, n: 0 };
  }
  countryScoreAgg[r.Country].sum += r.Score;
  countryScoreAgg[r.Country].n += 1;

  totalSum += r.Score;
  totalN += 1;
});

const countryLabels2 = Object.keys(countryScoreAgg);
const countryAvgScores = countryLabels2.map(c =>
  +(countryScoreAgg[c].sum / countryScoreAgg[c].n).toFixed(2)
);
const overallAvg = +(totalSum / totalN).toFixed(2);

// Listeye ekle
countryLabels2.push("GENEL ORT.");
countryAvgScores.push(overallAvg);

new Chart(document.getElementById("avgCountries"), {
  type: "bar",
  data: {
    labels: countryLabels2,
    datasets: [{
      label: "Ortalama Puan",
      data: countryAvgScores,
      backgroundColor: chartColors,
      borderColor: chartColors.map(c => c.replace("0.6", "1")),
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: "Ortalama Puan" } },
      x: { title: { display: true, text: "Ülke" } }
    }
  }
});

    /** 2) Line: 10 yıllar -> ortalama Score **/
    const decadeAgg = {};
    rows.forEach(r => {
      const decade = Math.floor(r.Release_Year / 10) * 10;
      if (!decadeAgg[decade]) decadeAgg[decade] = { sum: 0, n: 0 };
      decadeAgg[decade].sum += r.Score;
      decadeAgg[decade].n += 1;
    });
    const decadeKeys = Object.keys(decadeAgg).map(Number).sort((a,b)=>a-b);
    const decadeLabels = decadeKeys.map(d => `${d}s`);
    const decadeAvgScores = decadeKeys.map(d => +(decadeAgg[d].sum / decadeAgg[d].n).toFixed(1));

    new Chart(document.getElementById('lineDecades'), {
      type: 'line',
      data: {
        labels: decadeLabels,
        datasets: [{
          label: 'Ortalama Puan',
          data: decadeAvgScores,
          tension: 0.3
        }]
      },
      options: {
        plugins: {
        },
        scales: {
          y: { beginAtZero: true, title: { display: true, text: 'Puan' } },
          x: { title: { display: true, text: 'On Yıl' } }
        }
      }
    });

    /** 3) Scatter: Duration (minutes) vs Score **/
    const scatterData = rows.map(r => ({
      x: r.Duration,
      y: r.Score,
      label: `#${r.Album}`
    }));

    new Chart(document.getElementById('scatterDurationScore'), {
      type: 'scatter',
      data: {
        datasets: [{
            label:'Süre-Puan',
          data: scatterData,
          pointRadius: 4
        }]
      },
      options: {
        plugins: {
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const p = ctx.parsed;
                const lab = ctx.raw.label || '';
                return `${lab} (${p.x} min, ${p.y})`;
              }
            }
          }
        },
        scales: {
          x: { title: { display: true, text: 'Süre(dk)' } },
          y: { beginAtZero: true, title: { display: true, text: 'Puan' } }
        }
      }
    });

    /** 4) Line: Index -> Score **/
    const byIndex = rows.slice().sort((a,b) => a.Index - b.Index);
    const indexLabels = byIndex.map(r => r.Index);
    const indexScores = byIndex.map(r => r.Score);

    new Chart(document.getElementById('lineIndex'), {
      type: 'line',
      data: {
        labels: indexLabels,
        datasets: [{
          label: 'Puan',
          data: indexScores,
          fill: false,
          tension: 0.2
        }]
      },
      options: {
        plugins: {
        },
        scales: {
          x: { title: { display: true, text: 'Hafta' } },
          y: { beginAtZero: true, title: { display: true, text: 'Puan' } }
        }
      }
    });
    const best = rows
    .slice()
    .sort((a, b) => b.Score - a.Score || b.Release_Year - a.Release_Year || a.Index - b.Index)
    .slice(0, 3);

  const worst = rows
    .slice()
    .sort((a, b) => a.Score - b.Score || a.Release_Year - b.Release_Year || a.Index - b.Index)
    .slice(0, 3);
  fillAlbums(best, "best-albums");
  fillAlbums(worst, "worst-albums");
  }
});


    const slides = document.querySelector('.slides');
  const totalSlides = document.querySelectorAll('.slide').length;
  let index = 0;

  document.querySelector('.next').addEventListener('click', () => {
    index = (index + 1) % totalSlides;
    slides.style.transform = `translateX(-${index * 120}%)`;
  });

  document.querySelector('.prev').addEventListener('click', () => {
    index = (index - 1 + totalSlides) % totalSlides;
    slides.style.transform = `translateX(-${index * 120}%)`;
  });
  window.addEventListener("resize", () => {
  Chart.helpers.each(Chart.instances, function(instance) {
    instance.resize();
  });
});