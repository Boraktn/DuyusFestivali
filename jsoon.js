import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDRg4C-7Z_MptW2Qdpdw38DTwBizF2kV50",
    authDomain: "duyusfest.firebaseapp.com",
    projectId: "duyusfest",
    storageBucket: "duyusfest.firebasestorage.app",
    messagingSenderId: "1034831755567",
    appId: "1:1034831755567:web:e598a78920ce6ed11ec9da",
    measurementId: "G-5SF2WLBMMP"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// CSV'den çevrilmiş albüm datan (array halinde)
const albums = [
  {
    "Index": 1,
    "Album": "HIT ME HARD AND SOFT",
    "Artist": "BILLIE EILISH",
    "Image": "img/1.JPG",
    "Country": "ABD",
    "Score": 40,
    "Release_Year": 2024,
    "Duration": 43
  },
  {
    "Index": 2,
    "Album": "KARA KONULAR",
    "Artist": "CAN BONOMO",
    "Image": "img/2.JPG",
    "Country": "TÜRKİYE",
    "Score": 75,
    "Release_Year": 2024,
    "Duration": 42
  },
  {
    "Index": 3,
    "Album": "KAHIRLI  MERDİVEN",
    "Artist": "ADAMLAR",
    "Image": "img/3.JPG",
    "Country": "TÜRKİYE",
    "Score": 77,
    "Release_Year": 2024,
    "Duration": 33
  },
  {
    "Index": 4,
    "Album": "THE AGE OF THE UNDERSTATEMENT",
    "Artist": "THE LAST SHADOW PUPPETS",
    "Image": "img/4.JPG",
    "Country": "İNGİLTERE",
    "Score": 75,
    "Release_Year": 2008,
    "Duration": 35
  },
  {
    "Index": 5,
    "Album": "CURRENTS",
    "Artist": "TAME IMPALA",
    "Image": "img/5.JPG",
    "Country": "AVUSTRALYA",
    "Score": 54,
    "Release_Year": 2015,
    "Duration": 51
  },
  {
    "Index": 6,
    "Album": "APAYRI",
    "Artist": "HANDE YENER",
    "Image": "img/6.JPG",
    "Country": "TÜRKİYE",
    "Score": 53,
    "Release_Year": 2006,
    "Duration": 65
  },
  {
    "Index": 7,
    "Album": "FAVOURITE WORST NIGHMARE",
    "Artist": "ARCTIC MONKEYS",
    "Image": "img/7.JPG",
    "Country": "İNGİLTERE",
    "Score": 75,
    "Release_Year": 2007,
    "Duration": 38
  },
  {
    "Index": 8,
    "Album": "EL CAMINO",
    "Artist": "THE BLACK KEYS",
    "Image": "img/8.JPG",
    "Country": "ABD",
    "Score": 55,
    "Release_Year": 2011,
    "Duration": 38
  },
  {
    "Index": 9,
    "Album": "THE SECRET OF US",
    "Artist": "GRACIE ABRAMS",
    "Image": "img/9.JPG",
    "Country": "ABD",
    "Score": 31,
    "Release_Year": 2024,
    "Duration": 47
  },
  {
    "Index": 10,
    "Album": "MÜKEMMEL BOŞLUK",
    "Artist": "REDD",
    "Image": "img/10.JPG",
    "Country": "TÜRKİYE",
    "Score": 67,
    "Release_Year": 2016,
    "Duration": 49
  },
  {
    "Index": 11,
    "Album": "ABBEY ROAD",
    "Artist": "THE BEATLES",
    "Image": "img/11.JPG",
    "Country": "TÜRKİYE",
    "Score": 71,
    "Release_Year": 1969,
    "Duration": 47
  },
  {
    "Index": 12,
    "Album": "1989 (TAYLOR'S VERSION)",
    "Artist": "TAYLOR SWIFT",
    "Image": "img/12.JPG",
    "Country": "ABD",
    "Score": 36,
    "Release_Year": 2023,
    "Duration": 81
  },
  {
    "Index": 13,
    "Album": "ALTÜST",
    "Artist": "ATHENA",
    "Image": "img/13.JPG",
    "Country": "TÜRKİYE",
    "Score": 77,
    "Release_Year": 2014,
    "Duration": 61
  },
  {
    "Index": 14,
    "Album": "DISCOVERY",
    "Artist": "DAFT PUNK",
    "Image": "img/14.JPG",
    "Country": "FRANSA",
    "Score": 64,
    "Release_Year": 2001,
    "Duration": 61
  },
  {
    "Index": 15,
    "Album": "İÇİMDEKİ İZ",
    "Artist": "PEYK",
    "Image": "img/15.JPG",
    "Country": "TÜRKİYE",
    "Score": 100,
    "Release_Year": 2011,
    "Duration": 36
  },
  {
    "Index": 16,
    "Album": "NEVERMIND",
    "Artist": "NIRVANA",
    "Image": "img/16.JPG",
    "Country": "ABD",
    "Score": 77,
    "Release_Year": 1991,
    "Duration": 49
  },
  {
    "Index": 17,
    "Album": "ARRIVAL",
    "Artist": "ABBA",
    "Image": "img/17.JPG",
    "Country": "İSVEÇ",
    "Score": 58,
    "Release_Year": 1976,
    "Duration": 41
  },
  {
    "Index": 18,
    "Album": "3 AKORUN İNTİKAMI",
    "Artist": "KİLİNK",
    "Image": "img/18.JPG",
    "Country": "TÜRKİYE",
    "Score": 92,
    "Release_Year": 2004,
    "Duration": 28
  },
  {
    "Index": 19,
    "Album": "MOVING PICTURES",
    "Artist": "RUSH",
    "Image": "img/19.JPG",
    "Country": "TÜRKİYE",
    "Score": 86,
    "Release_Year": 1981,
    "Duration": 40
  },
  {
    "Index": 20,
    "Album": "KÖTÜ ŞEYLER",
    "Artist": "SON FECİ BİSİKLET",
    "Image": "img/20.JPG",
    "Country": "TÜRKİYE",
    "Score": 80,
    "Release_Year": 2017,
    "Duration": 32
  },
  {
    "Index": 21,
    "Album": "OLASI DANS ŞARKILARIMIZ",
    "Artist": "BEYAZ HAYVANLAR",
    "Image": "img/21.JPG",
    "Country": "TÜRKİYE",
    "Score": 67,
    "Release_Year": 2025,
    "Duration": 34
  },
  {
    "Index": 22,
    "Album": "TOXICITY",
    "Artist": "SYSTEM OF A DOWN",
    "Image": "img/22.JPG",
    "Country": "ABD",
    "Score": 67,
    "Release_Year": 2001,
    "Duration": 44
  },
  {
    "Index": 23,
    "Album": "PRINCESS OF POWER",
    "Artist": "MARINA",
    "Image": "img/23.JPG",
    "Country": "İNGİLTERE",
    "Score": 92,
    "Release_Year": 2025,
    "Duration": 47
  },
  {
    "Index": 24,
    "Album": "MANİFESTİVAL",
    "Artist": "MANİFEST",
    "Image": "img/24.JPG",
    "Country": "TÜRKİYE",
    "Score": 55,
    "Release_Year": 2025,
    "Duration": 26
  },
  {
    "Index": 25,
    "Album": "İSTANBUL SOKAKLARI",
    "Artist": "KRAMP",
    "Image": "img/25.JPG",
    "Country": "TÜRKİYE",
    "Score": 55,
    "Release_Year": 1998,
    "Duration": 43
  },
  {
    "Index": 26,
    "Album": "YENİDEN DOĞUŞ",
    "Artist": "HARDAL",
    "Image": "img/26.JPG",
    "Country": "TÜRKİYE",
    "Score": 92,
    "Release_Year": 1999,
    "Duration": 49
  },
  {
    "Index": 27,
    "Album": "KARMA",
    "Artist": "TARKAN",
    "Image": "img/27.jpg",
    "Country": "TÜRKİYE",
    "Score": 67,
    "Release_Year": 2001,
    "Duration": 49
  },
  {
    "Index": 28,
    "Album": "İNSANLIK HALLERİ",
    "Artist": "TEOMAN",
    "Image": "img/28.jpg",
    "Country": "TÜRKİYE",
    "Score": 73,
    "Release_Year": 2009,
    "Duration": 52
  },
  {
    "Index": 29,
    "Album": "HURRY UP WE'RE DREAMING",
    "Artist": "M83",
    "Image": "img/29.jpg",
    "Country": "FRANSA",
    "Score": 45,
    "Release_Year": 2011,
    "Duration": 73
  },
  {
    "Index": 30,
    "Album": "BİR İLERİ",
    "Artist": "BİRİLERİ",
    "Image": "img/30.jpg",
    "Country": "TÜRKİYE",
    "Score": 88,
    "Release_Year": 2016,
    "Duration": 32
  },
  {
    "Index": 31,
    "Album": "SEN GİBİ",
    "Artist": "NEV",
    "Image": "img/31.jpg",
    "Country": "TÜRKİYE",
    "Score": 73,
    "Release_Year": 2004,
    "Duration": 47
  },
  {
    "Index": 32,
    "Album": "TEA FOR THE TILLERMAN",
    "Artist": "CAT STEVENS",
    "Image": "img/32.jpg",
    "Country": "İNGİLTERE",
    "Score": 55,
    "Release_Year": 1970,
    "Duration": 36
  },
  {
    "Index": 33,
    "Album": "HAYAT",
    "Artist": "SAKİN",
    "Image": "img/33.jpg",
    "Country": "TÜRKİYE",
    "Score": 73,
    "Release_Year": 2008,
    "Duration": 46
  },
  {
    "Index": 34,
    "Album": "PUNK ÖLMEDİ AMA TUHAF KOKUYOR",
    "Artist": "ROBIN",
    "Image": "img/34.jpg",
    "Country": "TÜRKİYE",
    "Score": 64,
    "Release_Year": 2025,
    "Duration": 21
  },
  {
    "Index": 35,
    "Album": "L'ULTIMA FESTA",
    "Artist": "COSMO",
    "Image": "img/35.jpg",
    "Country": "İTALYA",
    "Score": 50,
    "Release_Year": 2016,
    "Duration": 34
  },
  {
    "Index": 36,
    "Album": "FEAR OF THE DARK (2015 REMASTER)",
    "Artist": "IRON MAIDEN",
    "Image": "img/36.jpg",
    "Country": "İNGİLTERE",
    "Score": 83,
    "Release_Year": 1992,
    "Duration": 58
  },
  {
    "Index": 37,
    "Album": "Y.O.K.",
    "Artist": "ÇİLEKEŞ",
    "Image": "img/37.jpeg",
    "Country": "TÜRKİYE",
    "Score": 64,
    "Release_Year": 2005,
    "Duration": 61
  },
  {
    "Index": 38,
    "Album": "ELEPHANT",
    "Artist": "THE WHITE STRIPES",
    "Image": "img/38.jpg",
    "Country": "ABD",
    "Score": 93,
    "Release_Year": 2003,
    "Duration": 50
  },
  {
    "Index": 39,
    "Album": "AFİLLİ YALNIZLIK",
    "Artist": "EMRE AYDIN",
    "Image": "img/39.webp",
    "Country": "TÜRKİYE",
    "Score": 80,
    "Release_Year": 2006,
    "Duration": 42
  },
  {
    "Index": 40,
    "Album": "GOOD NEWS FOR PEOPLE WHO LOVES BAD NEWS",
    "Artist": "MODEST MOUSE",
    "Image": "img/40.webp",
    "Country": "ABD",
    "Score": 44,
    "Release_Year": 2004,
    "Duration": 48
  },
  {
    "Index": 41,
    "Album": "BLACK HOLES AND REVELATIONS",
    "Artist": "MODEST MOUSE",
    "Image": "img/41.webp",
    "Country": "İNGİLTERE",
    "Score": 75,
    "Release_Year": 2006,
    "Duration": 50
  },
  {
    "Index": 42,
    "Album": 22,
    "Artist": "MOTİVE",
    "Image": "img/42.webp",
    "Country": "TÜRKİYE",
    "Score": 71,
    "Release_Year": 2022,
    "Duration": 19
  },
  {
    "Index": 43,
    "Album": "MESAFE",
    "Artist": "SERDAR ORTAÇ",
    "Image": "img/43.webp",
    "Country": "TÜRKİYE",
    "Score": 88,
    "Release_Year": 2006,
    "Duration": 79
  },
  {
    "Index": 44,
    "Album": "BRAT",
    "Artist": "CHARLI XCX",
    "Image": "img/44.webp",
    "Country": "İNGİLTERE",
    "Score": 73,
    "Release_Year": 2024,
    "Duration": 41
  },
  {
    "Index": 45,
    "Album": "PABLO HONEY",
    "Artist": "RADIOHEAD",
    "Image": "img/45.webp",
    "Country": "İNGİLTERE",
    "Score": "n/a",
    "Release_Year": 1993,
    "Duration": 42
  },
  {
    "Index": 46,
    "Album": "TOURIST HISTORY",
    "Artist": "TWO DOORS CINEMA CLUB",
    "Image": "img/46.webp",
    "Country": "KUZEY İRLANDA",
    "Score": "n/a",
    "Release_Year": 2010,
    "Duration": 32
  },
  {
    "Index": 47,
    "Album": "AFTER HOURS",
    "Artist": "THE WEEKND",
    "Image": "img/47.webp",
    "Country": "KANADA",
    "Score": "n/a",
    "Release_Year": 2020,
    "Duration": 56
  },
  {
    "Index": 48,
    "Album": "TELL ME I'M PRETTY",
    "Artist": "CAGE THE ELEPHANT",
    "Image": "img/48.webp",
    "Country": "ABD",
    "Score": "n/a",
    "Release_Year": 2015,
    "Duration": 38
  },
  {
    "Index": 49,
    "Album": "PUBERTY 2",
    "Artist": "MITSKI",
    "Image": "img/49.webp",
    "Country": "ABD",
    "Score": "n/a",
    "Release_Year": 2016,
    "Duration": 31
  },
  {
    "Index": 50,
    "Album": "PROJE",
    "Artist": "ERDEM KINAY",
    "Image": "img/50.webp",
    "Country": "TÜRKİYE",
    "Score": "n/a",
    "Release_Year": 2012,
    "Duration": 43
  },
  {
    "Index": 51,
    "Album": "SAM'S TOWN",
    "Artist": "THE KILLERS",
    "Image": "img/51.webp",
    "Country": "ABD",
    "Score": "n/a",
    "Release_Year": 2006,
    "Duration": 44
  },
  {
    "Index": 52,
    "Album": "DANS İLLÜZYON",
    "Artist": "SOFT ANALOG",
    "Image": "img/52.webp",
    "Country": "TÜRKİYE",
    "Score": "n/a",
    "Release_Year": 2023,
    "Duration": 31
  }
];

async function saveAlbumsForUser() {
  const userRef = doc(db, "users", "jDXbmNwAPKYFIoRZfyDIC7RgEJ02");

  await setDoc(
    userRef,
    {
      albums: albums
    },
    { merge: true } // mevcut kullanıcı bilgilerini silmesin, üzerine eklesin
  );

  console.log("Albüm datası başarıyla yüklendi!");
}
saveAlbumsForUser();
