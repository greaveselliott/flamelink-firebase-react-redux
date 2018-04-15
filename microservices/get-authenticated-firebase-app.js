import firebase, { app, initializeApp } from 'firebase';
const firebaseConfig = require('../frontend/firebase-config.json').result;

/**
 * Returns a Firebase App instance
 *
 * @param {String} uid - The UID of the user to sign in the app.
 * @param {String} customToken - A custom token to sign the user in the app.
 * @return {Promise<Object>} - A Firebase App instance specific to the given user with the user already signed-in.
 */
export default function getAuthenticatedFirebaseApp(uid = undefined, customToken) {
    // Instantiate a Firebase app.
    let firebaseApp;
    // Try to re-use cached firebase App.
    try {
      firebaseApp = app(/* uid */); // Uncomment. aka create named apps whe this bug is fixed: https://github.com/prescottprue/react-redux-firebase/issues/250
      console.log('Re-used a cached app for UID', uid);
    } catch(e) {
      firebaseApp = initializeApp(firebaseConfig/* , uid */); // Uncomment. aka create named apps when this bug is fixed: https://github.com/prescottprue/react-redux-firebase/issues/250
      console.log('Created a new Firebase App instance for UID', uid);
    }
  
    // Check if a Firebase user was signed in and a custom auth token was generated.
    let signInPromise;
    const firebaseAppUid = firebaseApp.auth().currentUser ? firebaseApp.auth().currentUser.uid : undefined;
    if (uid === firebaseAppUid) {
      signInPromise = Promise.resolve();
      console.log('Firebase App instance auth state is already correct.');
    } else if (uid && customToken) {
      console.log('Need to sign-in user into Firebase App instance.');
      signInPromise = firebaseApp.auth().signInWithCustomToken(customToken).then(user => {
        console.log('User now signed-in! uid:', user.uid);
      });
    } else {
      console.log('Need to sign out user in Firebase App instance.');
      signInPromise = firebaseApp.auth().signOut().then(() => {
        console.log('User now signed-out!');
      });
    }
  
    return signInPromise.then(() => firebaseApp);
  };