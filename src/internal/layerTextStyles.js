var _ = require("lodash")

var useRem = true;
var defaultBaseFontSize = 16;
var breakpointVariable = "$breakpoint";
var mobileBaseFontSize = defaultBaseFontSize;
var desktopBaseFontSize = defaultBaseFontSize;
var outputFontWeight = true;

var fontWeightWords = [
    {"name": "thin", "value": 100},
    {"name": "hairline", "value": 100},

    {"name": "extralight", "value": 200},
    {"name": "ultralight", "value": 200},

    {"name": "light", "value": 300},

    {"name": "normal", "value": 400},
    {"name": "regular", "value": 400},
    {"name": "", "value": 400},

    {"name": "medium", "value": 500},

    {"name": "semibold", "value": 600},
    {"name": "demibold", "value": 600},

    {"name": "bold", "value": 700},

    {"name": "extrabold", "value": 800},
    {"name": "ultrabold", "value": 800},

    {"name": "black", "value": 900},
    {"name": "heavy", "value": 900}
  ]

module.exports = {
  parse: function (sharedTextStyles) { 
    var desktop = []
    var mobile = []
    var assorted = []
    var sortedStyles = _.sortBy(sharedTextStyles.objects(), [style => style.name()], ["desc"])
    var typeStyles = getUniqueStyles(sortedStyles)
    typeStyles.forEach(function(thisStyle){
      var tag = getTag(String(thisStyle.name()))
      var style = getTextStyleAsJson(thisStyle)
      if (tag.ramp == "m") {
        mobile.push(style)
      } else if (tag.ramp == "d") {
        desktop.push(style)
      } else if (tag.ramp == "x") {
        // do nothing
      } else {
        assorted.push(style)
      }
    })
    return {"desktop": popPToTop(desktop), "mobile": popPToTop(mobile), "assorted": {"styles": assorted}};
  },
  writeSass: function (layerTextStyleMap, fonts) {
    var textStyleSheet = "",
      theTextFont,
      theDisplayFont,
      theAuxiliaryFont
    if ((layerTextStyleMap.desktop.styles && layerTextStyleMap.desktop.styles.length) || (layerTextStyleMap.mobile.styles && layerTextStyleMap.mobile.styles.length) || (layerTextStyleMap.assorted.styles && layerTextStyleMap.assorted.styles.length)) {
      textStyleSheet += "// FONT FAMILIES\n"
      if (fonts.textFont) {
        if (outputFontWeight) {
          theTextFont = getFontAndWeight(fonts.textFont.font);
          textStyleSheet += "$text-font: " + theTextFont.fontFamily + ";\n"
          textStyleSheet += "$text-font-weight: " + theTextFont.fontWeight + ";\n"
          textStyleSheet += "$text-font-style: " + theTextFont.fontStyle + ";\n"
        } else {
          textStyleSheet += "$text-font: " + fonts.textFont.font + ";\n"
        }
      }
      if (fonts.displayFont) {
        if (outputFontWeight) {
          theDisplayFont = getFontAndWeight(fonts.displayFont.font);
          var fontFamilyValue = theDisplayFont.fontFamily;
          if (theTextFont && fontFamilyValue == theTextFont.fontFamily) {
            fontFamilyValue = "$text-font"
          }
          textStyleSheet += "$display-font: " + fontFamilyValue + ";\n"
          textStyleSheet += "$display-font-weight: " + theDisplayFont.fontWeight + ";\n"
          textStyleSheet += "$display-font-style: " + theDisplayFont.fontStyle + ";\n"
        } else {
          textStyleSheet += "$display-font: " + fonts.displayFont.font + ";\n"
        }
      }
      if (fonts.auxiliaryFont && fonts.auxiliaryFont.length > 0) {
        _.forEach(fonts.auxiliaryFont, function(font){
          if (outputFontWeight) {
            theAuxiliaryFont = getFontAndWeight(font.fontObject.font);
            var fontFamilyValue = theAuxiliaryFont.fontFamily;
            if (theTextFont && fontFamilyValue == theTextFont.fontFamily) {
              fontFamilyValue = "$text-font"
            } else if (theDisplayFont && fontFamilyValue == theDisplayFont.fontFamily) {
              fontFamilyValue == "$display-font"
            }
            textStyleSheet += "$auxiliary-font-" + (font.index + 1) + ": " + fontFamilyValue + ";\n"
            textStyleSheet += "$auxiliary-font-" + (font.index + 1) + "-weight: " + theAuxiliaryFont.fontWeight + ";\n"
            textStyleSheet += "$auxiliary-font-" + (font.index + 1) + "-style: " + theAuxiliaryFont.fontStyle + ";\n"
          } else {
            textStyleSheet += "$auxiliary-font-" + (font.index + 1) + ": " + font.fontObject.font + ";\n"
          }
        })
      }
      // - mobile and desktop sizes [HAPPY PATH]
      if ((layerTextStyleMap.mobile.styles && layerTextStyleMap.mobile.styles.length > 0) && (layerTextStyleMap.desktop.styles && layerTextStyleMap.desktop.styles.length > 0)) {
        textStyleSheet += setBaseFontSize(layerTextStyleMap.mobile, layerTextStyleMap.desktop)
        textStyleSheet += writeTypeStyles(fonts, layerTextStyleMap.mobile, layerTextStyleMap.desktop)
      // - mobile sizes only
      } else if (layerTextStyleMap.mobile.styles && layerTextStyleMap.mobile.styles.length > 0) {
        textStyleSheet += setBaseFontSize(layerTextStyleMap.mobile)
        textStyleSheet += "\n// MOBILE TYPE STYLES\n" + writeTypeStyles(fonts, layerTextStyleMap.mobile)
      // - desktop sizes only
      } else if (layerTextStyleMap.desktop.styles && layerTextStyleMap.desktop.styles.length > 0) {
        textStyleSheet += setBaseFontSize(layerTextStyleMap.desktop)
        textStyleSheet += "\n// DESKTOP TYPE STYLES\n" + writeTypeStyles(fonts, layerTextStyleMap.desktop)
      }
      // - assorted styles (separate, as is)
      if (layerTextStyleMap.assorted.styles && layerTextStyleMap.assorted.styles.length > 0) {
        textStyleSheet += setBaseFontSize(layerTextStyleMap.assorted)
        textStyleSheet += "\n// ASSORTED TYPE STYLES\n" + writeTypeStyles(fonts, layerTextStyleMap.assorted)
      }
    }
    return textStyleSheet
  },
  fontSurvey: function (styles) {
    var fonts = []
    var uniqueStyles = getUniqueStyles(styles.objects())
    _.forEach(uniqueStyles, function(style) {
      var found = false;
      var isParagraph = false;
      var attributes = style.style().textStyle().attributes();
      var fontName = String(attributes.NSFont.fontDescriptor().objectForKey(NSFontNameAttribute))
      var tag = getTag(String(style.name()))
      var attributes = style.style().textStyle().attributes();
      var smallestSize = parseFloat(attributes.NSFont.fontDescriptor().objectForKey(NSFontSizeAttribute));
      if (tag.isTag && tag.cssSelector == "p") {
        isParagraph = true
      }
      var fontCount = 0
      _.forEach(fonts, function(foundFont){
        if (foundFont.font == fontName) {
          foundFont.count += 1;
          if (!foundFont.isParagraph) {
            foundFont.isParagraph = isParagraph
          }
          if (smallestSize < foundFont.smallestSize) {
            foundFont.smallestSize = smallestSize;
          }
          var fontCount = foundFont.count
          found = true;
        }
      })
      if (!found) {
        fonts.push({"font": fontName, "count": 1, "isParagraph": isParagraph, "smallestSize": smallestSize})
        fontCount = 1;
      }
    })
    return fonts
  },
  determineFontType: function (foundFonts) {
    var displayFont,
        textFont,
        auxiliaryFont = [],
        subArray = foundFonts.slice(),
        most = mostUsed(subArray)
    if (foundFonts.length == 1) {
      textFont = foundFonts[0]
    } else if (foundFonts.length == 2) {
      var smaller,
        smallestFont;
      _.forEach(foundFonts, function(font){
        if (!smallestFont) {
          smallestFont = font;
        } else if (font.smallestSize < smallestFont.smallestSize) {
          smallestFont = font;
        }
      })
      _.forEach(foundFonts, function(font) {
        if (!smaller) {
          smaller = font
        } else if (font.isParagraph) {
          smaller = font
        } else {
          smaller = smallestFont
        }
      });
      var index = subArray.indexOf(smaller);
      if (index > -1) {
        subArray.splice(index, 1);
      }
      textFont = smaller;
      displayFont = subArray[0];
    } else {
      _.forEach(foundFonts, function(font){
        if ((!textFont && font.isParagraph) || font.font == textFont) {
          textFont = font
          var index = subArray.indexOf(font);
          if (index > -1) {
            subArray.splice(index, 1);
          }
        }
      })
      _.forEach(subArray, function(font){
        if ((!displayFont && font == most) || font == displayFont) {
          displayFont = font;
        } else {
          auxiliaryFont.push({"index": auxiliaryFont.length, "fontObject": font})
        }
      })
    }
    var result = {"textFont": textFont, "displayFont": displayFont, "auxiliaryFont": auxiliaryFont}
    return result
  }
}
function setBaseFontSize (mobileRamp, desktopRamp) {
  var output = "";
  if (useRem) {
    if (mobileRamp.hasParagraph) {
      mobileBaseFontSize = mobileRamp.styles[0].size
    }
    if (desktopRamp && desktopRamp.hasParagraph) {
      desktopBaseFontSize = desktopRamp.styles[0].size
    }
    var output = "\n// BASE FONT SIZE\n@mixin baseFontSize {\n"
    // mobile base font size
    output += "  font-size: " + Math.round(mobileBaseFontSize / defaultBaseFontSize * 100) + "%;\n"
    output += "  @media screen and (min-width: " + breakpointVariable + ") {\n"
    output += "  & {\n"
    output += "    font-size: " + Math.round(desktopBaseFontSize / defaultBaseFontSize * 100) + "%;\n"
    output += "    }\n"
    output += "  }\n"
    output += "}\n\n"
  }
  return output
}
function mostUsed(foundFonts) {
  var most;
  _.forEach(foundFonts, function(font){
    if (!most) {
      most = font
    } else if (font.count > most.count) {
      most = font
    }
  })
  return most;
}
function getUniqueStyles(styles) {
  var uniqueStyles = [];
  styles.forEach(function(style){
    var found = false;
    uniqueStyles.forEach(function(sortedStyle){
      if (getTag(String(style.name())).tag == getTag(String(sortedStyle.name())).tag) {
        found = true;
      }
    })
    if (!found) {
      uniqueStyles.push(style)
    }
  })
  return uniqueStyles;
}
function getTextStyleAsJson (style) {
  var attributes = style.style().textStyle().attributes();
  var par = attributes.NSParagraphStyle;
  if (par != null) {
      var lineHeight = par.maximumLineHeight();
      var paragraphSpacing = par.paragraphSpacing();
  }
  var textTransform = 0
  var text = attributes.MSAttributedStringTextTransformAttribute;
  if (text != null) {
      textTransform = String(attributes.MSAttributedStringTextTransformAttribute) * 1;
  }
  var style = {
    name: String(style.name()),
    font: String(attributes.NSFont.fontDescriptor().objectForKey(NSFontNameAttribute)),
    size: String(attributes.NSFont.fontDescriptor().objectForKey(NSFontSizeAttribute)) * 1,
    spacing: String(attributes.NSKern) * 1,
    lineHeight: lineHeight,
    textTransform: textTransform,
    paragraphSpacing: paragraphSpacing,
    underline: String(attributes.NSUnderline) * 1
  };
  return style;
}
function popPToTop (styles) {
  var hasParagraph = false;
  styles.forEach(function(style, indx){
    if (getTag(String(style.name)).selector == "p") {
      array_move(styles, indx, 0);
      hasParagraph = true;
    }
  });
  return {"styles": styles, "hasParagraph": hasParagraph}
}
function array_move(arr, old_index, new_index) {
  if (new_index >= arr.length) {
    var k = new_index - arr.length + 1;
    while (k--) {
      arr.push(undefined);
    }
  }
  arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
  return arr; 
};
function getTag (name) {
  var regex = /^\[(([A-Za-z])*(\d\.*[0-9]*|[\P|\p]+))(.*)\]\s(.*)/g,
      tag = name,
      isTag = false,
      match = regex.exec(name),
      ramp,
      selector,
      variant,
      cssSelector,
      tagName
  if (match) {
    isTag = true
    tag = match[1].toLowerCase()
    ramp = match[2].toLowerCase()
    selector = match[3].toLowerCase()
    cssSelector = match[3].toLowerCase()
    if (cssSelector != "p") {
      cssSelector = "h" + selector
    }
    variant = match[4]
    tagName = match[5]
  }
  return {"isTag": isTag, "tag": tag, "ramp": ramp, "selector": selector, "cssSelector": cssSelector, "variant": variant, "name": tagName}
}
function hyphenize (str) {
  return String(str).replace(/[\.\,\[\]]/g, '_').replace(/[\s]/g, '-').replace(/\-\-\-/g, '-').replace(/\-\-/g, '-').toLowerCase();
}
function getFontAndWeight (fontName) {
  fontName = String(fontName)
  var hyphenIndex = fontName.indexOf("-"),
      fontWeight = 400,
      fontStyle = "normal",
      fontName;
  if (hyphenIndex > 0) {
    var fontWeightWord = fontName.slice(fontName.indexOf("-") + 1);
    fontName = fontName.slice(0, fontName.indexOf("-"));
    fontWeightWord = fontWeightWord.replace(/[\s]/g, '').toLowerCase();

    // find indexOf("italic")
    if (fontWeightWord.indexOf("italic") >= 0) {
      fontStyle = "italic"
      fontWeightWord = fontWeightWord.replace("italic", "")
    } else if (fontWeightWord.indexOf("oblique") >= 0) {
      fontStyle = "oblique"
      fontWeightWord = fontWeightWord.replace("oblique", "")
    }

    fontWeightWords.forEach(function(thisFontWeight){
      if (fontWeightWord == thisFontWeight.name) {
        fontWeight = thisFontWeight.value
      }
    })
  }
  var returnFontName = String(fontName.replace(/([A-Z])/g, ' $1')).trim()
  return {"fontFamily": '"' + returnFontName + '"', "fontWeight": fontWeight, "fontStyle": fontStyle}
}

