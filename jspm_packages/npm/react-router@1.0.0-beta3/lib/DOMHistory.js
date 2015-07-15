/* */ 
'use strict';
exports.__esModule = true;
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {'default': obj};
}
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}
function _inherits(subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }});
  if (superClass)
    subClass.__proto__ = superClass;
}
var _History2 = require("./History");
var _History3 = _interopRequireDefault(_History2);
var _DOMUtils = require("./DOMUtils");
var DOMHistory = (function(_History) {
  function DOMHistory() {
    var options = arguments[0] === undefined ? {} : arguments[0];
    _classCallCheck(this, DOMHistory);
    _History.call(this, options);
    this.getScrollPosition = options.getScrollPosition || _DOMUtils.getWindowScrollPosition;
  }
  _inherits(DOMHistory, _History);
  DOMHistory.prototype.go = function go(n) {
    if (n === 0)
      return ;
    window.history.go(n);
  };
  return DOMHistory;
})(_History3['default']);
exports['default'] = DOMHistory;
module.exports = exports['default'];
