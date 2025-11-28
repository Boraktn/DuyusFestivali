import { auth, db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";


export async function addAlbumForUser(album) {

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
  console.log("currentUser:", user);
  console.log("username in LS:", username);
  try {
    const albumsRef = collection(db, "users", username, "albums");
        console.log("Yazılacak path:", albumsRef.path);

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