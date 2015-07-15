/* */ 
'use strict';
exports.__esModule = true;
exports.getState = getState;
exports.createTransitionHook = createTransitionHook;
exports.getTransitionHooks = getTransitionHooks;
exports.getComponents = getComponents;
exports.getRouteParams = getRouteParams;
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {'default': obj};
}
var _invariant = require("invariant");
var _invariant2 = _interopRequireDefault(_invariant);
var _RouteUtils = require("./RouteUtils");
var _URLUtils = require("./URLUtils");
var _AsyncUtils = require("./AsyncUtils");
function getChildRoutes(route, locationState, callback) {
  if (route.childRoutes) {
    callback(null, route.childRoutes);
  } else if (route.getChildRoutes) {
    route.getChildRoutes(locationState, callback);
  } else {
    callback();
  }
}
function getIndexRoute(route, locationState, callback) {
  if (route.indexRoute) {
    callback(null, route.indexRoute);
  } else if (route.getIndexRoute) {
    route.getIndexRoute(callback, locationState);
  } else {
    callback();
  }
}
function assignParams(params, paramNames, paramValues) {
  return paramNames.reduceRight(function(params, paramName, index) {
    var paramValue = paramValues[index];
    if (Array.isArray(params[paramName])) {
      params[paramName].unshift(paramValue);
    } else if (paramName in params) {
      params[paramName] = [paramValue, params[paramName]];
    } else {
      params[paramName] = paramValue;
    }
    return params;
  }, params);
}
function createParams(paramNames, paramValues) {
  return assignParams({}, paramNames, paramValues);
}
function matchRouteDeep(route, pathname, locationState, callback) {
  var _matchPattern = (0, _URLUtils.matchPattern)(route.path, pathname);
  var remainingPathname = _matchPattern.remainingPathname;
  var paramNames = _matchPattern.paramNames;
  var paramValues = _matchPattern.paramValues;
  var isExactMatch = remainingPathname === '';
  if (isExactMatch && route.path) {
    var params = createParams(paramNames, paramValues);
    var branch = [route];
    getIndexRoute(route, locationState, function(error, indexRoute) {
      if (error) {
        callback(error);
      } else {
        if (indexRoute)
          branch.push(indexRoute);
        callback(null, {
          params: params,
          branch: branch
        });
      }
    });
  } else if (remainingPathname != null) {
    getChildRoutes(route, locationState, function(error, childRoutes) {
      if (error) {
        callback(error);
      } else if (childRoutes) {
        matchRoutes(childRoutes, remainingPathname, locationState, function(error, match) {
          if (error) {
            callback(error);
          } else if (match) {
            assignParams(match.params, paramNames, paramValues);
            match.branch.unshift(route);
            callback(null, match);
          } else {
            callback();
          }
        });
      } else {
        callback();
      }
    });
  } else {
    callback();
  }
}
function matchRoutes(routes, pathname, locationState, callback) {
  routes = (0, _RouteUtils.createRoutes)(routes);
  (0, _AsyncUtils.loopAsync)(routes.length, function(index, next, done) {
    matchRouteDeep(routes[index], pathname, locationState, function(error, match) {
      if (error || match) {
        done(error, match);
      } else {
        next();
      }
    });
  }, callback);
}
function getState(routes, location, callback) {
  matchRoutes(routes, (0, _URLUtils.stripLeadingSlashes)(location.pathname), location.state, callback);
}
function routeParamsChanged(route, prevState, nextState) {
  if (!route.path)
    return false;
  var paramNames = (0, _URLUtils.getParamNames)(route.path);
  return paramNames.some(function(paramName) {
    return prevState.params[paramName] !== nextState.params[paramName];
  });
}
function computeDiff(prevState, nextState) {
  var fromRoutes = prevState && prevState.branch;
  var toRoutes = nextState.branch;
  var leavingRoutes,
      enteringRoutes;
  if (fromRoutes) {
    leavingRoutes = fromRoutes.filter(function(route) {
      return toRoutes.indexOf(route) === -1 || routeParamsChanged(route, prevState, nextState);
    });
    leavingRoutes.reverse();
    enteringRoutes = toRoutes.filter(function(route) {
      return fromRoutes.indexOf(route) === -1 || leavingRoutes.indexOf(route) !== -1;
    });
  } else {
    leavingRoutes = [];
    enteringRoutes = toRoutes;
  }
  return [leavingRoutes, enteringRoutes];
}
function createTransitionHook(fn, context) {
  return function(nextState, transition, callback) {
    if (fn.length > 2) {
      fn.call(context, nextState, transition, callback);
    } else {
      fn.call(context, nextState, transition);
      callback();
    }
  };
}
function getTransitionHooksFromRoutes(routes, hookName) {
  return routes.reduce(function(hooks, route) {
    if (route[hookName])
      hooks.push(createTransitionHook(route[hookName], route));
    return hooks;
  }, []);
}
function getTransitionHooks(prevState, nextState) {
  var _computeDiff = computeDiff(prevState, nextState);
  var leavingRoutes = _computeDiff[0];
  var enteringRoutes = _computeDiff[1];
  var hooks = getTransitionHooksFromRoutes(leavingRoutes, 'onLeave');
  hooks.push.apply(hooks, getTransitionHooksFromRoutes(enteringRoutes, 'onEnter'));
  return hooks;
}
function getComponentsForRoute(route, callback) {
  if (route.component || route.components) {
    callback(null, route.component || route.components);
  } else if (route.getComponents) {
    route.getComponents(callback);
  } else {
    callback();
  }
}
function getComponents(routes, callback) {
  (0, _AsyncUtils.mapAsync)(routes, function(route, index, callback) {
    getComponentsForRoute(route, callback);
  }, callback);
}
function getRouteParams(route, params) {
  var routeParams = {};
  if (!route.path)
    return routeParams;
  var paramNames = (0, _URLUtils.getParamNames)(route.path);
  for (var p in params)
    if (params.hasOwnProperty(p) && paramNames.indexOf(p) !== -1)
      routeParams[p] = params[p];
  return routeParams;
}
