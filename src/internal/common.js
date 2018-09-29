module.exports = {
  
  getTag: (name) => {  
    var regex = /^\[(([A-Za-z])(\d\.*[0-9]*|[\p|\P]+))(.*)\]\s(.*)/g,
        tag = name,
        isTag = false,
        match = regex.exec(name),
        ramp = "",
        selector,
        variant,
        cssSelector,
        tagName = name

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
      tagName = match[5]
    }
    
    return {
      "isTag": isTag, 
      "tag": tag, 
      "ramp": ramp,
      "selector": selector, 
      "cssSelector": cssSelector, 
      "variant": variant, 
      "name": tagName
    }
  },
  
  rgbaToCSS: (color, opacityMultiplier) => {
    if (!opacityMultiplier) {
      opacityMultiplier = 1
    }
    var rgba = color.toString().replace(/[a-z]|:/g, "")
    var temprgba = rgba.slice(rgba.indexOf("(") + 1, rgba.indexOf(")") - 1).split(" ")
    rgba = "rgba("
    temprgba.forEach(function(value, index){
      if (index < 3) {
        rgba = rgba + Math.round(255 * value) + ", "
      } else {
        rgba = rgba + removeZeros(value * opacityMultiplier) + ", "
      }
    })
    rgba = rgba.slice(0, -2) + ")"
    return rgba
  }

}

function removeZeros(str){
  str = String(str)
  var regEx1 = /[0]+$/
  var regEx2 = /[.]$/
  if (str.indexOf('.')>-1){
      str = str.replace(regEx1,'')  // Remove trailing 0's
  }
  str = str.replace(regEx2,'')  // Remove trailing decimal
  return str
}
