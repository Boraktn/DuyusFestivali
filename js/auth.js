import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile            
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
// 🔹 Kayıt
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const rawUsername = signupUsername.value;
    const username = rawUsername.trim().toLowerCase();

    // 1) Boş / çok kısa kontrolü
    if (username.length < 3) {
      alert("Kullanıcı adı en az 3 karakter olmalı!");
      return;
    }

    // 2) Geçersiz karakter kontrolü
    // Sadece a–z ve 0–9 kabul ediliyor
    const validUsernameRegex = /^[a-z0-9]+$/;

    if (!validUsernameRegex.test(username)) {
      alert("Kullanıcı adı sadece İngilizce harf (a-z) ve rakam içerebilir. Boşluk, Türkçe karakter ve sembol kullanma.");
      return;
    }

    const email = signupEmail.value;
    const password = signupPassword.value;
    try {
    // 1) Username var mı?
    const userRef = doc(db, "users", username);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      alert("Bu kullanıcı adı zaten alınmış!");
      return;
    }
    
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const uid = userCredential.user.uid;
          await updateProfile(userCredential.user, { displayName: username });
          const uname = userCredential.user.displayName;
                localStorage.setItem("username", uname);



      await setDoc(userRef, {
      uid,
      email,
      createdAt: new Date()
    });
      alert("Kayıt başarılı!");
      window.location.href = "main.html";
    } catch (err) {
      alert(err.message);
    }
  });
}

// 🔹 Giriş
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = loginEmail.value;
    const password = loginPassword.value;

    try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            const username = userCredential.user.displayName;
      if (!username) {
        alert("Kullanıcı adın profilde bulunamadı. Lütfen tekrar kayıt ol.");
        return;
      }
      localStorage.setItem("username", username);
      alert("Giriş başarılı!");
      window.location.href = "main.html";
      
    } catch (err) {
      alert(err.message);
    }
  });
}

// 🔹 Oturum kontrolü
onAuthStateChanged(auth, (user) => {
  if (user && window.location.pathname.endsWith("login.html")) {
    //window.location.href = "main.html";
  }
});

// 🔹 Çıkış
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "login.html";
  });
}
