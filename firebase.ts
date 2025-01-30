// firebase.js (or firebase.ts)
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// ... other Firebase imports as needed





//staging
const firebaseConfig = {
  apiKey: "AIzaSyBGU66tz9RqRkPUCzuQo_WPqkdlRJ5BXPc",
  authDomain: "bnxtstaging.firebaseapp.com",
  databaseURL: "https://bnxtstaging-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bnxtstaging",
  storageBucket: "bnxtstaging.appspot.com",
  messagingSenderId: "930298277788",
  appId: "1:930298277788:web:85ebf0aa19cbaf1c6a2259",
  measurementId: "G-3ENFNZCLPP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const firestore = getFirestore(app);


export { firestore }; // Export the firestore instance
// ... export other firebase modules if needed