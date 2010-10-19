html5slider
=========

#### a JavaScript implementation of HTML5 `<input type=range>` for Firefox 4

It transforms all input elements with type range from plain textboxes to sliders
on-the-fly automatically, leaving no need for manual function calls.

Try out a [live demo](http://frankyan.com/labs/html5slider.html)!

To use html5slider, simply copy the html5slider.js file to the same directory as
your web page and include the following line of code in the web page:

`<script src="html5slider.js"></script>`

html5slider renders the sliders using pure CSS gradients and -moz-element().
Drawing the slider thumb appends only one extra node to the document, and this
node is hidden and shared by all the sliders.

It also provides robust implementions of the value, min, max, and step
attributes and properties and the onchange event. For keyboard accessibility,
the slider can also be manipulated while focused using the arrow keys.

Plans for future features include more accessibility and IE 9 support.

The source code is available under the MIT license.

For more information about HTML5 and `<input type=range>`, check out the
fantastic online guide "Dive Into HTML5" by Mark Pilgrim:
[http://diveintohtml5.org/forms.html#type-range](http://diveintohtml5.org/forms.html#type-range)

For more HTML5 polyfills and shims, check out this collection:
[http://github.com/Modernizr/Modernizr/wiki/HTML5-Cross-browser-Polyfills](http://github.com/Modernizr/Modernizr/wiki/HTML5-Cross-browser-Polyfills)
