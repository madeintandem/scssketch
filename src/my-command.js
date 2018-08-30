export default function(context) {
  var sketch = require('sketch')
  var document = sketch.getSelectedDocument()

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
    let hex = "#" + layerStyle.value().firstEnabledFill().color().immutableModelObject().hexValue()
    var tmp = {}
    tmp[name] = hex
    scss.shadows.push(tmp)
  }

  for (var i = 0; i < sharedStyles.numberOfSharedStyles(); i++) {

    layerStyle = sharedStyles.objects().objectAtIndex(i);
    separateColorAndShadow(layerStyle)
  }

  console.log(scss)
  }
}
