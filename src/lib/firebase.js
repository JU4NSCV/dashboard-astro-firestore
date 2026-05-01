import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Importa Firestore

const firebaseConfig = {
  apiKey: "AIzaSyCTdQ10Pu9...", // Tus keys actuales
  authDomain: "loginunity-58dd2.firebaseapp.com",
  projectId: "loginunity-58dd2",
  storageBucket: "loginunity-58dd2.firebasestorage.app",
  messagingSenderId: "1046363395594",
  appId: "1:1046363395594:web:a2d2a8ff5384fde48ef1f3",
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta la base de datos para usarla en todo el proyecto
export const db = getFirestore(app);
