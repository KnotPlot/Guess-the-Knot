import * as THREE from '../three/build/three.module.js';

var gtkVersion = "2026-04-08 11:04:36 PDT";

import {
  TrackballControls
} from '../three/examples/jsm/controls/TrackballControls.js';


import {
  VRButton
} from '../three/examples/jsm/webxr/VRButton.js';

import {
  GUI
} from '../three/examples/jsm/libs/lil-gui.module.min.js';

import {
  ModelLoader
} from "./ModelLoader.js";


import {
  KnotPlotBinaryLoader
} from "./KnotPlotBinaryLoader.js";

import {
  Utilities
} from "./Utilities.js";


import {
  Questions
} from "./Questions.js";


"use strict";

var container;
var camera, scene, renderer;
var controller0, controller1;
var controllerGrip0, controllerGrip1;
var inXR;
var allowQuestions = false;

var raycaster, intersected = [];
var tempMatrix = new THREE.Matrix4();

var controls;
const useTrackball = true;

var consoleBase;

function listChildren(object, indent = "") {
  console.log(indent + object.type + " " + object.name);
  if (object.children.length > 0) {
    for (var i = 0; i < object.children.length; i++)
      listChildren(object.children[i], indent + "    ");
  }
}

function toggleVisible(object, text) {
  if (object.name.indexOf(text) == 0)
    object.visible = !object.visible;

  if (object.children.length == 0)
    return;

  for (var i = 0; i < object.children.length; i++)
    toggleVisible(object.children[i], text);

}


var box, boxSize = 4.0;
console.clear();
const currentDate = new Date();

const options = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  hourCycle: 'h23' // Ensures 24-hour format
};

// Formats based on the user's default locale but forces a 24-hour cycle
const formattedDateTime = currentDate.toLocaleString(undefined, options);

console.log (formattedDateTime);

function setBoxSize (size) {
  box.scale.x = box.scale.y = box.scale.z = size;
}

function createBox() {
  var geometry = new THREE.PlaneGeometry(1, 1);
  var material = new THREE.MeshStandardMaterial({
    color: 0x333333,
    roughness: 1.0,
    metalness: 0.0
  });
  


  var face = new THREE.Mesh(geometry, material);
  face.rotation.x = -Math.PI / 2;
  face.position.y = -1;
  face.receiveShadow = true;
  face.visible = true;

  box = face;
  //box = new THREE.Group ();
  //box.add (face);
  //box.visible = true;
  //box.receiveShadow = true;
  setBoxSize(boxSize);
}


var isPL = false;
var developer = false;

var gamepadController = {
  isPL: false,
  visible:true,
  boxVisible: false,
  axes: false,
  developer:false,
  showOBJ:false
};

function setKnot(which) {
}

var currentModel = "monster";
var movieName = "monster";
var movieReady = true;


var guessSets = {
  monster: setKnot("monster"),
  compact: setKnot("compact"),
  PerkoPair: setKnot("perko_pair"),
  Freedman:setKnot ('freeedman'),
  ___knots___: setKnot("something"),
  monster1: setKnot("monster1"),
  monster2: setKnot("monster2"),

  
    unknown: setKnot("unknown"),

  unknown1: setKnot("unknown1"), 
  unknown2: setKnot("unknown2"),

  compact1: setKnot("compact1"),
  compact2: setKnot("compact2"),

  PerkoA: setKnot("PerkoA"),
  PerkoB: setKnot("PerkoB"),
  SquareKnot: setKnot("Square"),
  GrannyKnot: setKnot("Granny"),
  SquareGranny: setKnot("SquareGranny"),

  Brunnian3: setKnot("Brunnian3"),
  Brunnian4: setKnot("Brunnian4"),
  LorenzLink: setKnot("LorenzLink"),
  mosaic1: setKnot("mosaic1"),
  mosaic2: setKnot("mosaic2"),
  mosaic3: setKnot("mosaic3"),
  Ravenna: setKnot("ravenna"),
  CarrickBend: setKnot("carrick-bend"),
  Milnor: setKnot("milnor"),
  endlessKnot: setKnot("endlessKnot"),
  endlessRed: setKnot("endlessRed"),
  BorromeanRings: setKnot("BorromeanRings"),
  test1: setKnot("test1")
 
}


