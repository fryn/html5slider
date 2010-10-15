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
if (test.value == '50')
  return;
// test for required CSS property support
if (!('boxShadow' in test.style) || !('MozAppearance' in test.style))
  return;

// create sliders initially
document.addEventListener('DOMContentLoaded', function() {
  Array.forEach(document.querySelectorAll('input[type=range]'), create);
}, false);

// create sliders on-the-fly
document.addEventListener('DOMNodeInserted', function(e) {
  if (e.target.localName != 'input')
    return;
  setTimeout(function(node) {
    if (node.getAttribute('type') == 'range')
      create(node);
  }, 0, e.target);
}, false);

function create(slider) {

  function onDragStart(e) {
    var mid = (this.min - -this.max) / 2;
    var multiplier = origWidth / (this.max - this.min);
    var dev = Math.abs(this.value - mid) * multiplier;
    var x = e.clientX - this.offsetLeft;
    // distance between click and center of nub
    var diff = x - origWidth / 2 - dev;
    // check if click was within control bounds
    // TODO: detect clicking on right end when nub is in left half
    if (!(this.value < mid ? x > 2 * dev - 5 : x < origWidth + 10))
      return;
    // if click was not on nub, move nub to click location
    // TODO: center nub at click location
    if (diff < -3 || diff > 7) {
      this.value -= -diff / multiplier;
      draw.call(this);
    }
    dragging = 1;
    tempValue = this.value;
    prevX = e.clientX;
  }

  function onDrag(e) {
    if (!dragging)
      return;
    tempValue -= (prevX - e.clientX) * (this.max - this.min) / origWidth;
    prevX = e.clientX;
    this.value = tempValue;
    draw.call(this);
  }

  function onDragEnd() {
    dragging = 0;
  }

  function setWidth(width) {
    if (this != slider)
      throw new TypeError('Illegal Invocation');
    origWidth = +('' + width) || origWidth ||
                parseInt(getComputedStyle(this, 0).width);
    reset.call(this);
  }

  // validates min, max, and step attributes and redraws
  function reset() {
    var min = '' + this.getAttribute('min');
    var max = '' + this.getAttribute('max');
    var step = '' + this.getAttribute('step');
    // if invalid, reset min to 0, max to 100, and/or step to 1
    this.min = isNaN(min) ? 0 : +min;
    this.max = isNaN(max) || max < min ? 100 : +max;
    this.step = isNaN(step) ? 1 : +step;
    draw.call(this, 1);
  }

  // renders slider using CSS width, margin, and box-shadow
  function draw(force) {
    var value = '' + this.getAttribute('value');
    // if invalid, reset value to mean of min and max
    if (isNaN(value))
      value = (this.min - -this.max) / 2;
    // snap to step intervals
    value = Math.round((value - this.min) / this.step);
    value = value * this.step - -this.min;
    // clamp to [min, max]
    if (value < this.min)
      value = +this.min;
    else if (value > this.max)
      value = +this.min + ~~((this.max - this.min) / this.step) * this.step;
    this.setAttribute('value', value);
    // prevent unnecessary redrawing
    if (!force && value == prevValue)
      return;
    prevValue = value;
    // render it!
    var mid = (this.min - -this.max) / 2;
    var range = this.max - this.min;
    var multiplier = origWidth / range;
    var dev = Math.abs(value - mid) * multiplier;
    this.style.width = origWidth + 2 * dev + 'px';
    this.style.marginLeft = (value < mid ? -dev * 2 : 0) + 5 + 'px';
    this.style.marginRight = (value > mid ? -dev * 2 : 0) + 5 + 'px';
    var shadow = [], style = 'px 0 0 #444';
    // experimental thin style
    if (~this.className.split(' ').indexOf('x-thin'))
      style = 'px 2px 0 -6px #555';
    var end = (this.max - value) * multiplier;
    for (var i = (this.min - value) * multiplier; i < end; i += 3)
      shadow.push(i + style);
    shadow.push(end + style);
    this.style.boxShadow = shadow.join();
  }

  // variables kept private within the closure
  var origWidth, prevValue, dragging, tempValue, prevX;

  // create slider affordance
  slider.style.MozAppearance = 'radio';
  // TODO: integrate -moz-grab(bing) cursor?
  slider.style.cursor = 'default';

  // TODO: find better way to set width on-the-fly
  slider.setWidth = function() {
    setWidth.apply(this, arguments);
  };

  // sync properties with attributes
  ['value', 'min', 'max', 'step'].forEach(function(attr) {
    slider.__defineGetter__(attr, function() {
      return this.getAttribute(attr);
    });
    slider.__defineSetter__(attr, function(val) {
      this.setAttribute(attr, val);
    });
  });

  // TODO: defer attribute initialization until manually set
  slider.setWidth();

  // TODO: verify that this is not triggered excessively
  slider.addEventListener('DOMAttrModified', function(e) {
    if (~['min', 'max', 'step'].indexOf(e.attrName))
      reset.call(this);
    else if (e.attrName == 'value')
      draw.call(this);
  }, false);

  slider.addEventListener('mousedown', onDragStart, false);
  slider.addEventListener('mousemove', onDrag, false);
  slider.addEventListener('mouseout', onDragEnd, false);
  slider.addEventListener('mouseup', onDragEnd, false);

  // stop the focus ring from distorting the box shadow
  // TODO: find better way to do this for accessibility reasons
  slider.addEventListener('focus', function() {
    this.blur();
  }, false);

}

})();
