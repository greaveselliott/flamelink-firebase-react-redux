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

import React from 'react';
import { Route, Switch } from 'react-router';
import { connect } from 'react-redux';
import { firebaseConnect, isLoaded, isEmpty, getVal } from 'react-redux-firebase';
import { compose } from 'redux';
import * as _ from 'lodash';

// Routes
import Layout from './components/layout';
import ConditionalRedirect from './ConditionalRedirect';
import Home from './components/home';
import Post from './components/post';
import Page from './components/page';
import NotFound from './components/404';


const renderMergedProps = (component, ...rest) => {
  const finalProps = Object.assign({}, ...rest);
  return (
    React.createElement(component, finalProps)
  );
}

const PropsRoute = ({ component, ...rest }) => {
  return (
    <Route {...rest} render={routeProps => {
      return renderMergedProps(component, routeProps, rest);
    }}/>
  );
}

/**
 * All the routes.
 */
class Routes extends React.Component {
  render() {
    return (
      <Layout>
        <Switch> 
          <Route exact path="/" component={Home}/> 
          <Route>
          <Switch>
            {
              this.props.posts && _.map(this.props.posts, post => <PropsRoute key={post.id} path={_.get(post, 'seo.canonicalUrl', '/')} component={Post} id={post.id}/>)
            }
            <Route component={NotFound}/> 
            </Switch> 
          </Route> 
        </Switch>
      </Layout>
    )
  }
}

export default compose(
  firebaseConnect([
    'flamelink/environments/production/content/blog/en-US'
  ]),
  connect(state => ({
    posts: _.get(state, 'firebaseState.data.flamelink.environments.production.content.blog.en-US', undefined),
  })),
)(Routes);