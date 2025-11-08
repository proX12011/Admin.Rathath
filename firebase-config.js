// تأكد من استبدال القيم بقيم مشروع Firebase الخاص بك
const firebaseConfig = {
  apiKey: "AIzaSyCI4Fd1iXcEwh_t6LZ5R9P9x8wGviwBm4s",
  authDomain: "rathath-1235a.firebaseapp.com",
  projectId: "rathath-1235a",
  storageBucket: "rathath-1235a.appspot.com",
  messagingSenderId: "195683399231",
  appId: "1:195683399231:web:f36dbf2ee1b6825feeaa8a"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
