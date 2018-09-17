var _ = require("lodash")

module.exports = {
  parse: (sharedStyles) => {    
    var sortedStyles = _.sortBy(sharedStyles.objects(), [style => style.name()], ["desc"])
    var colors = []
    var shadows = []
    _.forEach(sortedStyles, function(style) {
      var tag = getTag(String(style.name()));
      if (style.value().shadows().length || style.value().innerShadows().length) {
        addShadow(shadows, style)
      }
      else if((tag.isTag && tag.ramp != "x") || !tag.isTag) {
        addColor(colors, style)
      }
    })
    
    return {colors: colors, shadows: shadows}
  },
  
  writeSass: (layerStyleMap) => {
    return `${writeColors(layerStyleMap.colors)}${writeShadows(layerStyleMap.shadows)}`
  }
}

function addColor(colorsArray, style) {
  var thisName = String(style.name())
  if (getTag(thisName).isTag) {
    thisName = thisName.slice(thisName.indexOf("]")+ 1).trim()
  }
  var tmp = {
    name: hyphenize(thisName) + "-color",
    value: "#" + style.value().firstEnabledFill().color().immutableModelObject().hexValue()
  }
  colorsArray.push(tmp)
}
function addShadow(shadowsArray, style) {
  var thisName = String(style.name())
  if (getTag(thisName).isTag) {
    thisName = thisName.slice(thisName.indexOf("]")+ 1).trim()
  }
  tmp = {
    name: hyphenize(thisName),
    value: getShadows(style.value())
  }
  shadowsArray.push(tmp)
}
function getShadows(styles) {
  var result = ""
  _.forEach(styles.shadows(), function(style){
    if (style.isEnabled()) {
      result += constructShadowValue(style)
    }
  })
  _.forEach(styles.innerShadows(), function(style){
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
  var rgba = style.color().toString().replace(/[a-z]|:/g, "")
  var temprgba = rgba.slice(rgba.indexOf("(") + 1, rgba.indexOf(")") - 1).split(" ");
  rgba = "("
  temprgba.forEach(function(value){
    rgba = rgba + removeZeros(value) + ", "
  })
  rgba = rgba.slice(0, -2) + ")"
  result += `${offsetX}px ${offsetY}px ${blurRadius}px rgba${rgba}, `;
  if (inset == "inset") {
    result = inset + " " + result
  }
  return result
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
    _.forEach(colors, (color) => {
      styles += `$${color.name}: ${color.value};\n`
    })
    styles += "\n"
  }
  return styles
}

function writeShadows(shadows) {
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
function getTag (name) {
  var regex = /^\[(([A-Za-z])(\d\.*[0-9]*|\p+))(.*)\].*/g,
      tag = name,
      isTag = false,
      match = regex.exec(name.toLowerCase()),
      ramp,
      selector,
      variant,
      cssSelector
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
  }
  return {"isTag": isTag, "tag": tag, "ramp": ramp, "selector": selector, "cssSelector": cssSelector, "variant": variant}
}
