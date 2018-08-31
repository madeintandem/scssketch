var _ = require("lodash")
var layerStyleMap = {
  colors: [],
  shadows: []
}

module.exports = {
  parse: function (sharedStyles) {
    for (var i = 0; i < sharedStyles.numberOfSharedStyles(); i++) {
      var style = sharedStyles.objects().objectAtIndex(i);
      if (String(style.name()).charAt(0) == "[") {
        addColor(style)
      } else {
        addShadow(style)
      }
    }    
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
    offsetX: style.value().firstEnabledShadow().offsetX(),
    offsetY: style.value().firstEnabledShadow().offsetY(),
    blurRadius: style.value().firstEnabledShadow().blurRadius(),
    rgba: style.value().firstEnabledShadow().color().toString().replace(/[a-z]|:/g, "")
  }
  layerStyleMap.shadows.push(tmp)
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
    var offsetX = `${shadow.offsetX}px`
    var offsetY = `${shadow.offsetY}px`
    var blurRadius = `${shadow.blurRadius}px`
    var rgba = `rgba${shadow.rgba}`
    styles = styles.concat(`$${shadow.name}: ${offsetX} ${offsetY} ${blurRadius} ${rgba};\n`)
  })
  return styles
}
