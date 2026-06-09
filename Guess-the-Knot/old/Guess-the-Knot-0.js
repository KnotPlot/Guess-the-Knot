import * as THREE from '../../three-js/build/three.module.js';

var gtkVersion = 0;

console.log ("Guess the Knot! (Fri 13 Mar 2026 12:14:32)");


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
  TestCharges
} from "./TestCharges.js";

import {
  ModelLoader
} from "../ModelLoader.js";


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
var tempMatrix = new THREE.Matrix4();

var controls;
const useTrackball = true;

var movableObjects;
var consoleBase;
var floor;  

var fixedCharges = [];

var verbose = false;


var gamepadController = {
  buttonA: false,
  buttonB: false,
  buttonX: false,
  buttonY: false,
  verbose: false,
  floorVisible: false,
  testInject: function () {
    for (var i = 0; i < 222; i++) {
      var pos = new THREE.Vector3 ();
      pos.x = 0.1 * (Math.random () - 0.5);
      pos.z = 0.1 * (Math.random () - 0.5);
      pos.y = 0.1 * (Math.random () - 0.5) + 1.02;
      TestCharges.Inject (pos);
    }
  },
  queryParticles: function () {
    TestCharges.QueryParticleState();
  },
  listMovables: function () {
    listChildren(movableObjects);
  },

  toggleKP: function () {
    toggleVisible(movableObjects, "KPcomp");
  },

  toggleCharges: function () {
    toggleVisible (movableObjects, "Fixed charge");
  }
};

function listChildren (object, indent = "") {
  console.log(indent + object.type + " " + object.name);
  if (object.children.length > 0) {
    for (var i = 0; i < object.children.length; i++)
      listChildren(object.children[i], indent + "    ");
  }
}

function toggleVisible (object, text) {
  if (object.name.indexOf (text) == 0)
    object.visible = !object.visible;

  if (object.children.length == 0)
    return;

  for (var i = 0; i < object.children.length; i++)
    toggleVisible (object.children[i], text);

}

function initGUI () {
  var gui = new GUI();

  gui.add (gamepadController, "buttonA").onChange (function (value) {
    buttonA (value);
  });
  gui.add (gamepadController, "buttonB").onChange (function (value) {
    buttonB (value);
  });
  gui.add (gamepadController, "buttonX").onChange (function (value) {
    buttonX (value);
  });
  gui.add (gamepadController, "buttonY").onChange (function (value) {
    buttonY (value);
  });
  gui.add (gamepadController, "verbose").onChange (function (value) {
    verbose = value;
  });
  gui.add (gamepadController, "floorVisible").onChange (function (value) {
    floor.visible = !floor.visible;
  });
  gui.add (gamepadController, "testInject");
  gui.add (gamepadController, "queryParticles");
  gui.add (gamepadController, "listMovables");
  gui.add (gamepadController, "toggleKP");
  gui.add (gamepadController, "toggleCharges");
}

initGUI ();
init ();
TestCharges.SetFixedCharges (fixedCharges); 
animate ();

var masterClock;

function infoFilaments (modelName, filamentArray) {
  console.log (modelName + " filamentArray has length " + filamentArray.length);
}

function init () {
  KnotPlotBinaryLoader.load ("knots/test4.k", infoFilaments);
  KnotPlotBinaryLoader.load ("monster.k", infoFilaments);
  KnotPlotBinaryLoader.load ("notmonster.k", infoFilaments);  
  
  masterClock = new THREE.Clock ();
     
  inXR = false;

  container = document.createElement ('div');
  document.body.appendChild (container);

  scene = new THREE.Scene();
  scene.background = new THREE.Color (0x000022);

  camera = new THREE.PerspectiveCamera (50, window.innerWidth / window.innerHeight, 0.1, 10);
  camera.position.set(0, 1.6, 3);


  var geometry = new THREE.PlaneBufferGeometry (4, 4);
  var material = new THREE.MeshStandardMaterial ({
    color: 0xeeeeee,
    roughness: 1.0,
    metalness: 0.0
  });
  floor = new THREE.Mesh (geometry, material);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  floor.visible = false;
  scene.add (floor);

  scene.add(new THREE.HemisphereLight (0x808080, 0x606060));

  var light = new THREE.DirectionalLight (0xffffff);
  light.position.set(0, 6, 0);
  light.castShadow = true;
  light.shadow.camera.top = 2;
  light.shadow.camera.bottom = -2;
  light.shadow.camera.right = 2;
  light.shadow.camera.left = -2;
  light.shadow.mapSize.set (4096, 4096);
  scene.add(light);


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

  document.body.appendChild (VRButton.createButton(renderer));

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

  controller0.add(line.clone ());
  controller1.add(line.clone ());

  raycaster = new THREE.Raycaster ();

  //

  window.addEventListener ('resize', onWindowResize, false);


  controls = new TrackballControls (camera, container);
  controls.rotateSpeed = 5;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;
  controls.keys = [65, 83, 68];
  controls.enabled = true;

  createMovables();
  TestCharges.Init (addToConsole, scene);

  const axesHelper = new THREE.AxesHelper (1.0);
  scene.add(axesHelper);

  //ModelLoader.glTF("carrick-bend", loadedModelCallback);
}

function loadedModelCallback (model) {
  model.position.y = 1.02;
  movableObjects.add(model);
}

function createMovables () {
  movableObjects = new THREE.Group ();
  movableObjects.name = "Movables";
  scene.add (movableObjects);

  var geometries = [
    new THREE.BoxBufferGeometry (0.2, 0.2, 0.2),
    new THREE.ConeBufferGeometry (0.2, 0.2, 64),
    new THREE.CylinderBufferGeometry (0.2, 0.2, 0.2, 64),
    new THREE.IcosahedronBufferGeometry (0.2, 3),
    new THREE.TorusBufferGeometry (0.2, 0.04, 64, 32)
  ];

  XRconsole.init ("mont", 0.102, consoleCallback);
}

