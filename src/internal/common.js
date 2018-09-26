module.exports = {
  
  // TODO: refactoring
  getTag: (name) => {  
    var regex = /^\[(([A-Za-z])(\d\.*[0-9]*|\p+))(.*)\]\s(.*)/g,
        tag = name,
        isTag = false,
        match = regex.exec(name),
        ramp,
        // selector,
        // variant,
        // cssSelector,
        tagName = name

    if (match) {
      isTag = true
      tag = match[1].toLowerCase()
      ramp = match[2].toLowerCase()
      // selector = match[3].toLowerCase()
      // cssSelector = match[3].toLowerCase()
      // if (cssSelector != "p") {
      //   cssSelector = "h" + selector
      // }
      // variant = match[4]
      tagName = match[5]
    }
    
    // TODO: doesn't seem like we need all these details
    return {
      "isTag": isTag, 
      "tag": tag, 
      "ramp": ramp,
      // "selector": selector, 
      // "cssSelector": cssSelector, 
      // "variant": variant, 
      "name": tagName
    }
  }

}
