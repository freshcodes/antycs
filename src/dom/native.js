/*! Copyright (c) 2013 Fresh Codes LLC
 * Licensed under the MIT License (LICENSE.txt).
 */
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['antycs'], function(antycs) {
      return factory(root, antycs);
    });
  } else if (typeof exports === 'object') {
    module.exports = function(antycs) {
      return factory(root, antycs);
    };
  } else {
    factory(root, antycs);
  }
}(this, function(root, antycs) {

  antycs.dom.matches = (function() {
    var matcher,
        el = document.createElement('i'),
        matchers = [
          'matches',
          'matchesSelector',
          'webkitMatchesSelector',
          'mozMatchesSelector',
          'msMatchesSelector',
          'oMatchesSelector'
        ];

    while((matcher = matchers.shift()) && !(matcher in el));

    if (matcher) {
      return function matches(el, sel) {
        return (matcher in el) && el[matcher](sel);
      };
    } else {
      return antycs.error('No compatible matches selector api');
    }
  })();

  antycs.dom.on = (function() {
    if ('addEventListener' in document) {
      return function on(type, target, handler) {
        document.addEventListener(type, function(event) {
          if (antycs.dom.matches(event.target, target)) {
            handler(event);
          }
        }, false);
      };
    } else {
      antycs.error('No compatible event listener api');
    }
  })();

  return antycs.dom;

}));
