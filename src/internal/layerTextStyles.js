var _ = require("lodash")

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
      } else {
        assorted.push(style)
      }

    })
    return {"desktop": popPToTop(desktop), "mobile": popPToTop(mobile), "assorted": assorted};
  },
  
  writeSass: function (layerTextStyleMap) {
    var textStyleSheet = ""
    if (layerTextStyleMap.mobile.length > 0) {
      textStyleSheet = textStyleSheet + "\n// MOBILE TYPE STYLES\n" + writeTypeStyles(layerTextStyleMap.mobile)
    }
    if (layerTextStyleMap.desktop.length > 0) {
      textStyleSheet = textStyleSheet + "\n// DESKTOP TYPE STYLES\n" + writeTypeStyles(layerTextStyleMap.desktop)
    }
    if (layerTextStyleMap.assorted.length > 0) {
      textStyleSheet = textStyleSheet + "\n// ASSORTED TYPE STYLES\n" + writeTypeStyles(layerTextStyleMap.assorted)
    }

    if (layerTextStyleMap.desktop.length || layerTextStyleMap.mobile.length || layerTextStyleMap.assorted.length) {
      textStyleSheet = "\n// TYPE STYLES\n" + textStyleSheet
    }
    return textStyleSheet
  }
}
function getUniqueStyles(styles) {
  var uniqueStyles = [];
  styles.forEach(function(style){
    if (uniqueStyles.length === 0) {
      uniqueStyles.push(style)
    } else {
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
  styles.forEach(function(style, indx){
    var tag = getTag(style.name);
    if (tag.isTag && tag.tag.slice(-1).toLowerCase() == "p") {
      array_move(styles, indx, 0);
    }
  });
  return styles
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
function writeTypeStyles(styles) {
  var output = String("");
  styles.forEach(function(thisStyle) {
    var styleName = String(thisStyle.name);
    var tag = getTag(styleName).tag
    if (styleName.slice(3,4) == "L") {
      styleName = styleName.slice(0,3) + styleName.slice(4);
    }
    output += "// " + styleName + "\n";
    output += "@mixin " + hyphenize(tag) + "-text-style {\n";
    output += "  font-family: " + thisStyle.font + ";\n";
    output += "  font-size: " + thisStyle.size + "px;\n";
    if (thisStyle.spacing) {
      output +="  letter-spacing: " + thisStyle.spacing + "px;\n";
    }
    output += "  line-height: " + thisStyle.lineHeight + "px;\n"
    var marginValue = "0";
    if (thisStyle.underline) {
      output += "  text-decoration: underline"
    }
    if (thisStyle.paragraphSpacing > 0) {
      marginValue = "0 0 " + thisStyle.paragraphSpacing + "px 0";
    }
    output += "  margin: " + marginValue + ";\n"
    output += "}\n"
  })
  return output
}