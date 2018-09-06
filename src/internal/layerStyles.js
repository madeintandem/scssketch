var _ = require("lodash")

module.exports = {
  parse: (sharedStyles) => {    
    var styles = _.sortBy(sharedStyles.objects(), [style => style.name()], ["desc"])
    var colors_shadows = _.partition(styles, (style) => { return style.name().charAt(0) == "[" })
    var colors = formatColors(colors_shadows[0])
    var shadows = formatShadows(colors_shadows[1])    
    return {colors: colors, shadows: shadows}
  },
  
  writeSass: (layerStyleMap) => {
    return `${writeColors(layerStyleMap.colors)}\n${writeShadows(layerStyleMap.shadows)}`
  }
}

function formatColors(colors) {
  return _.reduce(colors, (formattedColors, style) => {
      var tmp = {
        name: String(style.name()).split(" ").pop().concat("_color"),
        value: "#" + style.value().firstEnabledFill().color().immutableModelObject().hexValue()
      }
      formattedColors.push(tmp)    
      return formattedColors;
  }, [])
}

function formatShadows(shadows) {
  return _.reduce(shadows, (formattedShadows, style) => {
    tmp = {
      name: String(style.name()).replace(" ", "_"),
      value: constructShadowValue(style.value())
    }
    formattedShadows.push(tmp)
    return formattedShadows
  }, [])
}

function constructShadowValue(style) {
  var offsetX = style.firstEnabledShadow().offsetX()
  var offsetY = style.firstEnabledShadow().offsetY()
  var blurRadius = style.firstEnabledShadow().blurRadius()
  var rgba = formatRgba(style.firstEnabledShadow().color().toString().replace(/\(|\)|[a-z]|:/g, ""))
  
  return `${offsetX}px ${offsetY}px ${blurRadius}px rgba(${rgba})`
}

function writeColors(colors) {
  var styles = ""
  _.forEach(colors, (color) => {
    styles += `$${color.name}: ${color.value};\n`
  })
  return styles
}

function writeShadows(shadows) {
  var styles = ""
  _.forEach(shadows, (shadow) => {
    styles += `$${shadow.name}: ${shadow.value};\n`
  })
  return styles
}

function formatRgba(rgba) {
  return _.reduce(rgba.split(" "), (formattedRgba, item) => {
    var formattedItem = item.match(/\d.\d{2}/g)[0] 
    formattedRgba.push(formattedItem)
    return formattedRgba
  }, []).join(", ")
}
