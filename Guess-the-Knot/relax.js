import * as THREE from '../three/build/three.module.js';
// WORKING

import {
  TrackballControls
} from '../three/examples/jsm/controls/TrackballControls.js';

import {
  TransformControls
} from '../three/examples/jsm/controls/TransformControls.js';

import {
  CSS2DRenderer,
  CSS2DObject
} from '../three/examples/jsm/renderers/CSS2DRenderer.js';

import {
  Line2
} from '../three/examples/jsm/lines/Line2.js';
import {
  LineGeometry
} from '../three/examples/jsm/lines/LineGeometry.js';
import {
  LineMaterial
} from '../three/examples/jsm/lines/LineMaterial.js';


/*
  
https://lil-gui.georgealways.com
https://lil-gui.georgealways.com/examples/kitchen-sink/
see
https://lil-gui.georgealways.com/#Guide
for how to change the menus from elsewhere

*/

import {
  GUI
} from '../three/examples/jsm/libs/lil-gui.module.min.js';


import {
  Utilities
} from "./Utilities.js";


import {
  KnotPlotDynamics
} from "./KnotPlotDynamics.js";


import {
  KnotPlotBinaryLoader
} from "./KnotPlotBinaryLoader.js";

console.log('KnotPlotBinaryLoader version\n' + KnotPlotBinaryLoader.version());
KnotPlotDynamics.version();

let camera, scene, renderer, labelRenderer;
let trackballControls;

let root;

const raycaster = new THREE.Raycaster();

const xAxis = new THREE.Vector3(1, 0, 0);
const yAxis = new THREE.Vector3(0, 1, 0);
const zAxis = new THREE.Vector3(0, 0, 1);
const pointer = new THREE.Vector2();
const origin = new THREE.Vector3(0, 0, 0);

import {
  relaxVersion,
  KNOTS,
  knots,
  startingKnotIndex,
  params,
  maxnbeads
} from './relax/version.js';
var currentKnotIndex = startingKnotIndex;

var currentKnot = knots[currentKnotIndex];


const offset = new THREE.Vector3();

const displayMethod = {
  'old': 'old',
  'new': 'new'
}


var method = {
  'method': 'old'
}
//init();
var targetSteps = Infinity;
let transformKontrol;



var objectToMove;
var pointerIsDown = false;
var magnetBead;

var intersectionInfo;

function matrixPring(matrix) {
  var out = "";

  for (var i = 0; i < matrix.elements.length; i++) {
    out += matrix.elements[i].toFixed(2) + ' ';
    if (i % 4 == 3)
      out += '\n';
  }
  return out;
}


function tetra_not_used(pos) {
  // 1. Create the geometry (radius of 1)
  const geometry = new THREE.TetrahedronGeometry(1);

  // 2. Create a blue material
  const material = new THREE.MeshStandardMaterial({
    color: 0x0000ff
  });

  // 3. Create the mesh and add it to your scene
  const tetrahedron = new THREE.Mesh(geometry, material);
  root.add(tetrahedron);

}

var rayDirectionAtDown;
var rayOriginAtDown;
var beadToMove;
var distanceAtDown;
var beadPositionAtDown = new THREE.Vector3();

var lookDirection = new THREE.Vector3();

function onPointerDown(event) {
  //console.log('onPointerDown');
  if (!redHandle.visible) return;
  rayDirectionAtDown = raycaster.ray.direction;
  rayOriginAtDown = raycaster.ray.origin;
  beadToMove = intersectionInfo.object;

  //console.log(raycaster.ray.origin, raycaster.ray.direction);
  distanceAtDown = intersectionInfo.distance;

  var out = '';
  out += intersectionInfo.object.name;
  out += '\nposition ' + stringVector3(intersectionInfo.object.position);
  out += '\ndistance ' + intersectionInfo.distance;
  out += '\n\n ' + matrixPring(camera.matrixWorld);
  out += '\ndirection ' + stringVector3(raycaster.ray.direction, 3);
  trackballControls.enabled = false;
  greenHandle.visible = true;
  greenHandle.position.set(1022, 0, 0);
}

