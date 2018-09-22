# Tandem Tools To Export SCSS From Sketch

This Sketch plugin is built to enhance the overall workflow at [DevMynd](https://www.devmynd.com). It comes with three functions:

## Export as SCSS
This takes all layer styles and type styles and exports them as SCSS variables and mixins.  There are some neat little tricks you can use with the style naming to unlock additional features.

### Type Styles
The meat and potatoes of what this plugin outputs is type styles. Attributes are exported as variables. Desktop and mobile variables are paired into attribute mixins, and attribute mixins are combined into type style mixins.

To export a specific type setup, create a new type style.

Want to provide more context to the plugin? Use tags!

#### Type Style Tags

Tags are a relatively simple construct specific to this plugin. A "tag" generally appears at the beginning of a style name and is contained within square brackets like [this]. Tags are optional, but they can contain lots of helpful context when designing in Sketch and for the plugin when exporting.

Here's an example of a type style tag:
```
[D4L] Subheader
```
There are several components within that one tag, followed by the name.  Let's break them down:

##### Ramp
The first character after the opening bracket is the ramp.  There are two options here: "D" for "desktop" and "M" for "mobile." This lets the plugin know at what scale the style should be applied.

##### Selector
The second character after the opening bracket of a type style tag is the selector.  A selector can be a number 1-6 or the character "P."  Numbers correspond to different header styles. D1 is the `<h1>` header at the desktop size, M1 is the `<h1>` header at mobile sizes.

DP gives you the styles for a `<p>` tag at desktop size, etc.

##### Sub-selectors
If you need more than one style at a given size, you can use sub-selectors! You can add a decimal point and any number of decimal places.

##### Variant
Need still further differentiation, such as color variants? You can add ANYTHING after the selector inside of the tag.  It will be ignored in the output, but you can add it to help with organization within Sketch

##### Name
The name of the style will be included as a comment in the SCSS file.  For elements with a CSS selector (h1-h5 and p), the variables will be named with the selector and NOT the name.

### Colors
The plugin can export colors as an SCSS variable.  In order to indicate that a color should be exported, create a Layer Style with a color fill and no shadows.  Only the fill color will be exported.  You may name your layer style whatever you want. Variables are exported in alphabetical order, which is how they appear in Sketch.

Want the variables to have some logical order? Use tags!

#### Color Tags
Tags are a relatively simple construct specific to this plugin. A "tag" generally appears at the beginning of a style name and is contained within square brackets like [this].

Here's an example of a tag:
```
[C1] Primary
```
These tags allow you to organize your layer styles alphabetically without ruining your layer style names.  When colors are exported, the tag is excluded.  The above layer style would output an SCSS variable named `$primary-color`.

### Shadows
Shadows are exported from layer styles as an SCSS variable.  To indicate to the plugin that a shadow or shadows should be exported, create a layer style with one or more shadows.  Multiple shadows, including inner shadows, will all be exported together as a variable.

Need your shadow variables to have a logical order? Use tags!

#### Color Tags
Tags are a relatively simple construct specific to this plugin. A "tag" generally appears at the beginning of a style name and is contained within square brackets like [this].

Here's an example of a tag:
```
[S1] Thinner Shadow
```
These tags allow you to organize your layer styles alphabetically without ruining your layer style names.  When shadows are exported, the tag is excluded.  The above layer style would output an SCSS variable named `$thinner-shadow`.

### Gradients
You can get your gradients out of Sketch without writing them yourself.  This is written from scratch, because Sketch's own Copy CSS Attributes gradient export leaves quite a bit to be desired.

If you want the plugin to export a gradient as an SCSS variable, create a layer style with a gradient fill and no shadows.  The plugin will detect linear, radial, and conic gradients and export them as best as it can.

Need your gradient variables in a certain order? Use tags!

#### Gradient Tags
Tags are a relatively simple construct specific to this plugin. A "tag" generally appears at the beginning of a style name and is contained within square brackets like [this].

Here's an example of a tag:
```
[G1] Rainbow Conic Gradient
```
These tags allow you to organize your layer styles alphabetically without ruining your layer style names.  When gradients are exported, the tag is excluded.  The above layer style would output an SCSS variable named `$rainbow-conic-gradient`.

#### Linear Gradients
Linear gradients are created with an angle based on the layer style as applied to a square object.  Scale and position may be off from what you see in Sketch.

#### Radial Gradients
Radial gradients ignore the careful scale, rotation, and positioning of your ellipse. I'm sorry, it's hard to get all of that out right now.  TBD.

#### Conical Gradients
You can't position conical gradients in Sketch, so the output SCSS is centered, like it is in Sketch.  Currently, only Google Chrome supports rendering conical gradients, but there are handy polyfills for other browsers.

## Scale Type Ramp
If you want to use a [modular type ramp](http://gridlover.net/try), this action allows you to make and adjust one in a hurry. In order to do this, you will need to use type style tags.

#### Type Style Tags

Tags are a relatively simple construct specific to this plugin. A "tag" generally appears at the beginning of a style name and is contained within square brackets like [this]. Tags are optional, but they can contain lots of helpful context when designing in Sketch and for the plugin when exporting.

Here's an example of a type style tag:
```
[D4L] Subheader
```
There are several components within that one tag, followed by the name.  Let's break them down:

##### Ramp
The first character after the opening bracket is the ramp.  There are two options here: "D" for "desktop" and "M" for "mobile." This lets the plugin know at what scale the style should be applied.

##### Selector
The second character after the opening bracket of a type style tag is the selector.  A selector can be a number 1-6 or the character "P."  Numbers correspond to different header styles. D1 is the `<h1>` header at the desktop size, M1 is the `<h1>` header at mobile sizes.

DP gives you the styles for a `<p>` tag at desktop size, etc.

##### Sub-selectors
If you need more than one style at a given size, you can use sub-selectors! You can add a decimal point and any number of decimal places.

##### Variant
Need still further differentiation, such as color variants? You can add ANYTHING after the selector inside of the tag.  It will be ignored in the output, but you can add it to help with organization within Sketch.

##### Name
The name of the style, which follows the tag will be included as a comment in the SCSS file.  For elements with a CSS selector (h1-h5 and p), the variables will be named with the selector and NOT the name.

## Align Text
Stop the ever-frustrating alignment problems with type styles overriding your text alignment. Requires specific symbols with specific naming conventions.

Symbols must start with "Text Style" and end with "Centered" to be centered.  To be right aligned, the symbol name must start with  "Text Style" and end with "Right."