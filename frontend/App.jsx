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
import makeStore from './make-store';
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
export default class App extends React.Component {

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

  // Keep the Firebase ID Token and the __session cookie in sync.
  keepIdTokenInCookie(firebaseApp, '__session');

  const registry = makeRegistry();
  const history = createBrowserHistory();
  const store = makeStore(history, firebaseApp, window.__REDUX_STATE__);
  
  whenAuthReady(store).then(() => {
    // Render the app.
      ReactDOM.render(<App registry={registry} store={store} history={history}/>, document.getElementById('app'));
  });
}
