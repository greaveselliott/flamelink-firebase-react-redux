/**
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// @flow

// React core.
import React from 'react';
import ReactDOM from 'react-dom';

// Firebase.
import firebase from 'firebase/app';
import 'firebase/auth';
import flamelink from 'flamelink';

// Redux.
import { Provider } from 'react-redux';
import { createStore, compose, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { reactReduxFirebase, getFirebase, firebaseStateReducer } from 'react-redux-firebase';

// Router.
import { createBrowserHistory } from 'history';
import { ConnectedRouter, routerReducer, routerMiddleware } from 'react-router-redux';

// JSS.
import { SheetsRegistry } from 'react-jss/lib/jss';
import JssProvider from 'react-jss/lib/JssProvider';
import { create } from 'jss';
import preset from 'jss-preset-default';

// Other.
import { canUseDOM } from 'exenv';

// Local.
import { whenAuthReady, keepIdTokenInCookie } from './firebaseTools';
import Routes from './Routes';

/**
 * Loads the App in a server context.
 *
 * This takes care of setting up JSS, the Theme, Redux and the Router.
 */
export class App extends React.Component {

  constructor(props) {
    super(props);

    // Create a theme instance.
    this.theme =  {};

    // Configure JSS
    this.jss = create(preset());
    //this.jss.options.createGenerateClassName = createGenerateClassName;
  }

  componentDidMount() {
    // Remove the server-side injected CSS.
    const jssStyles = document.getElementById('jss-server-side');
    if (jssStyles && jssStyles.parentNode) {
      jssStyles.parentNode.removeChild(jssStyles);
    }
  }

  /**
   * @inheritDoc
   */
  render() {
    return (
      <JssProvider registry={this.props.registry} jss={this.jss}>
          <Provider store={this.props.store}>
            <ConnectedRouter history={this.props.history}>
              <Routes/>
            </ConnectedRouter>
          </Provider>
      </JssProvider>
    );
  }
}

/**
 * Create a redux store.
 *
 * @param {Object} history - The History manager to use.
 * @param {Object} firebaseApp - The Firebase App instance to use.
 * @param {Object} initialState - The initial state of the Redux store.
 * @return {Object} - The store.
 */
export function makeStore(history, firebaseApp, initialState = {}) {
  const historyMiddleware = routerMiddleware(history);
  const composeEnhancers = typeof window === 'object' &&
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?   
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
    }) : compose;

  return createStore(
    combineReducers({
      //...reducers,
      router: routerReducer,
      firebaseState: firebaseStateReducer
    }),
    initialState,
    composeEnhancers(
      applyMiddleware(thunk.withExtraArgument(getFirebase)),
      applyMiddleware(historyMiddleware),
      reactReduxFirebase(firebaseApp, {enableRedirectHandling: false})
    )
  );
}

/**
 * Create a Jss Registry.
 *
 * @return {Object} - The Jss Registry.
 */
export function makeRegistry() {
  return new SheetsRegistry();
}

// On the client, display the app.
if (canUseDOM) {
  // Get the Firebase config from the auto generated file.
  const firebaseConfig = require('./firebase-config.json').result;

  // Instantiate a Firebase app.
  const firebaseApp = firebase.initializeApp(firebaseConfig);

  const app = flamelink({ firebaseApp });

  app.nav.get()
  .then(menu => console.log('Main menu:', menu))
  .catch(error => console.error('Something went wrong while retrieving the menu. Details:', error));

  // Keep the Firebase ID Token and the __session cookie in sync.
  keepIdTokenInCookie(firebaseApp, '__session');

  const registry = makeRegistry();
  const history = createBrowserHistory();
  const store = makeStore(history, app, window.__REDUX_STATE__);

  // When Firebase Auth is ready we'll display the app.
  whenAuthReady(store).then(() => {
    // Render the app.
    ReactDOM.render(<App registry={registry} store={store} history={history}/>, document.getElementById('app'));
  });
}
