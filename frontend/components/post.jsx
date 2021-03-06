import React from 'react';
import { connect } from 'react-redux';
import { firebaseConnect, isLoaded, isEmpty, getVal } from 'react-redux-firebase';
import { compose } from 'redux';
import * as _ from 'lodash';
import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2 } from 'react-html-parser';

/**
 * Entry point to the FriendlyPix app.
 */
const Post = ({id, post}) => (
  <section>
    <h1>{post.title}</h1>
    <time>{post.date}</time>
    <div>{ReactHtmlParser(post.content)}</div>
  </section>
);

export default compose(
  firebaseConnect([
    'flamelink/environments/production/content/blog/en-US'
  ]),
  connect((state, props) => ({
    post: _.get(state, `firebaseState.data.flamelink.environments.production.content.blog.en-US.${props.id}`, ''),
  }))
)(Post);