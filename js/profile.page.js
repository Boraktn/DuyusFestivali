import {setViewMode, loadUserAlbumsGrid } from "./album.js";



document.addEventListener("DOMContentLoaded", () => {
  //HERHANGİ BİR KULLANICININ PROFİLİNE GÖZ ATMAK İÇİN 
  // U PARAMETRESİNDE KULLANICI ADIYLA BİRLİKTE PROFILE.HTML SAYFASINA YÖNLENDİRİLİR.
  const params = new URLSearchParams(window.location.search);
  const username = params.get("u");


  const usernameEl = document.getElementById("profileUsername");
  const errorEl = document.getElementById("profileError");
  const grid = document.getElementById("grid");

  if (!grid) return;
    //EĞER KULLANICI ADI DEĞERİ BOŞ İSE UYARI 
  if (!username) {
    if (errorEl) {
      errorEl.textContent = "Kullanıcı adı belirtilmemiş.";
      errorEl.style.display = "block";
    }
    grid.innerHTML = "";
    return;
  }

  if (usernameEl) usernameEl.textContent = `@${username}`;
  console.log("no set");
    loadUserAlbumsGrid(username)
    console.log("set");
  //GÖRÜNÜM MODU BELİRLENİP USERNAME İLE BİRLİKTE ALBUM.JS FONKSİYONUNA İLETİLİYOR.
  const gridViewBtn = document.getElementById("viewGrid");
  const wideViewBtn = document.getElementById("viewWide");
    if (gridViewBtn) {
        gridViewBtn.addEventListener("click", () => {
            setViewMode("grid",username);
        });
    }

    if (wideViewBtn) {
        wideViewBtn.addEventListener("click", () => {
            setViewMode("wide", username);
        });
    }
});