function onPointerUp(event) {
  //console.log('onPointerUp');
  trackballControls.enabled = true;
  greenHandle.visible = false;
  magnetOn = false;
  greenHandle.position.set(1022, 0, 0);
  footer.innerHTML = '';
  magnetLine.visible = false;
}

var magnetPosition;
var localPoint;
var magnetOn = false;

function onPointerMove(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;


  raycaster.setFromCamera(pointer, camera);

  if (!magnetOn) {
    const intersects = raycaster.intersectObjects(beadArray, false);
    if (intersects.length > 0) {
      intersectionInfo = intersects[0];
      const object = intersects[0].object;
      if (!object.visible)
        console.log('fix not visibles! ' + object.name + ' ' + object.visible);
      redHandle.visible = true;
      redHandle.position.copy(object.position);
      beadPositionAtDown.copy(object.position);
    } else {
      redHandle.visible = false;
    }
  }

  if (!greenHandle.visible)
    return;

  redHandle.visible = false;

  var out = beadToMove.name; 

  var v1 = rayDirectionAtDown.clone();
  v1.multiplyScalar(distanceAtDown);

  v1.add(rayOriginAtDown);

  var loc = beadToMove.worldToLocal(v1.clone());

  if (loc.length() > 15) {
    console.log ('*** bad location ' + stringVector3(loc));
    magnetLine.visible = false;
    magnetOn = false;
    animating = false;
    return;
  }
  
  greenHandle.position.set(beadPositionAtDown.x + loc.x,
    beadPositionAtDown.y + loc.y,
    beadPositionAtDown.z + loc.z);

  updateMagnetLinePositions(); 
  magnetLine.visible = true;

  out += '<br>' + stringVector3(greenHandle.position, 1, '&nbsp;&nbsp;&nbsp;');
  //console.log(out);
  footer.innerHTML = out;
  magnetOn = true;
  
  KnotPlotDynamics.setMagnet (magnetOn, greenHandle.position, beadToMove);
}

var pointer2 = false;


function togglePointerMode() {

}


function changeColour(colour) {
  for (var i = 0; i < cylinderArray.length; i++) {
    cylinderArray[i].material.color.setRGB(colour.x, colour.y, colour.z);
  }
}

function changeColourRandom() {
  for (var i = 0; i < cylinderArray.length; i++) {
    cylinderArray[i].material.color.setRGB(Math.random(), Math.random(), Math.random());
  }
}


init();

var greenHandle;
var redHandle;
var magnetLine;

function creategreenHandle() {
  const geometry = new THREE.IcosahedronGeometry(0.7, 0);

  const material = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    wireframe: true
  });

  greenHandle = new THREE.Mesh(geometry, material);
  greenHandle.visible = false;

}

function createredHandle() {
  const geometry = new THREE.IcosahedronGeometry(0.7, 0);

  const material = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    wireframe: true
  });

  redHandle = new THREE.Mesh(geometry, material);
  redHandle.visible = false;

}

function createMagnetLine() {
  // Define positions as a flat array [x1, y1, z1, x2, y2, z2, ...]
  const positions = [-10, 0, 0, 0, 5, 0, 10, 0, 0];

  const geometry = new LineGeometry();
  geometry.setPositions(positions);

  const material = new LineMaterial({
    color: 0x00ff00,
    linewidth: 3, // Width in pixels (or world units if worldUnits: true)
    resolution: new THREE.Vector2(window.innerWidth, window.innerHeight) // Required for correct rendering
  });

  magnetLine = new Line2(geometry, material);
  magnetLine.visible = false;
}

