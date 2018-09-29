var _ = require("lodash")
const common = require("./common");

module.exports = {
  isColor: (style) => {
    var tag = common.getTag(String(style.name()))
    return tag.ramp != "x"
  },
  
  addColors: (colorStyles) => {
    return _.reduce(colorStyles, (colors, style) => {
      var tagName = common.getTag(String(style.name()))
      var tmp = {
        name: _.kebabCase(tagName.name) + "-color",
        value: "#" + style.value().firstEnabledFill().color().immutableModelObject().hexValue()
      }
      colors.push(tmp)
      return colors
    }, [])
  },
  
  writeColors: (colors) => {
    var styles = ""
    if (colors.length > 0) {
      styles += "// COLORS\n"
      _.forEach(colors, (color) => {
        styles += `$${color.name}: ${color.value};\n`
      })
      styles += "\n"
    }
    return styles
  }   
}
