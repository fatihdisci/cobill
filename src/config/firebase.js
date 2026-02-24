// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyC0DHZdXrK3a01hngOGmDEDRON1BcWI7uw",
    authDomain: "cobill-52909.firebaseapp.com",
    projectId: "cobill-52909",
    storageBucket: "cobill-52909.firebasestorage.app",
    messagingSenderId: "764092752651",
    appId: "1:764092752651:web:3490ee1a4688164755380e",
    measurementId: "G-WL6E21B97P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
// Enable offline persistence
export const db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});
