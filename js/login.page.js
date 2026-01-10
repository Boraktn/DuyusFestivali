import { auth } from "./firebase.js";
import {
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";


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
                    return;
                }
                window.location.href = "index.html";

            } catch (err) {
                showMessage("Giriş Başarısız.");

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
function showMessage(msg) {
    const box = document.getElementById("authMessage");
    if (!box) return;
    box.textContent = msg;
    box.style.display = "block";
}
const forgotBtn = document.getElementById("forgotPasswordBtn");
const forgotModal = document.getElementById("forgotModal");
const forgotCloseBtn = document.getElementById("forgotCloseBtn");
const forgotForm = document.getElementById("forgotForm");
const forgotEmail = document.getElementById("forgotEmail");
const forgotMsg = document.getElementById("forgotMsg");

function openForgotModal() {
  forgotModal.style.display = "grid";
  forgotModal.setAttribute("aria-hidden", "false");
  forgotMsg.style.display = "none";
  forgotMsg.textContent = "";
  forgotEmail.value = document.getElementById("loginEmail")?.value?.trim() || "";
  setTimeout(() => forgotEmail.focus(), 0);
}

function closeForgotModal() {
  forgotModal.style.display = "none";
  forgotModal.setAttribute("aria-hidden", "true");
}

// Aç / kapa
forgotBtn.addEventListener("click", openForgotModal);
forgotCloseBtn.addEventListener("click", closeForgotModal);

// Backdrop’a tıklayınca kapansın
forgotModal.addEventListener("click", (e) => {
  if (e.target === forgotModal) closeForgotModal();
});

// ESC ile kapansın
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && forgotModal.style.display !== "none") closeForgotModal();
});

// Mail gönderme
forgotForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  forgotMsg.style.display = "none";
  forgotMsg.textContent = "";

  const email = forgotEmail.value.trim().toLowerCase();
  if (!email) return;

  try {
    const actionCodeSettings = {
      url: "https://duyusfestivali.com/login.html",
      handleCodeInApp: false,
    };

    await sendPasswordResetEmail(auth, email, actionCodeSettings);

    // Güvenlik: email var/yok sızdırmamak için genel mesaj
    forgotMsg.style.display = "block";
    forgotMsg.textContent =
      "Eğer bu e-posta kayıtlıysa, şifre sıfırlama bağlantısı gönderildi. Gelen kutunu/spam’i kontrol et.";

  } catch (err) {
    const code = err?.code || "";

    forgotMsg.style.display = "block";
    if (code === "auth/invalid-email") {
      forgotMsg.textContent = "E-posta formatı geçersiz.";
    } else if (code === "auth/too-many-requests") {
      forgotMsg.textContent = "Çok fazla deneme yapıldı. Bir süre sonra tekrar dene.";
    } else {
      forgotMsg.textContent =
        "Eğer bu e-posta kayıtlıysa, şifre sıfırlama bağlantısı gönderildi.";
    }

    console.error(err);
  }
});