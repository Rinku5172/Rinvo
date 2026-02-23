// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB-B2Ig87OM6X-Ar7RxcZW6FS6tzXE2a8A",
    authDomain: "live-chat-c1043.firebaseapp.com",
    databaseURL: "https://live-chat-c1043-default-rtdb.firebaseio.com",
    projectId: "live-chat-c1043",
    storageBucket: "live-chat-c1043.firebasestorage.app",
    messagingSenderId: "14427176503",
    appId: "1:14427176503:web:a0d9f1584fc88e9782c9b2",
    measurementId: "G-04JG218DFB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

console.log("Firebase initialized successfully");

// Expose app to window for debugging if needed
window.firebaseApp = app;
