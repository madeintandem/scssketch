var _ = require("lodash")
const common = require("./common")

module.exports = {
  isGradient: (style) => {
    return _.find(style.value().fills(), (fill) => { 
      return String(fill.fillType()) === "1"; 
    })
  },
  
  addGradients: (gradientStyles) => {
    return _.reduce(gradientStyles, (gradientsArray, style) => {
              var theFills = style.value().fills().reverse()
              var gradients = ""
              _.forEach(theFills, (fill) => {
                if(opacityExits(fill)) {
                  gradients += setGradient(fill, style)
                }
              })

              gradients = gradients.slice(0, -2);
              var thisName = String(style.name())
              var tag = common.getTag(thisName)
              if (tag.isTag || thisName.indexOf("]") > 0) {
                thisName = tag.name.trim()
              }
              gradientsArray.push({"name": _.kebabCase(thisName), "gradient": gradients})

              return gradientsArray
            }, [])  
  },
  
  writeGradients: (gradients) => {
    var styles = ""
    if (gradients.length) {
      styles = styles + "// GRADIENTS\n"
      _.forEach(gradients, (gradient) => {
        styles += `$${_.kebabCase(gradient.name)}: ${gradient.gradient};\n`
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
  var prefix = ""
  var gradients = ""
  var needToFlip = false
  var offset = 0
  
  if (gradientType.type == 0) {
    angle = getAngle(fill)
    if(angle != 0) {
      needToFlip = true
    }
    
    prefix = setPrefixForLinear(fill, angle, gradientType.stopsArray)
    gradientType.stopsArray = prefix.stopsArray;
    prefix = prefix.prefix
  } else if (gradientType.type == 1) {
    // it's radial
    prefix = "radial-gradient(ellipse at center, "
  } else if (gradientType.type == 2) {
    var conic = setPrefixForConic(gradientType.stopsArray)
    prefix = conic.prefix
    offset = conic.offset
  }

  var stops = getGradientStops(gradientType.stopsArray, offset, gradientType.gradientOpacity, needToFlip)
  gradients += prefix + stops + ", "
  
  if (gradientType.type == 2) {
    gradients = gradients.slice(0, -3) + ", "
    gradients += getGradientStops([gradientType.stopsArray[0]])
    gradients = gradients.slice(0, gradients.lastIndexOf(")"))
    gradients = gradients.slice(0, gradients.lastIndexOf(")"))
    gradients += ") 100%), "
  }
  
  return gradients
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
  return Math.round((deg + 90) * 10) / 10;
}

function setPrefixForConic(stopsArray) {
  // it's conic
  var offsetDegrees = 0
  var offset
  if (parseFloat(stopsArray[0].position()) != 0) {
    offset = parseFloat(stopsArray[0].position())
    offsetDegrees = offset * 360
    offset = Math.round(10000 * offset) / 100
  }
  offsetDegrees = Math.round((90 + offsetDegrees) * 100) / 100;
  
  return {
    prefix: "conic-gradient(from " + offsetDegrees + "deg, ",
    offset: offset
  }
}

function setPrefixForLinear(fill, angle, stops) {
  if (angle == 0) {
    return {"stopsArray": stops, "prefix": "linear-gradient("}
  } else {
    stops.reverse();
    return {"stopsArray": stops, "prefix": "linear-gradient(" + angle + "deg, "}
  }
}

function getGradientStops(stops, offset, gradientOpacity, needToFlip) {
  var result = "";
  _.forEach(stops, function(stop){
    var position = parseFloat(stop.position());
    var rgba = common.rgbaToCSS(stop.color(), gradientOpacity)
    if (!offset || String(offset).toLowerCase == "nan") {
      offset = 0
    }
    position = (100 * position) - offset;
    if (needToFlip === true) {
      position = 100 - position;
    }
    position = Math.round(100 * position) / 100
    result = result + rgba + " " + position + "%, "
  })
  result = result.slice(0, -2) + ")"
  return result;
}
