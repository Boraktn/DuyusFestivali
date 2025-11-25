import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// 🔹 Kayıt
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = signupEmail.value;
    const password = signupPassword.value;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: email,
        createdAt: new Date()
      });
      alert("Kayıt başarılı!");
      window.location.href = "index.html";
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
      await signInWithEmailAndPassword(auth, email, password);
      alert("Giriş başarılı!");
      window.location.href = "index.html";
    } catch (err) {
      alert(err.message);
    }
  });
}

// 🔹 Oturum kontrolü
onAuthStateChanged(auth, (user) => {
  if (user && window.location.pathname.endsWith("login.html")) {
    window.location.href = "index.html";
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
