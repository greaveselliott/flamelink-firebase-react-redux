import { createStore, compose, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { reactReduxFirebase, getFirebase, firebaseStateReducer } from 'react-redux-firebase';
import { routerReducer, routerMiddleware } from 'react-router-redux';

/**
 * Create a redux store.
 *
 * @param {Object} history - The History manager to use.
 * @param {Object} firebaseApp - The Firebase App instance to use.
 * @param {Object} initialState - The initial state of the Redux store.
 * @return {Object} - The store.
 */
const makeStore = (history, firebaseApp, initialState = {}) => {
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

export default makeStore;