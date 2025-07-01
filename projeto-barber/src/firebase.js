// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAfgUvpQ37MGKvorkNi7RkUBu1Xhl3fAEU",
  authDomain: "rbibarberapp.firebaseapp.com",
  projectId: "rbibarberapp",
  storageBucket: "rbibarberapp.firebasestorage.app",
  messagingSenderId: "1058405040508",
  appId: "1:1058405040508:web:8875d42c2d1b6b0e8b24f9",
  measurementId: "G-R1847B8PT6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
