export default function(context) {
  const layerStyles = require("./internal/layerStyles");
  const layerTextStyles = require("./internal/layerTextStyles");
  const sketch = context.api()
  const document = sketch.selectedDocument
  const pages = document.sketchObject.pages()
  alignText(pages)
}
function checkForTextStyleSymbol (symbol) {
    var result = false
    var symbolName = String(symbol.name());
    if (symbolName.startsWith("Text Style / All / [") && symbolName.indexOf("]") > 0) {
        result = true;
    }
    return result
}
function centerVertically(layer, parentHeight) {
    var layerWidth = parseFloat(layer.frame().width()) * 1;
    var layerHeight = parseFloat(layer.frame().height()) * 1;
    var layerXPos = parseFloat(layer.frame().x()) * 1;
    var yPos = (parseFloat(parentHeight) - parseFloat(layerHeight)) / 2;
    layer.frame().setRectByIgnoringProportions(NSMakeRect(layerXPos, yPos, layerWidth, layerHeight))
}
function alignText (pages) {
    var symbolsPage;
    pages.forEach(function(page){
        if (page.name() == "Symbols") {
            symbolsPage = page;
        }
    })
    if (symbolsPage) {
        var symbolsPageLayers = symbolsPage.layers();
        symbolsPageLayers.forEach(function(symbol, index) {
            if (checkForTextStyleSymbol(symbol)) {
                var symbolHeight = String(symbol.frame().height()) * 1;
                symbol.layers().forEach(function(layer){
                    if(String(layer.class()) == "MSTextLayer") {
                        centerVertically(layer, symbolHeight)
                    }
                })
                if (String(symbol.name()).toLowerCase().endsWith("centered")) {
                    symbol.layers().forEach(function(layer){
                        if(String(layer.class()) == "MSTextLayer") {
                            layer.textAlignment = 2;
                        }
                    })
                } else if (String(symbol.name()).toLowerCase().endsWith("right")) {
                    symbol.layers().forEach(function(layer){
                        if(String(layer.class()) == "MSTextLayer") {
                            layer.textAlignment = 1;
                        }
                    })
                }
            }
        })
    }
}