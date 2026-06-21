import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDFMIRL6Q9bcSZMpxgy0ZGklx0UglpCVQY",
  authDomain: "thegoodshepherd-50f8d.firebaseapp.com",
  projectId: "thegoodshepherd-50f8d",
  storageBucket: "thegoodshepherd-50f8d.firebasestorage.app",
  messagingSenderId: "90669916743",
  appId: "1:90669916743:web:803fde89a95324acea4762"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Enable offline persistence for Firestore
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn("Multiple tabs open, offline persistence disabled for this tab.");
  } else if (err.code === 'unimplemented') {
    console.warn("Current browser does not support offline persistence.");
  }
});

// Helper to ensure the user is anonymously signed in
export const signInUserAnonymously = async () => {
  try {
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  } catch (error) {
    console.error("Firebase Anonymous Auth Error:", error);
    return null;
  }
};
