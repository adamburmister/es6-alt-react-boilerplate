/* */ 
'use strict';
exports.__esModule = true;
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {'default': obj};
}
var _react = require("react");
var _react2 = _interopRequireDefault(_react);
var _invariant = require("invariant");
var _invariant2 = _interopRequireDefault(_invariant);
var _URLUtils = require("./URLUtils");
var _React$PropTypes = _react2['default'].PropTypes;
var func = _React$PropTypes.func;
var object = _React$PropTypes.object;
function pathnameIsActive(pathname, activePathname) {
  if ((0, _URLUtils.stripLeadingSlashes)(activePathname).indexOf((0, _URLUtils.stripLeadingSlashes)(pathname)) === 0)
    return true;
  return false;
}
function queryIsActive(query, activeQuery) {
  if (activeQuery == null)
    return query == null;
  if (query == null)
    return true;
  for (var p in query)
    if (query.hasOwnProperty(p) && String(query[p]) !== String(activeQuery[p]))
      return false;
  return true;
}
var RouterContextMixin = {
  propTypes: {stringifyQuery: func.isRequired},
  getDefaultProps: function getDefaultProps() {
    return {stringifyQuery: _URLUtils.stringifyQuery};
  },
  childContextTypes: {router: object.isRequired},
  getChildContext: function getChildContext() {
    return {router: this};
  },
  makePath: function makePath(pathname, query) {
    if (query) {
      if (typeof query !== 'string')
        query = this.props.stringifyQuery(query);
      if (query !== '')
        return pathname + '?' + query;
    }
    return pathname;
  },
  makeHref: function makeHref(pathname, query) {
    var path = this.makePath(pathname, query);
    var history = this.props.history;
    if (history && history.makeHref)
      return history.makeHref(path);
    return path;
  },
  transitionTo: function transitionTo(pathname, query) {
    var state = arguments[2] === undefined ? null : arguments[2];
    var history = this.props.history;
    (0, _invariant2['default'])(history, 'Router#transitionTo is client-side only (needs history)');
    history.pushState(state, this.makePath(pathname, query));
  },
  replaceWith: function replaceWith(pathname, query) {
    var state = arguments[2] === undefined ? null : arguments[2];
    var history = this.props.history;
    (0, _invariant2['default'])(history, 'Router#replaceWith is client-side only (needs history)');
    history.replaceState(state, this.makePath(pathname, query));
  },
  go: function go(n) {
    var history = this.props.history;
    (0, _invariant2['default'])(history, 'Router#go is client-side only (needs history)');
    history.go(n);
  },
  goBack: function goBack() {
    this.go(-1);
  },
  goForward: function goForward() {
    this.go(1);
  },
  isActive: function isActive(pathname, query) {
    var location = this.state.location;
    if (location == null)
      return false;
    return pathnameIsActive(pathname, location.pathname) && queryIsActive(query, location.query);
  }
};
exports['default'] = RouterContextMixin;
module.exports = exports['default'];
