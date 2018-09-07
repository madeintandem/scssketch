var _ = require("lodash")

module.exports = {
  parse: (sharedStyles) => {    
    var sortedStyles = _.sortBy(sharedStyles.objects(), [style => style.name()], ["desc"])
    var colors = []
    var shadows = []
    _.forEach(sortedStyles, function(style) {
      if(String(style.name()).charAt(0) == "[") {
        addColor(colors, style)
      } else {
        addShadow(shadows, style)
      }
    })
    
    return {colors: colors, shadows: shadows}
  },
  
  writeSass: (layerStyleMap) => {
    return `${writeColors(layerStyleMap.colors)}\n${writeShadows(layerStyleMap.shadows)}`
  }
}

function addColor(colorsArray, style) {
  var thisName = String(style.name())
  thisName = thisName.slice(thisName.indexOf("]")+ 1).trim()

  var tmp = {
    name: hyphenize(thisName) + "-color",
    value: "#" + style.value().firstEnabledFill().color().immutableModelObject().hexValue()
  }
  colorsArray.push(tmp)
}

function addShadow(shadowsArray, style) {
  tmp = {
    name: hyphenize(String(style.name())),
    value: constructShadowValue(style.value())
  }
  shadowsArray.push(tmp)
}

function constructShadowValue(style) {
  var offsetX = style.firstEnabledShadow().offsetX();
  var offsetY = style.firstEnabledShadow().offsetY();
  var blurRadius = style.firstEnabledShadow().blurRadius();
  var rgba = style.firstEnabledShadow().color().toString().replace(/[a-z]|:/g, "")
  var temprgba = rgba.slice(rgba.indexOf("(") + 1, rgba.indexOf(")") - 1).split(" ");
  rgba = "("
  temprgba.forEach(function(value){
    rgba = rgba + removeZeros(value) + ", "
  })
  rgba = rgba.slice(0, -2) + ")"
  
  return `${offsetX}px ${offsetY}px ${blurRadius}px rgba${rgba}`
}
function removeZeros(str){
  var regEx1 = /[0]+$/;
  var regEx2 = /[.]$/;
  if (str.indexOf('.')>-1){
      str = str.replace(regEx1,'');  // Remove trailing 0's
  }
  str = str.replace(regEx2,'');  // Remove trailing decimal
  return str;
}

function hyphenize(str) {
  return str.replace(/\s+/g, '-').replace(/\.+/g, '-').replace(/\,+/g, '-').toLowerCase();
}

function writeColors(colors) {
  var styles = ""
  if (colors.length > 0) {
    styles = styles +"// COLORS\n"
  }
  _.forEach(colors, (color) => {
    styles += `$${color.name}: ${color.value};\n`
  })
  return styles
}

function writeShadows(shadows) {
  var styles = ""
  if (shadows.length) {
    styles = styles + "// SHADOWS\n"
  }
  _.forEach(shadows, (shadow) => {
    styles += `$${shadow.name}: ${shadow.value};\n`
  })
  return styles
}
