import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC5hyW3l064LrbjhS91SDVcNaSM67YPTX0",
  authDomain: "midiabook.firebaseapp.com",
  projectId: "midiabook",
  storageBucket: "midiabook.firebasestorage.app",
  messagingSenderId: "1016977765660",
  appId: "1:1016977765660:web:f37fb1a913ba4cbc0136d9",
  measurementId: "G-TKDHJEBMVQ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);