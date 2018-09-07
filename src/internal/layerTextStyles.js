var _ = require("lodash")

module.exports = {
  parse: function (sharedTextStyles) { 

    var desktop = []
    var mobile = []
    var styles = sharedTextStyles.objects().sort(compare)
    var typeStyles = getUniqueStyles(styles)
    typeStyles.forEach(function(thisStyle){
      if(String(thisStyle.name()).slice(0,2).toLowerCase() == "[m") {
        mobile.push(getTextStyleAsJson(thisStyle))
      } else {
        desktop.push(getTextStyleAsJson(thisStyle))
      }
    })
    return {"desktop": popPToTop(desktop), "mobile": popPToTop(mobile)};
  },
  
  writeSass: function (layerTextStyleMap) {
    var textStyleSheet = ""
    if (layerTextStyleMap.mobile.length > 0) {
      textStyleSheet = textStyleSheet + "\n// MOBILE TYPE STYLES\n" + writeTypeStyles(layerTextStyleMap.mobile)
    }
    if (layerTextStyleMap.desktop.length > 0) {
      textStyleSheet = textStyleSheet + "\n// DESKTOP TYPE STYLES\n" + writeTypeStyles(layerTextStyleMap.desktop)
    }
    if (layerTextStyleMap.length > 0) {
      textStyleSheet = "\n// TYPE STYLES\n" + textStyleSheet
    }
    return textStyleSheet
  }
}

function getTextStyleAsJson (style) {
  var attributes = style.style().textStyle().attributes();
  var color = attributes.MSAttributedStringColorAttribute;
  if (color != null) {
      var red = color.red();
      var green = color.green();
      var blue = color.blue();
      var alpha = color.alpha();
  }
  var name = String(style.name());
  var family = String(attributes.NSFont.fontDescriptor().objectForKey(NSFontNameAttribute))
  var size = String(attributes.NSFont.fontDescriptor().objectForKey(NSFontSizeAttribute)) * 1
  var par = attributes.NSParagraphStyle;
  if (par != null) {
      var align = par.alignment();
      var lineHeight = par.maximumLineHeight();
      var paragraphSpacing = par.paragraphSpacing();
  }
  var spacing = String(attributes.NSKern) * 1;
  var text = attributes.MSAttributedStringTextTransformAttribute;
  if (text != null) {
      var textTransform = String(attributes.MSAttributedStringTextTransformAttribute) * 1;
  } else {
      var textTransform = 0;
  }
  var strike = String(attributes.NSStrikethrough) * 1
  var underline = String(attributes.NSUnderline) * 1
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
function popPToTop (styles) {
  styles.forEach(function(style, indx){
    if (String(style.name).charAt(2).toLowerCase() == "p") {
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
function getUniqueStyles(styles) {
  var uniqueStyles = [];
  styles.forEach(function(style){
    if (uniqueStyles.length === 0) {
      uniqueStyles.push(style)
    } else {
      var found = false;
      uniqueStyles.forEach(function(sortedStyle){

        // GET THE [TAG]
        var tag = getTag(String(sortedStyle.name()))
        log(String(style.name()).slice(1,tag.length + 1) + " == " + tag)
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

function compare(a,b) {
  if (a.name() < b.name())
    return -1;
  if (a.name() > b.name())
    return 1;
  return 0;
}
function getTag (name) {
  var tag = name.substring(0, name.indexOf("]") + 1);
  if (tag.slice(0,1) == "[" && tag.slice(tag.length -1) == "]") {
    tag = tag.substring(1, tag.length - 1)
    if (tag.slice(-1).toLowerCase() == "l") {
      tag = tag.slice(0, -1)
    }
  } else {
    tag = name
  }
  return tag
}
function stripTag (name) {
  var tag = String(name.slice(0, String(name.indexOf("]") + 1)));
  if (tag.slice(0,1) == "[" && tag.slice(tag.length -1) == "]") {
    tag = tag.slice(1, tag.length - 1)
  } else {
    tag = name
  }
  return tag
}
function hyphenize(str) {
  return str.replace(/\s+/g, '-').replace(/\.+/g, '-').replace(/\,+/g, '-').toLowerCase();
}
function writeTypeStyles(styles) {
  var output = String("");
  styles.forEach(function(thisStyle) {
    var styleName = String(thisStyle.name);
    if (styleName.slice(3,4) == "L") {
      styleName = styleName.slice(0,3) + styleName.slice(4);
    }
    var tag = stripTag(styleName)
    output = output.concat("// " + styleName + "\n");
    output = output.concat("@mixin " + hyphenize(tag) + "-text-style {\n");
    output = output.concat("  font-family: " + thisStyle.font + ";\n");
    output = output.concat("  font-size: " + thisStyle.size + "px;\n")
    output = output.concat("  line-height: " + thisStyle.lineHeight + "px;\n")
    var marginValue = "0";
    if (thisStyle.paragraphSpacing > 0) {
      marginValue = "0 0 " + thisStyle.paragraphSpacing + "px 0";
    }
    output = output.concat("  margin: " + marginValue + ";\n")
    output = output.concat("}\n")
  })
  return output
}
