// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
  getStorage
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js";

// Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCzBXby0fD2fg1nR6vhNtnb_-gWfIXzVAU",
  authDomain: "our-little-diary-44f7e.firebaseapp.com",
  projectId: "our-little-diary-44f7e",
  storageBucket: "our-little-diary-44f7e.firebasestorage.app",
  messagingSenderId: "579459093614",
  appId: "1:579459093614:web:ceff48cb5797695ebd427f"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Export service
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
