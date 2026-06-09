import * as THREE from '../three/build/three.module.js';

//import { TIFFLoader } from '../three/addons/loaders/TIFFLoader.js';
import {
  TIFFLoader
} from '../three/examples/jsm/loaders/TIFFLoader.js';

let renderer, scene, camera;

init();

function init() {
    // hard-coded (for now)

  var kellsImage = new Map();
  kellsImage.set('008r.tif', ['8r', 1022, 994]);
  kellsImage.set('013r.tif', ['13r', 1022, 384]);
  kellsImage.set('015v.tif', ['15v', 1022, 463]);
  kellsImage.set('019v.tif', ['19v', 1022, 433]);
  kellsImage.set('034r.tif', ['34r', 759, 1022]);
  kellsImage.set('043v.tif', ['43v', 1022, 553]);
  kellsImage.set('045r.tif', ['45r', 1022, 995]);
  kellsImage.set('114v.tif', ['114v', 1022, 853]);
  kellsImage.set('124r.tif', ['124r', 1022, 729]);
  kellsImage.set('130r.tif', ['130r', 729, 1022]);
  kellsImage.set('250v.tif', ['250v', 609, 1022]);
  kellsImage.set('254r.tif', ['254r', 452, 1022]);
  kellsImage.set('257r.tif', ['257r', 451, 1022]);
  kellsImage.set('257v.tif', ['257v', 615, 1022]);
  kellsImage.set('269r.tif', ['269r', 554, 700]);
  kellsImage.set('269v.tif', ['269v', 434, 1022]);
  kellsImage.set('273v.tif', ['273v', 535, 778]);
  kellsImage.set('291v.tif', ['291v', 798, 1022]);
  
  var kells = Array.from(kellsImage.keys());
  
  var out = "";
  
  
  for (const [key, value] of kellsImage) {
    var aspect = value [1] / value [2];
    out += key + ' in folio ' + value [0] + 
      ' of size ' + value [1] + 'x' + value [2] + ' (' + aspect.toFixed (3) + ')\n';  
  }
  console.log (out);


  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 10);
  camera.position.set(0, 0, 4);

  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  scene = new THREE.Scene();

  const loader = new TIFFLoader();

  var scale = 2.5;
  var xpos = 2;
  var aspect = 1.848;

  const geometry = new THREE.PlaneGeometry(scale * aspect, scale);




  loader.load('./BoK3/043v.tif', function (texture) {

    texture.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.MeshBasicMaterial({
      map: texture
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0, 0);

    scene.add(mesh);

    render();

  });


  window.addEventListener('resize', onWindowResize);

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  render();

}


//

function render() {

  renderer.render(scene, camera);

}
