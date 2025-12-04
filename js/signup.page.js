import { auth, db } from "./firebase.js";
import {
    createUserWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
    doc,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById("signupForm");

    //KULLANICI KAYIT FORMU
    if (signupForm) {
        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            //KULLANICI ADI TAMAMEN KÜÇÜK HARFE ÇEVRİLİYOR, 3 KARAKTERDEN AZ İSE VEYA 
            //ÖZEL SEMBOLLER İÇERİYORSA KAYIT EDİLMEYİP, KULLANICIYA UYARI GÖNDERİLİYOR
            const rawUsername = signupUsername.value;
            const username = rawUsername.trim().toLowerCase();

            if (username.length < 3) {
                alert("Kullanıcı adı en az 3 karakter olmalı!");
                return;
            }

            const validUsernameRegex = /^[a-z0-9]+$/;
            if (!validUsernameRegex.test(username)) {
                alert("Kullanıcı adı sadece İngilizce harf (a-z) ve rakam içerebilir. Boşluk, Türkçe karakter ve sembol kullanma.");
                return;
            }

            // KULLANICI ADI VERİTABANINDA VARSA UYARI GÖNDERİLİYOR
            try {
                const userRef = doc(db, "users", username);
                const snap = await getDoc(userRef);
                if (snap.exists()) {
                    alert("Bu kullanıcı adı zaten alınmış!");
                    return;
                }
                //BİR SORUN YOKSA EMAIL VE ŞİFRE İLE HESAP OLUŞTURULUYOR.
                const email = signupEmail.value;
                const password = signupPassword.value;
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);

                //KULLANICININ KİMLİK BİLGİSİ(USER IDENTIFIER) İLE USERNAME'İ DISPLAYNAME OLARAK PROFİLE EKLİYORUZ
                const uid = userCredential.user.uid;
                await updateProfile(userCredential.user, { displayName: username });

                //KULLANICININ BİLGİLERİNİ VERİTABANINA EKLİYORUZ. ARDINDAN KULLANICININ SAYFASINA YÖNLENDİRİYORUZ.
                await setDoc(userRef, {
                    uid,
                    email,
                    createdAt: new Date(),
                    albumCount: 0

                });
                window.location.href = "index.html";

            } catch (err) {
                alert(err.message);
            }
        });
    }
});