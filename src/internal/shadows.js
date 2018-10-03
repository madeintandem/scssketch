var _ = require("lodash")
const common = require("./common");

module.exports = {
  isShadow: (style) => {
    return style.value().shadows().length || style.value().innerShadows().length  
  },
  
  addShadows: (shadowStyles) => {
    return _.reduce(shadowStyles, (shaddows, style) => {
              var thisName = String(style.name())
              var tag = common.getTag(thisName)
              if (tag.isTag) {
                thisName = tag.name.trim()
              }
              tmp = {
                name: _.kebabCase(thisName),
                value: getShadows(style.value())
              }
              shaddows.push(tmp)      
              return shaddows
            }, [])
  },
  
  writeShadows: (shadows) => {
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
}

function getShadows(styles) {
  var theShadows = styles.shadows();
  var theShadows = theShadows.reverse();
  
  var shadowValueResult = _.reduce(theShadows, (result, style) => {
    if (style.isEnabled()) {
      return result + constructShadowValue(style)
    }
  }, "")

  var theInnerShadows = styles.innerShadows();
  theInnerShadows = theInnerShadows.reverse();

  var shadowResult = _.reduce(theInnerShadows, (result, style) => {
    if (style.isEnabled()) {
      return result + constructShadowValue(style, "inset")
    }  
  }, shadowValueResult)
  // TODO: @Drew just ran into a scenario that this is null
  // I am using the plugin for the designs that Elizabeth created for "what's for lunch"
  if(typeof lastname !== "undefined") return shadowResult.slice(0,-2)
}

function constructShadowValue(style, inset) {
  result = ""
  var offsetX = style.offsetX();
  var offsetY = style.offsetY();
  var blurRadius = style.blurRadius();
  var rgba = common.rgbaToCSS(style.color())
  result += `${offsetX}px ${offsetY}px ${blurRadius}px ${rgba}, `;
  if (inset == "inset") {
    result = inset + " " + result
  }
  return result
}
