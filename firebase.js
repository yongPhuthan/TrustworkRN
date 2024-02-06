import firebase from '@react-native-firebase/app';
import { Platform } from 'react-native';
import functions from '@react-native-firebase/functions';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { getStorage, isAvailable } from '@react-native-firebase/storage';
import messaging from '@react-native-firebase/messaging';
import auth from '@react-native-firebase/auth'
const firebaseConfig = {
  apiKey: "AIzaSyAlFmHGPiZC-XXlfQN37zbz5gV6dYDAsrU",
  authDomain: "workerfirebase-f1005.firebaseapp.com",
  projectId: "workerfirebase-f1005",
  storageBucket: "workerfirebase-f1005.appspot.com",
  messagingSenderId: "74243864435",
  appId: "1:74243864435:web:2725f00c276d20d66cf706",
  measurementId: "G-0PTNBY3B73"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// if (__DEV__) {
//   let emulatorHost = 'http://localhost'; 

//   if (Platform.OS === 'android') {
//     emulatorHost = 'http://127.0.0.1'; 
//   }

//   // firebase.functions().useEmulator(emulatorHost, 5001);
//   firebase.auth().useEmulator(`${emulatorHost}:9099`);
//   // firebase.firestore().useEmulator(emulatorHost, 8080)
//   // firebase.storage().useEmulator(emulatorHost,9199)

  
//   console.log('Using emulator at ' + emulatorHost);
// }

console.log('Firebase App name: ', firebase.app().name);


export default firebase;
