const sketch = context.api();
const document = sketch.selectedDocument;
var sharedStyles = document.sketchObject.documentData().layerTextStyles()
var typeStyles = sharedStyles.objects();
var doc = document.sketchObject;
var pages = doc.pages()
var symbolsPage;
pages.forEach(function(page){
  if (page.name() === "Symbols") {
    symbolsPage = page;
  }
})
function findSymbolById (theid) {
  theid = String(theid)
  var result;
  symbolsPage.layers().forEach(function(layer){
    if (layer.symbolID && String(layer.symbolID()) === theid) {
      result = layer
    }
  })
  return result;
}




function getShapeOverrides (shapeSymbol) {
  // establish overrides
  var overrides = []
  if (shapeSymbol.overrideValues && shapeSymbol.overrideValues().length > 0) {
    shapeSymbol.overrideValues().forEach(function(override){
      var overrideName = override.overrideName()
      var overrideObjectID;
      if (override.objectID) {
        overrideObjectID = override.objectID();
        overrideObjectID = String(overrideObjectID)
      }
      overrideName = String(overrideName).replace("_symbolID", "").split("/")
      overrides.push({"overrideName": overrideName, "value": String(override.value()), "do_objectID": overrideObjectID})
    })
  }
  var overrideResults = {
    "background": "do nothing",
    "borderThickness": "do nothing",
    "borderColor": "do nothing"
  }
  var symbolMaster = findSymbolById(shapeSymbol.symbolID());
  overrides.forEach(function(override){

    var firstSymbolName = ""
    var secondSymbolName = ""
    var value = "--nothing--";
    var valueSymbol;
    symbolMaster.layers().forEach(function(newLayer){
      if (override.overrideName[0] === String(newLayer.objectID())) {
        // we have a match
        firstSymbolName = String(newLayer.name())
        valueSymbol = findSymbolById(override.value)
        if (valueSymbol) {
          value = String(valueSymbol.name())
        }
        if (override.overrideName.length === 2) {
          var firstSymbol = findSymbolById(String(newLayer.symbolID()));
          firstSymbol.layers().forEach(function(eachLayer){
            if(override.overrideName[1] === String(eachLayer.objectID())) {
              secondSymbolName === String(eachLayer.name())
            }
          })
        }
      }
    })
    if (firstSymbolName.toLowerCase() === "fill") {
      // is it empty?
      if (value === "--nothing--") {
        overrideResults.background = "transparent"
      } else if (value.toLowerCase().startsWith('color')) {
        overrideResults.background = "#" + valueSymbol.layers()[0].style().firstEnabledFill().color().immutableModelObject().hexValue();
      }
    } else if (firstSymbolName.toLowerCase().startsWith("border")) {
      if (value === "--nothing--") {
        overrideResults.borderColor = "transparent"
      } else if (value.toLowerCase().startsWith('color')) {
        overrideResults.borderColor = "#" + valueSymbol.layers()[0].style().firstEnabledFill().color().immutableModelObject().hexValue();
      }
      if (value.toLowerCase().startsWith("border thickness")) {
        getBorderThickness(valueSymbol)
      }
    }
  })
  return overrideResults
}






function getBorderThickness (border) {
  borderThickness = {"top": 0,"bottom":0,"left":0,"right":0}
  // here is the border
  border.layers().forEach(function(borderEl){
    if (borderEl.hasClippingMask()) {
      var shapeGroup = borderEl;
      var outer = {"top": 0,"bottom":0,"left":0,"right":0};
      var inner = {"top": 0,"bottom":0,"left":0,"right":0};
      shapeGroup.layers().forEach(function(shape, index){
        if (index === 0) {
          outer.top = parseFloat(shape.frame().y())
          outer.left = parseFloat(shape.frame().x())
          outer.bottom = parseFloat(shape.frame().height()) + outer.top
          outer.right = parseFloat(shape.frame().width()) + outer.left
        } else {
          inner.top = parseFloat(shape.frame().y())
          inner.left = parseFloat(shape.frame().x())
          inner.bottom = parseFloat(shape.frame().height()) + inner.top
          inner.right = parseFloat(shape.frame().width()) + inner.left
        }
      })
      borderThickness.top = Math.abs(outer.top - inner.top)
      borderThickness.bottom = Math.abs(outer.bottom - inner.bottom)
      borderThickness.left = Math.abs(outer.left - inner.left)
      borderThickness.right = Math.abs(outer.right - inner.right)
    }
  })
  return borderThickness
}