function consoleCallback (group) {
  movableObjects.add (group);

  addToConsole("Guess the Knot! (version 0)");
  addToConsole("button A to add positive charge");
  addToConsole("button X to add negative charge");
  addToConsole("press and hold X to clear all charges");
  addToConsole("use squeeze buttons to inject test charges");

}

function onWindowResize () {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}

// delete a charge
// paint fieldlines


function addChargeFromController (controller, value) {
  var position = new THREE.Vector3 ();
  if (inXR) {
    position.setFromMatrixPosition (controller.matrixWorld);
  } else {
    position.x = 4 * (Math.random () - 0.5);
    position.y = 2 * Math.random ();
    position.z = 4 * (Math.random () - 0.5);
  }
  addCharge (position, value);
}


var fixedChargeKount = 0;

function addCharge (position, value) {
  // length of time squeeze could set the magnitude of the charge
  var colour = 0xff0000;
  if (value > 0)
    colour = 0x00ff00;

  var geometry = new THREE.IcosahedronBufferGeometry (0.2, 3);
  var material = new THREE.MeshStandardMaterial ({
    color: colour,
    roughness: 0.7,
    metalness: 0.0
  });

  var object = new THREE.Mesh (geometry, material);

  object.position.x = position.x;
  object.position.y = position.y;
  object.position.z = position.z;

  //object.scale.setScalar( Math.random() + 0.5 );
  object.scale.setScalar (0.25);

  object.castShadow = true;
  object.receiveShadow = true;
  object.userData = {
    charge: value
  };

  object.name = "Fixed charge " + fixedChargeKount;
  fixedChargeKount++;

  movableObjects.add (object);
  fixedCharges.push (object);

  if (verbose) {
    addToConsole ("charge " + value + " created at ("
      + position.x.toFixed (2) + ", "
      + position.y.toFixed (2) + ", "
      + position.z.toFixed (2) + ")");
  }
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
  if (!pressed)
    addChargeFromController (controller0, 1);
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

function removeFixedCharges () {
  if (fixedCharges.length < 1)
    return;

  // for reasons unknown (but time will tell),
  // moveableObjects.clear ();
  // doesn't work!!

  console.log ("removing fixed charges");

  //console.log ("number of children before is " + movableObjects.children.length);
  for (var fc = 0; fc < fixedCharges.length; fc++) {
    //console.log("removing " + fixedCharges [fc].name);
    movableObjects.remove (fixedCharges[fc]);
  }
  fixedCharges = [];
  TestCharges.SetFixedCharges (fixedCharges);

  //console.log ("number of children after is " + movableObjects.children.length);

}

function buttonX (pressed) {
  buttonXpressed = pressed;
  if (buttonDebug) {
    var s = "X ";
    if (pressed)
      s += "pressed";
    else
      s += "released";
    addToConsole (s);
  }

  if (pressed) {
    buttonXClock.start();
  } else {
    if (buttonXClock.getElapsedTime () < 1)
      addChargeFromController(controller1, -1);
  }

}

function doubleBlurt (s) {
  console.log(s);
  addToConsole (s);
}

function buttonY (pressed) {
  if (buttonDebug) {
    var s = "Y ";
    if (pressed)
      s += "pressed";
    else
      s += "released";
    addToConsole(s);
  }
  if (pressed)
    TestCharges.ToggleDamped ();
}

var nonVRinit = false;

function VRunavailable () {
  if (nonVRinit)
    return;
  nonVRinit = true;

  console.log ("VR unavailable, adding some charges");

  for (var i = 0; i < 11; i++) {
    var position = new THREE.Vector3;
    position.x = Math.random () * 4 - 2;
    position.y = Math.random () * 2;
    position.z = Math.random () * 4 - 2;

    var charge = 1;
    if (Math.random () < 0.5)
      charge = -1;
    addCharge(position, charge);
  }
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
    VRunavailable();
    return;
  }

  if (!inXR)
    removeFixedCharges ();

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
          addToConsole(kount + ": s " + sIndex + " gp " + gpIndex + " value " + button.value + " pressed " + button.pressed);

        switch (gpIndex) {
          case 4:
            button4(button.pressed);
            break;
          case 5:
            button5(button.pressed);
            break;
          case 11:
            button11(button.pressed);
            break;
          case 12:
            button12(button.pressed);
            break;
        }

        kount++;
      }
      prevPressed[gpIndex] = button.pressed;


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

function injectTestChargesWithConroller (controller) {
  var position = new THREE.Vector3();

  position.setFromMatrixPosition (controller.matrixWorld);
  TestCharges.Inject(position);
}

function injectTestCharges () {
  if (!inXR)
    return;


  if (squeezeValue0 > 0.2) {
    injectTestChargesWithConroller (controller0);
  }

  if (squeezeValue1 > 0.2)
    injectTestChargesWithConroller (controller1);

}


function render () {

  if (buttonXpressed) {
    if (buttonXClock.getElapsedTime () > 1)
      removeFixedCharges ();
  }

  var delta = masterClock.getDelta ();

  controls.update ();

  checkGamepads ();
  injectTestCharges ();

  cleanIntersected ();

  intersectObjects (controller0);
  intersectObjects (controller1);

  TestCharges.Update (delta);
  renderer.render (scene, camera);

}

function addToConsole (message) {
  XRconsole.addToConsole (message);
}
