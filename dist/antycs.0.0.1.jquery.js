/*! Copyright (c) 2013 Fresh Codes LLC
 * Licensed under the MIT License (LICENSE.txt).
 */
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(function() {
      return (root.antycs = factory(root));
    });
  } else if (typeof exports === 'object') {
    module.exports = root.antycs = factory(root);
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

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery', 'antycs'], function(jQuery, antycs) {
      return factory(root, jQuery, antycs);
    });
  } else if (typeof exports === 'object') {
    module.exports = function(antycs, jQuery) {
      return factory(root, jQuery, antycs);
    };
  } else {
    factory(root, jQuery, antycs);
  }
}(this, function(root, jQuery, antycs) {

  antycs.dom.matches = function matches(el, sel) {
    return jQuery(el).is(sel);
  };

  antycs.dom.on = function on(type, target, handler) {
    return jQuery(document).on(type, target, handler);
  };

  return antycs.dom;

}));

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

// facebook events:
//  edge.create: facebook.like,
//  edge.remove: facebook.unlike
//  message.send: facebook.send

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
          twttr.events.bind(name, plugin.handler);
        }
      });
      plugin._setup = true;
    },

    handler: function(event) {
      if (event && !antycs.event.isPropagationStopped(event)) {
        plugin.handle(event);
      }
    },

    handle: function(event) {
      for (var i=0,watcher; (watcher=plugin.watchers[i++]);) {
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
        return window.twttr || (t = { _e: [], ready: function(f){ t._e.push(f); } });
      }(document, "script", "twitter-wjs"));
    }
  };

  return (antycs.plugins.twitter = plugin);

}));

// youtube events:
//  onStateChange: youtube.statechange
//  onPlaybackQualityChange: youtube.qualitychange
//  onPlaybackRateChange: youtube.ratechange
//  onError: youtube.error
