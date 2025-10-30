const firebaseConfig = {
    apiKey: "AIzaSyA60-akW_V273dqni9Uf6v7AQCACzG0gV8",
    authDomain: "rehcreation.firebaseapp.com",
    projectId: "rehcreation",
    storageBucket: "rehcreation.firebasestorage.app",
    messagingSenderId: "1029621535215",
    appId: "1:1029621535215:web:11a5bd5d0ed3980193661a",
    measurementId: "G-ZQ92JHWJ8E"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth(); // Firebase Authentication
const db = firebase.firestore(); // Firebase Firestore Database

console.log('Firebase initialized successfully!');
