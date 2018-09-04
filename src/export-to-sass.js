export default function(context) {
  const layerStyles = require("./layerStyles");
  const layerTextStyles = require("./layerTextStyles");
  const sketch = context.api()
  const document = sketch.selectedDocument
  const sharedStyles = document.sketchObject.documentData().layerStyles()
  const sharedTextStyles = document.sketchObject.documentData().layerTextStyles()
  
  const layerStyleMap = layerStyles.parse(sharedStyles)
  const layerStyleSheet = layerStyles.writeSass(layerStyleMap)
  // console.log(layerStyleSheet)
  
  const layerTextStyleMap = layerTextStyles.parse(sharedTextStyles)
  const layerTextStyleSheet = layerTextStyles.writeSass(layerTextStyleMap)
  // console.log(layerTextStyleSheet)  
}
