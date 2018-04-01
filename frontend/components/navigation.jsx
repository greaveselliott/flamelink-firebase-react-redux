import React from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux';
import { firebaseConnect, isLoaded, isEmpty, getVal } from 'react-redux-firebase';
import { compose } from 'redux';
import * as _ from 'lodash';

import Page from './page';

const Navigation = ({ posts }) => (
  <nav>
    {
      posts && _.map(posts, post => <Link key={`${post.id}`} to={_.get(post, 'seo.canonicalUrl', '/')}>{post.title}</Link>)
    }
  </nav>
);


export default compose(
  firebaseConnect([
    'flamelink/environments/production/content/blog/en-US'
  ]),
  connect(state => ({
    posts: _.get(state, 'firebaseState.data.flamelink.environments.production.content.blog.en-US', undefined),
  })),
)(Navigation);