function updateMagnetLinePositions() {
  if (greenHandle.position.length() > 17) {
    console.log ('*** invalid position! ' + stringVector3(greenHandle.position));
    return;
  }
  magnetLine.geometry.setPositions([greenHandle.position.x, greenHandle.position.y, greenHandle.position.z,
    beadToMove.position.x, beadToMove.position.y, beadToMove.position.z
  ]);
}

function init() {

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050044);
  //scene.background = new THREE.Color(0xffffff);

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 5000);
  camera.position.z = 600;
  scene.add(camera);

  const light1 = new THREE.DirectionalLight(0xffffff, 2.5);
  light1.position.set(1, 1, 1);
  scene.add(light1);

  const light2 = new THREE.DirectionalLight(0xffffff, 1.5);
  light2.position.set(-1, -1, 1);
  scene.add(light2);

  const light3 = new THREE.DirectionalLight(0xffffff, 1.5);
  light3.position.set(1,1, -1);
  scene.add(light3);


  const light4 = new THREE.DirectionalLight(0xffffff, 1.5);
  light4.position.set(-1,-1, -1);
  scene.add(light4);


  root = new THREE.Group();
  root.scale.x = root.scale.y = root.scale.z = 33;

  scene.add(root);

  creategreenHandle();
  createredHandle();
  createMagnetLine();
  //  

  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  document.getElementById('container').appendChild(renderer.domElement);

  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0px';
  labelRenderer.domElement.style.pointerEvents = 'none';
  document.getElementById('container').appendChild(labelRenderer.domElement);

  //    

  trackballControls = new TrackballControls(camera, renderer.domElement);
  trackballControls.minDistance = 102.2;
  //controls.maxDistance = 3000;
  trackballControls.rotateSpeed = 10;
  trackballControls.zoomSpeed = 1.2;
  trackballControls.panSpeed = 0.8;

  transformKontrol = new TransformControls(camera, renderer.domElement);
  const gizmo = transformKontrol.getHelper();
  scene.add(gizmo);
  transformKontrol.setMode('translate'); //rgs
  transformKontrol.setSpace('world');
  transformKontrol.addEventListener('change', render);
  transformKontrol.addEventListener('dragging-changed', function (event) {

    console.log('dragging changed to ' + event.value);
    trackballControls.enabled = !event.value;

    if (event.value)
      transformKontrol._gizmo.visible = false;


  });


  loadKnot(currentKnot);


  window.addEventListener('resize', onWindowResize);
  document.addEventListener('pointermove', onPointerMove);
  document.addEventListener('pointerdown', onPointerDown);
  document.addEventListener('pointerup', onPointerUp);

  let actionButton = {
    step: function () { 
      KnotPlotDynamics.step();
      targetSteps = Infinity;
    },
    info: function () {
      KnotPlotDynamics.infoLocation();
    },
    go3: function () {
      animating = !animating;
      targetSteps = Infinity;
      setTimeout(function () {
        animating = false;
        console.log('stopping');
      }, 3000);
    },
    go25: function () {
      animating = !animating;
      targetSteps = Infinity;
      setTimeout(function () {
        animating = false;
        console.log('stopping');
      }, 25000);
    },
    goSteps: function () {
      targetSteps = step2 + 1022;
      animating = true;
    },
    go: function () {
      animating = !animating;
      targetSteps = Infinity;
      if (animating)
        console.log('animating...');
      else
        console.log('stopped');
    }
  }


  const gui = new GUI();

  gui.add(params, 'knot', KNOTS).onChange(loadKnot);
  gui.add(actionButton, 'step').name('step');
  gui.add(actionButton, 'info').name('info');
  gui.add(actionButton, 'go3').name('go for 3 seconds');
  gui.add(actionButton, 'go25').name('go for 25 seconds');
  gui.add(actionButton, 'goSteps').name('go for 1022 steps');
  gui.add(actionButton, 'go').name('go');
  

  gui.open();

}

const toplabel = document.getElementById("toplabel");


