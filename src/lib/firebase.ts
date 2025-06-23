// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, setDoc, serverTimestamp, type Firestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDE3bJ_94ioTUXhF71gpDs9DP_TDkx7fq4",
  authDomain: "vida-integrada.firebaseapp.com",
  projectId: "vida-integrada",
  storageBucket: "vida-integrada.firebasestorage.app",
  messagingSenderId: "824927129146",
  appId: "1:824927129146:web:f9c91d122591a26ef3af03"
};

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;

if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
  } catch (e) {
    console.error("Error initializing Firebase", e);
  }
} else {
  console.error("Firebase configuration is incomplete. Firebase features will be disabled.");
}

export { app, db, auth, doc, onSnapshot, setDoc, serverTimestamp };
