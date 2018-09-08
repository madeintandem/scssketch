var _ = require("lodash")

var useRem = true;

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
    return {"desktop": popPToTop(desktop), "mobile": popPToTop(mobile), "assorted": assorted};
  },
  
  writeSass: function (layerTextStyleMap, fonts) {
    var textStyleSheet = "\n// FONT FAMILIES\n"
    textStyleSheet += "$text-font: " + fonts.textFont.font + ";\n"
    if (fonts.displayFont) {
      textStyleSheet += "$display-font: " + fonts.displayFont.font + ";\n"
    }
    if (fonts.auxiliaryFont) {
      textStyleSheet += "$auxiliary-font: " + fonts.auxiliaryFont.font + ";\n"
    }

    if (layerTextStyleMap.mobile.styles && layerTextStyleMap.mobile.styles.length > 0) {
      textStyleSheet += "\n// MOBILE TYPE STYLES\n" + writeTypeStyles(layerTextStyleMap.mobile, fonts)
    }
    if (layerTextStyleMap.desktop.styles && layerTextStyleMap.desktop.styles.length > 0) {
      textStyleSheet += "\n// DESKTOP TYPE STYLES\n" + writeTypeStyles(layerTextStyleMap.desktop, fonts)
    }
    if (layerTextStyleMap.assorted.styles && layerTextStyleMap.assorted.styles.length > 0) {
      textStyleSheet += "\n// ASSORTED TYPE STYLES\n" + writeTypeStyles(layerTextStyleMap.assorted, fonts)
    }

    if ((layerTextStyleMap.desktop.styles && layerTextStyleMap.desktop.styles.length) || (layerTextStyleMap.mobile.styles && layerTextStyleMap.mobile.styles.length) || (layerTextStyleMap.assorted.styles && layerTextStyleMap.assorted.styles.length)) {
      textStyleSheet = "\n// TYPE STYLES\n" + textStyleSheet
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
function writeTypeStyles(typeRamp, fonts) {
  var output = String(""),
      styles = typeRamp.styles,
      baseFontSize = 16;
  if (useRem && typeRamp.hasParagraph) {
    baseFontSize = typeRamp[0].styles.size
  }
  styles.forEach(function(thisStyle) {
    var styleName = String(thisStyle.name);
    var tag = getTag(styleName).tag
    if (styleName.slice(3,4) == "L") {
      styleName = styleName.slice(0,3) + styleName.slice(4);
    }
    tag = hyphenize(tag);
    output += "// " + styleName + "\n";

    // set vars
    var fontType = "text-font"
    if (fonts.displayFont.font == thisStyle.font) {
      fontType = "display-font"
    } else if (fonts.auxiliaryFont.font == thisStyle.font) {
      fontType = "auxiliary-font"
    }
    output += "$" + tag + "-font-family: $" + fontType + ";\n";
    var fontSize = thisStyle.size + "px";
    log ("use rem: " + useRem)
    if (useRem) {
      fontSize = Math.round((thisStyle.size / baseFontSize) * 1000) / 1000 + "rem"
    }
    output += "$" + tag + "-font-size: " + fontSize + ";\n";
    output += "$" + tag + "-letter-spacing: " + thisStyle.spacing + "px;\n";
    output += "$" + tag + "-line-height: " + Math.round(thisStyle.lineHeight / thisStyle.size * 100) / 100 + ";\n"
    var underline = "none"
    if (thisStyle.underline) {
      underline = "underline"
    }
    output += "$" + tag + "-text-decoration: " + underline + ";\n"
    var marginValue = "0";
    if (thisStyle.paragraphSpacing > 0) {
      marginValue = "0 0 " + thisStyle.paragraphSpacing + "px 0";
    }
    output += "$" + tag + "-margin: " + marginValue + ";\n"

    // use vars
    output += "@mixin " + tag + "-text-style {\n";
    output += "  font-family: $" + tag + "-font-family;\n"
    output += "  font-size: $" + tag + "-font-size;\n"
    output += "  letter-spacing: $" + tag + "-letter-spacing;\n"
    output += "  line-height: $" + tag + "-line-height;\n"
    output += "  text-decoration: $" + tag + "-text-decoration;\n"
    output += "  margin: $" + tag + "-margin;\n"
    output += "}\n"
  })
  return output
}