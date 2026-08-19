import {initializeApp} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {getAuth,createUserWithEmailAndPassword,signInWithEmailAndPassword,sendPasswordResetEmail,signOut,onAuthStateChanged,updateProfile} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import {getFirestore,doc,setDoc,getDoc,collection,addDoc,getDocs,query,where} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const config={
  projectId:"axbetorg",
  storageBucket:"axbetorg.firebasestorage.app",
  apiKey:"AIzaSyAzPEUEbyQTxZmlHExSqQMYqJZiM1p9fY8",
  appId:"1:910584871383:android:2ba95c9dc4ce007dc17392"
};
const app=initializeApp(config);
export const auth=getAuth(app);
export const db=getFirestore(app);
export {createUserWithEmailAndPassword,signInWithEmailAndPassword,sendPasswordResetEmail,signOut,onAuthStateChanged,updateProfile,doc,setDoc,getDoc,collection,addDoc,getDocs,query,where};
