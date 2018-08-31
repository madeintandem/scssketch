export default function(context) {
  const layerStyles = require("./layerStyles");
  const sketch = context.api()
  const document = sketch.selectedDocument
  const sharedStyles = document.sketchObject.documentData().layerStyles()
  

  const layerStyleJson = layerStyles.parse(sharedStyles)

  // console.log(layerStyleJson)
}
