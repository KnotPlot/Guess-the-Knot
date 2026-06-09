// XR console!!
import * as THREE from '../three-js/build/three.module.js';

'use strict';

var XRconsole = function () {


};

var consoleFont;
var consoleReady = false;
var consoleLineSkip = undefined;
var consoleGroup;
var consoleTextSize;
var consoleBase = "unset";

var fontDict = {
  "mont": "Montserrat Medium_Regular-rev"
}

XRconsole.init = function (font, textSize, callBack) {
  if (consoleBase != "unset") 
	  consoleBase.visible = false;
	
  consoleTextSize = textSize;
  var fontName = fontDict [font];
  if (fontName == undefined) {
    console.log ("font `" + font + "' not found");
    return;
  }
  var fontFileName = "../fonts/" + fontName + ".json";
  var loader = new THREE.FontLoader();
  loader.load (fontFileName, function (font) {

    console.log("\n\nloaded font " + fontName + "\n");
    consoleFont = font;
    consoleReady = true;
    consoleGroup = new THREE.Group();
    var ignore = createTextObject("This is for setting Line Skip!");
    consoleGroup.translateY(consoleLineSkip);
    consoleGroup.name = "Console";
    createConsoleBase ();
    consoleBase.add (consoleGroup);

    callBack (consoleBase);

  },
             // onProgress callback
	function ( xhr ) {
	},

	// onError callback
	function ( err ) {
    console.log ("couldn't load the file `%s'\n", fontFileName);
  }
             
             );

}

XRconsole.addToConsole = function (message) {
  if (!consoleReady) 
    return;


  for (var i = 0; i < consoleGroup.children.length; i++) {
    var line = consoleGroup.children[i];
    line.translateY(consoleLineSkip);
  }
  var text = createTextObject(message);
  consoleGroup.add (text);
}

var colour;

function createTextObject (message) {
  colour = 0xffaaff;   // move

  var matLite = new THREE.MeshBasicMaterial ({
    color: colour,
    transparent: false,
    opacity: 1.0,
    side: THREE.DoubleSide
  });

  var shapes = consoleFont.generateShapes (message, consoleTextSize);

  var geometry = new THREE.ShapeBufferGeometry (shapes);

  geometry.computeBoundingBox ();
  if (consoleLineSkip == undefined) {
    consoleLineSkip = 1.2 * (geometry.boundingBox.max.y - geometry.boundingBox.min.y);
  }


  var textMesh = new THREE.Mesh (geometry, matLite);
  textMesh.position.x = 0;
  textMesh.position.y = 0;
  textMesh.position.z = 0;
  textMesh.name = message;

  return textMesh;
}

function createConsoleBase () {
  //var geometry = new THREE.BoxBufferGeometry(0.15, 0.1, 0.15);
  var geometry = new THREE.BoxBufferGeometry(0.001, 0.001, 0.001);

  var material = new THREE.MeshStandardMaterial({
    color: 0x447799,
    roughness: 0.7,
    metalness: 0.0
  });

  consoleBase = new THREE.Mesh (geometry, material);
  consoleBase.name = "Console Base";
  consoleBase.translateZ(-3);
  consoleBase.translateX(-2);
}


export { XRconsole }
