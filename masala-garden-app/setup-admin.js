/* eslint-disable @typescript-eslint/no-require-imports */
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');

const firebaseConfig = {
  apiKey: "AIzaSyBqCNRf1hJ-m2MEMupgVZ5ZZ_DChY4HoYY",
  authDomain: "masala-garden.firebaseapp.com",
  projectId: "masala-garden",
  storageBucket: "masala-garden.firebasestorage.app",
  messagingSenderId: "930934827137",
  appId: "1:930934827137:web:efa1f74c0646ce1c7dc580"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

createUserWithEmailAndPassword(auth, 'masalagardenoluvil@gmail.com', 'r1e2e3h4a')
  .then(() => {
    console.log('SUCCESS: Admin user created successfully!');
    console.log('Email: masalagardenoluvil@gmail.com');
    console.log('Password: r1e2e3h4a');
    process.exit(0);
  })
  .catch((error) => {
    if (error.code === 'auth/email-already-in-use') {
      console.log('Admin user already exists - ready to use!');
      process.exit(0);
    }
    console.log('Error:', error.message);
    process.exit(1);
  });