function compareNameLength(a,b) {
  if (a.name.length < b.name.length)
    return -1;
  if (a.name.length> b.name.length)
    return 1;
  return 0;
}
function writeTypeStyles(fonts, mobileTypeRamp, desktopTypeRamp) {
  var output = "",
      isResponsive = false,
      mobileStyles = mobileTypeRamp.styles,
      desktopStyles = [],
      exceptionDesktopStyles = [];
      if (desktopTypeRamp) {
        desktopStyles = desktopTypeRamp.styles,
        exceptionDesktopStyles = desktopStyles.slice()
      }

  mobileStyles.forEach(function(thisStyle) {
    var desktopTag;
    var desktopStyleName;
    var styleName = String(thisStyle.name);
    var tag = getTag(styleName);
    if (!tag.isTag) {
      tag.tag = hyphenize(tag.tag);
    }
    if (tag.isTag && tag.variant) {
      var styleName = styleName.slice(0, styleName.toLowerCase().indexOf(tag.variant)) + styleName.slice(styleName.toLowerCase().indexOf(tag.variant) + tag.variant.length);
    }
    // replace "m" with "h"
    if (tag.isTag && tag.selector == "p") {
      styleName = styleName.slice(0,1) + styleName.slice(2)
    } else if (tag.isTag) {
      styleName = styleName.slice(0,1) + "H" + styleName.slice(2)
    }
    output += "// " + styleName + "\n";
    // find a counterpart desktop style
    var found = false;
    var thisDesktopStyle
    _.forEach(desktopStyles, function(desktopStyle) {
      desktopStyleName = String(desktopStyle.name);
      desktopTag = getTag(desktopStyleName);
      if (desktopTag.isTag && desktopTag.variant) {
        desktopStyleName = desktopStyleName.slice(0, desktopStyleName.toLowerCase().indexOf(desktopTag.variant)) + desktopStyleName.toLowerCase().slice(desktopStyleName.indexOf(desktopTag.variant) + desktopTag.variant.length);
      }
      if (!desktopTag.isTag)
      desktopTag.tag = hyphenize(desktopTag.tag).toLowerCase();
      if (tag.isTag && desktopTag.selector == tag.selector && !found) {
        found = true;
        thisDesktopStyle = desktopStyle
        var index = exceptionDesktopStyles.indexOf(thisDesktopStyle);
        if (index > -1) {
          exceptionDesktopStyles.splice(index, 1);
        }
      }
    })

    // set vars
    var fontType = "text-font"
    if (fonts.displayFont && fonts.displayFont.font == thisStyle.font) {
      fontType = "display-font"
    } else {
      _.forEach(fonts.auxiliaryFont, function(font){
        if (thisStyle.font == font.fontObject.font) {
          fontType = "auxiliary-font-" + String(font.index + 1)
        }
      })
    }

    output += outputSetupVars(thisStyle, mobileBaseFontSize, fonts)

    // if desktop, set desktop vars
    if (thisDesktopStyle) {
      output += outputSetupVars(thisDesktopStyle, desktopBaseFontSize, fonts)
      isResponsive = true
    }
    // give me those sweet sweet mixins
    output += outputMixin(tag, 0, isResponsive)
  })
  _.forEach(exceptionDesktopStyles, function(thisStyle) {
    var styleName = String(thisStyle.name);
    var tag = getTag(styleName);
    if (!tag.isTag) {
      tag.tag = hyphenize(tag.tag);
    }
    if (tag.isTag && tag.variant) {
      var styleName = styleName.slice(0, styleName.toLowerCase().indexOf(tag.variant)) + styleName.slice(styleName.toLowerCase().indexOf(tag.variant) + tag.variant.length);
    }
    // replace "m" with "h"
    if (tag.isTag && tag.selector == "p") {
      styleName = styleName.slice(0,1) + styleName.slice(2)
    } else if (tag.isTag) {
      styleName = styleName.slice(0,1) + "H" + styleName.slice(2)
    }
    output += "// " + styleName + "\n";

    output += outputSetupVars(thisStyle, mobileBaseFontSize, fonts)
    output += outputMixin(tag, 0, false)
  })
  return output;
}

