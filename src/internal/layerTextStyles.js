var _ = require("lodash")

module.exports = {
  parse: function (sharedTextStyles) { 
    var mobileStyles = _.filter(sharedTextStyles.objects(), (style) => { 
      return style.name().match(/\[M[\d|P]\]/);
    })

    var desktopStyles = _.filter(sharedTextStyles.objects(), (style) => { 
      return style.name().match(/\[D[\d|P]\]/);
    })

    var mobile = addMobile(mobileStyles)
    var desktop = addDesktop(desktopStyles)
    return {mobile: mobile, desktop: desktop}
  },
  
  writeSass: function (layerTextStyleMap) {
    return writeMobile(layerTextStyleMap.mobile).concat(writeDesktop(layerTextStyleMap.desktop))
  }
}

function addMobile(mobileStyles) {
  var mobile = []
   _.forEach(mobileStyles, (style) => {
    const attributes = style.value().textStyle().attributes();
    const tmp = {
      name: style.name(),
      font_family: attributes.NSFont.fontDescriptor().objectForKey(NSFontNameAttribute),
      font_size: `${attributes.NSFont.fontDescriptor().objectForKey(NSFontSizeAttribute)}px`,
      // font_weight: ,
      line_height: `${attributes.NSParagraphStyle.maximumLineHeight()}px`,
      margin: 0,
      text_transform: attributes.MSAttributedStringTextTransformAttribute
    }
    mobile.push(tmp)
  })

  return mobile
}

function addDesktop(desktopStyles) {  
  var desktop = []
   _.forEach(desktopStyles, (style) => {
    const attributes = style.value().textStyle().attributes();
    const tmp = {
      name: style.name(),
      font_size: `${attributes.NSFont.fontDescriptor().objectForKey(NSFontSizeAttribute)}px`,
      line_height: `${attributes.NSParagraphStyle.maximumLineHeight()}px`
    }
    desktop.push(tmp)
  })
  
  return desktop
}

function writeMobile(mobileStyles) {
  var sass = "// --- MOBILE TYPE RAMP ---\n"
  _.forEach(mobileStyles, style => {
    sass += printStyleHeader(style.name)
    sass += printStyle(style)
    sass += "}\n\n"
  })

  return sass
}

function writeDesktop(desktopStyles) {
  var sass = "// --- DESKTOP TYPE RAMP ---\n"
  _.forEach(desktopStyles, style => {
    sass += printStyleHeader(style.name)
    sass += printStyle(style)
    sass += "}\n\n"
  })

  return sass
}

function printStyle(style) {
  var sass = ""
  _.forEach(_.omit(style, ["name"]), (value, key) => {
    sass += value ? `\t${key.replace("_", "-")}: ${value};\n` : ""
  })  
  return sass
}

function printStyleHeader(name) {
  var mixinName = _.lowerCase(name.substring(name.indexOf("["), name.indexOf("]"))).replace(" ", "")
  var sass = `// ${name} \n`
  sass += `@mixin ${mixinName}TextStyle {\n`
  return sass
}
