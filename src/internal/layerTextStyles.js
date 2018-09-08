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
    log("fonts == " + fonts.textFont)
    textStyleSheet += "$text-style: " + fonts.textFont.font + ";\n"
    if (fonts.displayFont) {
      textStyleSheet += "$text-style: " + fonts.displayFont.font + ";\n"
    }
    if (fonts.auxiliaryFont) {
      textStyleSheet += "$text-style: " + fonts.auxiliaryFont.font + ";\n"
    }
    textStyleSheet += "$text-style: " + fonts.textFont.font

    if (layerTextStyleMap.mobile.length > 0) {
      textStyleSheet += "\n// MOBILE TYPE STYLES\n" + writeTypeStyles(layerTextStyleMap.mobile, fonts)
    }
    if (layerTextStyleMap.desktop.length > 0) {
      textStyleSheet += "\n// DESKTOP TYPE STYLES\n" + writeTypeStyles(layerTextStyleMap.desktop, fonts)
    }
    if (layerTextStyleMap.assorted.length > 0) {
      textStyleSheet += "\n// ASSORTED TYPE STYLES\n" + writeTypeStyles(layerTextStyleMap.assorted, fonts)
    }

    if (layerTextStyleMap.desktop.length || layerTextStyleMap.mobile.length || layerTextStyleMap.assorted.length) {
      textStyleSheet = "\n// TYPE STYLES\n" + textStyleSheet
    }
    return textStyleSheet
  },
  fontSurvey: function (styles) {
    var fonts = []
    _.forEach(styles.objects(), function(style) {
      var found = false;
      var isParagraph = false;
      var tag = getTag(String(style.name())).tag
      if (tag.slice(0, -1).toLowerCase() == "p") {
        isParagraph = true
      }
      var attributes = style.style().textStyle().attributes();
      var fontName = String(attributes.NSFont.fontDescriptor().objectForKey(NSFontNameAttribute))
      _.forEach(fonts, function(foundFont){
        if (foundFont.font == fontName) {
          foundFont.count += 1;
          found = true;
        }
      })
      if (!found) {
        fonts.push({"font": fontName, "count": 1, "isParagraph": isParagraph})
      }
    })
    return fonts
  },
  determineFontType: function (foundFonts) {
    var displayFont;
    var textFont;
    var auxiliaryFont;
    var mostUsed;
    _.forEach(foundFonts, function(font){
      if (!font.isParagraph) {
        if (!mostUsed) {
          mostUsed = font
        } else if (font.count > mostUsed.count) {
          mostUsed = font
        }
      }
    })
    _.forEach(foundFonts, function(font){
      if ((!textFont && font.isParagraph) || font.font == textFont) {
        textFont = font.font
      } else if ((!displayFont && font == mostUsed) || font.font == displayFont) {
        displayFont = font.font
      } else {
        auxiliaryFont = font.font
      }
    })
    return {"textFont": textFont, "displayFont": displayFont, "auxiliaryFont": auxiliaryFont}
  }
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
  t.styles.forEach(function(thisStyle) {
    var styleName = String(thisStyle.name);
    var tag = getTag(styleName).tag
    if (styleName.slice(3,4) == "L") {
      styleName = styleName.slice(0,3) + styleName.slice(4);
    }
    output += "// " + styleName + "\n";
    output += "@mixin " + hyphenize(tag) + "-text-style {\n";
    var fontType = "text-font"
    if (fonts.displayFont.font == thisStyle.font) {
      fontType = "display-font"
    } else if (fonts.auxiliaryFont.font == thisStyle.font) {
      fontType = "auxiliary-font"
    }
    output += "  font-family: $" + fontType + ";\n";
    var fontSize = thisStyle.size + "px";
    if (useRem) {
      fontSize = Math.round(thisStyle.size * 1000) / 1000 + "rem"
    }
    output += "  font-size: " + fontSize + ";\n";
    output += "  letter-spacing: " + thisStyle.spacing + "px;\n";
    output += "  line-height: " + Math.round(thisStyle.lineHeight / thisStyle.size * 100) / 100 + ";\n"
    var underline = "none"
    if (thisStyle.underline) {
      underline = "underline"
    }
    output += "  text-decoration: " + underline
    var marginValue = "0";
    if (thisStyle.paragraphSpacing > 0) {
      marginValue = "0 0 " + thisStyle.paragraphSpacing + "px 0";
    }
    output += "  margin: " + marginValue + ";\n"
    output += "}\n"
  })
  return output
}