var knots = {


  monster1: setKnot("monster1"),
  monster2: setKnot("monster2"),

  unknown1: setKnot("unknown1"),
  unknown2: setKnot("unknown2"),

  compact1a: setKnot("compact1a"),
  compact1b: setKnot("compact1b"),

  PerkoA: setKnot("PerkoA"),
  PerkoB: setKnot("PerkoB"),
  Brunnian3: setKnot("Brunnian3"),
  Brunnian4: setKnot("Brunnian4"),
  LorenzLink: setKnot("LorenzLink"),
  mosaic1: setKnot("mosaic1"),
  mosaic2: setKnot("mosaic2"),
  mosaic3: setKnot("mosaic3"),
  test1: setKnot("test1")

}

var frame = 1;
var OBJ_mesh;

function add_OBJ_mesh (mesh) {
  OBJ_mesh = mesh;
  OBJ_mesh.scale.setScalar (0.1);
  OBJ_mesh.rotation.x = Math.PI / 2;
  OBJ_mesh.castShadow = true;  
  OBJ_mesh.visible = false;
  scene.add (OBJ_mesh);
}

function loadFrame () {
  //currentModel = "movies/monster/";
  currentModel = "movies/" + movieName + "/";
  if (frame < 10)
    currentModel += "00";
  else if (frame < 100)
    currentModel += "0";
  currentModel += frame;
  updateKPF ();
}

let actionButton = {
  nextFrame: function() {
    if (!movieReady) {
      EphemeralMessage ("not available for " + movieName);
      return;
    }
    
    frame++;
    if (frame > 199)
      frame = 1;
    loadFrame (); 
  },

  prevFrame: function() {
    if (!movieReady) {
      EphemeralMessage ("not available for " + movieName);
      return;
    }
    
    frame--;
    if (frame < 1)
      frame = 199;
    loadFrame ();
  },
  
  testOBJ: function() {
    //gamepadController.showOBJ = true;
    Utilities.loadOBJ ('./models/gumby.obj', add_OBJ_mesh);
  },
  
  testLoader: function () {
    Utilities.test('questions.csv');
  }
  
};

var trackballRotate = {
  scene: setKnot('rotating scene'),
  model: setKnot('rotating model')
}

var params = {
  currentSet: 'monster',
  currentKnot: "monster1",
  trackball: "scene"
  //currentLink: 'PerkoA'  
};

var shadowBox = {

}

var knotGroup;

function META_info(META_map) {
  var META_info = "META info of size " + META_map.size + "\n";
  META_map.forEach(function (value, key) {
    META_info += key + ": " + value + "\n";
  });
  //console.log(META_info);

}

function updateKPF() {
  //console.log("adding model " + currentModel + ' with PL=' + isPL + " to knotGroup");
  ModelLoader.loadKPF(currentModel, knotGroup, META_info);
}


function initGUI() {
  var gui = new GUI({
    width: 300
  });

  var folderExamples = gui.addFolder("Guess the Knot!");

  folderExamples.add(params, 'currentSet', Object.keys(guessSets)).onChange(function () {
    if (params.currentSet != "none") {
      currentModel = params.currentSet;
      movieName = currentModel;
      console.log ('movieName is ' + movieName);  
      askQuestion(currentModel);
      updateKPF();
      if (movieName == "monster" || movieName == "compact" || movieName == "PerkoPair" || movieName == 'Freedman') 
        movieReady = true;  
      else
        movieReady = false;
    }

  });


  gui.add(gamepadController, "visible").onChange(function (value) {
    knotGroup.visible = gamepadController.visible;
    console.log ("knotGroup visible " + knotGroup.visibility);  
  });

  gui.add(gamepadController, "isPL").onChange(function (value) {
    isPL = value;
    ModelLoader.setPL(isPL);
    updateKPF();
  });

  var folderTrackball = gui.addFolder("Trackball");
  folderTrackball.add(params, 'trackball', Object.keys(trackballRotate)).onChange(function () {
    console.log("\n\setting trackball to " + params.trackball);

  });


  gui.add(gamepadController, "boxVisible").onChange(function (value) {
    box.visible = !box.visible;
  });

  gui.add(gamepadController, "axes").onChange(function (value) {
    axesHelper.visible = !axesHelper.visible;
  });
  gui.add (gamepadController, "developer").onChange(function (value) {
    developer = value;
    ModelLoader.setDeveloper (developer);
    KnotPlotBinaryLoader.setDeveloper (developer);
    Questions.setDeveloper (developer);
  });
        
                                                 
  
  gui.add( actionButton, 'nextFrame').name( 'next frame' );
  gui.add( actionButton, 'prevFrame').name( 'previous frame' );
  gui.add (actionButton, "testOBJ").name ('OBJ test');
  gui.add (actionButton, "testLoader").name ('loader test');
  gui.add(gamepadController, "showOBJ").onChange(function (value) {
    OBJ_mesh.visible = value;
  });
                                                


  folderExamples.open();
}

