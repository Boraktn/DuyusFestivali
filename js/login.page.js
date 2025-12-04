import { auth } from "./firebase.js";
import {
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");

    //KULLANICI GİRİŞ FORMU
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = loginEmail.value;
            const password = loginPassword.value;

            //EMAIL VE ŞİFREYLE GİRİŞ YAPILIR. 
            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                //KULLANICININ USERNAME'İ KİMLİK BİLGİLERİNE EKLENMİŞ Mİ KONTROL EDİYORUZ.
                //EĞER EKLİ DEĞİLSE UYARI GÖNDERİLİYOR.
                const username = userCredential.user.displayName;
                if (!username) {
                    alert("Kullanıcı adın profilde bulunamadı. Lütfen tekrar kayıt ol.");
                    return;
                }
                window.location.href = "index.html";

            } catch (err) {
                alert(err.message);
            }
        });
    }
});
//ZATEN GİRİŞ YAPMIŞ BİR KULLANICI LOGIN SAYFASINDA İSE KENDİ SAYFASINA YÖNLENDİRİLİR.
onAuthStateChanged(auth, (user) => {
    if (user && window.location.pathname.endsWith("login.html")) {
        window.location.href = "index.html";
    }
});