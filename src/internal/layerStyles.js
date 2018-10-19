var _ = require("lodash")
const common = require("./common");
const colors = require("./colors");
const shadows = require("./shadows");
const gradients = require("./gradients");

module.exports = {
  parse: (sharedStyles) => {    
    var sortedStyles = _.sortBy(sharedStyles.objects(), [style => style.name()], ["desc"])
    var shadowStyles = _.filter(sortedStyles, (style) => { return shadows.isShadow(style) })
    var otherStyles = _.differenceWith(sortedStyles, shadowStyles, _.isEqual)
    var gradientStyles = _.filter(otherStyles, (style) => { return gradients.isGradient(style) })
    otherStyles = _.differenceWith(otherStyles, gradientStyles, _.isEqual)
    var colorStyles = _.filter(otherStyles, (style) => { return colors.isColor(style) })

    return {
      colors: colors.addColors(colorStyles), 
      shadows: shadows.addShadows(shadowStyles), 
      gradients: gradients.addGradients(gradientStyles)
    }
  },
  
  writeSass: (layerStyleMap) => {
    return `${colors.writeColors(layerStyleMap.colors)}${gradients.writeGradients(layerStyleMap.gradients)}${shadows.writeShadows(layerStyleMap.shadows)}`
  }
}