initGUI();
init();
animate();


function toggle() {
  console.log("toggle");
}

function infoFilaments(modelName, filamentArray, knotName) {
  console.log(modelName + " filamentArray has length " + filamentArray.length + ", name is " + knotName);
  //addToConsole (knotName);
  knot.set(knotName, false);
  console.log("--------");

}


var axesHelper;
var trackball;
const keys = {};

function scaleKnotGroup(amount) {
  console.log('up');
  knotGroup.scale.x *= amount;
  knotGroup.scale.y *= amount;
  knotGroup.scale.z *= amount;
}

function aboutX(rot) {
  //console.log('x');
  knotGroup.rotation.x += rot;
}

function aboutY(rot) {
  //console.log('y');
  knotGroup.rotation.y += rot;
}


function aboutZ(rot) {
  console.log('y');
  knotGroup.rotation.z += rot;
}

function toggleTrackBallMode() {
  console.log('toggleTrackBallMode');
}

function handleKeyUp(key) {
  // only handle key up events for now
  // since there are often multiple key down events
  console.log('>' + key + '<');
  var amount = THREE.MathUtils.degToRad(90 / 4);
  switch (key) {
    case '-':
    case '_':
      scaleKnotGroup(1.0 / 1.02);
      break;
    case '+':
    case '=':
      scaleKnotGroup(1.02);
      break;
    case 'w':
    case 'arrowup':
      aboutX(amount);
      break;
    case 'a':
    case 'arrowleft':
      aboutY(amount);
      break;
    case 's':
    case 'arrowdown':
      aboutX(-amount);
      break;
    case 'd':
    case 'arrowright':
      aboutY(-amount);
      break;
    case ' ':
      toggleTrackBallMode();
      break;
  }
}

var keystateMap = new Map();


function createLighting(lightingParent) {
  lightingParent.add(new THREE.HemisphereLight(0x808080, 0x606060));

  var light = new THREE.DirectionalLight(0xffffff);
  light.position.set(0, 6, 0);
  light.castShadow = true;
  light.shadow.camera.top = 2;
  light.shadow.camera.bottom = -2;
  light.shadow.camera.right = 2;
  light.shadow.camera.left = -2;
  light.shadow.mapSize.set(4096, 4096);
  light.intensity = 3;
  lightingParent.add(light);
}


var mouse;
var objects = [];
var timer;

function init() {
  var lightingCamera = false; // get this working!!
  mouse = new THREE.Vector2();
  timer = new THREE.Timer();
  console.log ("Guess-the-Knot version\n" + gtkVersion);

  ModelLoader.version();
  Utilities.version ();
  KnotPlotBinaryLoader.version ();   
  
  trackball = new THREE.Group();
  knotGroup = new THREE.Group();

  // Function to handle key presses
  window.addEventListener('keydown', (event) => {
    //console.log (event.key.toLowerCase () + " down");
  }, false);
  // Function to handle key releases
  window.addEventListener('keyup', (event) => {
    //console.log (event.key.toLowerCase () + " up");
    handleKeyUp(event.key.toLocaleLowerCase());
  }, false);


  inXR = false;

  container = document.createElement('div');
  document.body.appendChild(container);


  scene = new THREE.Scene();  
  

  scene.background = new THREE.Color(0x000022);


  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10);
  camera.position.set(0, 1.6, 3);
  if (lightingCamera) {
    createLighting(camera);
  }


  createBox(boxSize);
  scene.add(box);
  scene.add(knotGroup);



  if (!lightingCamera) {

    createLighting(scene);
  }

  //
  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  renderer.xr.enabled = true;
  //renderer.useLegacyLights = true;
  container.appendChild(renderer.domElement);

  //document.body.appendChild (VRButton.createButton (renderer));



  var geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, -1)
  ]);

  var line = new THREE.Line(geometry);
  line.name = 'line';
  line.scale.z = 5;

  //controller0.add(line.clone());
  //controller1.add(line.clone());

  raycaster = new THREE.Raycaster();

  window.addEventListener('resize', onWindowResize, false);


  controls = new TrackballControls(camera, container);
  controls.rotateSpeed = 5;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;
  controls.keys = [65, 83, 68]; // A S D  
  controls.enabled = true;

  createMovables();

  axesHelper = new THREE.AxesHelper(2.0);
  scene.add(axesHelper);
  axesHelper.visible = false;

}

