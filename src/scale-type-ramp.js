var _ = require("lodash")
const numberOfTextStyles = 5; // This does not include paragraph styles
const numberOfStylesSmallerThanBaseSize = 1; // There is one style that is smaller than the base paragraph size
var sharedStyles
var doc
var dFontSize, dLineHeight, dScaleFactor, mFontSize, mLineHeight, mScaleFactor;

export default function(context) {
  doc = context.api().selectedDocument
  sharedStyles = doc.sketchObject.documentData().layerTextStyles()

  // Here are some options that I'm hard-coding for now
  var window = createWindow();
  var alert = window[0]; 

  var response = alert.runModal()
  if (response === 1000) {
    // They clicked OK
    var desktopType = findAndGetType({
      baseFontSize: parseInt(dFontSize.stringValue()),
      lineHeightFactor: parseFloat(dLineHeight.stringValue()),
      scaleFactor: parseFloat(dScaleFactor.stringValue())
    })
    var mobileType = findAndGetType({
      baseFontSize: parseInt(mFontSize.stringValue()),
      lineHeightFactor: parseFloat(mLineHeight.stringValue()),
      scaleFactor: parseFloat(mScaleFactor.stringValue())
    })
    
    // Log the results to the console
    // console.log("desktop type:", desktopType)
    // console.log("mobile type:", mobileType)
    
    if (desktopType) {
      updateTypeStyles(desktopType, "desktop")
    }
    if (mobileType) {
      updateTypeStyles(mobileType)
    }
  }
}

// THIS IS THE MEAT OF THIS THING
// ---------------------------------------------------------------------------
var calculateType = (options) => {
  // Get the three values from the DOM
  var baseFontSize = parseInt(options.baseFontSize);
  var lineHeightFactor = parseFloat(options.lineHeightFactor);
  var scaleFactor = parseFloat(options.scaleFactor);
 
  // We need a base unit for line heights.
  // We will be reusing this sucker a lot in annoyingly complicated ways which I will try to describe later.
  // baseLineHeight is the baseFontSize times the lineHeightFactor, rounded to the nearest integer.
  var baseLineHeight = Math.round(baseFontSize * lineHeightFactor);

  // Here's an empty array where we will dump styles.
  var styles = [];
  // Loop five times, with the variable i as the index
  var i = 1; // We start with h1, not h0
  while (i <= numberOfTextStyles) {

    // Here I'm going to start with a data object to which I will add style attributes
    var temp = {};

    // Add a CSS selector key/value so we know what the style is for
    temp.selector = i;

    // Calculate font size
    
    // This is a little complex, it determines the exponent for the scale factor for a given style
    var adjustedIndex = ((numberOfTextStyles - numberOfStylesSmallerThanBaseSize) - i);

    // Raise the scale factor exponent however many times as needed.
    var adjustedScaleFactor = Math.pow(scaleFactor, adjustedIndex);

    // Multiply the scale factor with the font size
    temp.fontSize = Math.round(baseFontSize * adjustedScaleFactor);

    // Calculate line height

    // Remember the "annoyingly complicated" part?
    // We want the line height to be rounded UP to the next multiple of baseLineHeight
    temp.lineHeight = Math.ceil(temp.fontSize / baseLineHeight) * baseLineHeight;

    // Ok, now push the temp object to the array
    styles.push(temp)
    i = i + 1;
  }

  // Pushing the paragraph styles
  var paragraphStyles = {
    // Paragraph CSS selector
    selector: 'p',
    // Paragraphs are the base font size...
    fontSize: baseFontSize,
    // ...and base line height.
    lineHeight: baseLineHeight
  };

  // Stick the paragraph styles into the styles array and we're done 
  styles.push(paragraphStyles)
  // return the array
  return styles;
}

// Some additional notes:

// The plugin will need to be able to apply different styles to desktop and mobile.
// My initial thoughts would be to show six inputs, then run through the function twice
// and apply the styles to the different type styles separately.
function findAndGetType (options) {
  // Get the necessary vars from the options passed in
  var baseFontSize = options.baseFontSize;
  var lineHeightFactor = options.lineHeightFactor;
  var scaleFactor = options.scaleFactor;

  if (baseFontSize  && lineHeightFactor && scaleFactor) {
    // We have what we need, go ahead and calculate
    var result = calculateType({
      baseFontSize: baseFontSize,
      lineHeightFactor: lineHeightFactor,
      scaleFactor: scaleFactor
    })
    return result;
  }
}

