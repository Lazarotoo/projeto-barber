// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAfgUvpQ37MGKvorkNi7RkUBu1Xhl3fAEU",
  authDomain: "rbibarberapp.firebaseapp.com",
  projectId: "rbibarberapp",
  storageBucket: "rbibarberapp.firebasestorage.app",
  messagingSenderId: "1058405040508",
  appId: "1:1058405040508:web:8875d42c2d1b6b0e8b24f9",
  measurementId: "G-R1847B8PT6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const _analytics = getAnalytics(app);