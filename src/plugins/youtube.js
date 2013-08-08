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
        if ((watcher.target && event.target && event.target.a) && watcher.target === event.target.a.id) {
          plugin.triggerWatcher(watcher, event);
        }
      }
    },

    matchesEventType: function(event, type) {
      return event && (type === 'youtube' || type === 'youtube.' + event.type);
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