// Let's build a dialog box for inputs
function createWindow () {
  var alert = COSAlertWindow.new();
  alert.setMessageText("Set Type Ramp")

  // Creating dialog buttons
  alert.addButtonWithTitle("Ok");
  alert.addButtonWithTitle("Cancel");

  // Creating the view
  var viewWidth = 300;
  var viewHeight = 150;

  var view = NSView.alloc().initWithFrame(NSMakeRect(0, 0, viewWidth, viewHeight));
  alert.addAccessoryView(view);

  var alloc = NSTextField.alloc();
  // Creating the inputs
  var desktopTypeRampLabel = alloc.initWithFrame(NSMakeRect(0, viewHeight - 70, viewWidth, 70));

  dFontSize = alloc.initWithFrame(NSMakeRect(10, viewHeight - 60, (viewWidth/3) - 20, 20));
  var dFontSizeLabel = alloc.initWithFrame(NSMakeRect(10, viewHeight - 40, (viewWidth/3) - 20, 20));

  dLineHeight = alloc.initWithFrame(NSMakeRect(20 + (viewWidth - 40)/3, viewHeight - 60, (viewWidth/3) - 20, 20));
  var dLineHeightLabel = alloc.initWithFrame(NSMakeRect(20 + (viewWidth - 40)/3, viewHeight - 40, (viewWidth/3) - 20, 20));

  dScaleFactor = alloc.initWithFrame(NSMakeRect(30 + (2*(viewWidth - 40)/3), viewHeight - 60, (viewWidth/3) - 20, 20));
  var dScaleFactorLabel = alloc.initWithFrame(NSMakeRect(30 + (2*(viewWidth - 40)/3), viewHeight - 40, (viewWidth/3) - 20, 20));


  var mobileTypeRampLabel = alloc.initWithFrame(NSMakeRect(0, viewHeight -150, viewWidth, 70));
  // Creating the inputs
  mFontSize = alloc.initWithFrame(NSMakeRect(10, viewHeight - 140, (viewWidth/3) - 20, 20));
  var mFontSizeLabel = alloc.initWithFrame(NSMakeRect(10, viewHeight - 120, (viewWidth/3) - 20, 20));

  mLineHeight = alloc.initWithFrame(NSMakeRect(20 + (viewWidth - 40)/3, viewHeight - 140, (viewWidth/3) - 20, 20));
  var mLineHeightLabel = alloc.initWithFrame(NSMakeRect(20 + (viewWidth - 40)/3, viewHeight - 120, (viewWidth/3) - 20, 20));

  mScaleFactor = alloc.initWithFrame(NSMakeRect(30 + (2*(viewWidth - 40)/3), viewHeight - 140, (viewWidth/3) - 20, 20));
  var mScaleFactorLabel = alloc.initWithFrame(NSMakeRect(30 + (2*(viewWidth - 40)/3), viewHeight - 120, (viewWidth/3) - 20, 20));

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
  mScaleFactorLabel.setDrawsBackground(false);

  // Adding the labels
  view.addSubview(desktopTypeRampLabel)
  view.addSubview(dFontSizeLabel)
  view.addSubview(dLineHeightLabel)
  view.addSubview(dScaleFactorLabel)
  view.addSubview(mobileTypeRampLabel)
  view.addSubview(mFontSizeLabel)
  view.addSubview(mLineHeightLabel)
  view.addSubview(mScaleFactorLabel)
  // Adding the textfields
  view.addSubview(dFontSize);
  view.addSubview(dLineHeight);
  view.addSubview(dScaleFactor);
  view.addSubview(mFontSize);
  view.addSubview(mLineHeight);
  view.addSubview(mScaleFactor);

  // Show the dialog
  return [alert]
}

