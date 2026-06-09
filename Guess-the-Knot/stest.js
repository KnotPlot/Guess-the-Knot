// WORKING

import * as THREE from '../three/build/three.module.js';

import {
  GUI
} from '../three/examples/jsm/libs/lil-gui.module.min.js';

import {
  OrbitControls
} from '../three/examples/jsm/controls/OrbitControls.js';
import {
  TransformControls
} from '../three/examples/jsm/controls/TransformControls.js';
			
import { OBJLoader } from '../three/examples/jsm/loaders/OBJLoader.js';
console.log ('OBJ!!');

let container;
let camera, scene, renderer;
const splineHelperObjects = [];
let splinePointsLength = 4;
const positions = [];
const point = new THREE.Vector3();

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const onUpPosition = new THREE.Vector2();
const onDownPosition = new THREE.Vector2();

const geometry = new THREE.BoxGeometry(20, 20, 20);
let transformControl;

const ARC_SEGMENTS = 200;

const splines = {};

const params = {
  uniform: false,
  tension: 0.5,
  centripetal: true,
  chordal: false,
  addPoint: addPoint,
  removePoint: removePoint,
  exportSpline: exportSpline,
  reloadKnot: reloadKnot
};

init();

function init() {

  container = document.getElementById('container');

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.set(0, 250, 1000);
  scene.add(camera);

  scene.add(new THREE.AmbientLight(0xf0f0f0, 3));
  const light = new THREE.SpotLight(0xffffff, 4.5);
  light.position.set(0, 1500, 200);
  light.angle = Math.PI * 0.2;
  light.decay = 0;
  light.castShadow = true;
  light.shadow.camera.near = 200;
  light.shadow.camera.far = 2000;
  light.shadow.bias = -0.000222;
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;
  scene.add(light);

  const planeGeometry = new THREE.PlaneGeometry(2000, 2000);
  planeGeometry.rotateX(-Math.PI / 2);
  const planeMaterial = new THREE.ShadowMaterial({
    color: 0x333333,
    opacity: 0.2
  });

  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.position.y = -200;
  plane.receiveShadow = true;
  scene.add(plane);

  const helper = new THREE.GridHelper(2000, 55);
  helper.position.y = -1;
  helper.material.opacity = 0.25;
  helper.material.transparent = true;
  scene.add(helper);

  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  /*
  const gui = new GUI();

  gui.add(params, 'uniform').onChange(render);
  gui.add(params, 'tension', 0, 1).step(0.01).onChange(function (value) {

    splines.uniform.tension = value;
    updateSplineOutline();
    render();

  });
  gui.add(params, 'centripetal').onChange(render);
  gui.add(params, 'chordal').onChange(render);
  gui.add(params, 'addPoint');
  gui.add(params, 'removePoint');
  gui.add(params, 'exportSpline');
  gui.add(params, 'reloadKnot');
  gui.open();
*/
  // Controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.damping = 0.2;
  controls.addEventListener('change', render);

  transformControl = new TransformControls(camera, renderer.domElement);
  transformControl.addEventListener('change', render);
  transformControl.addEventListener('dragging-changed', function (event) {

    controls.enabled = !event.value;

  });
  scene.add(transformControl.getHelper());

  transformControl.addEventListener('objectChange', function () {

    updateSplineOutline();

  });

  document.addEventListener('pointerdown', onPointerDown);
  document.addEventListener('pointerup', onPointerUp);
  document.addEventListener('pointermove', onPointerMove);
  window.addEventListener('resize', onWindowResize);

  /*******
   * Curves
   *********/

  for (let i = 0; i < splinePointsLength; i++) {

    addSplineObject(positions[i]);

  }

  positions.length = 0;

  for (let i = 0; i < splinePointsLength; i++) {

    positions.push(splineHelperObjects[i].position);

  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(ARC_SEGMENTS * 3), 3));

  let curve = new THREE.CatmullRomCurve3(positions);
  curve.curveType = 'catmullrom';
  curve.mesh = new THREE.Line(geometry.clone(), new THREE.LineBasicMaterial({
    color: 0xff0000,
    opacity: 0.35
  }));
  curve.mesh.castShadow = true;
  splines.uniform = curve;

  curve = new THREE.CatmullRomCurve3(positions);
  curve.curveType = 'centripetal';
  curve.mesh = new THREE.Line(geometry.clone(), new THREE.LineBasicMaterial({
    color: 0x00ff00,
    opacity: 0.35
  }));
  curve.mesh.castShadow = true;
  splines.centripetal = curve;

  curve = new THREE.CatmullRomCurve3(positions);
  curve.curveType = 'chordal';
  curve.mesh = new THREE.Line(geometry.clone(), new THREE.LineBasicMaterial({
    color: 0x0000ff,
    opacity: 0.35
  }));
  curve.mesh.castShadow = true;
  splines.chordal = curve;

  for (const k in splines) {

    const spline = splines[k];
    scene.add(spline.mesh);

  }

  load([

    new THREE.Vector3(-675.668390, 275.886927, 184.561276),
    new THREE.Vector3(-732.381815, 85.970511, -152.537854),
    new THREE.Vector3(-516.447320, 79.063659, -461.544710),
    new THREE.Vector3(-206.169322, 275.172713, -394.928693),
    new THREE.Vector3(-11.994741, 220.096851, -74.765560),
    new THREE.Vector3(204.624147, 233.097511, 230.170269),
    new THREE.Vector3(257.584784, 445.824991, 548.531815),
    new THREE.Vector3(42.464792, 358.413956, 838.573371),
    new THREE.Vector3(-213.541918, 122.536388, 712.156486),
    new THREE.Vector3(-216.030358, 165.843903, 343.412005),
    new THREE.Vector3(-16.282346, 425.381691, 129.528699),
    new THREE.Vector3(280.431089, 337.353039, -76.310249),
    new THREE.Vector3(389.301019, 69.967988, -334.854872),
    new THREE.Vector3(247.696061, 61.688740, -685.889358),
    new THREE.Vector3(-48.396885, 273.120563, -821.565104),
    new THREE.Vector3(-340.613092, 479.423085, -675.193521),
    new THREE.Vector3(-462.761323, 416.476156, -328.169111),
    new THREE.Vector3(-295.627023, 106.409182, -208.359257),
    new THREE.Vector3(27.404440, 108.593700, -373.797152),
    new THREE.Vector3(303.140653, 383.201515, -425.493203),
    new THREE.Vector3(625.267790, 443.726965, -232.106620),
    new THREE.Vector3(736.853843, 293.858510, 108.836749),
    new THREE.Vector3(590.616310, 106.950487, 418.218120),
    new THREE.Vector3(238.363134, 89.356663, 563.533625),
    new THREE.Vector3(-71.482617, 332.073110, 537.484462),
    new THREE.Vector3(-423.371621, 438.451642, 435.465665)


  ]);

  render();

}

