/*! Copyright (c) 2013 Fresh Codes LLC
 * Licensed under the MIT License (LICENSE.txt).
 */
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(function() {
      return (root.antycs = factory(root));
    });
  } else if (typeof exports === 'object') {
    module.exports = factory(root);
  } else {
    root.antycs = factory(root);
  }
}(this, function(root) {

  var antycs = {
    plugins: { _default: {} },
    dom: {},
    watch: function(event, target, fn) {
      (antycs.plugins[event.split('.')[0]] || antycs.plugins._default)
        .watch.call(this, event, (!fn ? undefined : target), (fn || target));
      return antycs;
    },
    error: function(msg) {
      throw new Error(msg);
    },
    event: {
      stopPropagation: function(event) {
        event.__stopAntycsPropagation = true;
      },
      isPropagationStopped: function(event) {
        return event.__stopAntycsPropagation === true;
      },
      allowPropagation: function(event) {
        return (event.__stopAntycsPropagation = false);
      }
    }
  };

  antycs.dom.matches = antycs.dom.on = function() {
    antycs.error('No antycs.dom implementation loaded.');
  };
  antycs.plugins._default.watch = function() {
    antycs.error('No antycs.plugins are loaded.');
  };

  return antycs;

}));
