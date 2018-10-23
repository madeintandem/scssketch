var _ = require("lodash")
const common = require("./common");

module.exports = {
  isShadow: (style) => {
    return style.value().shadows().length || style.value().innerShadows().length  
  },
  
  addShadows: (shadowStyles) => {
    return _.reduce(shadowStyles, (shadows, style) => {
              var thisName = String(style.name())
              var tag = common.getTag(thisName)
              if (tag.isTag) {
                thisName = tag.name.trim()
              }
              tmp = {
                name: _.kebabCase(thisName),
                value: getShadows(style.value())
              }
              shadows.push(tmp)      
              return shadows
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
  var result = ""
  var theShadows = styles.shadows().reverse();
  _.forEach(theShadows, (style) => {
    if (style.isEnabled()) {
      result += constructShadowValue(style)
    }
  })
  var theInnerShadows = styles.innerShadows().reverse();
  _.forEach(theInnerShadows, (style) => {
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
  var rgba = common.rgbaToCSS(style.color())
  result += `${offsetX}px ${offsetY}px ${blurRadius}px ${rgba}, `;
  if (inset == "inset") {
    result = inset + " " + result
  }
  return result
}
