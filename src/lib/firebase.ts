import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { userFirebaseConfig } from "./firebaseConfig";

// Initialize Firebase with USER'S custom config
const app = initializeApp(userFirebaseConfig);
export const db = getFirestore(app, (userFirebaseConfig as any).firestoreDatabaseId);
export const auth = getAuth(app);

console.log("Client-side Firebase initialized with user project:", userFirebaseConfig.projectId);