function loadedModelCallback(model) {
  model.position.y = 1.02;
  //movableObjects.add(model);
}

function createMovables() {

}

function consoleCallback(group) {

  console.log("Guess the Knot! (" + gtkVersion + ")");

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}


var squeezeValue0;
var squeezeValue1;

function squeezeStart(event) { // may not be needed
}

function squeezeEnd(event) {}

function onSelectStart(event) {
  // make this work for groups

  var controller = event.target;

  var intersections = getIntersections(controller);

  if (intersections.length > 0) {

    var intersection = intersections[0];

    tempMatrix.getInverse(controller.matrixWorld);

    var object = intersection.object;
    object.matrix.premultiply(tempMatrix);
    object.matrix.decompose(object.position, object.quaternion, object.scale);
    object.material.emissive.b = 1;
    controller.add(object);

    controller.userData.selected = object;

  }

}

function onSelectEnd(event) {

  var controller = event.target;

  if (controller.userData.selected !== undefined) {

    var object = controller.userData.selected;
    object.matrix.premultiply(controller.matrixWorld);
    object.matrix.decompose(object.position, object.quaternion, object.scale);
    object.material.emissive.b = 0;
    //movableObjects.add(object);

    controller.userData.selected = undefined;

  }


}

function getIntersections(controller) {

  tempMatrix.identity().extractRotation(controller.matrixWorld);

  raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
  raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

 }

function intersectObjects(controller) {
}

function cleanIntersected() {

  while (intersected.length) {

    var object = intersected.pop();
    object.material.emissive.r = 0;

  }

}

var prevPressed = undefined;
var kount = 0;
var buttonDebug = false;

function buttonA(pressed) {
  if (buttonDebug) {
    var s = "A ";
    if (pressed)
      s += "pressed";
    else
      s += "released";
    addToConsole(s);
  }


}

function buttonB(pressed) {
  if (buttonDebug) {
    var s = "B ";
    if (pressed)
      s += "pressed";
    else
      s += "released";
    addToConsole(s);
  }
  box.visible = pressed;
}

var buttonXpressed = false;

function buttonX(pressed) {

}

function doubleBlurt(s) {
  console.log(s);
  addToConsole(s);
}

function buttonY(pressed) {}

var nonVRinit = false;

function VRunavailable() {
  if (nonVRinit)
    return;
  nonVRinit = true;


}

var checkGamepadsFirstCall = true;

var button4 = buttonA;
var button5 = buttonB;
var button11 = buttonX;
var button12 = buttonY;

