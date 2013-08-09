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
    watchers: [],

    watch: function(type, target, fn) {
      plugin.watchers.push({
        type: type,
        target: target,
        fn: fn
      });
    },

    init: function(settings) {
      if (!('FB' in window)) { plugin.load(settings); }
      var fn = root.fbAsyncInit;
      root.fbAsyncInit = function() {
        if (fn) { fn(); }
        if (settings) { FB.init(settings); }
        plugin.setup();
      };
    },

    setup: function() {
      var name, events = ['edge.create', 'edge.remove', 'message.send'];
      while ((name = events.shift())) {
        FB.Event.subscribe(name, plugin.handlers[name]);
      }
    },

    handlers: {
      'edge.create': function(url) {
        plugin.handle({ type: 'like', target: url });
      },

      'edge.remove': function(url) {
        plugin.handle({ type: 'unlike', target: url });
      },

      'message.send': function(url) {
        plugin.handle({ type: 'send', target: url });
      }
    },

    handler: function(event) {
      if (event && !antycs.event.isPropagationStopped(event)) {
        plugin.handle(event);
      }
    },

    handle: function(event) {
      for (var i=0,watcher; (watcher=plugin.watchers[i++]);) {
        if (!plugin.matchesEventType(event, watcher.type)) { continue; }
        if (plugin.matchesEventTarget(event, watcher.target)) {
          plugin.triggerWatcher(watcher, event);
        }
      }
    },

    matchesEventType: function(event, type) {
      return event && (type === 'facebook' || type === 'facebook.' + event.type);
    },

    matchesEventTarget: function(event, target) {
      return (!target || (event.target === target));
    },

    triggerWatcher: function(watcher, event) {
      antycs.event.stopPropagation(event);
      watcher.fn(event);
    },

    load: function() {
      var el = document.createElement('div');
      el.setAttribute('id', 'fb-root');
      document.body.appendChild(el);
      (function(d) {
        var js, id, ref;
        id = "facebook-jssdk";
        ref = d.getElementsByTagName("script")[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement("script"); js.id = id; js.async = true;
        js.src = "//connect.facebook.net/en_US/all.js";
        ref.parentNode.insertBefore(js, ref);
      }(document));
    }
  };

  return (antycs.plugins.facebook = plugin);

}));
