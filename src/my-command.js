export default function(context) {
  // const sketch = require('sketch')
  const sketch = context.api()
  var document = sketch.selectedDocument

  var sharedStyles = document.sketchObject.documentData().layerStyles()

  var scss = {
    colors: [],
    shadows: []
  }
  function separateColorAndShadow(style) {
    if (String(style.name()).charAt(0) == '[') {
      addColor(style)
    } else {
      addShadow(style)
    }
  }

  function addColor(style) {
    let name = String(style.name()).split(' ').pop().concat('_color')
    let hex = "#" + layerStyle.value().firstEnabledFill().color().immutableModelObject().hexValue()
    var tmp = {}
    tmp[name] = hex
    scss.colors.push(tmp)
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
    scss.shadows.push(tmp)
  }

  for (var i = 0; i < sharedStyles.numberOfSharedStyles(); i++) {

    var layerStyle = sharedStyles.objects().objectAtIndex(i);
    separateColorAndShadow(layerStyle)
  }

  function writeToFile() {
    var scssFile = ''

  }

  function writeColors(scss) {
    return scss.colors
  }

  function writeShadows(scss) {
    scss.shadows
  }
  console.log(writeColors(scss) + "/n")
}
