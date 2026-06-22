import * as THREE from '../three/build/three.module.js';
import {
  TIFFLoader
} from '../three/examples/jsm/loaders/TIFFLoader.js';
import {
  Utilities
} from "./Utilities.js";


var artVersion = "2026-06-22 02:05:00 CEST";
var currentImage = 0;
const imageMap = new Map();
var imageArray = new Array();
const verbose = true;

function addImages(csv) {
  for (var c = 0; c < csv.length; c++) {
    var key = csv [c][0];
    var file = csv [c][1];
    var set = csv [c][2];
    var width = parseInt (csv [c][3]);
    var height = parseInt (csv [c][4]);
    var stuff = csv [c][5];
    if (file != undefined)
      imageMap.set(csv[c][0], [file.trim(), set.trim(), width, height,stuff]);
  }
  var out = "";
  for (const [key, value] of imageMap) {
    out += key + ": " + value[0] + ', ' + value[1] + ', ' + value[2] + 'x' + value[3] + "\n";
  }
  if (verbose)
    console.log(out);
  imageArray = Array.from(imageMap.keys());
  loadImage(currentImage);
}

function loadImages(csv) {
  Utilities.loadCSV(csv, addImages);
}


let renderer, scene, camera;


function init() {

  loadImages("./art/manifest.csv");

  var out = "";
  
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 10);
  camera.position.set(0, 0, 4);

  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  window.addEventListener('resize', onWindowResize);
}

init();

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

var mesh;
const toplabelText = document.getElementById("toplabel");


function loadImage(imageIndex) {
  var imageInfo = imageMap.get(imageArray[imageIndex]);

  var scale = 2.5;
  var xpos = 2;
  var aspect = imageInfo[2] / imageInfo[3];
  var filename = "./art/" + imageInfo[0];
  var name = imageInfo [1];

  console.log(filename + " " + name + " " + aspect.toFixed(3));

  const loader = new TIFFLoader();
  const geometry = new THREE.PlaneGeometry(scale * aspect, scale);


  loader.load(filename, function (texture) {

    texture.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.MeshBasicMaterial({
      map: texture
    });

    if (mesh != undefined) {
      // clean up old mesh and materials
      
      mesh.removeFromParent();
      mesh.geometry.dispose();
      
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(material => material.dispose());
      } else {
        mesh.material.dispose();
      }
    }

    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0, 0);

    scene.add(mesh);

    render();
    toplabelText.innerHTML = name;
    // https://www.w3schools.com/jsref/met_win_open.asp
    stuffatbottom.innerHTML = imageInfo[4];
  });

}  

var kount = 0;

function render() {
  renderer.render(scene, camera);
}

const subTitle = document.getElementById("subTitle");
subTitle.innerHTML = artVersion;

const btpp = document.getElementById('btn-prev');
btpp.addEventListener('click', () => {
  currentImage = (currentImage + imageArray.length - 1) % imageArray.length;
  loadImage(currentImage);
})

const btpx = document.getElementById('btn-next');
btpx.addEventListener('click', () => {
  currentImage = (currentImage + 1) % imageArray.length;
  loadImage(currentImage);
})

const btpr = document.getElementById('btn-random');
btpr.addEventListener('click', () => {
  var cimg = currentImage;
  do {
    currentImage = Math.floor(Math.random() * imageArray.length);
  } while (cimg == currentImage);
  loadImage(currentImage);
})

const stuffatbottom = document.getElementById('stuffatbottom');
stuffatbottom.innerHTML = 'this is the replacement text';
