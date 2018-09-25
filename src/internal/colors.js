var _ = require("lodash")
const common = require("./common");

module.exports = {
  isColor: (style) => {
    var tag = common.getTag(String(style.name()))
    // TODO: this is confusing
    return ((tag.isTag && tag.ramp != "x") || !tag.isTag)
  },
  
  addColors: (colorStyles) => {
    return _.reduce(colorStyles, (colors, style) => {
              var tagName = tag
              if (tag.isTag) {
                tagName = tag.name.trim()
              }
              var tmp = {
                name: common.hyphenize(tagName) + "-color",
                value: "#" + style.value().firstEnabledFill().color().immutableModelObject().hexValue()
              }
              colors.push(tmp)
              return colors
            }, [])
  },
  
  writeColors: (colors) => {
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
}
