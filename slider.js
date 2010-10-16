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
if (!('MozAppearance' in test.style))
  return;

var isMac = ~navigator.oscpu.indexOf(' OS X ');

if (document.readyState == 'loading')
  document.addEventListener('DOMContentLoaded', createAll, false);
else
  createAll();

// create sliders on-the-fly
document.addEventListener('DOMNodeInserted', function(e) {
  if (e.target.localName != 'input')
    return;
  setTimeout(function(node) {
    if (node.getAttribute('type') == 'range' && !node.__setWidth__)
      create(node);
  }, 0, e.target);
}, false);

function themeNatively() {
  // create slider affordance
  var appearance = isMac ? 'scale-horizontal' : 'scalethumb-horizontal';
  var thumb = document.createElement('hr');
  thumb.id = '__scale-horizontal__';
  thumb.style.setProperty('-moz-appearance', appearance, 'important');
  thumb.style.setProperty('position', 'fixed', 'important');
  thumb.style.setProperty('top', '-999999px', 'important');
  document.body.appendChild(thumb);
}

function createAll() {
  themeNatively();
  // create initial sliders
  Array.forEach(document.querySelectorAll('input[type=range]'), create);
}

function create(slider) {

  function onDragStart(e) {
    if (!range)
      return;
    var width = parseFloat(getComputedStyle(this, 0).width);
    var multiplier = (width - thumb.width) / range;
    // distance between click and center of nub
    var dev = e.clientX - this.offsetLeft - thumb.width / 2 -
              (value - min) * multiplier;
    // if click was not on nub, move nub to click location
    if (Math.abs(dev) > thumb.radius)
      this.value -= -dev / multiplier;
    tempValue = value;
    prevX = e.clientX;
    addEventListener('mousemove', onDrag, false);
    addEventListener('mouseup', onDragEnd, false);
  }

  function onDrag(e) {
    var width = parseFloat(getComputedStyle(slider, 0).width);
    tempValue += (e.clientX - prevX) * range / (width - thumb.width);
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

  // validates min, max, and step attributes/properties and redraws
  function update() {
    min = isAttrNum(this.min) ? +this.min : 0;
    max = isAttrNum(this.max) ? +this.max : 100;
    step = isAttrNum(this.step) ? +this.step : 1;
    range = max - min;
    draw.call(this, true);
  }

  // recalculates value property
  function calc() {
    if (!isValueSet && !areAttrsSet)
      value = this.getAttribute('value');
    if (!isAttrNum(value))
      value = (min + max) / 2;;
    // snap to step intervals (WebKit sometimes does not - bug?)
    value = Math.round((value - min) / step) * step + min;
    // clamp to [min, max]
    if (value < min)
      value = min;
    else if (value > max)
      value = min + ~~(range / step) * step;
  }

  // renders slider using CSS width, margin, and box-shadow
  function draw(force) {
    calc.call(this);
    // prevent unnecessary redrawing
    if (!force && value == prevValue)
      return;
    prevValue = value;
    // render it!
    var position = range ? (value - min) / range * 100 : 0;
    this.style.background =
      '-moz-element(#__scale-horizontal__) ' + position + '% no-repeat, ' +
      '-moz-linear-gradient(top, transparent 9px, #666 9px, #bbb 14px, ' +
                            'transparent 14px,transparent) no-repeat';
  }

  var value, min, max, step;
  var isValueSet, areAttrsSet, range, prevValue, tempValue, prevX;

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
    isValueSet = true;
    draw.call(this);
  });

  // sync properties with attributes
  ['min', 'max', 'step'].forEach(function(prop) {
    if (slider.hasAttribute(prop))
      areAttrsSet = true;
    slider.__defineGetter__(prop, function() {
      return this.hasAttribute(prop) ? this.getAttribute(prop) : '';
    });
    slider.__defineSetter__(prop, function(val) {
      val === null ? this.removeAttribute(prop) : this.setAttribute(prop, val);
    });
  });

  // initialize slider
  update.call(slider);

  var thumb = {
    radius: isMac ? 9 : 6,
    width: isMac ? 22 : 12,
    height: isMac ? 22 : 20
  };
  var styles = {
    'color': 'transparent',
    'background-size': 'contain',
    'min-width': thumb.width + 'px',
    'min-height': thumb.height + 'px',
    'max-height': thumb.height + 'px',
    padding: 0,
    border: 0,
    cursor: 'default',
    '-moz-user-select': 'none'
  };
  for (var prop in styles)
    slider.style.setProperty(prop, styles[prop], 'important');

  slider.addEventListener('DOMAttrModified', function(e) {
    // note that value attribute only sets initial value
    if (e.attrName == 'value' && !isValueSet) {
      value = e.newValue;
      draw.call(this);
    }
    else if (~['min', 'max', 'step'].indexOf(e.attrName)) {
      update.call(this);
      areAttrsSet = true;
    }
  }, false);

  slider.addEventListener('mousedown', onDragStart, false);

}

})();
