// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
export const firebaseConfig = { // <-- Export firebaseConfig
  apiKey: "AIzaSyBiVi586v55EBknoBWXcolH5i1q83hFCvE",
  authDomain: "asdfghjkl-cccfd.firebaseapp.com",
  projectId: "asdfghjkl-cccfd",
  storageBucket: "asdfghjkl-cccfd.firebasestorage.app",
  messagingSenderId: "76671857119",
  appId: "1:76671857119:web:9c9414e08580f47447946a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);