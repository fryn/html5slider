slider.js
=========

#### a JavaScript implementation of HTML5 `<input type="range">` for Firefox 4

It transforms all input elements with type range from textboxes to sliders
on-the-fly automatically, so it does not require any input.

To use slider.js, simply include slider.js in your web page directory and the
following line of code in your web page HTML:
`<script src="slider.js"></script>`

slider.js renders the sliders using pure CSS gradients and -moz-element().
Drawing the slider thumb requires only one additional node to be added; this
node is hidden and shared by all the sliders.

It also provides robust implementions of the value, min, max, and step
attributes and properties and the onchange event.

slider.js is available under the MIT license.

For more information about HTML5 & `<input type="range">`, check out the
fantastic online guide "Dive Into HTML5" by Mark Pilgrim:
[http://diveintohtml5.org/forms.html#type-range](http://diveintohtml5.org/forms.html#type-range)

For more HTML5 polyfills and shims, check out this collection:
[http://github.com/Modernizr/Modernizr/wiki/HTML5-Cross-browser-Polyfills](http://github.com/Modernizr/Modernizr/wiki/HTML5-Cross-browser-Polyfills)
