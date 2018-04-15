import { XMLHttpRequest } from 'xmlhttprequest';
import { https } from 'firebase-functions';
import path from 'path';
import fs from 'fs';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import * as _ from 'lodash';
import App, { makeRegistry } from '../frontend/app';
import makeStore from '../frontend/make-store';
import firebaseTools, { whenAuthReady } from '../frontend/firebaseTools';
import express from 'express';
import firebaseMiddleware from './firebase-express-middleware';
import firebase from 'firebase';
import admin from 'firebase-admin';
import history, { createMemoryHistory } from 'history';

// needed to fix "Error: The XMLHttpRequest compatibility library was not found." in Firebase client SDK.
global.XMLHttpRequest = XMLHttpRequest;
const firebaseConfig = require('../frontend/firebase-config.json').result;
const baseTemplate = fs.readFileSync(path.resolve(__dirname, './index.html'));
const template = _.template(baseTemplate);
const router = new express.Router();
const serviceAccount = require('./service-account-credentials.json');
const firebaseAdminApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
}, '__service_account');


const cacheControlHeaderValues = {};

// This Express middleware will check ig there is a Firebase ID token and inject
router.use(firebaseMiddleware.auth({
  checkCookie: true,
  generateCustomToken: true,
  firebaseAdminApp: firebaseAdminApp
}));

router.get('*', (req, res) => {
  const user = req.user || {};
  createFirebaseAppWithSignedInUser(user.uid, user.token).then(firebaseApp => {
      // We make sure that the firebase auth state listeners are triggered again.
      // Create the redux store.
      const history = createMemoryHistory();
      // Set the new URL.
      history.replace(req.url);
      const store = makeStore(history, firebaseApp);
      const registry = makeRegistry();
        
      // Wait for auth to be ready.
      whenAuthReady(store).then(() => {
        const root = React.createElement(App, {registry, store, history});
        const body = ReactDOMServer.renderToString(root);
        const initialState = store.getState();
        const css = registry.toString();
        const lastUrl = initialState.router.location.pathname;

        if (lastUrl !== req.url) {
          // If there has been a redirect we redirect server side.
          console.log('Server side redirect to', lastUrl);
          res.redirect(lastUrl);
        } else {
          // res.set('Cache-Control', 'public, max-age=60, s-maxage=180'); // TODO: make this change dependent on each URL. with a map maybe??
          // If there was no redirect we send the rendered app as well as the redux state.
          res.send(template({body, initialState, css, node_env: process.env.NODE_ENV}));
        }
    }, 200).catch(error => {
      console.log('There was an error', error);
      res.status(500).send(error);
    });
  }).catch(error => {
    console.log('There was an error', error);
    res.status(500).send(error);
  });
});

/**
 * Helper function to get the markup from React, inject the initial state, and
 * send the server-side markup to the client
 */
exports = module.exports = https.onRequest(router);

/**
 * Returns a Firebase App instance
 *
 * @param {String} uid - The UID of the user to sign in the app.
 * @param {String} customToken - A custom token to sign the user in the app.
 * @return {Promise<Object>} - A Firebase App instance specific to the given user with the user already signed-in.
 */
function createFirebaseAppWithSignedInUser(uid = undefined, customToken) {
  // Instantiate a Firebase app.
  let firebaseApp;
  // Try to re-use cached firebase App.
  try {
    firebaseApp = firebase.app(/* uid */); // Uncomment. aka create named apps whe this bug is fixed: https://github.com/prescottprue/react-redux-firebase/issues/250
    console.log('Re-used a cached app for UID', uid);
  } catch(e) {
    firebaseApp = firebase.initializeApp(firebaseConfig/* , uid */); // Uncomment. aka create named apps when this bug is fixed: https://github.com/prescottprue/react-redux-firebase/issues/250
    console.log('Created a new Firebase App instance for UID', uid);
  }

  // Check if a Firebase user was signed in and a custom auth token was generated.
  let signInPromise;
  const firebaseAppUid = firebaseApp.auth().currentUser ? firebaseApp.auth().currentUser.uid : undefined;
  if (uid === firebaseAppUid) {
    signInPromise = Promise.resolve();
    console.log('Firebase App instance auth state is already correct.');
  } else if (uid && customToken) {
    console.log('Need to sign in user in Firebase App instance.');
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
