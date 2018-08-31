var _ = require("lodash")
var layerStyleMap = {
  colors: [],
  shadows: []
}

module.exports = {
  parse: function (sharedStyles) {    
    var styles = _.sortBy(sharedStyles.objects(), [style => style.name()], ["desc"])
    _.forEach(styles, function(style){
        String(style.name()).charAt(0) == "[" ? addColor(style) : addShadow(style)
    })
    
    return layerStyleMap
  },
  
  write: function () {
    return writeColors().concat(writeShadows())
  }
}

function addColor(style) {
  var tmp = {
    name: String(style.name()).split(" ").pop().concat("_color"),
    value: "#" + style.value().firstEnabledFill().color().immutableModelObject().hexValue()
  }
  layerStyleMap.colors.push(tmp)
}

function addShadow(style) {
  tmp = {
    name: String(style.name()).replace(" ", "_"),
    value: constructShadowValue(style.value())
  }
  layerStyleMap.shadows.push(tmp)
}

function constructShadowValue(style) {
  var offsetX = style.firstEnabledShadow().offsetX()
  var offsetY = style.firstEnabledShadow().offsetY()
  var blurRadius = style.firstEnabledShadow().blurRadius()
  var rgba = style.firstEnabledShadow().color().toString().replace(/[a-z]|:/g, "")
  
  return `${offsetX}px ${offsetY}px ${blurRadius}px rgba${rgba}`
}

function writeColors() {
  var styles = ""
  _.forEach(layerStyleMap.colors, function(color) {
    styles = styles.concat(`$${color.name}: ${color.value};\n`)
  })
  return styles
}

function writeShadows() {
  var styles = ""
  _.forEach(layerStyleMap.shadows, function(shadow) {
    styles = styles.concat(`$${shadow.name}: ${shadow.value};\n`)
  })
  return styles
}