function META_info(META_map) {
  var META_info = "META info of size " + META_map.size + "\n";
  META_map.forEach(function (value, key) {
    META_info += key + ": " + value + "\n";
    if (key == 'name')
      toplabel.innerHTML = value;
  });
  console.log(META_info);
}

function sphere(location, radius, colour) {
  radius = 0.18;
  const geometry = new THREE.SphereGeometry(radius, 32, 32);
  const material = new THREE.MeshPhongMaterial({
    color: colour
  });
  const sphere = new THREE.Mesh(geometry, material);
  sphere.position.x = location.x;
  sphere.position.y = location.y;
  sphere.position.z = location.z;
  sphere.castShadow = true;
  return sphere;
}


function cylinder(from, to, radius) {
  var height = from.distanceTo(to);
  var centre = new THREE.Vector3();
  centre.lerpVectors(from, to, 0.5);


  var geometry = new THREE.CylinderGeometry(radius, radius, height, 12);
  var material = new THREE.MeshPhongMaterial({
    color: new THREE.Color(
      componentColour.x,
      componentColour.y,
      componentColour.z)
  });


  var mesh = new THREE.Mesh(geometry, material);
  mesh.position.x = centre.x;
  mesh.position.y = centre.y;
  mesh.position.z = centre.z;

  var dir = new THREE.Vector3();
  dir.subVectors(to, from);
  dir.normalize();
  mesh.quaternion.setFromUnitVectors(yAxis, dir);
  mesh.castShadow = true;

  return mesh;

}

function form(vect) {
  return vect.x.toFixed(3) + ' ' + vect.y.toFixed(3) + ' ' + vect.z.toFixed(3);
}

function vprint(v) {
  return v.x.toFixed(3) + ', ' + v.y.toFixed(3) + ', ' + v.z.toFixed(3);
}


var beadArray = new Array();
var cylinderArray = new Array();
var beadLoc = new Array();
var cylinderLoc = new Array();

var cylinderMatrix;

function updateArrays(location, number_of_beads) {
  console.log('updateArrays from ' + beadArray.length + ' to ' + number_of_beads);
  var out = '';
  if (beadArray.length == 0) {
    console.log('clearing root');
    root.clear();
    root.add(greenHandle);
    root.add(redHandle);
    root.add(magnetLine);
  }

  var i = beadArray.length;

  do {
    var next = (i + 1) % number_of_beads;
    //out += 'adding cylinder and bead ' + i + '\n';

    var mfrom = new THREE.Vector3(0, 0, -1);
    var mto = new THREE.Vector3(0, 0, 1);

    var cylinderMesh = cylinder(mfrom, mto, 0.1); // make changable  
    cylinderMesh.position.x = cylinderMesh.position.y = cylinderMesh.position.z = 0.0;
    cylinderMesh.name = 'cylinder ' + i;
    root.add(cylinderMesh);
    cylinderArray.push(cylinderMesh);
    //cylinderMatrix = cylinderMesh.matrix.clone();

    var beadMesh = sphere(location[i], 0.12, 'yellow');
    beadMesh.name = "bead " + i;
    //transformKontrol.attach(beadMesh);   the UI should have nothing to do with the geometry!!
    //dragMesh = beadMesh;    
    beadMesh.position.x = beadMesh.position.y = beadMesh.position.z = 0.0;
    beadArray.push(beadMesh);

    root.add(beadMesh);
    i++;
  } while (beadArray.length < number_of_beads);
  //console.log(out);

}

var step2 = 0;

