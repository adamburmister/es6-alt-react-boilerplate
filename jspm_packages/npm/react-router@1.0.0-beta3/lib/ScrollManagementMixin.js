/* */ 
'use strict';
exports.__esModule = true;
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {'default': obj};
}
var _react = require("react");
var _react2 = _interopRequireDefault(_react);
var _DOMUtils = require("./DOMUtils");
var _NavigationTypes = require("./NavigationTypes");
var _NavigationTypes2 = _interopRequireDefault(_NavigationTypes);
var func = _react2['default'].PropTypes.func;
function getCommonAncestors(branch, otherBranch) {
  return branch.filter(function(route) {
    return otherBranch.indexOf(route) !== -1;
  });
}
function shouldUpdateScrollPosition(state, prevState) {
  var location = state.location;
  var branch = state.branch;
  var prevLocation = prevState.location;
  var prevBranch = prevState.branch;
  if (prevLocation === null)
    return false;
  if (location.pathname === prevLocation.pathname)
    return false;
  var sharedAncestors = getCommonAncestors(branch, prevBranch);
  if (sharedAncestors.some(function(route) {
    return route.ignoreScrollBehavior;
  }))
    return false;
  return true;
}
function updateWindowScrollPosition(navigationType, scrollX, scrollY) {
  if (_DOMUtils.canUseDOM) {
    if (navigationType === _NavigationTypes2['default'].POP) {
      (0, _DOMUtils.setWindowScrollPosition)(scrollX, scrollY);
    } else {
      (0, _DOMUtils.setWindowScrollPosition)(0, 0);
    }
  }
}
var ScrollManagementMixin = {
  propTypes: {
    shouldUpdateScrollPosition: func.isRequired,
    updateScrollPosition: func.isRequired
  },
  getDefaultProps: function getDefaultProps() {
    return {
      shouldUpdateScrollPosition: shouldUpdateScrollPosition,
      updateScrollPosition: updateWindowScrollPosition
    };
  },
  componentDidUpdate: function componentDidUpdate(prevProps, prevState) {
    var location = this.state.location;
    var locationState = location && location.state;
    if (locationState && this.props.shouldUpdateScrollPosition(this.state, prevState)) {
      var scrollX = locationState.scrollX;
      var scrollY = locationState.scrollY;
      this.props.updateScrollPosition(location.navigationType, scrollX || 0, scrollY || 0);
    }
  }
};
exports['default'] = ScrollManagementMixin;
module.exports = exports['default'];
