import firebase from '@react-native-firebase/app';
import {
  FIREBASE_PROJECT_ID,
  FIREBASE_APP_ID,
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_MEASUREMENT_ID,
  FIREBASE_STORAGE_BUCKET,
} from '@env';
import {Platform} from 'react-native';
import '@react-native-firebase/auth';
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID,
};
console.log(FIREBASE_AUTH_DOMAIN);
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

if (__DEV__) {
  let emulatorHost = 'http://localhost';

  if (Platform.OS === 'android') {
    emulatorHost = 'http://127.0.0.1';
  }

  // firebase.functions().useEmulator(emulatorHost, 5001);
  firebase.auth().useEmulator(`${emulatorHost}:9099`);
  // firebase.firestore().useEmulator(emulatorHost, 8080)
  // firebase.storage().useEmulator(emulatorHost,9199)

  console.log('Using emulator at ' + emulatorHost);
}

console.log('Firebase App name: ', firebase.app().name);

export default firebase;
