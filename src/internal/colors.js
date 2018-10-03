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
      // TODO: @Drew just ran into a scenario that this is null
      // I am using the plugin for the designs that Elizabeth created for "what's for lunch"
      if(style.value().firstEnabledFill()) {
        var tmp = {
          name: _.kebabCase(tagName.name) + "-color",
          value: "#" + style.value().firstEnabledFill().color().immutableModelObject().hexValue()
        }
        colors.push(tmp)
      }
      return colors
    }, [])
  },
  
  writeColors: (colors) => {
    if(colors.length == 0) return ""
    
    var styles = _.reduce(colors, (styles, color) => {
      return styles + `$${color.name}: ${color.value};\n`
    }, "// COLORS\n")

    return styles += "\n"
  }   
}