var findLayersMatchingPredicate_inContainer_filterByType = (predicate, container, layerType) => {
  var scope;
  switch (layerType) {
    case MSPage :
      scope = doc.sketchObject.pages()
      return scope.filteredArrayUsingPredicate(predicate)
    break;

    case MSArtboardGroup :
      if(typeof container !== 'undefined' && container != nil) {
        if (container.className == "MSPage") {
          scope = container.artboards()
          return scope.filteredArrayUsingPredicate(predicate)
        }
      } else {
        // search all pages
        var filteredArray = NSArray.array()
        var loopPages = doc.sketchObject.pages().objectEnumerator(), page;
        while (page = loopPages.nextObject()) {
            scope = page.artboards()
            filteredArray = filteredArray.arrayByAddingObjectsFromArray(scope.filteredArrayUsingPredicate(predicate))
        }
        return filteredArray
      }
    break;

    default :
      if(typeof container !== 'undefined' && container != nil) {
        scope = container.children()
        return scope.filteredArrayUsingPredicate(predicate)
      } else {
        var filteredArray = NSArray.array()
        var loopPages = doc.sketchObject.pages().objectEnumerator(), page;
        while (page = loopPages.nextObject()) {
            scope = page.children()
            filteredArray = filteredArray.arrayByAddingObjectsFromArray(scope.filteredArrayUsingPredicate(predicate))
        }
        return filteredArray
      }
    }
    return NSArray.array() // Return an empty array if no matches were found
}

var findLayersWithSharedStyleNamed_inContainer = (styleName, newStyle, container) => {
    // Get sharedObjectID of shared style with specified name
    var styleSearchPredicate = NSPredicate.predicateWithFormat("name == %@", styleName)
    var filteredStyles = sharedStyles.objects().filteredArrayUsingPredicate(styleSearchPredicate)

    var filteredLayers = NSArray.array()
    var loopStyles = filteredStyles.objectEnumerator(), style, predicate;

    while (style = loopStyles.nextObject()) {
      predicate = NSPredicate.predicateWithFormat("style.sharedObjectID == %@", style.objectID())
      filteredLayers = filteredLayers.arrayByAddingObjectsFromArray(findLayersMatchingPredicate_inContainer_filterByType(predicate, container))
    }

    for (var i = 0; i < filteredLayers.length; i++) {
      filteredLayers[i].style = newStyle;
    }

    return filteredLayers
}

function checkForMatchingStyles(existingTextObjects, newStyleName, newStyle) {
  if (existingTextObjects.count() != 0) {
    for (var i = 0; i < existingTextObjects.count(); i++) {
      var existingName = existingTextObjects[i].name();
      var style = existingTextObjects.objectAtIndex(i);
      var textStyle;

      if(existingName == newStyleName) {
        existingTextObjects[i].updateToMatch(newStyle)
        return;
      }
    }

    var s = MSSharedStyle.alloc().initWithName_firstInstance(newStyleName,newStyle);
    sharedStyles.addSharedObject(s);

  } else {
    var s = MSSharedStyle.alloc().initWithName_firstInstance(newStyleName,newStyle);
    sharedStyles.addSharedObject(s);
  }
}

function getTextStyleAsJson (style, changes) {
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
  var family = String(definedTextStyle.attributes.NSFont.fontDescriptor().objectForKey(NSFontNameAttribute))
  var size = changes.size

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

  var strike = String(definedTextStyle.attributes.NSStrikethrough) * 1
  var underline = String(definedTextStyle.attributes.NSUnderline) * 1

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

function setTypeStyle (style) {
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
  
  var newText = MSTextLayer.alloc().initWithFrame(rectTextFrame);

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
  newText.addAttribute_value("MSAttributedStringTextTransformAttribute", textTransform)

  var paragraphStyle = newText.paragraphStyle();
  paragraphStyle.setParagraphSpacing(paragraphSpacing);
  newText.addAttribute_value("NSParagraphStyle", paragraphStyle);

  newText.addAttribute_value("NSStrikethrough", strikethrough);
  newText.addAttribute_value("NSUnderline", underline);

  checkForMatchingStyles(sharedStyles.objects(), name, newText.style());
  findLayersWithSharedStyleNamed_inContainer(newText.name() , newText.style())

  doc.sketchObject.reloadInspector()
}

function updateTypeStyles(styleMap, desktopRamp) {
  var ramp = "m";
  if (desktopRamp == "desktop") {
    ramp = "d";
  }
  styleMap.forEach(function(calculatedStyle){
    var token = "[" + ramp + calculatedStyle.selector;
    var changes = {
      size: calculatedStyle.fontSize,
      lineHeight: calculatedStyle.lineHeight
    }
    // console.log(changes)

    sharedStyles.objects().forEach((documentStyle) => {
      // Get matching style
      if (String(documentStyle.name()).startsWith(String(token).toUpperCase())) {
        var style = getTextStyleAsJson(documentStyle, changes);
        // console.log(style);
        setTypeStyle(style)
      }
    });
  });
}
