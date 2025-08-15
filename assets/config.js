// Import the necessary functions from the Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDa4p0t6Pi42bT1XFtliEXEIEGjckKmess",
    authDomain: "videyin.firebaseapp.com",
    projectId: "videyin",
    storageBucket: "videyin.firebasestorage.app",
    messagingSenderId: "64735373534",
    appId: "1:64735373534:web:1ffe4e85091490689c3a4f",
    databaseURL: "https://videyin-default-rtdb.firebaseio.com", // Often useful, good to have
    measurementId: "G-CBL1YM3B11" // For Google Analytics
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = 'videyin-app'; // Exporting app-specific constants is also a good practice

// You can also export the app instance if needed elsewhere
export default app;