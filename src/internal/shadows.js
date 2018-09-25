var _ = require("lodash")
const common = require("./common");

module.exports = {
  isShadow: (style) => {
    return style.value().shadows().length || style.value().innerShadows().length  
  },
  
  addShadows: (shadowStyles) => {
    return _.reduce(shadowStyles, (shaddows, style) => {
              var thisName = String(style.name())
              var tag = common.getTag(thisName)
              if (tag.isTag) {
                thisName = tag.name.trim()
              }
              tmp = {
                name: common.hyphenize(thisName),
                value: getShadows(style.value())
              }
              shaddows.push(tmp)      
              return shaddows
            }, [])
  },
  
  writeShadows: (shadows) => {
    var styles = ""
    if (shadows.length) {
      styles = styles + "// SHADOWS\n"
      _.forEach(shadows, (shadow) => {
        styles += `$${shadow.name}: ${shadow.value};\n`
      })
      styles += "\n"
    }
    return styles
  }
}

function getShadows(styles) {
  var result = ""
  var theShadows = styles.shadows();
  var theShadows = theShadows.reverse();
  _.forEach(theShadows, (style) => {
    if (style.isEnabled()) {
      result += constructShadowValue(style)
    }
  })
  var theInnerShadows = styles.innerShadows();
  theInnerShadows = theInnerShadows.reverse();
  _.forEach(theInnerShadows, (style) => {
    if (style.isEnabled()) {
      result += constructShadowValue(style, "inset")
    }
  })
  return result.slice(0,-2)
}

function constructShadowValue(style, inset) {
  result = ""
  var offsetX = style.offsetX();
  var offsetY = style.offsetY();
  var blurRadius = style.blurRadius();
  var rgba = rgbaToCSS(style.color())
  result += `${offsetX}px ${offsetY}px ${blurRadius}px rgba${rgba}, `;
  if (inset == "inset") {
    result = inset + " " + result
  }
  return result
}

function rgbaToCSS(color, opacityMultiplier) {
  if (!opacityMultiplier) {
    opacityMultiplier = 1;
  }
  var rgba = color.toString().replace(/[a-z]|:/g, "")
  var temprgba = rgba.slice(rgba.indexOf("(") + 1, rgba.indexOf(")") - 1).split(" ");
  rgba = "rgba("
  temprgba.forEach(function(value, index){
    if (index < 3) {
      rgba = rgba + Math.round(255 * value) + ", "
    } else {
      rgba = rgba + removeZeros(value * opacityMultiplier) + ", "
    }
  })
  rgba = rgba.slice(0, -2) + ")"
  return rgba
}

function removeZeros(str){
  str = String(str)
  var regEx1 = /[0]+$/;
  var regEx2 = /[.]$/;
  if (str.indexOf('.')>-1){
      str = str.replace(regEx1,'');  // Remove trailing 0's
  }
  str = str.replace(regEx2,'');  // Remove trailing decimal
  return str;
}
