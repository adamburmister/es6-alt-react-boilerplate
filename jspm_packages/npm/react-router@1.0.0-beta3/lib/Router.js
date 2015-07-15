/* */ 
'use strict';
exports.__esModule = true;
var _extends = Object.assign || function(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];
    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }
  return target;
};
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {'default': obj};
}
var _react = require("react");
var _react2 = _interopRequireDefault(_react);
var _warning = require("warning");
var _warning2 = _interopRequireDefault(_warning);
var _invariant = require("invariant");
var _invariant2 = _interopRequireDefault(_invariant);
var _AsyncUtils = require("./AsyncUtils");
var _RouteUtils = require("./RouteUtils");
var _RoutingUtils = require("./RoutingUtils");
var _PropTypes = require("./PropTypes");
var _RouterContextMixin = require("./RouterContextMixin");
var _RouterContextMixin2 = _interopRequireDefault(_RouterContextMixin);
var _ScrollManagementMixin = require("./ScrollManagementMixin");
var _ScrollManagementMixin2 = _interopRequireDefault(_ScrollManagementMixin);
var _Location = require("./Location");
var _Transition = require("./Transition");
var _Transition2 = _interopRequireDefault(_Transition);
var _React$PropTypes = _react2['default'].PropTypes;
var arrayOf = _React$PropTypes.arrayOf;
var func = _React$PropTypes.func;
var object = _React$PropTypes.object;
function runTransition(prevState, routes, location, hooks, callback) {
  var transition = new _Transition2['default']();
  (0, _RoutingUtils.getState)(routes, location, function(error, nextState) {
    if (error || nextState == null || transition.isCancelled) {
      callback(error, null, transition);
    } else {
      nextState.location = location;
      var transitionHooks = (0, _RoutingUtils.getTransitionHooks)(prevState, nextState);
      if (Array.isArray(hooks))
        transitionHooks.unshift.apply(transitionHooks, hooks);
      (0, _AsyncUtils.loopAsync)(transitionHooks.length, function(index, next, done) {
        transitionHooks[index](nextState, transition, function(error) {
          if (error || transition.isCancelled) {
            done(error);
          } else {
            next();
          }
        });
      }, function(error) {
        if (error || transition.isCancelled) {
          callback(error, null, transition);
        } else {
          (0, _RoutingUtils.getComponents)(nextState.branch, function(error, components) {
            if (error || transition.isCancelled) {
              callback(error, null, transition);
            } else {
              nextState.components = components;
              callback(null, nextState, transition);
            }
          });
        }
      });
    }
  });
}
var Router = _react2['default'].createClass({
  displayName: 'Router',
  mixins: [_RouterContextMixin2['default'], _ScrollManagementMixin2['default']],
  statics: {run: function run(routes, location, transitionHooks, callback) {
      if (typeof transitionHooks === 'function') {
        callback = transitionHooks;
        transitionHooks = null;
      }
      (0, _invariant2['default'])(typeof callback === 'function', 'Router.run needs a callback');
      runTransition(null, routes, location, transitionHooks, callback);
    }},
  propTypes: {
    createElement: func.isRequired,
    onAbort: func,
    onError: func,
    onUpdate: func,
    history: _PropTypes.history,
    routes: _PropTypes.routes,
    children: _PropTypes.routes,
    location: _PropTypes.location,
    branch: _PropTypes.routes,
    params: object,
    components: arrayOf(_PropTypes.components)
  },
  getDefaultProps: function getDefaultProps() {
    return {createElement: _react.createElement};
  },
  getInitialState: function getInitialState() {
    return {
      isTransitioning: false,
      location: null,
      branch: null,
      params: null,
      components: null
    };
  },
  _updateState: function _updateState(location) {
    var _this = this;
    (0, _invariant2['default'])((0, _Location.isLocation)(location), 'A <Router> needs a valid Location');
    var hooks = this.transitionHooks;
    if (hooks)
      hooks = hooks.map(function(hook) {
        return (0, _RoutingUtils.createTransitionHook)(hook, _this);
      });
    this.setState({isTransitioning: true});
    runTransition(this.state, this.routes, location, hooks, function(error, state, transition) {
      if (error) {
        _this.handleError(error);
      } else if (transition.isCancelled) {
        if (transition.redirectInfo) {
          var _transition$redirectInfo = transition.redirectInfo;
          var pathname = _transition$redirectInfo.pathname;
          var query = _transition$redirectInfo.query;
          var state = _transition$redirectInfo.state;
          _this.replaceWith(pathname, query, state);
        } else {
          (0, _invariant2['default'])(_this.state.location, 'You may not abort the initial transition');
          _this.handleAbort(transition.abortReason);
        }
      } else if (state == null) {
        (0, _warning2['default'])(false, 'Location "%s" did not match any routes', location.pathname);
      } else {
        _this.setState(state, _this.props.onUpdate);
      }
      _this.setState({isTransitioning: false});
    });
  },
  addTransitionHook: function addTransitionHook(hook) {
    if (!this.transitionHooks)
      this.transitionHooks = [];
    this.transitionHooks.push(hook);
  },
  removeTransitionHook: function removeTransitionHook(hook) {
    if (this.transitionHooks)
      this.transitionHooks = this.transitionHooks.filter(function(h) {
        return h !== hook;
      });
  },
  handleAbort: function handleAbort(reason) {
    if (this.props.onAbort) {
      this.props.onAbort.call(this, reason);
    } else {
      this._ignoreNextHistoryChange = true;
      this.goBack();
    }
  },
  handleError: function handleError(error) {
    if (this.props.onError) {
      this.props.onError.call(this, error);
    } else {
      throw error;
    }
  },
  handleHistoryChange: function handleHistoryChange() {
    if (this._ignoreNextHistoryChange) {
      this._ignoreNextHistoryChange = false;
    } else {
      this._updateState(this.props.history.location);
    }
  },
  componentWillMount: function componentWillMount() {
    var _props = this.props;
    var history = _props.history;
    var routes = _props.routes;
    var children = _props.children;
    var location = _props.location;
    var branch = _props.branch;
    var params = _props.params;
    var components = _props.components;
    if (history) {
      (0, _invariant2['default'])(routes || children, 'Client-side <Router>s need routes. Try using <Router routes> or ' + 'passing your routes as nested <Route> children');
      this.routes = (0, _RouteUtils.createRoutes)(routes || children);
      if (typeof history.setup === 'function')
        history.setup();
      if (history.addChangeListener)
        history.addChangeListener(this.handleHistoryChange);
      this._updateState(history.location);
    } else {
      (0, _invariant2['default'])(location && branch && params && components, 'Server-side <Router>s need location, branch, params, and components ' + 'props. Try using Router.run to get all the props you need');
      this.setState({
        location: location,
        branch: branch,
        params: params,
        components: components
      });
    }
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    (0, _invariant2['default'])(this.props.history === nextProps.history, '<Router history> may not be changed');
    if (nextProps.history) {
      var currentRoutes = this.props.routes || this.props.children;
      var nextRoutes = nextProps.routes || nextProps.children;
      if (currentRoutes !== nextRoutes) {
        this.routes = (0, _RouteUtils.createRoutes)(nextRoutes);
        if (nextProps.history.location)
          this._updateState(nextProps.history.location);
      }
    }
  },
  componentWillUnmount: function componentWillUnmount() {
    var history = this.props.history;
    if (history && history.removeChangeListener)
      history.removeChangeListener(this.handleHistoryChange);
  },
  _createElement: function _createElement(component, props) {
    return typeof component === 'function' ? this.props.createElement(component, props) : null;
  },
  render: function render() {
    var _this2 = this;
    var _state = this.state;
    var branch = _state.branch;
    var params = _state.params;
    var components = _state.components;
    var element = null;
    if (components) {
      element = components.reduceRight(function(element, components, index) {
        if (components == null)
          return element;
        var route = branch[index];
        var routeParams = (0, _RoutingUtils.getRouteParams)(route, params);
        var props = _extends({}, _this2.state, {
          route: route,
          routeParams: routeParams
        });
        if ((0, _react.isValidElement)(element)) {
          props.children = element;
        } else if (element) {
          _extends(props, element);
        }
        if (typeof components === 'object') {
          var elements = {};
          for (var key in components)
            if (components.hasOwnProperty(key))
              elements[key] = _this2._createElement(components[key], props);
          return elements;
        }
        return _this2._createElement(components, props);
      }, element);
    }
    (0, _invariant2['default'])(element === null || element === false || (0, _react.isValidElement)(element), 'The root route must render a single element');
    return element;
  }
});
exports['default'] = Router;
module.exports = exports['default'];
