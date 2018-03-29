import * as firebase from 'firebase';
import flamelink from 'flamelink';
import 'firebase/firestore';

const config = {
  apiKey: "AIzaSyAKPFpSGtSgthnTtnlk1kIxbZBiOgRNv-0",
  authDomain: "scuba-diver-expert.firebaseapp.com",
  databaseURL: "https://scuba-diver-expert.firebaseio.com",
  projectId: "scuba-diver-expert",
  storageBucket: "scuba-diver-expert.appspot.com",
  messagingSenderId: "121777976722"
};

const firebaseApp = !firebase.apps.length 
  ? firebase.initializeApp(config).firestore()
  : firebase.app().firestore();


