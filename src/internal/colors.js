var _ = require("lodash")
const common = require("./common");

module.exports = {
  isColor: (style) => {
    var tag = common.getTag(String(style.name()))
    // TODO: this is confusing

    // If the style name has a tag and the ramp isn't "x", OR If the style name isn't a tag

    return ((tag.isTag && tag.ramp != "x") || !tag.isTag)
  },
  
  addColors: (colorStyles) => {
    log(colorStyles.length)
    return _.reduce(colorStyles, (colors, style) => {
      var tagName = common.getTag(String(style.name()))
      if (!tagName.isTag) {
        tagName = {"name": String(style.name())}
      }
      var tmp = {
        name: common.hyphenize(tagName.name) + "-color",
        value: "#" + style.value().firstEnabledFill().color().immutableModelObject().hexValue()
      }
      colors.push(tmp)
      return colors
    }, [])
  },
  
  writeColors: (colors) => {
    var styles = ""
    log(colors.length)
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
