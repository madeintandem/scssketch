const sketch = require('sketch')

export default function(context) {
  var document = sketch.getSelectedDocument()

  var sharedStyles = document.sketchObject.documentData().layerStyles()

  function separateColorAndShadow(style) {
    if (String(style.name()).charAt(0) == '[') {
      console.log("color")
    } else {
      console.log("shadow")
    }
  }

  for (var i = 0; i < sharedStyles.numberOfSharedStyles(); i++) {

    layerStyle = sharedStyles.objects().objectAtIndex(i);
    separateColorAndShadow(layerStyle)
    //var colorName = String(layerStyle.name());
    //var colorHex = "#" + layerStyle.value().firstEnabledFill().color().immutableModelObject().hexValue();
    //console.log(colorName + " " + colorHex)
  }
}

