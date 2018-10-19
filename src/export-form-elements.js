export default function(context) {
  const _ = require("lodash")
  const sketch = context.api()
  const document = sketch.selectedDocument
  const pages = document.sketchObject.pages()
  const symbolsPage = _.find(pages, (page) => {return String(page.name()) === "Symbols"});
  exportFormElements(pages)
}
function exportFormElements (pages) {
  if (!symbolsPage) {
    console.log("There is no symbols page.")
    return false;
  }

  // get button symbols
  var buttonSymbols = _.filter(symbolsPage.layers(), (layer) =>{return checkForButtonSymbol(layer)})


  _.forEach(buttonSymbols, (button) => {
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

    var shape = _.find(button.layers, (layer) => { return String(layer.name()).toLowerCase() === "shape"})
    if (shape) {
      var shapeAttributes = parseShape(layer)
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
    log(String(symbol.name()))
    log(buttonAttributes)
  })
}
function findSymbolById (theid) {
  return _.find(symbolsPage.layers(), (layer) =>{
    return (String(layer.symbolID()) === String(theid))
  })
}
function findSymbolWithinLayers (theid, symbol) {
  var result;
  symbol.layers().forEach(function(layer){
    // symbolID
    if (layer.symbolID) {
    }
    if (layer.symbolID && String(layer.symbolID()) == theid) {
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


  //log(overrides)
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
      if (override.overrideName[0] == String(newLayer.objectID())) {

        // we have a match
        firstSymbolName = String(newLayer.name())
        valueSymbol = findSymbolById(override.value)
        if (valueSymbol) {
          value = String(valueSymbol.name())
        }
        if (override.overrideName.length == 2) {
          var firstSymbol = findSymbolById(String(newLayer.symbolID()));
          firstSymbol.layers().forEach(function(eachLayer){
            if(override.overrideName[1] == String(eachLayer.objectID())) {
              secondSymbolName == String(eachLayer.name())
            }
          })
        }




      }
    })
    if (firstSymbolName.toLowerCase() == "fill") {
      // is it empty?
      if (value == "--nothing--") {
        overrideResults.background = "transparent"
      } else if (value.toLowerCase().startsWith('color')) {
        overrideResults.background = "#" + valueSymbol.layers()[0].style().firstEnabledFill().color().immutableModelObject().hexValue();
      }
    } else if (firstSymbolName.toLowerCase().startsWith("border")) {
      if (value == "--nothing--") {
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
        if (index == 0) {
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
  return (String(symbol.name()).toLowerCase().startsWith("Button"))
}
function parseShape (layer) {
  var radius,
      background,
      borderThickness,
      borderColor = "transparent";

  var symbolID = layer.symbolID();
  var shapeSymbolMaster = findSymbolById(symbolID);

  // We need to get the fill symbol
  var fillSymbol = _.find(shapeSymbolMaster.layers(), (layer) => {
    return (String(layer.name()).toLowerCase().split(" ")[0] === "fill")
  })
  if (fillSymbol) {

      // we now have fill symbol, let's look it up
    var fillSymbolMaster = findSymbolById(fillSymbol.symbolID());

    // let's get border radius
    var borderRadiusShape = _.find(fillSymbolMaster.layers(), (fillLayer) => {
      return fillLayer.hasClippingMask()
    })
    if (borderRadiusShape) {
      // TODO get border radii for each corner
      borderRadius = parseFloat(borderRadiusShape.layers()[0].fixedRadius());
    }

    // let's get fill color
    var fillColor = (fillSymbolMaster.layers(), (fillLayer) => {
      return !fillLayer.hasClippingMask()
    })
    var fillColorMaster = findSymbolById(fillSymbol.symbolID())
    var fillColorName = String(fillColorMaster.name());
    fillColorName = fillColorName.slice(fillColorName.lastIndexOf("/") + 1).trim();

    // TODO what if the fill is a gradient?
    background = "#" + fillColorMaster.layers()[0].style().firstEnabledFill().color().immutableModelObject().hexValue();
  }


    } else if (fillOrBorderName == "border") {
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

      
    }
  })
}