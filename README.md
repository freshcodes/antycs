# antycs

Organize and simplify your analytics event trapping related code.

`antycs` is composed of a slim core with a rather simple api. It depends on various "plugins" to add event watching functionality and allows you to utilize your DOM library of choice. Currently a native DOM implementation is provided for modern browsers and a jQuery implementation for older browsers.

The primary method used is called `antycs.watch` and it allows you to watch for specific events with a specific target. The events you can watch for depends on which plugins you include. The default plugin provides DOM related event functionality such as `click` and `submit` events. Other events exposed by plugins are namespaced with the plugins name and then the type of event. For instance the Twitter plugin allows you to watch for `twitter.retweet` and other related Twitter events exposed by the Twitter Web Intents API. You can also watch for any Twitter events by only watching for `twitter`.

## Examples

There are several examples in the examples directory that illustrate how to use `antycs`. Here is a glimpse of how it can be used:

    antycs
        .watch('click', '.track', function(event) {
            // code to handle a click on anything
            // with the class .track in the document
        })
        .watch('submit', '.track', function(event) {
            // code to handle a submit event on anything
            // with the class .track in the document
        });

If you load one of the other plugins such as the Twitter plugin you can watch for other types of events as well.

    antycs
        .watch('twitter.follow', '.track', function(event) {
            // code to handle a twitter follow event
            // from a twitter follow button with the
            // class of .track
        });

You can find the data Twitter exposes with these events by reviewing [their documentation](https://dev.twitter.com/docs/tfw-javascript).


## API

### `antycs.watch(event, target, handler)`

The events that can be watched for depends on what plugins are loaded. The target is typically a CSS selector for most situations. Some third party APIs are not as flexible and require targeting against a different parameter such as a URI for the Facebook plugin. This method is chainable.

### `antycs.error(message)`

Used when antycs cannot do something it expected to be able to do.

### `antycs.dom.matches(element, selector)`

This is used to facilitate event delegation based on a selector. There are currently two implementations: a native and jQuery based implementation. It simply takes an element and a selector and returns true or false if the selector matches the element or not.

### `antycs.dom.on(type, target, handler)`

This is used to facilitate event delegation based on a selector. There are currently two implementations; a native and jQuery based implementation. It simply takes an event type, a target which is a CSS selector, and a handler.

### `antycs.event.stopPropagation(event)`

This is used to control event propagation for antycs based events. Sets a property on the event that says it should not propagate. This is called by default and can be overridden by calling `antycs.event.allowPropagation` in the event handler.

### `antycs.event.isPropagationStopped(event)`

This is used to control event propagation for antycs based events. Returns true or false if the event is set to propagate or not.

### `antycs.event.allowPropagation(event)`

This is used to control event propagation for antycs based events. Sets a property on the event that says it should propagate. This can be overridden by calling `antycs.event.stopPropagation` in the event handler.


## Plugins

### Default

The `target` argument to `antycs.watch` is not required. If you do not pass a target then you'll get all the watched events that bubble up to the document. If you do pass a `target` then it should be in the form of a CSS selector.

The default plugin allows for tracking of DOM related events. It adds a slight delay to some link clicks and form submits by default.

### Twitter

The `target` argument to `antycs.watch` is not required. If you do not pass a target then you'll get all the watched events from the entire site. If you do pass a `target` then it should be in the form of a CSS selector.

If you are using some twitter buttons on your site then you can listen for some events that are exposed by Twitter. Here is a list of what this plugin supports listening to:

 * `click`
 * `tweet`
 * `retweet`
 * `follow`
 * `unfollow`
 * `favorite`

To watch for these events simply prefix them with `twitter.` such as: `antycs.watch('twitter.click', ...)`. You can also watch for all the events by only watching for `twitter` such as: `antycs.watch('twitter', ...)`.


### Facebook

This uses the [Facebook JavaScript SDK](https://developers.facebook.com/docs/web/gettingstarted/). There are two examples in the examples directory related to the Facebook plugin on how to initialize it.

The `target` argument to `antycs.watch` is not required. If you pass a `target` it should be the url associated with the button. For example you could target a like to a specific url.

```js
antycs.watch('facebook.like', 'http://target.uri/', function(event) { ... });
```

If you are using the HTML5 like/send buttons then you can watch for the following events:

 * `like`
 * `unlike`
 * `send`


### YouTube

The `target` argument to `antycs.watch` is required and must be a string that is the id of the player you are wanting to watch. So if you had the following player:

```html
<iframe id="exampleplayer" type="text/html" width="640" height="360" src="http://www.youtube.com/embed/I6OXjnBIW-4?enablejsapi=1"...
```


Then you could watch the events from this play by using the follow snippet.

```js
antycs.watch('youtube.play', 'exampleplayer', function(event) { ... });
```

If you are embedding videos via the iframe method from YouTube then you can listen for these events.

 * `play`
 * `pause`
 * `end`
 * `buffer`
 * `cue`
 * `qualitychange`
 * `ratechange`
 * `error`

To watch for these events simply prefix them with `youtube.` such as: `antycs.watch('youtube.play', ...)`. You can always watch for all the events by only watching for `youtube` such as: `antycs.watch('youtube', ...)`.


## License

`antycs` is licensed under the MIT (LICENSE.txt) license.

Copyright (c) 2013 Fresh Codes LLC

