/*
Copyright (c) 2010 Frank Yan, <http://frankyan.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

(function() {

// test for native support
var test = document.createElement('input');
test.type = 'range';
if (test.value == 50)
  return;
// test for required CSS property support
if (!('boxShadow' in test.style) || !('MozAppearance' in test.style))
  return;

// create sliders initially
if (document.readyState == 'loading')
  document.addEventListener('DOMContentLoaded', createAll, false);
else
  createAll();

// create sliders on-the-fly
document.addEventListener('DOMNodeInserted', function(e) {
  if (e.target.localName != 'input')
    return;
  setTimeout(function(node) {
    if (node.getAttribute('type') == 'range' && !node.resetWidth)
      create(node);
  }, 0, e.target);
}, false);

function createAll() {
  Array.forEach(document.querySelectorAll('input[type=range]'), create);
}

function create(slider) {

  function onDragStart(e) {
    var x = e.clientX - this.offsetLeft;
    // distance between click and center of nub
    var diff = x - origWidth / 2 - dev;
    // check if click was within control bounds
    if (!(value < mid ? x > 2 * dev - 5 : x < origWidth + 10))
      return;
    // if click was not on nub, move nub to click location
    if (diff < -3 || diff > 7)
      this.value -= -diff / multiplier;
    tempValue = value;
    prevX = e.clientX;
    addEventListener('mousemove', onDrag, false);
    addEventListener('mouseup', onDragEnd, false);
  }

  function onDrag(e) {
    tempValue += (e.clientX - prevX) / multiplier;
    prevX = e.clientX;
    slider.value = tempValue;
  }

  function onDragEnd(e) {
    removeEventListener('mousemove', onDrag, false);
    removeEventListener('mouseup', onDragEnd, false);
  }

  // determines whether value is valid number in attribute form
  function isAttrNum(value) {
    return !isNaN(value) && +value == parseFloat(value, 10);
  }

  function resetWidth(width) {
    if (this != slider)
      throw new TypeError('Illegal invocation');
    if (isAttrNum(width)) {
      origWidth = +width;
      reset.call(this);
    }
  }

  // validates min, max, and step attributes/properties and redraws
  function reset() {
    min = isAttrNum(this.min) ? +this.min : 0;
    max = isAttrNum(this.max) ? +this.max : 100;
    step = isAttrNum(this.step) ? +this.step : 1;
    // cache common computations
    mid = (min + max) / 2;
    range = max - min;
    // draw only nub if min equals max (WebKit does otherwise)
    multiplier = range ? origWidth / range : 1;
    draw.call(this, true);
  }

  // recalculates value property
  function calc() {
    if (!isValueModified && !areAttrsModified)
      value = this.getAttribute('value');
    if (!isAttrNum(value))
      value = mid;
    // snap to step intervals (WebKit sometimes does not - bug?)
    value = Math.round((value - min) / step) * step + min;
    // clamp to [min, max]
    if (value < min)
      value = min;
    else if (value > max)
      value = min + ~~(range / step) * step;
    dev = Math.abs(value - mid) * multiplier;
  }

  // renders slider using CSS width, margin, and box-shadow
  function draw(force) {
    calc.call(this);
    // prevent unnecessary redrawing
    if (!force && value == prevValue)
      return;
    prevValue = value;
    // render it!
    var margins = [5, 5];
    margins[+(value > mid)] -= dev * 2;
    this.style.setProperty('width', origWidth + 2 * dev + 'px', 'important');
    this.style.setProperty('margin-left', margins[0] + 'px', 'important');
    this.style.setProperty('margin-right', margins[1] + 'px', 'important');
    var shadow = [], style = 'px 0 0 #444';
    // experimental thin style
    if (~this.className.split(' ').indexOf('x-thin'))
      style = 'px 2px 0 -6px #555';
    var end = (max - value) * multiplier;
    for (var i = (min - value) * multiplier; i < end; i += 3)
      shadow.push(i + style);
    shadow.push(end + style);
    this.style.setProperty('box-shadow', shadow.join(), 'important');
  }

  var origWidth, value, min, max, step, mid, range, multiplier, dev;
  var isValueModified, areAttrsModified, prevValue, tempValue, prevX;

  // since any previous changes are unknown, assume element was just created
  if (slider.value !== '')
    value = slider.value;
  // implement value property properly
  slider.__defineGetter__('value', function() {
    calc.call(this);
    return '' + value;
  });
  slider.__defineSetter__('value', function(val) {
    value = '' + val;
    isValueModified = true;
    draw.call(this);
  });

  // sync properties with attributes
  ['min', 'max', 'step'].forEach(function(prop) {
    if (slider.hasAttribute(prop))
      areAttrsModified = true;
    slider.__defineGetter__(prop, function() {
      return this.hasAttribute(prop) ? this.getAttribute(prop) : '';
    });
    slider.__defineSetter__(prop, function(val) {
      val === null ? this.removeAttribute(prop) : this.setAttribute(prop, val);
    });
  });

  // create slider affordance
  slider.style.setProperty('-moz-appearance', 'radio', 'important');
  slider.style.setProperty('cursor', 'default', 'important');

  // expose public method to reset width on-the-fly safely
  slider.resetWidth = function() {
    resetWidth.apply(this, arguments);
  };

  // initialize slider
  slider.resetWidth(parseFloat(getComputedStyle(slider, 0).width));

  slider.addEventListener('DOMAttrModified', function(e) {
    // note that value attribute only sets initial value
    if (e.attrName == 'value' && !isValueModified) {
      value = e.newValue;
      draw.call(this);
    }
    else if (~['min', 'max', 'step'].indexOf(e.attrName)) {
      reset.call(this);
      areAttrsModified = true;
    }
  }, false);

  slider.addEventListener('mousedown', onDragStart, false);

  // stop the focus ring from distorting the box shadow
  slider.addEventListener('focus', function() {
    this.blur();
  }, false);

}

})();
