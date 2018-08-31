var that = this;
function __skpm_run (key, context) {
  that.context = context;

var exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/my-command.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/layerStyles.js":
/*!****************************!*\
  !*** ./src/layerStyles.js ***!
  \****************************/
/*! exports provided: layerStyle */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "layerStyle", function() { return layerStyle; });
var layerStyleMap = {
  colors: [],
  shadows: []
};
function layerStyle(sharedStyles) {
  for (var i = 0; i < sharedStyles.numberOfSharedStyles(); i++) {
    var style = sharedStyles.objects().objectAtIndex(i);
    readLayerStyles(style);
  }
}

function readLayerStyles(style) {
  if (String(style.name()).charAt(0) == '[') {
    addColor(style);
  } else {
    addShadow(style);
  }
}

function addColor(style) {
  var name = String(style.name()).split(' ').pop().concat('_color');
  var hex = "#" + style.value().firstEnabledFill().color().immutableModelObject().hexValue();
  var tmp = {};
  tmp[name] = hex;
  layerStyleMap.colors.push(tmp);
}

function addShadow(style) {
  var name = String(style.name()).replace(' ', '_');
  var tmp = {};
  tmp[name] = {
    offsetX: style.value().firstEnabledShadow().offsetX(),
    offsetY: style.value().firstEnabledShadow().offsetY(),
    blurRadius: style.value().firstEnabledShadow().blurRadius(),
    color: style.value().firstEnabledShadow().color()
  };
  layerStyleMap.shadows.push(tmp);
}

/***/ }),

/***/ "./src/my-command.js":
/*!***************************!*\
  !*** ./src/my-command.js ***!
  \***************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _layerStyles_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./layerStyles.js */ "./src/layerStyles.js");

/* harmony default export */ __webpack_exports__["default"] = (function (context) {
  // const sketch = require('sketch')
  var sketch = context.api();
  var document = sketch.selectedDocument;
  var sharedStyles = document.sketchObject.documentData().layerStyles();
  var layerStyleJson = Object(_layerStyles_js__WEBPACK_IMPORTED_MODULE_0__["layerStyle"])(sharedStyles); // 
  // function writeToFile() {
  //   var scssFile = ''
  // 
  // }
  // 
  // function writeColors(scss) {
  //   return scss.colors
  // }
  // 
  // function writeShadows(scss) {
  //   scss.shadows
  // }

  console.log("all done!");
});

/***/ })

/******/ });
  if (key === 'default' && typeof exports === 'function') {
    exports(context);
  } else {
    exports[key](context);
  }
}
that['onRun'] = __skpm_run.bind(this, 'default')

//# sourceMappingURL=my-command.js.map