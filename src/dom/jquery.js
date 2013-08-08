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
