var that = this;
function __skpm_run (key, context) {
  that.context = context;

var exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/resize.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/resize.js":
/*!***********************!*\
  !*** ./src/resize.js ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

var sketch = context.api();
var document = sketch.selectedDocument;
var sharedStyles;
var doc;

function initVars(context) {
  // const document = sketch.selectedDocument
  // const sharedStyles = document.sketchObject.documentData().layerStyles()
  // doc = document.sketchObject;
  doc = sketch.selectedDocument; // sharedStyles = doc.documentData().layerTextStyles();

  sharedStyles = document.sketchObject.documentData().layerStyles();
} // Here are some options that I'm hard-coding for now


var numberOfTextStyles = 5; // This does not include paragraph styles

var numberOfStylesSmallerThanBaseSize = 1; // There is one style that is smaller than the base paragraph size
// THIS IS THE MEAT OF THIS THING
// ---------------------------------------------------------------------------

var calculateType = function calculateType(options) {
  // Get the three values from the DOM
  var baseFontSize = parseInt(options.baseFontSize);
  var lineHeightFactor = parseFloat(options.lineHeightFactor);
  var scaleFactor = parseFloat(options.scaleFactor); // We need a base unit for line heights.
  // We will be reusing this sucker a lot in annoyingly complicated ways which I will try to describe later.
  // baseLineHeight is the baseFontSize times the lineHeightFactor, rounded to the nearest integer.

  var baseLineHeight = Math.round(baseFontSize * lineHeightFactor); // Here's an empty array where we will dump styles.

  var styles = []; // Loop five times, with the variable i as the index

  var i = 1; // We start with h1, not h0

  while (i <= numberOfTextStyles) {
    // Here I'm going to start with a data object to which I will add style attributes
    var temp = {}; // Add a CSS selector key/value so we know what the style is for

    temp.selector = i; // Calculate font size
    // This is a little complex, it determines the exponent for the scale factor for a given style

    var adjustedIndex = numberOfTextStyles - numberOfStylesSmallerThanBaseSize - i; // Raise the scale factor exponent however many times as needed.

    var adjustedScaleFactor = Math.pow(scaleFactor, adjustedIndex); // Multiply the scale factor with the font size

    temp.fontSize = Math.round(baseFontSize * adjustedScaleFactor); // Calculate line height
    // Remember the "annoyingly complicated" part?
    // We want the line height to be rounded UP to the next multiple of baseLineHeight

    temp.lineHeight = Math.ceil(temp.fontSize / baseLineHeight) * baseLineHeight; // Ok, now push the temp object to the array

    styles.push(temp);
    i = i + 1;
  } // Pushing the paragraph styles


  var paragraphStyles = {
    // Paragraph CSS selector
    selector: 'p',
    // Paragraphs are the base font size...
    fontSize: baseFontSize,
    // ...and base line height.
    lineHeight: baseLineHeight
  }; // Stick the paragraph styles into the styles array and we're done 

  styles.push(paragraphStyles); // return the array

  return styles;
}; // Some additional notes:
// The plugin will need to be able to apply different styles to desktop and mobile.
// My initial thoughts would be to show six inputs, then run through the function twice
// and apply the styles to the different type styles separately.


function findAndGetType(options) {
  // Get the necessary vars from the options passed in
  var baseFontSize = options.baseFontSize;
  var lineHeightFactor = options.lineHeightFactor;
  var scaleFactor = options.scaleFactor; // Do we have what we need?

  if (!baseFontSize || !lineHeightFactor || !scaleFactor) {
    // We don't have all three values. Don't calc.
    console.log('Not all values present');
    return null;
  } else {
    // We have what we need, go ahead and calculate
    var result = calculateType({
      baseFontSize: baseFontSize,
      lineHeightFactor: lineHeightFactor,
      scaleFactor: scaleFactor
    });
    return result;
  }
} // Let's build a dialog box for inputs


var dFontSize, dLineHeight, dScaleFactor, mFontSize, mLineHeight, mScaleFactor;

function createWindow() {
  var alert = COSAlertWindow.new();
  alert.setMessageText("Set Type Ramp"); // Creating dialog buttons

  alert.addButtonWithTitle("Ok");
  alert.addButtonWithTitle("Cancel"); // Creating the view

  var viewWidth = 300;
  var viewHeight = 150;
  var view = NSView.alloc().initWithFrame(NSMakeRect(0, 0, viewWidth, viewHeight));
  alert.addAccessoryView(view);
  var alloc = NSTextField.alloc(); // Creating the inputs

  var desktopTypeRampLabel = alloc.initWithFrame(NSMakeRect(0, viewHeight - 70, viewWidth, 70));
  dFontSize = alloc.initWithFrame(NSMakeRect(10, viewHeight - 60, viewWidth / 3 - 20, 20));
  var dFontSizeLabel = alloc.initWithFrame(NSMakeRect(10, viewHeight - 40, viewWidth / 3 - 20, 20));
  dLineHeight = alloc.initWithFrame(NSMakeRect(20 + (viewWidth - 40) / 3, viewHeight - 60, viewWidth / 3 - 20, 20));
  var dLineHeightLabel = alloc.initWithFrame(NSMakeRect(20 + (viewWidth - 40) / 3, viewHeight - 40, viewWidth / 3 - 20, 20));
  dScaleFactor = alloc.initWithFrame(NSMakeRect(30 + 2 * (viewWidth - 40) / 3, viewHeight - 60, viewWidth / 3 - 20, 20));
  var dScaleFactorLabel = alloc.initWithFrame(NSMakeRect(30 + 2 * (viewWidth - 40) / 3, viewHeight - 40, viewWidth / 3 - 20, 20));
  var mobileTypeRampLabel = alloc.initWithFrame(NSMakeRect(0, viewHeight - 150, viewWidth, 70)); // Creating the inputs

  mFontSize = alloc.initWithFrame(NSMakeRect(10, viewHeight - 140, viewWidth / 3 - 20, 20));
  var mFontSizeLabel = alloc.initWithFrame(NSMakeRect(10, viewHeight - 120, viewWidth / 3 - 20, 20));
  mLineHeight = alloc.initWithFrame(NSMakeRect(20 + (viewWidth - 40) / 3, viewHeight - 140, viewWidth / 3 - 20, 20));
  var mLineHeightLabel = alloc.initWithFrame(NSMakeRect(20 + (viewWidth - 40) / 3, viewHeight - 120, viewWidth / 3 - 20, 20));
  mScaleFactor = alloc.initWithFrame(NSMakeRect(30 + 2 * (viewWidth - 40) / 3, viewHeight - 140, viewWidth / 3 - 20, 20));
  var mScaleFactorLabel = alloc.initWithFrame(NSMakeRect(30 + 2 * (viewWidth - 40) / 3, viewHeight - 120, viewWidth / 3 - 20, 20));
  desktopTypeRampLabel.setStringValue("Desktop Type Ramp");
  desktopTypeRampLabel.setSelectable(false);
  desktopTypeRampLabel.setEditable(false);
  desktopTypeRampLabel.setBezeled(true);
  desktopTypeRampLabel.setDrawsBackground(false);
  dFontSizeLabel.setStringValue("Font Size");
  dFontSizeLabel.setSelectable(false);
  dFontSizeLabel.setEditable(false);
  dFontSizeLabel.setBezeled(false);
  dFontSizeLabel.setDrawsBackground(false);
  dLineHeightLabel.setStringValue("Line Height");
  dLineHeightLabel.setSelectable(false);
  dLineHeightLabel.setEditable(false);
  dLineHeightLabel.setBezeled(false);
  dLineHeightLabel.setDrawsBackground(false);
  dScaleFactorLabel.setStringValue("Scale Factor");
  dScaleFactorLabel.setSelectable(false);
  dScaleFactorLabel.setEditable(false);
  dScaleFactorLabel.setBezeled(false);
  dScaleFactorLabel.setDrawsBackground(false);
  mobileTypeRampLabel.setStringValue("Mobile Type Ramp");
  mobileTypeRampLabel.setSelectable(false);
  mobileTypeRampLabel.setEditable(false);
  mobileTypeRampLabel.setBezeled(true);
  mobileTypeRampLabel.setDrawsBackground(false);
  mFontSizeLabel.setStringValue("Font Size");
  mFontSizeLabel.setSelectable(false);
  mFontSizeLabel.setEditable(false);
  mFontSizeLabel.setBezeled(false);
  mFontSizeLabel.setDrawsBackground(false);
  mLineHeightLabel.setStringValue("Line Height");
  mLineHeightLabel.setSelectable(false);
  mLineHeightLabel.setEditable(false);
  mLineHeightLabel.setBezeled(false);
  mLineHeightLabel.setDrawsBackground(false);
  mScaleFactorLabel.setStringValue("Scale Factor");
  mScaleFactorLabel.setSelectable(false);
  mScaleFactorLabel.setEditable(false);
  mScaleFactorLabel.setBezeled(false);
  mScaleFactorLabel.setDrawsBackground(false); // Adding the labels

  view.addSubview(desktopTypeRampLabel);
  view.addSubview(dFontSizeLabel);
  view.addSubview(dLineHeightLabel);
  view.addSubview(dScaleFactorLabel);
  view.addSubview(mobileTypeRampLabel);
  view.addSubview(mFontSizeLabel);
  view.addSubview(mLineHeightLabel);
  view.addSubview(mScaleFactorLabel); // Adding the textfields

  view.addSubview(dFontSize);
  view.addSubview(dLineHeight);
  view.addSubview(dScaleFactor);
  view.addSubview(mFontSize);
  view.addSubview(mLineHeight);
  view.addSubview(mScaleFactor); // Show the dialog

  return [alert];
}

var findLayersMatchingPredicate_inContainer_filterByType = function findLayersMatchingPredicate_inContainer_filterByType(context, predicate, container, layerType) {
  var scope;
  initVars(context);

  switch (layerType) {
    case MSPage:
      scope = doc.pages();
      return scope.filteredArrayUsingPredicate(predicate);
      break;

    case MSArtboardGroup:
      if (typeof container !== 'undefined' && container != nil) {
        if (container.className == "MSPage") {
          scope = container.artboards();
          return scope.filteredArrayUsingPredicate(predicate);
        }
      } else {
        // search all pages
        var filteredArray = NSArray.array();
        var loopPages = doc.pages().objectEnumerator(),
            page;

        while (page = loopPages.nextObject()) {
          scope = page.artboards();
          filteredArray = filteredArray.arrayByAddingObjectsFromArray(scope.filteredArrayUsingPredicate(predicate));
        }

        return filteredArray;
      }

      break;

    default:
      if (typeof container !== 'undefined' && container != nil) {
        scope = container.children();
        return scope.filteredArrayUsingPredicate(predicate);
      } else {
        var filteredArray = NSArray.array();
        var loopPages = doc.pages().objectEnumerator(),
            page;

        while (page = loopPages.nextObject()) {
          scope = page.children();
          filteredArray = filteredArray.arrayByAddingObjectsFromArray(scope.filteredArrayUsingPredicate(predicate));
        }

        return filteredArray;
      }

  }

  return NSArray.array(); // Return an empty array if no matches were found
};

var findLayersWithSharedStyleNamed_inContainer = function findLayersWithSharedStyleNamed_inContainer(context, styleName, newStyle, container) {
  initVars(context); // Get sharedObjectID of shared style with specified name

  var allStyles = doc.documentData().layerTextStyles().objects();
  var styleSearchPredicate = NSPredicate.predicateWithFormat("name == %@", styleName);
  var filteredStyles = allStyles.filteredArrayUsingPredicate(styleSearchPredicate);
  var filteredLayers = NSArray.array();
  var loopStyles = filteredStyles.objectEnumerator(),
      style,
      predicate;

  while (style = loopStyles.nextObject()) {
    predicate = NSPredicate.predicateWithFormat("style.sharedObjectID == %@", style.objectID());
    filteredLayers = filteredLayers.arrayByAddingObjectsFromArray(findLayersMatchingPredicate_inContainer_filterByType(context, predicate, container));
  }

  for (var i = 0; i < filteredLayers.length; i++) {
    filteredLayers[i].style = newStyle;
  }

  return filteredLayers;
};

function checkForMatchingStyles(context, existingTextObjects, newStyleName, newStyle) {
  initVars(context);

  if (existingTextObjects.count() != 0) {
    for (var i = 0; i < existingTextObjects.count(); i++) {
      var existingName = existingTextObjects[i].name();
      var style = existingTextObjects.objectAtIndex(i);
      var textStyle;

      if (existingName == newStyleName) {
        existingTextObjects[i].updateToMatch(newStyle);
        return;
      }
    }

    var s = MSSharedStyle.alloc().initWithName_firstInstance(newStyleName, newStyle);
    sharedStyles.addSharedObject(s);
  } else {
    var s = MSSharedStyle.alloc().initWithName_firstInstance(newStyleName, newStyle);
    sharedStyles.addSharedObject(s);
  }
}

function getTextStyleAsJson(style, changes) {
  var definedTextStyle = {};
  definedTextStyle.attributes = style.style().textStyle().attributes();
  var color = definedTextStyle.attributes.MSAttributedStringColorAttribute;

  if (color != null) {
    var red = color.red();
    var green = color.green();
    var blue = color.blue();
    var alpha = color.alpha();
  }

  var name = String(style.name());
  var family = String(definedTextStyle.attributes.NSFont.fontDescriptor().objectForKey(NSFontNameAttribute));
  var size = changes.size;
  var par = definedTextStyle.attributes.NSParagraphStyle;

  if (par != null) {
    var align = par.alignment();
    var lineHeight = changes.lineHeight;
    var paragraphSpacing = par.paragraphSpacing();
  }

  var spacing = String(definedTextStyle.attributes.NSKern) * 1;
  var text = definedTextStyle.attributes.MSAttributedStringTextTransformAttribute;

  if (text != null) {
    var textTransform = String(definedTextStyle.attributes.MSAttributedStringTextTransformAttribute) * 1;
  } else {
    var textTransform = 0;
  }

  var strike = String(definedTextStyle.attributes.NSStrikethrough) * 1;
  var underline = String(definedTextStyle.attributes.NSUnderline) * 1;
  var style = {
    name: name,
    font: family,
    size: size,
    color: {
      red: red,
      green: green,
      blue: blue,
      alpha: alpha
    },
    alignment: align,
    spacing: spacing,
    lineHeight: lineHeight,
    paragraphSpacing: paragraphSpacing,
    textTransform: textTransform,
    strikethrough: strike,
    underline: underline
  };
  return style;
}

function setTypeStyle(style) {
  var size = style.size;
  var family = style.font;
  var name = style.name;
  var red = style.color.red;
  var green = style.color.green;
  var blue = style.color.blue;
  var alpha = style.color.alpha;
  var align = style.alignment || 0;
  var spacing = style.spacing || 0;
  var paragraphSpacing = style.paragraphSpacing || 0;
  var lineHeight = style.lineHeight || 0;
  var textTransform = style.textTransform || 0;
  var strikethrough = style.strikethrough || 0;
  var underline = style.underline || 0;
  var rectTextFrame = NSMakeRect(0, 0, 250, 50);
  var newText = doc.MSTextLayer().initWithFrame(rectTextFrame);
  var color = MSColor.colorWithRed_green_blue_alpha(red, green, blue, alpha);
  newText.name = name;
  newText.stringValue = name + ' ' + size + 'px';
  newText.fontSize = size;
  newText.fontPostscriptName = family;

  if (isNaN(red) != true) {
    newText.textColor = color;
  } else {
    newText.textColor = MSColor.colorWithNSColor(NSColor.colorWithGray(0.0));
  }

  newText.textAlignment = align;
  newText.setCharacterSpacing(spacing);
  newText.setLineHeight(lineHeight);
  newText.addAttribute_value("MSAttributedStringTextTransformAttribute", textTransform);
  var paragraphStyle = newText.paragraphStyle();
  paragraphStyle.setParagraphSpacing(paragraphSpacing);
  newText.addAttribute_value("NSParagraphStyle", paragraphStyle);
  newText.addAttribute_value("NSStrikethrough", strikethrough);
  newText.addAttribute_value("NSUnderline", underline);
  checkForMatchingStyles(context, sharedStyles.objects(), name, newText.style());
  findLayersWithSharedStyleNamed_inContainer(context, newText.name(), newText.style());
  doc.reloadInspector();
}

function updateTypeStyles(styleMap, desktopRamp) {
  var ramp = "m";

  if (desktopRamp == "desktop") {
    ramp = "d";
  }

  styleMap.forEach(function (calculatedStyle) {
    var token = "[" + ramp + calculatedStyle.selector;
    var changes = {
      size: calculatedStyle.fontSize,
      lineHeight: calculatedStyle.lineHeight
    };
    console.log(changes);
    sharedStyles.objects().forEach(function (documentStyle) {
      // Get matching style
      if (String(documentStyle.name()).startsWith(String(token).toUpperCase())) {
        var style = getTextStyleAsJson(documentStyle, changes);
        console.log(style);
        setTypeStyle(style);
      }
    });
  });
}

function settings(context) {
  var window = createWindow(context);
  var alert = window[0];
  var response = alert.runModal();

  if (response === 1000) {
    // They clicked OK
    var desktopType = null;
    var mobileType = null;
    desktopType = findAndGetType({
      baseFontSize: parseInt(dFontSize.stringValue()),
      lineHeightFactor: parseFloat(dLineHeight.stringValue()),
      scaleFactor: parseFloat(dScaleFactor.stringValue())
    });
    mobileType = findAndGetType({
      baseFontSize: parseInt(mFontSize.stringValue()),
      lineHeightFactor: parseFloat(mLineHeight.stringValue()),
      scaleFactor: parseFloat(mScaleFactor.stringValue())
    }); // Log the results to the console

    console.log("desktop type:", desktopType);
    console.log("mobile type:", mobileType);

    if (desktopType) {
      updateTypeStyles(desktopType, "desktop");
    }

    if (mobileType) {
      updateTypeStyles(mobileType);
    }
  }
}

settings();

/***/ })

/******/ });
  if (key === 'default' && typeof exports === 'function') {
    exports(context);
  } else {
    exports[key](context);
  }
}
that['onRun'] = __skpm_run.bind(this, 'default')

//# sourceMappingURL=resize.js.map