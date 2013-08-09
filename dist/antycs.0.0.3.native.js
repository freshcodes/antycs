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
    isReady: false,

    watch: function(type, target, fn) {
      plugin.setup();
      plugin.watch = function watch(type, target, fn) {
        plugin.watchers.push({
          type: type,
          target: target,
          fn: fn
        });
        if (plugin.isReady) { plugin.preparePlayer(watcher); }
      };
      plugin.watch(type, target, fn);
    },

    setup: function() {
      if (!('YT' in root)) { plugin.load(); }
      var fn = root.onYouTubeIframeAPIReady;
      root.onYouTubeIframeAPIReady = function() {
        plugin.isReady = true;
        for (var i=0,watcher; (watcher = plugin.watchers[i++]);) {
          plugin.preparePlayer(watcher);
        }
        if (fn) { fn(); }
      };
    },

    preparePlayer: function(watcher) {
      watcher.player = new YT.Player(watcher.target, {
        events: {
          'onStateChange'           : plugin.handlers.onStateChange,
          'onPlaybackQualityChange' : plugin.handlers.onPlaybackQualityChange,
          'onPlaybackRateChange'    : plugin.handlers.onPlaybackRateChange,
          'onError'                 : plugin.handlers.onError
        }
      });
    },

    handlers: {
      'onStateChange': function(event) {
        switch(event.data) {
          case YT.PlayerState.ENDED:
            event.type = 'end';
            break;
          case YT.PlayerState.PLAYING:
            event.type = 'play';
            break;
          case YT.PlayerState.PAUSED:
            event.type = 'pause';
            break;
          case YT.PlayerState.BUFFERING:
            event.type = 'buffer';
            break;
          case YT.PlayerState.CUED:
            event.type = 'cue';
            break;
        }
        if (event.type) { plugin.handle(event); }
      },

      'onPlaybackQualityChange': function(event) {
        event.type = 'qualitychange';
        plugin.handle(event);
      },

      'onPlaybackRateChange': function(event) {
        event.type = 'ratechange';
        plugin.handle(event);
      },

      'onError': function(event) {
        event.type = 'error';
        plugin.handle(event);
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
      return event && (type === 'youtube' || type === 'youtube.' + event.type);
    },

    matchesEventTarget: function(event, target) {
      return (target && event.target && event.target.a) && target === event.target.a.id;
    },

    triggerWatcher: function(watcher, event) {
      antycs.event.stopPropagation(event);
      watcher.fn(event);
    },

    load: function() {
      var tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  };

  return (antycs.plugins.youtube = plugin);

}));
