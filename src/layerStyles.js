var _ = require("lodash")

module.exports = {
  parse: function (sharedStyles) {    
    var colors = []
    var shadows = []
    var styles = _.sortBy(sharedStyles.objects(), [style => style.name()], ["desc"])
    _.forEach(styles, function(style){
        if(String(style.name()).charAt(0) == "[") {
          addColor(colors, style)
        } else {
          addShadow(shadows, style)
        }
    })
    
    return {colors: colors, shadows: shadows}
  },
  
  writeSass: function (layerStyleMap) {
    return writeColors(layerStyleMap.colors).concat(writeShadows(layerStyleMap.shadows))
  }
}

function addColor(colorsArray, style) {
  var tmp = {
    name: String(style.name()).split(" ").pop().concat("_color"),
    value: "#" + style.value().firstEnabledFill().color().immutableModelObject().hexValue()
  }
  colorsArray.push(tmp)
}

function addShadow(shadowsArray, style) {
  tmp = {
    name: String(style.name()).replace(" ", "_"),
    value: constructShadowValue(style.value())
  }
  shadowsArray.push(tmp)
}

function constructShadowValue(style) {
  var offsetX = style.firstEnabledShadow().offsetX()
  var offsetY = style.firstEnabledShadow().offsetY()
  var blurRadius = style.firstEnabledShadow().blurRadius()
  var rgba = style.firstEnabledShadow().color().toString().replace(/[a-z]|:/g, "")
  
  return `${offsetX}px ${offsetY}px ${blurRadius}px rgba${rgba}`
}

function writeColors(colors) {
  var styles = ""
  _.forEach(colors, function(color) {
    styles = styles.concat(`$${color.name}: ${color.value};\n`)
  })
  return styles
}

function writeShadows(shadows) {
  var styles = ""
  _.forEach(shadows, function(shadow) {
    styles = styles.concat(`$${shadow.name}: ${shadow.value};\n`)
  })
  return styles
}
