import * as THREE from '../three/build/three.module.js';
// WORKING

import {
  TrackballControls
} from '../three/examples/jsm/controls/TrackballControls.js';
import {
  VRMLLoader
} from '../three/examples/jsm/loaders/VRMLLoader.js';
import {
  PDBLoader
} from '../three/examples/jsm/loaders/PDBLoader.js';
import {
  CSS2DRenderer,
  CSS2DObject
} from '../three/examples/jsm/renderers/CSS2DRenderer.js';
import {
  GUI
} from '../three/examples/jsm/libs/lil-gui.module.min.js';
import {
  proteinsVersion,
  initialProtein,
  PROTEINS
} from './proteins/version.js'; // run update.php in folder proteins to update the protein list
import {
  moleculesVersion, 
  initialMolecule,
  MOLECULES
} from './molecules/version.js'; // run update.php in folder molecules to update the molecule list


let camera, scene, renderer, labelRenderer;
let controls;

let root;
 
const offset = new THREE.Vector3();

init();

var proteinLoader = new VRMLLoader();
var moleculeLoader = new PDBLoader();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050505);

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 5000);
  camera.position.z = 1000;
  scene.add(camera);

  const light1 = new THREE.DirectionalLight(0xffffff, 2.5);
  light1.position.set(1, 1, 1);
  scene.add(light1);

  const light2 = new THREE.DirectionalLight(0xffffff, 1.5);
  light2.position.set(-1, -1, 1);
  scene.add(light2);

  root = new THREE.Group();
  scene.add(root);

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

  controls = new TrackballControls(camera, renderer.domElement);
  controls.minDistance = 500;
  controls.maxDistance = 2000;
  controls.rotateSpeed = 10;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;

  window.addEventListener('resize', onWindowResize);

  const gui = new GUI();
  const menus = {
    protein: initialProtein,
    molecule: initialMolecule
  }

  gui.add(menus, 'protein', PROTEINS).onChange(loadProtein);
  gui.add(menus, 'molecule', MOLECULES).onChange(loadMolecule);
  gui.open();

}

var subTitle = document.getElementById("subTitle");
subTitle.innerHTML = ' ';
var infoURL = document.getElementById("infoURL");
infoURL.innerHTML = ' ';

function showInfo (url, text) {  
  infoURL.innerHTML = '<a href="' + url + '" target="_blank">' + text + '</a>';
}

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

function root_clear () {
    console.log('clearing root');

  root.clear ();
}

function loadProtein(protein) {
  const filename = "./proteins/" + protein;
  console.log('loading ' + filename);
  subTitle.innerHTML = 'loading ' + protein;

  root_clear (); // need to clear properly
  
  proteinLoader.load(filename,
    (object) => {
      object.position.y = 0;
      object.scale.setScalar(2);
      root.add(object);
      const name = protein.split(".")[0];
      subTitle.innerHTML = 'knotted protein ' + name;
      EphemeralMessage ("use the link below to view this protein's page at KnotProt site (opens in a new tab)");
      showInfo ('https://knotprot.cent.uw.edu.pl/view/' + name.replace ('_', '/'), 'more info about ' + name);
    },
    () => {
      console.log('.');
    },
    () => {
      console.log('failed to load ' + protein);
    });
} 

function loadMolecule(molecule) {
  const filename = "./molecules/" + molecule;
  console.log('loading ' + filename);
  subTitle.innerHTML = 'loading ' + molecule;
  infoURL.innerHTML = '';

  root_clear(); // need to clear properly
  moleculeLoader.load(filename, function (pdb) {

    
      const geometryAtoms = pdb.geometryAtoms;
      const geometryBonds = pdb.geometryBonds;
      const json = pdb.json;

      const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
      const sphereGeometry = new THREE.IcosahedronGeometry(1, 3);

      geometryAtoms.computeBoundingBox();
      geometryAtoms.boundingBox.getCenter(offset).negate();

      geometryAtoms.translate(offset.x, offset.y, offset.z);
      geometryBonds.translate(offset.x, offset.y, offset.z);

      let positions = geometryAtoms.getAttribute('position');
      const colors = geometryAtoms.getAttribute('color');

      const position = new THREE.Vector3();
      const color = new THREE.Color();

      for (let i = 0; i < positions.count; i++) {

        position.x = positions.getX(i);
        position.y = positions.getY(i);
        position.z = positions.getZ(i);

        color.r = colors.getX(i);
        color.g = colors.getY(i);
        color.b = colors.getZ(i);

        const material = new THREE.MeshPhongMaterial({
          color: color
        });

        const object = new THREE.Mesh(sphereGeometry, material);
        object.position.copy(position);
        object.position.multiplyScalar(75);
        object.scale.multiplyScalar(25);
        root.add(object);

        const atom = json.atoms[i];

        const text = document.createElement('div');
        text.className = 'label';
        text.style.color = 'rgb(' + atom[3][0] + ',' + atom[3][1] + ',' + atom[3][2] + ')';
        text.textContent = atom[4];

        const label = new CSS2DObject(text);
        label.position.copy(object.position);
        root.add(label);

      }

      positions = geometryBonds.getAttribute('position');

      const start = new THREE.Vector3();
      const end = new THREE.Vector3();

      for (let i = 0; i < positions.count; i += 2) {

        start.x = positions.getX(i);
        start.y = positions.getY(i);
        start.z = positions.getZ(i);

        end.x = positions.getX(i + 1);
        end.y = positions.getY(i + 1);
        end.z = positions.getZ(i + 1);

        start.multiplyScalar(75);
        end.multiplyScalar(75);

        const object = new THREE.Mesh(boxGeometry, new THREE.MeshPhongMaterial({
          color: 0xffffff
        }));
        object.position.copy(start);
        object.position.lerp(end, 0.5);
        object.scale.set(5, 5, start.distanceTo(end));
        object.lookAt(end);
        root.add(object);

      }
  }
    ,
    () => {
      console.log('.');
    },
    () => {   // never seems to fail!
      console.log('failed to load ' + molecule);
    }                  
                      
  )}


  loadProtein(initialProtein);

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
  }

  function animate() {
    controls.update();
    const time = Date.now() * 0.0004;
    render();
  }

  function render() {

    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);

  }