function checkForButtonSymbol (symbol) {
  var result = false
  var symbolName = String(symbol.name());
  if (symbolName.startsWith("Button")) {
    result = true;
  }
  return result
}
function parseShape (layer) {
  var radius,
      background,
      borderThickness,
      borderColor = "transparent";
  // we now have the shape symbol
  var symbolID = layer.symbolID();
  var radiusSymbol = findSymbolById(symbolID);
  radiusSymbol.layers().forEach(function(fillOrBorder){
    var fillOrBorderName = String(fillOrBorder.name()).toLowerCase();
    if (fillOrBorderName.indexOf(" ") >= 0) {
      fillOrBorderName = fillOrBorderName.slice(0, fillOrBorderName.indexOf(" "))
    }
    if (fillOrBorderName === "fill") {
      // we now have fill symbol, let's look it up
      var fill = findSymbolById(fillOrBorder.symbolID());

      // let's get border radius
      fill.layers().forEach(function(fillLayer){
        if (fillLayer.hasClippingMask()) {
          var borderRadiusShape = fillLayer;
          borderRadius = parseFloat(borderRadiusShape.layers()[0].fixedRadius());
        } else {
          // this sucker is our fill symbol...

          var fillColor = findSymbolById(fillLayer.symbolID());
          var fillColorName = String(fillColor.name());
          fillColorName = fillColorName.slice(fillColorName.lastIndexOf("/") + 1).trim();

          // TODO what if the fill is a gradient?

          background = "#" + fillColor.layers()[0].style().firstEnabledFill().color().immutableModelObject().hexValue();

          // TODO check against colors array for true variable later
          
        }
      })
    } else if (fillOrBorderName === "border") {
      var border = findSymbolById(fillOrBorder.symbolID());
      borderThickness = getBorderThickness(border)
    }
  })
  var overrideValues = getShapeOverrides(layer)
  if (overrideValues.background != "do nothing") {
    background = overrideValues.background
  }
  if (overrideValues.borderColor != "do nothing") {
    borderColor = overrideValues.borderColor
  }
  if (overrideValues.borderThickness != "do nothing") {
    borderThickness = overrideValues.borderThickness
  }
  return {"borderRadius": borderRadius, "background": background, "borderThickness": borderThickness, "borderColor": borderColor}
}
if (symbolsPage) {
  symbolsPage.layers().forEach(function(symbol) {
    if (checkForButtonSymbol(symbol)) {
      // we now have a button.
      var buttonAttributes = {
        "height": parseInt(symbol.frame().height()),
        "padding": {"top":0,"bottom":0,"left":0,"right":0},
        "borderRadius": null,
        "borderThickness": null,
        "borderColor": "transparent",
        "background": null,
        "textStyle": null,
        "textColor": null,
        "textAlignment": null
      }
      symbol.layers().forEach(function(layer){
        if (String(layer.name()).toLowerCase() === "shape") {
          var shapeAttributes = parseShape(layer)
          //log(shapeAttributes)

          if (shapeAttributes.background) {
            buttonAttributes.background = shapeAttributes.background
          }
          if (shapeAttributes.borderColor) {
            buttonAttributes.borderColor = shapeAttributes.borderColor
          }
          if (shapeAttributes.borderRadius) {
            buttonAttributes.borderRadius = shapeAttributes.borderRadius
          }
          if (shapeAttributes.borderThickness) {
            buttonAttributes.borderThickness = shapeAttributes.borderThickness
          }
        }
      })
      log(String(symbol.name()))
      log(buttonAttributes)
    }
  })
}