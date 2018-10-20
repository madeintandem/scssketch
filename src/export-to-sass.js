export default function(context) {
  const layerStyles = require("./internal/layerStyles");
  const layerTextStyles = require("./internal/layerTextStyles");
  const formElements = require("./internal/formElements")

  const sketch = context.api()
  const document = sketch.selectedDocument

  const sharedStyles = document.sketchObject.documentData().layerStyles()
  const sharedTextStyles = document.sketchObject.documentData().layerTextStyles()
  const layerStyleMap = layerStyles.parse(sharedStyles)
  const layerStyleSheet = layerStyles.writeSass(layerStyleMap)
  
  const fontsUsed = layerTextStyles.fontSurvey(sharedTextStyles)
  const fonts = layerTextStyles.determineFontType(fontsUsed)
  const layerTextStyleMap = layerTextStyles.parse(sharedTextStyles)
  const layerTextStyleSheet = layerTextStyles.writeSass(layerTextStyleMap, fonts)

  const formElementMap = formElements.parse(sharedStyles, sharedTextStyles, layerStyleMap)
  const formElementStyleSheet = formElements.writeSass(formElementMap)

  var scss = "" + layerStyleSheet + layerTextStyleSheet + formElementStyleSheet
  saveScssToFile(scss)
}

function saveScssToFile(fileData) {
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
