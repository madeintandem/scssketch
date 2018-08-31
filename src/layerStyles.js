var layerStyleMap = {
  colors: [],
  shadows: []
}

export function layerStyle(sharedStyles){
  for (var i = 0; i < sharedStyles.numberOfSharedStyles(); i++) {
  
    var style = sharedStyles.objects().objectAtIndex(i);
    readLayerStyles(style)
  }
}

function readLayerStyles(style) {
  if (String(style.name()).charAt(0) == '[') {
    addColor(style)
  } else {
    addShadow(style)
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
  tmp[name] = {
    offsetX: style.value().firstEnabledShadow().offsetX(),
    offsetY: style.value().firstEnabledShadow().offsetY(),
    blurRadius: style.value().firstEnabledShadow().blurRadius(),
    color: style.value().firstEnabledShadow().color(),
  }
  layerStyleMap.shadows.push(tmp)
}