function addSplineObject(position) {

  const material = new THREE.MeshLambertMaterial({
    color: Math.random() * 0xffffff
  });
  const object = new THREE.Mesh(geometry, material);

  if (position) {

    object.position.copy(position);

  } else {

    object.position.x = Math.random() * 1000 - 500;
    object.position.y = Math.random() * 600;
    object.position.z = Math.random() * 800 - 400;

  }

  object.castShadow = true;
  object.receiveShadow = true;
  scene.add(object);
  splineHelperObjects.push(object);
  return object;

}

function addPoint() {

  splinePointsLength++;

  positions.push(addSplineObject().position);

  updateSplineOutline();

  render();

}

function removePoint() {

  if (splinePointsLength <= 4) {

    return;

  }

  const point = splineHelperObjects.pop();
  splinePointsLength--;
  positions.pop();

  if (transformControl.object === point) transformControl.detach();
  scene.remove(point);

  updateSplineOutline();

  render();

}

function updateSplineOutline() {

  for (const k in splines) {

    const spline = splines[k];

    const splineMesh = spline.mesh;
    const position = splineMesh.geometry.attributes.position;

    for (let i = 0; i < ARC_SEGMENTS; i++) {

      const t = i / (ARC_SEGMENTS - 1);
      spline.getPoint(t, point);
      position.setXYZ(i, point.x, point.y, point.z);

    }

    position.needsUpdate = true;

  }

}


async function reloadKnot() {

  console.log ('OBJ about toload');
  const loader = new OBJLoader();
  

  
  
  
const object = await loader.loadAsync( './models/knot.obj' );

  
  
  scene.add( object );

}

function reloadKnot3() {
  var file = 'tmp.txt';

  const reader = new FileReader();
  reader.onload = () => {
    console.log(reader.result);
  };
  reader.onerror = () => {
    console.log('oh no!');
  };
  reader.readAsText(file);
}


const loader = new THREE.FileLoader();
//loader.setResponseType("blob");

function reloadKnotBAD() {
  var fname = 'tmp.txt';

  loader.load(
    fname,

    // onLoad
    function (dataBlob) {
      console.log('loaded @ ' + fname);
      let reader = new FileReader();
      reader.onload = () => {
        console.log(fileReader.result);
      };
    },

    // on Progress
    function (ignore) {},

    // onError
    function (err) {
      console.error("an error happened trying to load " + fname);
    }
  );


  /*
  let fileReader = new FileReader ();
  fileReader.onload = () => {
    console.log (fileReader.result);
  };
  fileReader.onerror = () => {
    console.log ("oh no!, something has happened!");
  }
  fileReader.readAsText ('tmp.txt');
  */
}

function exportSpline() {

  const strplace = [];

  for (let i = 0; i < splinePointsLength; i++) {

    const p = splineHelperObjects[i].position;
    strplace.push(`new THREE.Vector3(${p.x}, ${p.y}, ${p.z})`);

  }

  console.log(strplace.join(',\n'));
  const code = '[' + (strplace.join(',\n\t')) + ']';
  prompt('copy and paste code', code);

}

function load(new_positions) {

  while (new_positions.length > positions.length) {

    addPoint();

  }

  while (new_positions.length < positions.length) {

    removePoint();

  }

  for (let i = 0; i < positions.length; i++) {

    positions[i].copy(new_positions[i]);

  }

  updateSplineOutline();

}

function render() {

  splines.uniform.mesh.visible = params.uniform;
  splines.centripetal.mesh.visible = params.centripetal;
  splines.chordal.mesh.visible = params.chordal;
  renderer.render(scene, camera);

}

function onPointerDown(event) {

  onDownPosition.x = event.clientX;
  onDownPosition.y = event.clientY;

}

function onPointerUp(event) {

  onUpPosition.x = event.clientX;
  onUpPosition.y = event.clientY;

  if (onDownPosition.distanceTo(onUpPosition) === 0) {

    transformControl.detach();
    render();

  }

}

function onPointerMove(event) {

  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObjects(splineHelperObjects, false);

  if (intersects.length > 0) {

    const object = intersects[0].object;

    if (object !== transformControl.object) {

      transformControl.attach(object);

    }

  }

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  render();

}

console.log ('lsfjsdlfk');
