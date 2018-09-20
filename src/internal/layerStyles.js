var _ = require("lodash")

module.exports = {
  parse: (sharedStyles) => {    
    var sortedStyles = _.sortBy(sharedStyles.objects(), [style => style.name()], ["desc"])
    var colors = []
    var shadows = []
    var gradients = []
    _.forEach(sortedStyles, function(style) {
      var tag = getTag(String(style.name()));
      if (style.value().shadows().length || style.value().innerShadows().length) {
        addShadow(shadows, style)
      }
      else {
        var isGradient = false;
        _.forEach(style.value().fills(), function(fill) {

          if (String(fill.fillType()) == "1" && fill.gradient() && fill.gradient().stops() && fill.gradient().stops().length) {
            isGradient = true
          }
        })
        if (isGradient) {
          addGradient(gradients, style)
        } else if ((tag.isTag && tag.ramp != "x") || !tag.isTag) {
          addColor(colors, style)
        }
      }
    })
    
    return {colors: colors, shadows: shadows, gradients: gradients}
  },
  
  writeSass: (layerStyleMap) => {
    return `${writeColors(layerStyleMap.colors)}${writeGradients(layerStyleMap.gradients)}${writeShadows(layerStyleMap.shadows)}`
  }
}

function addColor(colorsArray, style) {
  var thisName = String(style.name())
  if (getTag(thisName).isTag) {
    thisName = thisName.slice(thisName.indexOf("]")+ 1).trim()
  }
  var tmp = {
    name: hyphenize(thisName) + "-color",
    value: "#" + style.value().firstEnabledFill().color().immutableModelObject().hexValue()
  }
  colorsArray.push(tmp)
}
function addShadow(shadowsArray, style) {
  var thisName = String(style.name())
  if (getTag(thisName).isTag) {
    thisName = thisName.slice(thisName.indexOf("]")+ 1).trim()
  }
  tmp = {
    name: hyphenize(thisName),
    value: getShadows(style.value())
  }
  shadowsArray.push(tmp)
}
function getShadows(styles) {
  var result = ""
  var theShadows = styles.shadows();
  var theShadows = theShadows.reverse();
  _.forEach(theShadows, function(style){
    if (style.isEnabled()) {
      result += constructShadowValue(style)
    }
  })
  var theInnerShadows = styles.innerShadows();
  theInnerShadows = theInnerShadows.reverse();
  _.forEach(theInnerShadows, function(style){
    if (style.isEnabled()) {
      result += constructShadowValue(style, "inset")
    }
  })
  return result.slice(0,-2)
}
function constructShadowValue(style, inset) {
  result = ""
  var offsetX = style.offsetX();
  var offsetY = style.offsetY();
  var blurRadius = style.blurRadius();
  var rgba = rgbaToCSS(style.color())
  result += `${offsetX}px ${offsetY}px ${blurRadius}px rgba${rgba}, `;
  if (inset == "inset") {
    result = inset + " " + result
  }
  return result
}
function addGradient (gradientsArray, style) {
  // for each gradient
  var gradients = "";
  var isLinear = false;
  var theFills = style.value().fills();
  theFills = theFills.reverse()
  _.forEach(theFills, function(fill){
    if (String(fill.fillType()) == "1" && fill.gradient() && fill.gradient().stops() && fill.gradient().stops().length && parseFloat(fill.contextSettings().opacity()) > 0) {
      // get gradient type
      var stopsArray = fill.gradient().stops()
      stopsArray = _.sortBy(stopsArray, [style => style.position()], ["desc"])
      var prefix = "";
      var gradientOpacity = 1;
      if (fill.contextSettings()) {
        gradientOpacity = parseFloat(fill.contextSettings().opacity());
      }
      log("gotten fill opacity = " + gradientOpacity)
      var gradientType = fill.gradient().gradientType();
      if (gradientType == 0) {
        // it's linear
        var fromX = fill.gradient().from().x;
        var fromY = fill.gradient().from().y;
        var toX = fill.gradient().to().x;
        var toY = fill.gradient().to().y;

        var deltaX = fromX - toX;
        var deltaY = fromY - toY;
        var rad = Math.atan2(deltaY, deltaX); // In radians
        var deg = rad * (180 / Math.PI)

        //subtract 90 because of sketch
        var angle = deg + 90
        angle = Math.round(angle * 10) / 10;
        if (angle == 0) {
          prefix = "linear-gradient("
        } else {
          stopsArray.reverse();
          isLinear = true;
          prefix = "linear-gradient(" + angle + "deg, "
        }
      } else if (gradientType == 1) {
        // it's radial
        prefix = "radial-gradient(ellipse at center, "
      } else if (gradientType == 2) {
        // it's conic
        var offset = 0;
        var firstStop;
        var offsetDegrees = 0;
        _.forEach(stopsArray, function(stop, index){
          if (index == 0 && parseFloat(stop.position()) != 0) {
            offset = parseFloat(stop.position())
            offsetDegrees = offset * 360
            offset = Math.round(10000 * offset) / 100
            firstStop = stop;
          }
        })
        offsetDegrees = Math.round((90 + offsetDegrees) * 100) / 100;
        prefix = "conic-gradient(from " + offsetDegrees + "deg, "
      }
      var stops = getGradientStops(stopsArray, offset, gradientOpacity, isLinear)
      gradients += prefix + stops + ", "
      if (offset > 0) {
        gradients = gradients.slice(0, -3) + ", "
        gradients += getGradientStops([firstStop])
        gradients = gradients.slice(0, gradients.lastIndexOf(")"))
        gradients = gradients.slice(0, gradients.lastIndexOf(")"))
        gradients += ") 100%), "
      }
    }
  })
  gradients = gradients.slice(0, -2);
  var thisName = String(style.name())
  if (getTag(thisName).isTag || thisName.indexOf("]") > 0) {
    thisName = thisName.slice(thisName.indexOf("]")+ 1).trim()
  }
  gradientsArray.push({"name": hyphenize(thisName), "gradient": gradients})
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
function removeZeros(str){
  str = String(str)
  var regEx1 = /[0]+$/;
  var regEx2 = /[.]$/;
  if (str.indexOf('.')>-1){
      str = str.replace(regEx1,'');  // Remove trailing 0's
  }
  str = str.replace(regEx2,'');  // Remove trailing decimal
  return str;
}
function rgbaToCSS(color, opacityMultiplier) {
  if (!opacityMultiplier) {
    opacityMultiplier = 1;
  }
  log("opacity multiplier = " + opacityMultiplier)
  var rgba = color.toString().replace(/[a-z]|:/g, "")
  var temprgba = rgba.slice(rgba.indexOf("(") + 1, rgba.indexOf(")") - 1).split(" ");
  rgba = "rgba("
  temprgba.forEach(function(value, index){
    if (index < 3) {
      rgba = rgba + Math.round(255 * value) + ", "
    } else {
      log("value = " + value)
      rgba = rgba + removeZeros(value * opacityMultiplier) + ", "
    }
  })
  rgba = rgba.slice(0, -2) + ")"
  log("rgba = " + rgba)
  return rgba
}
function hyphenize (str) {
  return String(str).replace(/[\.\,\[\]]/g, '_').replace(/[\s]/g, '-').replace(/\-\-\-/g, '-').replace(/\-\-/g, '-').toLowerCase();
}
function writeColors(colors) {
  var styles = ""
  if (colors.length > 0) {
    styles = styles +"// COLORS\n"
    _.forEach(colors, (color) => {
      styles += `$${color.name}: ${color.value};\n`
    })
    styles += "\n"
  }
  return styles
}

function writeShadows(shadows) {
  var styles = ""
  if (shadows.length) {
    styles = styles + "// SHADOWS\n"
    _.forEach(shadows, (shadow) => {
      styles += `$${shadow.name}: ${shadow.value};\n`
    })
    styles += "\n"
  }
  return styles
}
function writeGradients(gradients) {
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
function getTag (name) {
  var regex = /^\[(([A-Za-z])(\d\.*[0-9]*|\p+))(.*)\].*/g,
      tag = name,
      isTag = false,
      match = regex.exec(name.toLowerCase()),
      ramp,
      selector,
      variant,
      cssSelector
  if (match) {
    isTag = true
    tag = match[1].toLowerCase()
    ramp = match[2].toLowerCase()
    selector = match[3].toLowerCase()
    cssSelector = match[3].toLowerCase()
    if (cssSelector != "p") {
      cssSelector = "h" + selector
    }
    variant = match[4]
  }
  return {"isTag": isTag, "tag": tag, "ramp": ramp, "selector": selector, "cssSelector": cssSelector, "variant": variant}
}