function checkGamepads() {
  if (prevPressed == undefined) {
    //console.log("creating prevPressed array\n");
    prevPressed = [];
    for (var i = 0; i < 40; i++)
      prevPressed.push(false);
  }

  var session = renderer.xr.getSession();
  if (!session) {
    VRunavailable();
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

      if (button.pressed != prevPressed[gpIndex]) {
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

  renderer.setAnimationLoop(render);

}

updateKPF();


function render() {

  if (buttonXpressed) {
    

  }

  
  controls.update();

  checkGamepads();

  cleanIntersected();


  renderer.render(scene, camera);

}

function addToConsole(message) {
}



function ignore() {

}

const subTitle = document.getElementById ("subTitle");
subTitle.innerHTML = gtkVersion;

const EphemeralMessageText = document.getElementById ("EphemeralMessage");
EphemeralMessageText.style.visibility = "hidden";

function hideEphemeralMessage () {
  EphemeralMessageText.style.visibility = "hidden";
}

function EphemeralMessage (message) {
  console.log (message);
  EphemeralMessageText.innerHTML = message;
  EphemeralMessageText.style.visibility = "visible";
  setTimeout (hideEphemeralMessage, 3000);
}

var intervalID;
var moviePlaying = false;

var masterClock = new THREE.Clock ();

function playMovie () {
  frame = 1
  var numFramesShown = 0;
  var frameStep = 5;
  moviePlaying = true;

  masterClock.getDelta();
  
  intervalID = setInterval(() => {
    if (frame < 200) {
      numFramesShown++;
      loadFrame ();
    }
    else {
      clearInterval (intervalID);
      moviePlaying = false;
      console.log ("showed " + numFramesShown + " frames in " + masterClock.getDelta().toFixed (1) + 's');
    }
    
    //console.log ("frame " + frame);
    frame += frameStep;
  }, 30 * frameStep);
}


function playMovieNew () {
  frame = 1
  var numFramesShown = 0;
  //var frameStep = 5;
  moviePlaying = true;

  masterClock.getDelta();
  
  intervalID = setInterval(() => {
    if (frame <= 40) {
      numFramesShown++;
      loadFrame ();
    }
    else {
      clearInterval (intervalID);
      moviePlaying = false;
      console.log ("showed " + numFramesShown + " frames in " + masterClock.getDelta().toFixed (1) + 's');
    }
    
    //console.log ("frame " + frame);
    frame++;
  }, 150);
}


const findoutButton = document.getElementById ("findout");
findoutButton.addEventListener ('click', () => {
  
  if (movieReady) { 
    if (moviePlaying) {
      EphemeralMessage ("currently finding out!");
      return;
    }
    EphemeralMessage ("here we go!"); 
    playMovie (); 
  }
  else {
    EphemeralMessage ("not working yet for " + movieName);
  }

});


var question = "";
var question_div = document.getElementById ("question");

function askCallback(group) {
  //movableObjects.add(group);
  
  var lines = question.split ('|');

  var html = "";
  var visibility = false;
  
  lines.forEach (function (line) {
    html += line + "<br>";
    if (line.includes ("?"))
      visibility = true;
  });
   question_div.innerHTML = html;
  if (visibility)
    findoutButton.style.visibility = "visible";
  else
    findoutButton.style.visibility = "hidden";
}

Questions.load(function () {
  askQuestion(currentModel);
});

function askQuestion(q) {

  question = Questions.getQuestion(q.toLowerCase());
  askCallback ();
  render();
  
  
}

const btpx = document.getElementById('btn-px');

btpx.addEventListener('click', () => {
    // Example: Rotate a cube in your Three.js scene
    //console.log ('btn-1 clicked');
  aboutX (THREE.MathUtils.degToRad(90 / 4));
})

const btpy = document.getElementById('btn-py');

btpy.addEventListener('click', () => {
    // Example: Rotate a cube in your Three.js scene
    //console.log ('btn-2 clicked');
  aboutY(THREE.MathUtils.degToRad(90 / 4));
})


const btpz = document.getElementById('btn-pz');

btpz.addEventListener('click', () => {
    // Example: Rotate a cube in your Three.js scene
    //console.log ('btn-2 clicked');
  aboutZ(THREE.MathUtils.degToRad(90 / 4));
})

const btmx = document.getElementById('btn-mx');

btmx.addEventListener('click', () => {
    // Example: Rotate a cube in your Three.js scene
    //console.log ('btn-1 clicked');
  aboutX (THREE.MathUtils.degToRad(-90 / 4));
})

const btmy = document.getElementById('btn-my');

btmy.addEventListener('click', () => {
    // Example: Rotate a cube in your Three.js scene
    //console.log ('btn-2 clicked');
  aboutY(THREE.MathUtils.degToRad(-90 / 4));
})

const btmz = document.getElementById('btn-mz');

btmz.addEventListener('click', () => {
    // Example: Rotate a cube in your Three.js scene
    //console.log ('btn-2 clicked');
  aboutZ(THREE.MathUtils.degToRad(-90 / 4));
})


const btsd = document.getElementById('btn-sd');

btsd.addEventListener('click', () => {
    // Example: Rotate a cube in your Three.js scene
    //console.log ('btn-2 clicked');
  scaleKnotGroup(1/1.04);
})


const btsu = document.getElementById('btn-su');

btsu.addEventListener('click', () => {
    // Example: Rotate a cube in your Three.js scene
    //console.log ('btn-2 clicked');
  scaleKnotGroup(1.04);
})

EphemeralMessage ("use the buttons in the lower left to rotate or scale the knot");
console.log ("\n\n\n*************************** THREE.REVISION is:" + THREE.REVISION);


