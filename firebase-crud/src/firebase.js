// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD3QRWfbUO5whLlMF_Soyik67jfpnA151s",
  authDomain: "safety-paris.firebaseapp.com",
  databaseURL: "https://safety-paris-default-rtdb.firebaseio.com",
  projectId: "safety-paris",
  storageBucket: "safety-paris.appspot.com",
  messagingSenderId: "100574226816",
  appId: "1:100574226816:web:a4bb8be7ebf48a071e7965",
  measurementId: "G-L6M86H2ZDX",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Get a reference to the database service
const database = getDatabase(app);

export { database };
