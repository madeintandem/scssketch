export default function(context) {
  const layerStyles = require("./layerStyles");
  const layerTextStyles = require("./layerTextStyles");
  const sketch = context.api()
  const document = sketch.selectedDocument
  const sharedStyles = document.sketchObject.documentData().layerStyles()
  const sharedTextStyles = document.sketchObject.documentData().layerTextStyles()
  
  const layerStyleMap = layerStyles.parse(sharedStyles)
  const layerStyleSheet = layerStyles.writeSass(layerStyleMap)
  
  const layerTextStyleMap = layerTextStyles.parse(sharedTextStyles)
  const layerTextStyleSheet = layerTextStyles.writeSass(layerTextStyleMap)
  
  var scss = `${layerStyleSheet} \n ${layerTextStyleSheet}`
  
  saveScssToFile(scss, document)
}

function saveScssToFile(fileData, document) {
  var panel = NSSavePanel.savePanel()
  panel.setTitle("styles")
  panel.setAllowedFileTypes(["scss"])
  panel.setNameFieldStringValue("styles")
  panel.setAllowsOtherFileTypes(false)
  panel.setExtensionHidden(false)
  
  if (panel.runModal()) {
  	var path = panel.URL().path()
    var file = NSString.stringWithFormat("%@", fileData)
    var f = NSString.stringWithFormat("%@", path)
    file.writeToFile_atomically_encoding_error(f, true, NSUTF8StringEncoding, null)
  }
}
