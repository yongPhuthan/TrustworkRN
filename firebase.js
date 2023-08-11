// Import the functions you need from the SDKs you need
import firebase from '@react-native-firebase/app';
import { Platform } from 'react-native';

const firebaseConfig = {
    apiKey: "AIzaSyBGN-aq1pEffu-OA2LkaRBNKJvQo5L79Tc",
    authDomain: "trustwork-app.firebaseapp.com",
    projectId: "trustwork-app",
    storageBucket: "trustwork-app.appspot.com",
    messagingSenderId: "45749402805",
    appId: "1:45749402805:web:4d6b1796316c12a33692fc",
    measurementId: "G-BELHE8Q5XT",
  databaseURL: 'gs://trustwork-app.appspot.com',
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

if (__DEV__) {
  let emulatorHost = 'http://localhost';
  if (Platform.OS === 'android') {
    emulatorHost = 'http://124.120.205.238';
  }
//   firebase.functions().useEmulator(emulatorHost, 5001);
  firebase.auth().useEmulator(`${emulatorHost}:9099`);
  firebase.firestore().useEmulator(emulatorHost, 8080)
  console.log('emulator' + emulatorHost);
}

console.log('Firebase App name: ', firebase.app().name);

export default firebase;
