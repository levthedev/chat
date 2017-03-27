function isElementInViewport(el) {
  var rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 && rect.left >= 0 &&
    rect.bottom <= (window.innerHeight) && rect.right <= (window.innerWidth)
  );
}

function onVisibilityChange(el, callback) {
  var old_visible;
  return function() {
    var visible = isElementInViewport(el);
    if (visible != old_visible) {
      old_visible = visible;
      if (typeof callback == 'function') {
        callback(visible);
      }
    }
  }
}

function fadeIn(el) {
  el.classList.add('fadeIn');
}

document.addEventListener("DOMContentLoaded", function(event) {
  p = document.getElementById('prices');
  f = document.getElementById('allFeatures');
  pt = document.getElementById('pricing');
  ft = document.getElementById('features');
  prices = onVisibilityChange(pt, function(visible) { visible && fadeIn(p) });
  features = onVisibilityChange(ft, function(visible) { visible && fadeIn(f) });
  addEventListener('DOMContentLoaded', prices, false);
  addEventListener('load', prices, false);
  addEventListener('scroll', prices, false);
  addEventListener('resize', prices, false);
  addEventListener('DOMContentLoaded', features, false);
  addEventListener('load', features, false);
  addEventListener('scroll', features, false);
  addEventListener('resize', features, false);
});
