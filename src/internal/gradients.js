var _ = require("lodash")
const common = require("./common");

module.exports = {
  isGradient: (style) => {
    _.forEach(style.value().fills(), (fill) => {
      if (String(fill.fillType()) == "1" && 
                    fill.gradient() && 
                    fill.gradient().stops() && 
                    fill.gradient().stops().length) {
        return true
      }
    })
  },
  
  addGradients: (gradientStyles) => {
    return _.reduce(gradientStyles, (gradientsArray, style) => {
              var gradients = ""
              var isLinear = false
              var theFills = style.value().fills().reverse()
              
              _.forEach(theFills, (fill) => {
                if(opacityExits(fill)) {
                  setGradient(fill, style)
                }
              })

              gradients = gradients.slice(0, -2);
              var thisName = String(style.name())
              var tag = common.getTag(thisName)
              if (tag.isTag || thisName.indexOf("]") > 0) {
                thisName = tag.name.trim()
              }
              gradientsArray.push({"name": common.hyphenize(thisName), "gradient": gradients})

              return gradientsArray
            }, [])  
  },
  
  writeGradients: (gradients) => {
    var styles = ""
    if (gradients.length) {
      styles = styles + "// GRADIENTS\n"
      _.forEach(gradients, (gradient) => {
        styles += `$${hyphenize(gradient.name)}: ${gradient.gradient};\n`
      })
      styles += "\n"
    }
    return styles
  
  }
}

function opacityExits(fill) {
  return String(fill.fillType()) == "1" && 
                fill.gradient() && 
                fill.gradient().stops() && 
                fill.gradient().stops().length && 
                parseFloat(fill.contextSettings().opacity()) > 0
}

function setGradient(fill, style) {
  var gradientType = getGradientType(fill, style)
  var prefix = "";
  var firstStop = "" //TODO: this is very bad but I don't know exactly what it does
  if (gradientType.type == 0) {
    angle = getAngle(fill)
    if(angle == 0) {
      isLinear = true; //TODO: why angle = 0 is not a linear = true? 
    }
    
    setPrefixForLinear(fill, angle)
  } else if (gradientType.type == 1) {
    // it's radial
    prefix = "radial-gradient(ellipse at center, "
  } else if (gradientType.type == 2) {
    var conic = setPrefixForConic(gradientType.stopsArray)
    prefix = conic.prefix
    firstStop = conic.firstStop
  }

  var stops = getGradientStops(gradientType.stopsArray, offset, gradientType.gradientOpacity, isLinear)
  gradients += prefix + stops + ", "
  if (offset > 0) {
    gradients = gradients.slice(0, -3) + ", "
    gradients += getGradientStops([firstStop])
    gradients = gradients.slice(0, gradients.lastIndexOf(")"))
    gradients = gradients.slice(0, gradients.lastIndexOf(")"))
    gradients += ") 100%), "
  }
}

function getGradientType(fill, style) {
  var stopsArray = fill.gradient().stops()
  stopsArray = _.sortBy(stopsArray, [style => style.position()], ["desc"])
  var gradientOpacity = 1;
  if (fill.contextSettings()) {
    gradientOpacity = parseFloat(fill.contextSettings().opacity());
  }
  
  return  {
    type: fill.gradient().gradientType(),
    stopsArray: stopsArray,
    Opacity: gradientOpacity
  }
}

function getAngle(fill) {
  var fromX = fill.gradient().from().x;
  var fromY = fill.gradient().from().y;
  var toX = fill.gradient().to().x;
  var toY = fill.gradient().to().y;

  var deltaX = fromX - toX;
  var deltaY = fromY - toY;
  var rad = Math.atan2(deltaY, deltaX); // In radians
  var deg = rad * (180 / Math.PI)

  //subtract 90 because of sketch
  // TODO: you mentioned substact
  return Math.round((deg + 90) * 10) / 10;
}

function setPrefixForConic(stopsArray) {
  // it's conic
  var offsetDegrees = 0
  var firstStop
  _.forEach(stopsArray, (stop, index) => {
    if (index == 0 && parseFloat(stop.position()) != 0) {
      var offset = parseFloat(stop.position())
      offsetDegrees = offset * 360
      offset = Math.round(10000 * offset) / 100
      firstStop = stop; //TODO: why firststop?? 
    }
  })
  offsetDegrees = Math.round((90 + offsetDegrees) * 100) / 100;
  
  return {
    prefix: "conic-gradient(from " + offsetDegrees + "deg, ",
    firstStop: firstStop
  }
}

function setPrefixForLinear(fill, angle) {
  if (angle == 0) {
    return "linear-gradient("
  } else {
    gradientType.stopsArray.reverse();
    return "linear-gradient(" + angle + "deg, "
  }
}

function getGradientStops(stops, offset, gradientOpacity, isLinear) {
  var result = "";
  _.forEach(stops, function(stop){
    var position = parseFloat(stop.position());
    var rgba = rgbaToCSS(stop.color(), gradientOpacity)
    if (!offset || String(offset).toLowerCase == "nan") {
      offset = 0
    }
    position = (100 * position) - offset;
    position = Math.round(100 * position) / 100
    if (isLinear) {
      position = 100 - position
    }
    result = result + rgba + " " + position + "%, "
  })
  result = result.slice(0, -2) + ")"
  return result;
}
