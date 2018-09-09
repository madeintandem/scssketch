var _ = require("lodash")

var useRem = true;
var defaultBaseFontSize = 16;
var breakpointVariable = "$breakpoint";
var mobileBaseFontSize = defaultBaseFontSize;
var desktopBaseFontSize = defaultBaseFontSize;

module.exports = {
  parse: function (sharedTextStyles) { 
    var desktop = []
    var mobile = []
    var assorted = []
    var sortedStyles = _.sortBy(sharedTextStyles.objects(), [style => style.name()], ["desc"])
    var typeStyles = getUniqueStyles(sortedStyles)
    log("typeStyles.length == " + typeStyles.length)
    typeStyles.forEach(function(thisStyle){
      var tag = getTag(String(thisStyle.name()))
      var style = getTextStyleAsJson(thisStyle)
      if (tag.isTag && tag.tag.slice(0,1).toLowerCase() == "m") {
        mobile.push(style)
      } else if (tag.isTag && tag.tag.slice(0,1).toLowerCase() == "d") {
        desktop.push(style)
      } else if (tag.isTag && tag.tag.slice(0,1).toLowerCase() == "x") {
        // do nothing
      } else {
        assorted.push(style)
      }
    })
    return {"desktop": popPToTop(desktop), "mobile": popPToTop(mobile), "assorted": {"styles": assorted}};
  },
  
  writeSass: function (layerTextStyleMap, fonts) {
    var textStyleSheet = ""
    if ((layerTextStyleMap.desktop.styles && layerTextStyleMap.desktop.styles.length) || (layerTextStyleMap.mobile.styles && layerTextStyleMap.mobile.styles.length) || (layerTextStyleMap.assorted.styles && layerTextStyleMap.assorted.styles.length)) {
      textStyleSheet += "\n// TYPE STYLES\n"

      textStyleSheet += "\n// FONT FAMILIES\n"
      if (fonts.textFont) {
        textStyleSheet += "$text-font: " + fonts.textFont.font + ";\n"
      }
      if (fonts.displayFont) {
        textStyleSheet += "$display-font: " + fonts.displayFont.font + ";\n"
      }
      if (fonts.auxiliaryFont) {
        textStyleSheet += "$auxiliary-font: " + fonts.auxiliaryFont.font + ";\n"
      }




      // - mobile and desktop sizes [HAPPY PATH]
      // add baseFontSize mixin here...

      if ((layerTextStyleMap.mobile.styles && layerTextStyleMap.mobile.styles.length > 0) && (layerTextStyleMap.desktop.styles && layerTextStyleMap.desktop.styles.length > 0)) {
        textStyleSheet += setBaseFontSize(layerTextStyleMap.mobile, layerTextStyleMap.desktop)
        textStyleSheet += writeTwoTypeStyles(layerTextStyleMap.mobile, layerTextStyleMap.desktop, fonts)



      // - mobile sizes only
      // add baseFontSize mixin here...

      } else if (layerTextStyleMap.mobile.styles && layerTextStyleMap.mobile.styles.length > 0) {
        textStyleSheet += setBaseFontSize(layerTextStyleMap.mobile)
        textStyleSheet += "\n// MOBILE TYPE STYLES\n" + writeOneTypeStyle(layerTextStyleMap.mobile, fonts)


      // - desktop sizes only
      // add baseFontSize mixin here...
      } else if (layerTextStyleMap.desktop.styles && layerTextStyleMap.desktop.styles.length > 0) {

        textStyleSheet += setBaseFontSize(layerTextStyleMap.desktop)
        textStyleSheet += "\n// DESKTOP TYPE STYLES\n" + writeOneTypeStyle(layerTextStyleMap.desktop, fonts)
      }



      // - assorted styles (separate, as is)
      // add baseFontSize mixin here...
      if (layerTextStyleMap.assorted.styles && layerTextStyleMap.assorted.styles.length > 0) {
        textStyleSheet += setBaseFontSize(layerTextStyleMap.assorted)
        textStyleSheet += "\n// ASSORTED TYPE STYLES\n" + writeOneTypeStyle(layerTextStyleMap.assorted, fonts)
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
      var tag = getTag(String(style.name())).tag
      if (tag.slice(-1).toLowerCase() == "p") {
        isParagraph = true
      }
      var fontCount = 0
      _.forEach(fonts, function(foundFont){
        if (foundFont.font == fontName) {
          foundFont.count += 1;
          if (!foundFont.isParagraph) {
            foundFont.isParagraph = isParagraph
          }
          var fontCount = foundFont.count
          found = true;
        }
      })
      if (!found) {
        fonts.push({"font": fontName, "count": 1, "isParagraph": isParagraph})
        fontCount = 1;
      }
    })
    return fonts
  },
  determineFontType: function (foundFonts) {
    var displayFont;
    var textFont;
    var auxiliaryFont;
    var subArray = foundFonts.slice()
    _.forEach(foundFonts, function(font){
      if ((!textFont && font.isParagraph) || font.font == textFont) {
        textFont = font
        var index = subArray.indexOf(font);
        if (index > -1) {
          subArray.splice(index, 1);
        }
      }
    })
    var most = mostUsed(subArray);
    _.forEach(subArray, function(font){
      if ((!displayFont && font == most) || font == displayFont) {
        displayFont = font
      } else {
        auxiliaryFont = font
      }
    })
    var result = {"textFont": textFont, "displayFont": displayFont, "auxiliaryFont": auxiliaryFont}
    return result
  }
}
function setBaseFontSize (mobileRamp, desktopRamp) {
  if (useRem && mobileRamp.hasParagraph) {
    mobileBaseFontSize = mobileRamp[0].styles.size
  }
  if (desktopRamp && useRem && desktopRamp.hasParagraph) {
    mobileBaseFontSize = mobileRamp[0].styles.size
  }
  var output = "\n// BASE FONT SIZE\n@mixin baseFontSize {\n"
  // mobile base font size
  output += "font-size: " + Math.round(mobileBaseFontSize / defaultBaseFontSize * 100) + "%;\n"
  output += "  @media screen and (min-width: " + breakpointVariable + ") {\n"
  output += "  & {\n"
  output += "    font-size: " + Math.round(desktopBaseFontSize / defaultBaseFontSize * 100) + "%;\n"
  output += "    }\n"
  output += "  }\n"
  output += "}\n"
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
      // GET THE [TAG]
      var tag = getTag(String(sortedStyle.name())).tag
      if (String(style.name()).slice(1,tag.length + 1) == tag) {
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
  var style = {
    name: String(style.name()),
    font: String(attributes.NSFont.fontDescriptor().objectForKey(NSFontNameAttribute)),
    size: String(attributes.NSFont.fontDescriptor().objectForKey(NSFontSizeAttribute)) * 1,
    spacing: String(attributes.NSKern) * 1,
    lineHeight: lineHeight,
    paragraphSpacing: paragraphSpacing,
    underline: String(attributes.NSUnderline) * 1
  };
  return style;
}
function popPToTop (styles) {
  var hasParagraph = false;
  styles.forEach(function(style, indx){
    var tag = getTag(style.name);
    if (tag.isTag && tag.tag.slice(-1).toLowerCase() == "p") {
      array_move(styles, indx, 0);
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
  var tag = name.slice(0, name.indexOf("]") + 1);
  var isTag = false
  if (tag.slice(0,1) == "[" && tag.slice(tag.length -1) == "]") {
    isTag = true;
    tag = tag.substring(1, tag.length - 1)
    if (tag.slice(-1).toLowerCase() == "l") {
      tag = tag.slice(0, -1)
    }
  } else {
    tag = name
  }
  return {isTag: isTag, tag: tag}
}
function hyphenize(str) {
  return String(str).replace(/\s+/g, '-').replace(/\.+/g, '-').replace(/\,+/g, '-').toLowerCase();
}
function writeOneTypeStyle(typeRamp, fonts) {
  var output = String(""),
      styles = typeRamp.styles,
      baseFontSize = mobileBaseFontSize;
  if (useRem && typeRamp.hasParagraph) {
    baseFontSize = typeRamp[0].styles.size
  }
  styles.forEach(function(thisStyle) {
    var styleName = String(thisStyle.name);
    var tag = getTag(styleName);
    if (tag.isTag && styleName.slice(tag.tag.length + 1, tag.tag.length + 2).toLowerCase() == "l") {
      styleName = styleName.slice(0,tag.tag.length + 1) + styleName.slice(tag.tag.length + 2);
    }
    tag.tag = hyphenize(tag.tag);
    output += "// " + styleName + "\n";

    // set vars
    var fontType = "text-font"
    if (fonts.displayFont.font == thisStyle.font) {
      fontType = "display-font"
    } else if (fonts.auxiliaryFont.font == thisStyle.font) {
      fontType = "auxiliary-font"
    }
    output += "$" + tag.tag + "-font-family: $" + fontType + ";\n";
    var fontSize = thisStyle.size + "px";
    if (useRem) {
      fontSize = Math.round((thisStyle.size / baseFontSize) * 1000) / 1000 + "rem"
    }
    output += "$" + tag.tag + "-font-size: " + fontSize + ";\n";
    output += "$" + tag.tag + "-letter-spacing: " + thisStyle.spacing + "px;\n";
    output += "$" + tag.tag + "-line-height: " + Math.round(thisStyle.lineHeight / thisStyle.size * 100) / 100 + ";\n"
    var underline = "none"
    if (thisStyle.underline) {
      underline = "underline"
    }
    output += "$" + tag.tag + "-text-decoration: " + underline + ";\n"
    var marginValue = "0";
    if (thisStyle.paragraphSpacing > 0) {
      marginValue = "0 0 " + thisStyle.paragraphSpacing + "px 0";
    }
    output += "$" + tag.tag + "-margin: " + marginValue + ";\n"

    // use vars
    var labelTextStyle = "-text-style";
    if (tag.tag.slice(-5).toLowerCase() == "style") {
      labelTextStyle = ""
    }
    output += "@mixin " + tag.tag + labelTextStyle + " {\n";
    output += "  font-family: $" + tag.tag + "-font-family;\n"
    output += "  font-size: $" + tag.tag + "-font-size;\n"
    output += "  letter-spacing: $" + tag.tag + "-letter-spacing;\n"
    output += "  line-height: $" + tag.tag + "-line-height;\n"
    output += "  text-decoration: $" + tag.tag + "-text-decoration;\n"
    output += "  margin: $" + tag.tag + "-margin;\n"
    output += "}\n"
  })
  return output
}
function writeTwoTypeStyles(mobileTypeRamp, desktopTypeRamp, fonts) {
  var output = String(""),
      mobileStyles = mobileTypeRamp.styles,
      desktopStyles = desktopTypeRamp.styles;
      exceptionDesktopStyles = desktopTypeRamp.styles.slice()

  mobileStyles.forEach(function(thisStyle) {
    var styleName = String(thisStyle.name);
    var tag = getTag(styleName);
    if (tag.isTag && styleName.slice(tag.tag.length + 1, tag.tag.length + 2).toLowerCase() == "l") {
      styleName = styleName.slice(0,tag.tag.length + 1) + styleName.slice(tag.tag.length + 2);
    }
    tag.tag = hyphenize(tag.tag);
    var desktopTag;
    var desktopStyleName;
    // replace "m" with "h"
    if (tag.isTag) {
      if (styleName.charAt(2).toLowerCase() == "p") {
        styleName = styleName.slice(0,1) + styleName.slice(2)
      } else {
        styleName = styleName.slice(0,1) + "H" + styleName.slice(2)
      }
    }
    output += "// " + styleName + "\n";
    // find a counterpart desktop style
    var found = false;
    var thisDesktopStyle
    _.forEach(desktopTypeRamp.styles, function(desktopStyle) {
      desktopStyleName = String(desktopStyle.name);
      desktopTag = getTag(desktopStyleName);
      if (desktopTag.isTag && desktopStyleName.slice(desktopTag.tag.length + 1, desktopTag.tag.length + 2).toLowerCase() == "l") {
        desktopStyleName = desktopStyleName.slice(0,desktopTag.tag.length + 1) + desktopStyleName.slice(desktopTag.tag.length + 2);
      }
      desktopTag.tag = hyphenize(desktopTag.tag);
      if (desktopTag.isTag && tag.isTag && tag.tag.slice(1) == desktopTag.tag.slice(1) && !found) {
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
    if (fonts.displayFont.font == thisStyle.font) {
      fontType = "display-font"
    } else if (fonts.auxiliaryFont.font == thisStyle.font) {
      fontType = "auxiliary-font"
    }
    output += "$" + tag.tag + "-font-family: $" + fontType + ";\n";
    var fontSize = thisStyle.size + "px";
    if (useRem) {
      fontSize = Math.round((thisStyle.size / mobileBaseFontSize) * 1000) / 1000 + "rem"
    }
    output += "$" + tag.tag + "-font-size: " + fontSize + ";\n";
    output += "$" + tag.tag + "-letter-spacing: " + thisStyle.spacing + "px;\n";
    output += "$" + tag.tag + "-line-height: " + Math.round(thisStyle.lineHeight / thisStyle.size * 100) / 100 + ";\n"
    var underline = "none"
    if (thisStyle.underline) {
      underline = "underline"
    }
    output += "$" + tag.tag + "-text-decoration: " + underline + ";\n"
    var marginValue = "0";
    if (thisStyle.paragraphSpacing > 0) {
      marginValue = "0 0 " + thisStyle.paragraphSpacing + "px 0";
    }
    output += "$" + tag.tag + "-margin: " + marginValue + ";\n"


    // if desktop, set desktop vars
    if (thisDesktopStyle) {
      var fontType = "text-font"
      if (fonts.displayFont.font == thisStyle.font) {
        fontType = "display-font"
      } else if (fonts.auxiliaryFont.font == thisStyle.font) {
        fontType = "auxiliary-font"
      }
      output += "$" + desktopTag.tag + "-font-family: $" + fontType + ";\n"
      if (useRem) {
        fontSize = Math.round((thisDesktopStyle.size / desktopBaseFontSize) * 1000) / 1000 + "rem"
      }
      output += "$" + desktopTag.tag + "-font-size: " + fontSize + ";\n";
      output += "$" + desktopTag.tag + "-letter-spacing: " + thisDesktopStyle.spacing + "px;\n";
      output += "$" + desktopTag.tag + "-line-height: " + Math.round(thisDesktopStyle.lineHeight / thisDesktopStyle.size * 100) / 100 + ";\n"
      var underline = "none"
      if (thisDesktopStyle.underline) {
        underline = "underline"
      }
      output += "$" + desktopTag.tag + "-text-decoration: " + underline + ";\n"
      var marginValue = "0";
      if (thisDesktopStyle.paragraphSpacing > 0) {
        marginValue = "0 0 " + thisDesktopStyle.paragraphSpacing + "px 0";
      }
      output += "$" + desktopTag.tag + "-margin: " + marginValue + ";\n"
    }
    // use vars
    var labelTextStyle = "-text-style"
    if (tag.tag.slice(-5).toLowerCase() == "style") {
      labelTextStyle = ""
    }
    output += "@mixin " + tag.tag + labelTextStyle + " {\n";
    output += "  font-family: $" + tag.tag + "-font-family;\n"
    output += "  font-size: $" + tag.tag + "-font-size;\n"
    output += "  letter-spacing: $" + tag.tag + "-letter-spacing;\n"
    output += "  line-height: $" + tag.tag + "-line-height;\n"
    output += "  text-decoration: $" + tag.tag + "-text-decoration;\n"
    output += "  margin: $" + tag.tag + "-margin;\n"

    // if desktop, use media query and desktop vars

    if (thisDesktopStyle) {
      output += "  @media screen and (min-width: " + breakpointVariable + ") {\n"
      output += "    font-family: $" + desktopTag.tag + "-font-family;\n"
      output += "    font-size: $" + desktopTag.tag + "-font-size;\n"
      output += "    letter-spacing: $" + desktopTag.tag + "-letter-spacing;\n"
      output += "    line-height: $" + desktopTag.tag + "-line-height;\n"
      output += "    text-decoration: $" + desktopTag.tag + "-text-decoration;\n"
      output += "    margin: $" + desktopTag.tag + "-margin;\n"
      output += "  }\n"
    }

    // end mixin
    output += "}\n"




  })
  // write exception desktop styles 
  if (exceptionDesktopStyles.length > 0) {
    output += "// ORPHANED DESKTOP STYLES"
  }
  exceptionDesktopStyles = {"styles": exceptionDesktopStyles};

  output += writeOneTypeStyle(exceptionDesktopStyles, fonts)

  return output
}