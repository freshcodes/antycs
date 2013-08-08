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

  var plugin = {
    timeout: 300,
    watch: function(type, target, fn) {
      antycs.dom.on(type, target, function(event) {
        if (!antycs.event.isPropagationStopped(event)) {
          antycs.event.stopPropagation(event);
          fn(event);
          if ((antycs.event.isPropagationStopped(event)) &&
              (event.type in plugin.handlers) &&
              (event.target.nodeName in plugin.handlers[event.type])) {
            plugin.handlers[event.type][event.target.nodeName](event);
          }
        }
      });
    },
    delay: function(fn) {
      setTimeout(fn, plugin.timeout);
    },
    handlers: {
      submit: {
        FORM: function(event) {
          event.preventDefault();
          plugin.delay(function() {
            event.target.submit();
          });
        }
      },
      click: {
        A: function(event) {
          if (!event.metaKey && event.target.href && event.target.target !== "_blank") {
            event.preventDefault();
            plugin.delay(function() {
              window.location.href = event.target.href;
            });
          }
        }
      }
    }
  };

  return (antycs.plugins._default = plugin);

}));
