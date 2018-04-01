import React from 'react';
import { connect } from 'react-redux';
import { firebaseConnect, isLoaded, isEmpty, getVal } from 'react-redux-firebase';
import { compose } from 'redux';
import * as _ from 'lodash';

const Page = ({pageData}) => (
  <section>
      <h1>Page</h1>
  </section>
);

export default compose(
  firebaseConnect((props, store) => ([
    { 
      path: '/flamelink/environments/production/content/blog/es-US/',
      queryParams: [ 'orderByChild=createdBy', `equalTo=${store.getState().router.location.pathname}` ] 
    }
  ])),
  connect(state => ({
    pageData: _.get(state, `firebaseState.data.flamelink.environments.production.content.blog`, undefined),
  })),
)(Page);