// @ts-ignore - Firebase types
import { initializeApp } from "firebase/app";
// @ts-ignore - Firebase types
import { getDatabase, ref, set, get, update, remove, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBdkxR0tSpwJw1oOwQ3Y1qzZx142w-H4bo",
  authDomain: "nenestyle-9d4ba.firebaseapp.com",
  projectId: "nenestyle-9d4ba",
  storageBucket: "nenestyle-9d4ba.firebasestorage.app",
  messagingSenderId: "271313129581",
  appId: "1:271313129581:web:f045e816e213f295636f64",
  measurementId: "G-M679PDRGMK",
  databaseURL: "https://nenestyle-9d4ba-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, set, get, update, remove, onValue };
export default app;
