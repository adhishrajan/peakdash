// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBwCCtCAtY28wJuIWqAyO0rNm-ZjpbyBPU",
    authDomain: "cs-8803-mas-7455d.firebaseapp.com",
    projectId: "cs-8803-mas-7455d",
    storageBucket: "cs-8803-mas-7455d.firebasestorage.app",
    messagingSenderId: "75896788715",
    appId: "1:75896788715:web:d49357e123e1f5b52c10ae",
    measurementId: "G-6VJ68QN778"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