function outputSetupVars(style, baseSize, fonts) {
  var styleName = String(style.name),
      tag = getTag(styleName);
  tag.tag = hyphenize(tag.tag)
  var pre = "$" + tag.tag,
      output = "";

  // SET UP FONT FAMILY STUFF

  var fontType = "text-font"
  if (fonts.displayFont && fonts.displayFont.font == style.font) {
    fontType = "display-font"
  } else {
    _.forEach(fonts.auxiliaryFont, function(font){
      if (style.font == font.fontObject.font) {
        fontType = "auxiliary-font-" + String(font.index + 1)
      }
    })
  }
  output += pre + "-font-family: $" + fontType + ", $" + fontType + "-fallback-fonts;\n"
  if (outputFontWeight) {
    output += pre + "-font-weight: $" + fontType + "-weight;\n"
  }
  fontSize = style.size + "px"
  if (useRem) {
    fontSize = Math.round((style.size / baseSize) * 1000) / 1000 + "rem"
  }
  output += pre + "-font-size: " + fontSize + ";\n";
  var letterSpacing = parseFloat(style.spacing) + "px;\n";
  if (useRem) {
    letterSpacing = Math.round((parseFloat(style.spacing) / baseSize) * 100) / 100 + "rem;\n";
    }
  output += pre + "-letter-spacing: " + letterSpacing;

  var textTransform = style.textTransform;
  if (String(textTransform) == "0") {
    textTransform = "none"
  } else if (String(textTransform) == "1") {
    textTransform = "uppercase"
  } else if (String(textTransform) == "2") {
    textTransform = "lowercase"
  }
  output += pre + "-text-transform: " + textTransform + ";\n";
  var lineHeight = Math.round(style.lineHeight / style.size * 100) / 100;
  if (String(lineHeight) == "0") {
    lineHeight = "normal";
  }
  output += pre + "-line-height: " + lineHeight + ";\n"
  var underline = "none"
  if (style.underline) {
    underline = "underline"
  }
  output += pre + "-text-decoration: " + underline + ";\n"
  var marginValue = "0";
  if (style.paragraphSpacing > 0) {
    marginValue = "0 0 " + style.paragraphSpacing + "px 0";
    if (useRem) {
      marginValue = "0 0 " + Math.round((style.paragraphSpacing / baseSize) * 100) / 100 + "rem 0";
    }
  }
  output += pre + "-margin: " + marginValue + ";\n"
  return output
}