function updateKnot(location, number_of_beads) {
  if (targetSteps < Infinity) {
    if (step2 >= targetSteps - 1) {
      animating = false;
      console.log('stopped');
    }
  }

  var out = 'updateKnot ' + number_of_beads + ' ' + step2++ + '\n';

  if (cylinderArray.length < number_of_beads)
    updateArrays(location, number_of_beads);

  var viz = true;

  for (var v = 0; v < beadArray.length; v++) {
    if (v >= number_of_beads)
      viz = false;

    beadArray[v].visible = viz;
    beadArray[v].position.set(9999999, 0, 0);
    cylinderArray[v].visible = viz;
  }
  //updateMagnetLinePositions();

  const currentDir = new THREE.Vector3(0, 0, 1);

  for (var i = 0; i < number_of_beads; i++) {
    var next = (i + 1) % number_of_beads;
    var from = location[i];
    var to = location[next];
    const targetDir = new THREE.Vector3(to.x - from.x, to.y - from.y, to.z - from.z);

    var length = targetDir.length();

    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(currentDir, targetDir.normalize());

    cylinderArray[i].position.x = (from.x + to.x) / 2;
    cylinderArray[i].position.y = (from.y + to.y) / 2;
    cylinderArray[i].position.z = (from.z + to.z) / 2;
    cylinderArray[i].scale.y = length / 2;
    cylinderArray[i].rotation.set(Math.PI / 2, 0, 0);
    cylinderArray[i].applyQuaternion(quaternion);

    beadArray[i].position.x = from.x;
    beadArray[i].position.y = from.y;
    beadArray[i].position.z = from.z;
  }
  render();
}

function stringVector3(v, places, separator) {
  if (places == undefined)
    places = 1;
  if (separator == undefined)
    separator = ', ';
  return v.x.toFixed(places) + separator + v.y.toFixed(places) + separator + v.z.toFixed(places);
}

function stringVector2(v) {
  return 'sf ' + v.x;
  //return v.x.toFixed(1) + ', ' + v.y.toFixed(1);
}


KnotPlotDynamics.setValues(maxnbeads);
KnotPlotDynamics.setCallback(updateKnot);

var componentColour = new THREE.Vector3(0, 0.0, 0);


function process(modelname, filamentArray, ignore, metaMap) {
  console.log('*** loaded ' + modelname);
  META_info(metaMap);
  var stuff = "";

  for (var comp = 0; comp < filamentArray.length; comp++) {
    stuff += "component " + comp + '\n';
    var filament = filamentArray[comp];
    //componentColour = filament.colour;
    //console.log ('componentColour is ---> ' + stringVector3(componentColour));
    updateKnot(filament.vertex, filament.vertex.length);
    KnotPlotDynamics.load(filament.vertex);
    changeColour(filament.colour);

  }


  console.log(stuff);
}

function loadKnot(knot) {
  // *** need to find out how to update the menu setting when the prev / next / random buttons are used
  var model = 'relax/' + knot;
  currentKnotIndex = knots.indexOf(knot);
  KnotPlotBinaryLoader.load(model, process);
}

//

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);

}

var animating = false;

function animate() {

  trackballControls.update();

  const time = Date.now() * 0.0004;

  if (animating) {
    KnotPlotDynamics.step();
    if (magnetOn)
      updateMagnetLinePositions();
  }

  render();

}

function render() {

  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);

}

const subTitle = document.getElementById("subTitle");
subTitle.innerHTML = relaxVersion;

function loadByIndex(im) {
  console.log(im);
  currentKnot = knots[im];
  loadKnot(currentKnot);
}

const footer = document.getElementById('footerText');
footer.innerHTML = "";

const btpp = document.getElementById('btn-prev');
btpp.addEventListener('click', () => {
  currentKnotIndex = (currentKnotIndex + knots.length - 1) % knots.length;
  loadByIndex(currentKnotIndex);
})

const btpx = document.getElementById('btn-next');
btpx.addEventListener('click', () => {
  currentKnotIndex = (currentKnotIndex + 1) % knots.length;
  loadByIndex(currentKnotIndex);
})

const btpr = document.getElementById('btn-random');
btpr.addEventListener('click', () => {
  var cimg = currentKnotIndex;
  do {
    currentKnotIndex = Math.floor(Math.random() * knots.length);
  } while (cimg == currentKnotIndex);
  loadByIndex(currentKnotIndex);
})
