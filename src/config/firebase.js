import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "mock-api-key",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mock-auth-domain",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mock-project-id",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mock-storage-bucket",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "mock-sender-id",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "mock-app-id"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Firebase Cloud Messaging — lazy init
let messaging = null;
export const getMessagingInstance = async () => {
    if (messaging) return messaging;
    try {
        const supported = await isSupported();
        if (supported) {
            messaging = getMessaging(app);
        }
    } catch (e) {
        console.warn('[FCM] Messaging not supported:', e);
    }
    return messaging;
};