function outputMixin (tag, indent, isResponsive) {
  var text = "",
      output = ""
  var i;
  for (i = 0; i < indent; i++) { 
    text += " ";
  }
  indent = text;
  if (!tag.isTag) {
    var newTag = tag.tag
    tag.tag = newTag;
    tag.cssSelector = newTag
  }
  var attributes = ["font-family", "font-size", "letter-spacing", "line-height", "text-transform", "text-decoration", "margin"]
  if (outputFontWeight) {
    attributes = ["font-family", "font-weight", "font-style", "font-size", "letter-spacing", "line-height", "text-transform", "text-decoration", "margin"]
  }
  _.forEach(attributes, function(attribute){
    output += indent + "@mixin " + hyphenize(tag.cssSelector) + "-" + attribute + " {\n"
    output += indent + "  " + attribute + ": $" + hyphenize(tag.tag) + "-" + attribute + ";\n"
    if (isResponsive) {
      output += indent + "  @media screen and (min-width: " + breakpointVariable + ") {\n"
      output += indent + "    " + attribute + ": $d" + hyphenize(tag.selector) + "-" + attribute + ";\n"
      output += indent + "  }\n"
    }
    output += indent + "}\n"
  })
  // now tie it all together

  output += indent + "@mixin " + hyphenize(tag.cssSelector) + "-text-style {\n"
  _.forEach(attributes, function(attribute){
    output += indent + "  @include " + hyphenize(tag.cssSelector) + "-" +attribute + ";\n"
  })
  output += indent + "}\n\n"
  return output
}