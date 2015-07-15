import 'fetch';
import alt from './alt';
import React from 'react';

class MyApp extends React.Component {
  render() {
    return <p>Hello World</p>;
  }
}

React.render(<MyApp />, document.body);
