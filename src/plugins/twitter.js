/*! Copyright (c) 2013 Fresh Codes LLC
 * Licensed under the MIT License (LICENSE.txt).
 */
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['antycs'], function(antycs) {
      return factory(root, antycs);
    });
  } else if (typeof exports === 'object') {
    module.exports = factory(root, require('antycs'));
  } else {
    factory(root, antycs);
  }
}(this, function(root, antycs) {

  var plugin = {
    watchers: [],

    watch: function(type, target, fn) {
      plugin.setup();
      plugin.watch = function watch(type, target, fn) {
        plugin.watchers.push({
          type: type,
          target: target,
          fn: fn
        });
      };
      plugin.watch(type, target, fn);
    },

    setup: function() {
      if (!('twttr' in window)) { plugin.load(); }
      twttr.ready(function() {
        var name, events = ['click', 'tweet', 'retweet', 'follow', 'unfollow', 'favorite'];
        while ((name = events.shift())) {
          twttr.events.bind(name, function(event) {
            if (event && !antycs.event.isPropagationStopped(event)) {
              antycs.plugins.twitter.handle(event);
            }
          });
        }
      });
      plugin._setup = true;
    },

    handle: function(event) {
      for (var i=0,watcher; watcher=plugin.watchers[i++];) {
        if (!plugin.matchesEventType(event, watcher.type)) { continue; }
        if (!watcher.target || (watcher.target && antycs.dom.matches(event.target, watcher.target))) {
          plugin.triggerWatcher(watcher, event);
        }
      }
    },

    matchesEventType: function(event, type) {
      return event && (type === 'twitter' || type === 'twitter.' + event.type);
    },

    triggerWatcher: function(watcher, event) {
      antycs.event.stopPropagation(event);
      watcher.fn(event);
    },

    load: function() {
      window.twttr = (function (d,s,id) {
        var t, js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return; js=d.createElement(s); js.id=id;
        js.src="https://platform.twitter.com/widgets.js"; fjs.parentNode.insertBefore(js, fjs);
        return window.twttr || (t = { _e: [], ready: function(f){ t._e.push(f) } });
      }(document, "script", "twitter-wjs"));
    }
  };

  return (antycs.plugins.twitter = plugin);

}));
