var _ = require("lodash")
const common = require("./common");

var useRem = true;
var defaultBaseFontSize = 16;
var breakpointVariable = "$breakpoint";
var mobileBaseFontSize = defaultBaseFontSize;
var desktopBaseFontSize = defaultBaseFontSize;
var outputFontWeight = true;

module.exports = {
  parse: function (sharedTextStyles) { 
    var desktop = []
    var mobile = []
    var assorted = []
    var sortedStyles = _.sortBy(sharedTextStyles.objects(), [style => style.name()], ["desc"])

    _.forEach(getUniqueStyles(sortedStyles), (thisStyle) => {
      var tag = common.getTag(String(thisStyle.name()))
      var style = getTextStyleAsJson(thisStyle)
      if (tag.ramp === "m") {
        mobile.push(style)
      } else if (tag.ramp === "d") {
        desktop.push(style)
      } else if (tag.ramp != "x") {
        assorted.push(style)
      }
    })
    return {"desktop": popPToTop(desktop), "mobile": popPToTop(mobile), "assorted": {"styles": assorted}};
  },

  // TODO Refactor this
  writeSass: function (layerTextStyleMap, fonts) {
    var textStyleSheet = ""

    if ((layerTextStyleMap.desktop.styles && layerTextStyleMap.desktop.styles.length) || 
        (layerTextStyleMap.mobile.styles && layerTextStyleMap.mobile.styles.length) || 
        (layerTextStyleMap.assorted.styles && layerTextStyleMap.assorted.styles.length)) {
      
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

      if(fonts.displayFont) {
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
    _.forEach(uniqueStyles, (style) => {
      var found = false;
      var isParagraph = false;
      var fontCount = 0
      var attributes = style.style().textStyle().attributes();
      var fontName = String(attributes.NSFont.fontDescriptor().objectForKey(NSFontNameAttribute))
      var tag = common.getTag(String(style.name()))
      var smallestSize = parseFloat(attributes.NSFont.fontDescriptor().objectForKey(NSFontSizeAttribute));
      
      if (tag.isTag && tag.cssSelector === "p") {
        isParagraph = true
      }
      _.forEach(fonts, (foundFont) => {
        if (foundFont.font === fontName) {
          foundFont.count += 1;
          if (!foundFont.isParagraph) {
            foundFont.isParagraph = isParagraph
          }
          if (smallestSize < foundFont.smallestSize) {
            foundFont.smallestSize = smallestSize;
          }
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
    var fontList = [],
        textFont,
        displayFont,
        auxiliaryFont = [],
        subArray = foundFonts.slice()

    if (foundFonts.length === 1) {
      textFont = {"name": "text-font", "fontObject": foundFonts[0]}

    } else if (foundFonts.length === 2) {
      if (_.find(foundFonts, (font) => {return font.isParagraph})) {
        textFont = {"name": "text-font", "fontObject": _.find(foundFonts, (font) => {return font.isParagraph})}
      } else {
        textFont = {"name": "text-font", "fontObject": _.min(foundFonts, (font) => {return font.smallestSize})};
      }
      displayFont = _.pull(subArray, textFont.fontObject);
      displayFont = {"name": "display-font", "fontObject": displayFont[0]};
    } else {
      // there are more than two fonts
      var paragraphFont = _.find(foundFonts, (obj) => { return obj.isParagraph})
      if (paragraphFont) {
        textFont = {"name": "text-font", "fontObject": paragraphFont}
        subArray = _.pull(subArray, paragraphFont);
      }
      _.forEach(subArray, function(font){
        if ((!displayFont && font === _.max(foundFonts, (font) => {return font.count})) || font === displayFont) {
          displayFont = {"name": "display-font", "fontObject": font};
        } else {
          auxiliaryFont.push({"name": "auxiliary-font-" + (auxiliaryFont.length + 1), "fontObject": font})
        }
      })
    }
    var result = [textFont, displayFont].concat(auxiliaryFont);
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

function getUniqueStyles(styles) {
  return _.uniqBy(styles, (style) => {
    return common.getTag(String(style.name())).tag
  })
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
  styles = _.sortBy(styles, (style) => {return common.getTag(String(style.name)).selector === 'p' ? 0 : 1;})
  var hasParagraph = _.find(styles, (style) => {return common.getTag(String(style.name)).selector === 'p'});
  return {"styles": styles, "hasParagraph": hasParagraph}
}

function getFontAndWeight (fontName) {

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
    ],
  fontName = String(fontName),
      fontWeightFound,
      fontStyle = "normal"
      
  if (fontName.indexOf("-")) {
    var fontWeightWord = fontName.split("-");
    fontName = String(fontWeightWord[0]);
    fontWeightWord = String(fontWeightWord[1]).replace(/[\s]/g, '').toLowerCase();

    // find indexOf("italic")
    if (fontWeightWord.indexOf("italic") >= 0) {
      fontStyle = "italic"
      fontWeightWord = fontWeightWord.replace("italic", "")
    } else if (fontWeightWord.indexOf("oblique") >= 0) {
      fontStyle = "oblique"
      fontWeightWord = fontWeightWord.replace("oblique", "")
    }
    
    fontWeightFound = _.find(fontWeightWords, (thisFontWeight) => { 
      return (fontWeightWord === thisFontWeight.name)
    })
  }

  var returnFontName = String(fontName).replace(/([A-Z])/g, ' $1').trim()
  return {
    "fontFamily": '"' + returnFontName + '"', 
    "fontWeight": fontWeightFound ? fontWeightFound.value : 400, 
    "fontStyle": fontStyle}
}

function compareNameLength(a,b) {
  if (a.name.length < b.name.length)
    return -1;
  if (a.name.length> b.name.length)
    return 1;
  return 0;
}

// TODO Needs refactoring
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

  _.forEach(mobileStyles, (thisStyle) => {
    var styleName = String(thisStyle.name);
    var tag = common.getTag(styleName);
    if (tag.isTag) {
      styleName = tag.cssSelector.toUpperCase() + " " + tag.name
    }
    output += "// " + styleName + "\n";


    // find a counterpart desktop style
    var found = false;
    var thisDesktopStyle = _.find(desktopStyles, (desktopStyle) => {return common.getTag(String(desktopStyle.name)).selector == tag.selector})
    
    if (thisDesktopStyle) {
      exceptionDesktopStyles = _.pull(exceptionDesktopStyles, thisDesktopStyle)
      var desktopTag = common.getTag(String(thisDesktopStyle.name));
      if (!desktopTag.isTag) {
        desktopTag.tag = _.kebabCase(desktopTag.tag).toLowerCase();
      }

      output += outputSetupVars(thisStyle, mobileBaseFontSize, fonts)

      // if desktop, set desktop vars
      output += outputSetupVars(thisDesktopStyle, desktopBaseFontSize, fonts)
      isResponsive = true
    }
    // give me those sweet sweet mixins
    output += outputMixin(tag, 0, isResponsive)
  })
  _.forEach(exceptionDesktopStyles, (thisStyle) => {
    var styleName = String(thisStyle.name);
    var tag = common.getTag(styleName);
    if (tag.isTag) {
      styleName = tag.cssSelector.toUpperCase() + " " + tag.name
    }
    output += "// " + styleName + "\n";

    output += outputSetupVars(thisStyle, mobileBaseFontSize, fonts)
    output += outputMixin(tag, 0, false)
  })
  return output;
}

function outputSetupVars(style, baseSize, fonts) {
  var styleName = String(style.name)
  var tag = common.getTag(styleName)
  if (!tag.isTag) {
    tag.tag = _.kebabCase(tag.tag)
  }
  
  var pre = "$" + tag.tag
  var output = ""

  // SET UP FONT FAMILY STUFF
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

  output += pre + "-font-family: $" + fontType.name + ", $" + fontType.name + "-fallback-fonts;\n"
  if (outputFontWeight) {
    output += pre + "-font-weight: $" + fontType.name + "-weight;\n"
    output += pre + "-font-style: $" + fontType.name + "-style;\n"
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
  if (String(textTransform) === "0") {
    textTransform = "none"
  } else if (String(textTransform) === "1") {
    textTransform = "uppercase"
  } else if (String(textTransform) === "2") {
    textTransform = "lowercase"
  }
  output += pre + "-text-transform: " + textTransform + ";\n";
  var lineHeight = Math.round(style.lineHeight / style.size * 100) / 100;
  if (String(lineHeight) === "0") {
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
    tag.tag = _.kebabCase(tag.tag)
    tag.cssSelector = tag.tag
  }
  var attributes = ["font-family", "font-size", "letter-spacing", "line-height", "text-transform", "text-decoration", "margin"]
  if (outputFontWeight) {
    attributes = ["font-family", "font-weight", "font-style", "font-size", "letter-spacing", "line-height", "text-transform", "text-decoration", "margin"]
  }
  _.forEach(attributes, function(attribute) {
    output += indent + "@mixin " + tag.cssSelector + "-" + attribute + " {\n"
    output += indent + "  " + attribute + ": $" + tag.tag + "-" + attribute + ";\n"
    if (isResponsive) {
      output += indent + "  @media screen and (min-width: " + breakpointVariable + ") {\n"
      output += indent + "    " + attribute + ": $d" + tag.selector + "-" + attribute + ";\n"
      output += indent + "  }\n"
    }
    output += indent + "}\n"
  })
  // now tie it all together

  output += indent + "@mixin " + tag.cssSelector + "-text-style {\n"
  _.forEach(attributes, function(attribute){
    output += indent + "  @include " + tag.cssSelector + "-" +attribute + ";\n"
  })
  output += indent + "}\n\n"
  return output
}
