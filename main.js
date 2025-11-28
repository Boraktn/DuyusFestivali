import { addAlbumForUser } from "./album.js";

// Test amaçlı kullanacağın albüm objesi
// Gerçekte bunu kartlardan/aramadan alacaksın
const testAlbum = {
  Index: 1,
  Album: "HIT ME HARD AND SOFT",
  Artist: "BILLIE EILISH",
  Image: "https://i.scdn.co/image/ab67616d00001e02758ab206da1e32aa315ac2e8",
  Country: "ABD",
  Score: 40,
  Release_Year: 2024,
  Duration: 43
};

document.getElementById("addAlbumBtn").addEventListener("click", () => {
  addAlbumForUser(testAlbum);
});
