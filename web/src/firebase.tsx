import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'
import 'firebase/functions'

// config file for database

// const firebaseConfig = {
//     apiKey: process.env.NEXT_APP_APIKEY,
//     authDomain: process.env.NEXT_APP_AUTHDOMAIN,
//     projectId: process.env.NEXT_APP_PID,
//     storageBucket: process.env.NEXT_APP_SB,
//     messagingSenderId: process.env.NEXT_APP_SID,
//     appId: process.env.NEXT_APP_APPID,
//     measurementId: process.env.NEXT_APP_MID
// };
const firebaseConfig = {
    apiKey: "AIzaSyBXyEiKCI7oId80eJOj1DOc6xUbJUbpbZE",
    authDomain: "donateatree-d0fd0.firebaseapp.com",
    projectId: "donateatree-d0fd0",
    storageBucket: "donateatree-d0fd0.appspot.com",
    messagingSenderId: "662272986207",
    appId: "1:662272986207:web:e342a5ccc632c87157dfea",
    measurementId: "G-BJ14Z2RNG7"
};
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const usersRef = firebase.firestore().collection('users');
const functions = firebase.functions();

export { firebase, auth, functions, usersRef }