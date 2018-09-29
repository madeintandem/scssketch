export default function(context) {
  const layerStyles = require("./internal/layerStyles");
  const layerTextStyles = require("./internal/layerTextStyles");
  const sketch = context.api()
  const document = sketch.selectedDocument
  const pages = document.sketchObject.pages()
  alignText(pages)
}

function alignText (pages) {
  var symbolsPage = _.find(pages, (page) => {return String(page.name()) === "Symbols"});
  if (symbolsPage) {
    var symbolsPageLayers = symbolsPage.layers();
    var textStyleSymbols = filterTextStyleSymbols(symbolsPageLayers)

    _.forEach(textStyleSymbols, (symbol) => {
      var layers = _.filter(symbol.layers(), (layer) => {return String(layer.class()) === "MSTextLayer"})
      layer.textAlignment = setTextAlignment(layers, symbol)
    })
  }
}

function filterTextStyleSymbols(symbolsPageLayers) {
  return _.filter(symbolsPageLayers, (symbol) => {
    return (String(symbol.name()).startsWith("Text Style / All / [") && String(symbol.name()).indexOf("]") > 0)
  })
}

function setTextAlignment(layers, symbol) {
  _.forEach(layers, (layer) => {
    centerVertically(layer, String(symbol.frame().height()) * 1)
    if (String(symbol.name()).toLowerCase().endsWith("centered")) {
      return 2;
    } else if (String(symbol.name()).toLowerCase().endsWith("right")) { 
      return 1;
    }
  })
}

function centerVertically(layer, parentHeight) {
  var layerWidth = parseFloat(layer.frame().width()) * 1;
  var layerHeight = parseFloat(layer.frame().height()) * 1;
  var layerXPos = parseFloat(layer.frame().x()) * 1;
  var yPos = (parseFloat(parentHeight) - parseFloat(layerHeight)) / 2;
  layer.frame().setRectByIgnoringProportions(NSMakeRect(layerXPos, yPos, layerWidth, layerHeight))
}
