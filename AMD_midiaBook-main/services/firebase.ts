// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, } from "firebase/auth";
import {getFirestore} from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyCvQGKuhM1pYVAe9Zbc03jDqhahLx0MmP0",
  authDomain: "media-final-a0c45.firebaseapp.com",
  projectId: "media-final-a0c45",
  storageBucket: "media-final-a0c45.firebasestorage.app",
  messagingSenderId: "746108505316",
  appId: "1:746108505316:web:9aa840c0f4079c619c30f1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
