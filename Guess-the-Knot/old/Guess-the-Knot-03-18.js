import * as THREE from '../../three-js/build/three.module.js';

var gtkVersion = "2026-03-17 21:30:43 UTC";

console.log ("Guess the Knot! (" + gtkVersion + ")");


import {
  TrackballControls
} from '../../three-js/examples/jsm/controls/TrackballControls.js';
import {
  VRButton
} from '../../three-js/examples/jsm/webxr/VRButton.js';
import {
  XRControllerModelFactory
} from '../../three-js/examples/jsm/webxr/XRControllerModelFactory.js';
import {
  GUI
} from '../../three-js/examples/jsm/libs/dat.gui.module.js';

import {
  ModelLoader
} from "./ModelLoader.js";

import {
  KnotPlotBinaryLoader
} from "./KnotPlotBinaryLoader.js";

import {
  XRconsole
} from "../XRconsole.js";

"use strict";

var container;
var camera, scene, renderer;
var controller0, controller1;
var controllerGrip0, controllerGrip1;
var inXR;

var raycaster, intersected = [];
var tempMatrix = new THREE.Matrix4 ();

var controls;
const useTrackball = true;

var movableObjects;
var consoleBase;


function listChildren (object, indent = "") {
  console.log(indent + object.type + " " + object.name);
  if (object.children.length > 0) {
    for (var i = 0; i < object.children.length; i++)
      listChildren (object.children[i], indent + "    ");
  }
}

function toggleVisible (object, text) {
  if (object.name.indexOf (text) == 0)
    object.visible = !object.visible;

  if (object.children.length == 0)
    return;

  for (var i = 0; i < object.children.length; i++)
    toggleVisible (object.children [i], text);

}

var floor;  

var isPL = false;


var gamepadController = {
	
  isPL: false,
  floorVisible: false,
  
};

function setKnot (which) {
	console.log ("setting knot to " + which);
}

var currentModel = "unknown1a";

var knots = {
	unknown1a: setKnot ("unknown1a"),
	unknown1b: setKnot ("unknown1b"),
	unknown1ar: setKnot ("unknown1ar"), 
	unknown1br: setKnot ("unknown1br"),  
	unknown2a: setKnot ("unknown2a"),
	unknown2b: setKnot ("unknown2b"),
	compact1a: setKnot ("compact1a"),
	compact1b: setKnot ("compact1b"),  
	  
	PerkoA: setKnot ("PerkoA"),
	PerkoB: setKnot ("PerkoB"),
	Brunnian3: setKnot ("Brunnian3"),
	Brunnian4: setKnot ("Brunnian4"),
	Whitehead: setKnot ("Whitehead"), 
	LorenzLink: setKnot ("LorenzLink"),
	test: setKnot ("test")
	
}

var links = {  
	PerkoA: setKnot ("PerkoA"),
	PerkoB: setKnot ("PerkoB"),
	Brunnian3: setKnot ("Brunnian3"),
	Brunnian4: setKnot ("Brunnian4"),
	Whitehead: setKnot ("Whitehead"), 
	test: setKnot ("test")
}

var params = {
	currentKnot: 'unknown1a',
	currentLink: 'PerkoA'
};

  
function updateKPF () {
	console.log ("updating model to " + currentModel + ' with PL=' + isPL);
	ModelLoader.loadKPF (currentModel, scene);
}

function initGUI () { 
	var gui = new GUI ({ width: 300 });
	
	var folderExamples = gui.addFolder ("Examples");
	
	folderExamples.add (params, 'currentKnot', Object.keys (knots)).onChange (function () {
        console.log ("\n\nchange to " + params.currentKnot);
		currentModel = params.currentKnot;
		updateKPF ();

	} );

	/*
	folderExamples.add (params, 'currentLink', Object.keys (links)).onChange (function () {
        console.log ("\n\nchange to " + params.currentLink);
		currentModel = params.currentLink;
		updateKPF ();

	} );
*/
	   
	   
		
	gui.add (gamepadController, "isPL").onChange (function (value) {
		isPL = value;
		ModelLoader.setPL (isPL);
		updateKPF ();
	});
	gui.add (gamepadController, "floorVisible").onChange (function (value) {
		floor.visible = !floor.visible;
	});
	
	
	folderExamples.open ();
}
  
initGUI ();
init ();
animate ();

var masterClock;

function toggle () {
  console.log ("toggle");
}

function infoFilaments (modelName, filamentArray, knotName) {
  console.log (modelName + " filamentArray has length " + filamentArray.length + ", name is " + knotName);
  //addToConsole (knotName);
  knot.set (knotName, false);
  console.log ("--------"); 
 
}

