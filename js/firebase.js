import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

//DUYUŞ FEST, DUYUŞ FEST, DUYUŞ FEST
const firebaseConfig = {
    apiKey: "AIzaSyDRg4C-7Z_MptW2Qdpdw38DTwBizF2kV50",
    authDomain: "duyusfest.firebaseapp.com",
    projectId: "duyusfest",
    storageBucket: "duyusfest.firebasestorage.app",
    messagingSenderId: "1034831755567",
    appId: "1:1034831755567:web:e598a78920ce6ed11ec9da",
    measurementId: "G-5SF2WLBMMP"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
