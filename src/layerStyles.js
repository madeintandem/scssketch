var layerStyleMap = {
  colors: [],
  shadows: []
}

module.exports = {
  parse: function (sharedStyles) {
    for (var i = 0; i < sharedStyles.numberOfSharedStyles(); i++) {
      var style = sharedStyles.objects().objectAtIndex(i);
      if (String(style.name()).charAt(0) == '[') {
        addColor(style)
      } else {
        addShadow(style)
      }
    }    
    return layerStyleMap
  }
}

function addColor(style) {
  let name = String(style.name()).split(' ').pop().concat('_color')
  let hex = "#" + style.value().firstEnabledFill().color().immutableModelObject().hexValue()
  var tmp = {}
  tmp[name] = hex
  layerStyleMap.colors.push(tmp)
}

function addShadow(style) {
  let name = String(style.name()).replace(' ', '_')
  var tmp = {}
  var color = style.value().firstEnabledShadow().color().toString().replace(/[a-z]|:/g, "")
  tmp[name] = {
    offsetX: style.value().firstEnabledShadow().offsetX(),
    offsetY: style.value().firstEnabledShadow().offsetY(),
    blurRadius: style.value().firstEnabledShadow().blurRadius(),
    rgba: "rbga".concat(color)
  }
  layerStyleMap.shadows.push(tmp)
}