function init () {
  ModelLoader.version ();
  
  masterClock = new THREE.Clock ();
     
  inXR = false;

  container = document.createElement ('div');
  document.body.appendChild (container);

  scene = new THREE.Scene();
  scene.background = new THREE.Color (0x000022);

  camera = new THREE.PerspectiveCamera (50, window.innerWidth / window.innerHeight, 0.1, 10);
  camera.position.set (0, 1.6, 3);

  
  var geometry = new THREE.PlaneBufferGeometry (4, 8);
  var material = new THREE.MeshStandardMaterial ({
    color: 0x333333,
    roughness: 1.0,
    metalness: 0.0
  });
  floor = new THREE.Mesh (geometry, material);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1;
  floor.receiveShadow = true;
  floor.visible = false;
 
  scene.add (floor); 

  scene.add (new THREE.HemisphereLight (0x808080, 0x606060));

  var light = new THREE.DirectionalLight (0xffffff);
  light.position.set(0, 6, 0);
  light.castShadow = true;
  light.shadow.camera.top = 2;
  light.shadow.camera.bottom = -2;
  light.shadow.camera.right = 2;
  light.shadow.camera.left = -2;
  light.shadow.mapSize.set (4096, 4096);
  scene.add (light);


  //

  renderer = new THREE.WebGLRenderer ({
    antialias: true
  });
  renderer.setPixelRatio (window.devicePixelRatio);
  renderer.setSize (window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  renderer.xr.enabled = true;
  container.appendChild (renderer.domElement);

  //document.body.appendChild (VRButton.createButton(renderer));

  // controllers

  controller0 = renderer.xr.getController (0);
  controller0.addEventListener ('selectstart', onSelectStart);
  controller0.addEventListener ('selectend', onSelectEnd);
  controller0.addEventListener ('squeezestart', squeezeStart);
  controller0.addEventListener ('squeezend', squeezeEnd);
  scene.add (controller0);

  controller1 = renderer.xr.getController (1);
  controller1.addEventListener ('selectstart', onSelectStart);
  controller1.addEventListener ('selectend', onSelectEnd);
  controller1.addEventListener ('squeezestart', squeezeStart);
  controller1.addEventListener ('squeezend', squeezeEnd);
  scene.add (controller1);


  var controllerModelFactory = new XRControllerModelFactory ();

  controllerGrip0 = renderer.xr.getControllerGrip (0);
  controllerGrip0.add(controllerModelFactory.createControllerModel (controllerGrip0));
  scene.add(controllerGrip0);

  controllerGrip1 = renderer.xr.getControllerGrip (1);
  controllerGrip1.add(controllerModelFactory.createControllerModel (controllerGrip1));
  scene.add(controllerGrip1);

  //

  var geometry = new THREE.BufferGeometry ().setFromPoints ([new THREE.Vector3 (0, 0, 0), new THREE.Vector3 (0, 0, -1)]);

  var line = new THREE.Line (geometry);
  line.name = 'line';
  line.scale.z = 5;

  controller0.add (line.clone ());
  controller1.add (line.clone ());

  raycaster = new THREE.Raycaster ();

  //

  window.addEventListener ('resize', onWindowResize, false);


  controls = new TrackballControls (camera, container);
  controls.rotateSpeed = 5;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;
  controls.keys = [65, 83, 68];
  controls.enabled = true;

  createMovables ();

  const axesHelper = new THREE.AxesHelper (1.0);
  scene.add (axesHelper);

}

function loadedModelCallback (model) {
  model.position.y = 1.02;
  movableObjects.add (model);
}

function createMovables () {
  movableObjects = new THREE.Group ();
  movableObjects.name = "Movables";
  scene.add (movableObjects);

	/*
  var geometries = [
    new THREE.BoxBufferGeometry (0.2, 0.2, 0.2),
    new THREE.ConeBufferGeometry (0.2, 0.2, 64),
    new THREE.CylinderBufferGeometry (0.2, 0.2, 0.2, 64),
    new THREE.IcosahedronBufferGeometry (0.2, 3),
    new THREE.TorusBufferGeometry (0.2, 0.04, 64, 32)
  ];
*/
	
  XRconsole.init ("mont", 0.102, consoleCallback);
}

function consoleCallback (group) {
  movableObjects.add (group);

  addToConsole ("Guess the Knot!");
  addToConsole (gtkVersion);
}

function onWindowResize () {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize (window.innerWidth, window.innerHeight);

}



var squeezeValue0;
var squeezeValue1;

function squeezeStart (event) { // may not be needed
}

function squeezeEnd (event) {}

function onSelectStart (event) {
  // make this work for groups

  var controller = event.target;

  var intersections = getIntersections (controller);

  if (intersections.length > 0) {

    var intersection = intersections [0];

    tempMatrix.getInverse (controller.matrixWorld);

    var object = intersection.object;
    object.matrix.premultiply (tempMatrix);
    object.matrix.decompose (object.position, object.quaternion, object.scale);
    object.material.emissive.b = 1;
    controller.add(object);

    controller.userData.selected = object;

  }

}

function onSelectEnd (event) {

  var controller = event.target;

  if (controller.userData.selected !== undefined) {

    var object = controller.userData.selected;
    object.matrix.premultiply (controller.matrixWorld);
    object.matrix.decompose (object.position, object.quaternion, object.scale);
    object.material.emissive.b = 0;
    movableObjects.add (object);

    controller.userData.selected = undefined;

  }


}

function getIntersections (controller) {

  tempMatrix.identity ().extractRotation (controller.matrixWorld);

  raycaster.ray.origin.setFromMatrixPosition (controller.matrixWorld);
  raycaster.ray.direction.set (0, 0, -1).applyMatrix4 (tempMatrix);

  //return raycaster.intersectObjects(movableObjects.children, true);
  return raycaster.intersectObjects (movableObjects.children);
}

function intersectObjects (controller) {

  // Do not highlight when already selected

  if (controller.userData.selected !== undefined) return;

  var line = controller.getObjectByName ('line');
  var intersections = getIntersections (controller);

  if (intersections.length > 0) {

    var intersection = intersections [0];

    var object = intersection.object;
    object.material.emissive.r = 1;
    intersected.push (object);

    line.scale.z = intersection.distance;

  } else {

    line.scale.z = 5;

  }

}

function cleanIntersected () {

  while (intersected.length) {

    var object = intersected.pop ();
    object.material.emissive.r = 0;

  }

}

var prevPressed = undefined;
var kount = 0;
var buttonDebug = false;

function buttonA (pressed) {
  if (buttonDebug) {
    var s = "A ";
    if (pressed)
      s += "pressed";
    else
      s += "released";
    addToConsole(s);
  }
  
	
}

function buttonB (pressed) {
  if (buttonDebug) {
    var s = "B ";
    if (pressed)
      s += "pressed";
    else
      s += "released";
    addToConsole(s);
  }
  floor.visible = pressed;
}

var buttonXClock = new THREE.Clock ();
var buttonXpressed = false;

function buttonX (pressed) {

}

function doubleBlurt (s) {
  console.log (s);
  addToConsole (s);
}

function buttonY (pressed) {
}

var nonVRinit = false;

function VRunavailable () {
  if (nonVRinit)
    return;
  nonVRinit = true;


}

var checkGamepadsFirstCall = true;

var button4 = buttonA;
var button5 = buttonB;
var button11 = buttonX;
var button12 = buttonY;

function checkGamepads () {
  if (prevPressed == undefined) {
    //console.log("creating prevPressed array\n");
    prevPressed = [];
    for (var i = 0; i < 40; i++)
      prevPressed.push(false);
  }

  var session = renderer.xr.getSession ();
  if (!session) {
    VRunavailable ();
    return;
  }

 
  inXR = true;

  var gpIndex = 0;
  var sIndex = 0;

  for (const source of session.inputSources) {
    if (!source.gamepad)
      continue;

    if (checkGamepadsFirstCall) {
      var hand = source.handedness;
      var s = "controller" + sIndex + " handedness is " + hand;
      doubleBlurt(s);
      if (sIndex == 0 && hand == "left") {
        doubleBlurt("swapping button callbacks");
        button4 = buttonX;
        button5 = buttonY;
        button11 = buttonA;
        button12 = buttonB;
      }


    }

    for (const button of source.gamepad.buttons) {

      if (button.pressed != prevPressed [gpIndex]) {
        if (buttonDebug)
          addToConsole (kount + ": s " + sIndex + " gp " + gpIndex + " value " + button.value + " pressed " + button.pressed);

        switch (gpIndex) {
          case 4:
            button4 (button.pressed);
            break;
          case 5:
            button5 (button.pressed);
            break;
          case 11:
            button11 (button.pressed);
            break;
          case 12:
            button12 (button.pressed);
            break;
        }

        kount++;
      }
      prevPressed [gpIndex] = button.pressed;


      switch (gpIndex) {
        case 1:
          squeezeValue0 = button.value;
          break;
        case 8:
          squeezeValue1 = button.value;
          break;
      }

      gpIndex++;
    }

    sIndex++;
  }

  checkGamepadsFirstCall = false;
}

function animate() {

  renderer.setAnimationLoop (render);

}

updateKPF ();


function render () {

  if (buttonXpressed) {
    if (buttonXClock.getElapsedTime () > 1) {
		
	}

  }

  var delta = masterClock.getDelta ();

  controls.update ();

  checkGamepads ();

  cleanIntersected ();

  intersectObjects (controller0);
  intersectObjects (controller1);

  renderer.render (scene, camera);

}

function addToConsole (message) {
  XRconsole.addToConsole (message);
}
