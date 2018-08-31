import {layerStyle} from "./layerStyles.js";

export default function(context) {
  // const sketch = require('sketch')
  const sketch = context.api()
  const document = sketch.selectedDocument
  const sharedStyles = document.sketchObject.documentData().layerStyles()

  const layerStyleJson = layerStyle(sharedStyles)

  // 
  // function writeToFile() {
  //   var scssFile = ''
  // 
  // }
  // 
  // function writeColors(scss) {
  //   return scss.colors
  // }
  // 
  // function writeShadows(scss) {
  //   scss.shadows
  // }
  console.log("all done!")
}
