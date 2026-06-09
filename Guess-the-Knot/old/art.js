import * as THREE from '../three/build/three.module.js';


import {
  TIFFLoader
} from '../three/examples/jsm/loaders/TIFFLoader.js';

var kellsArray;
var kellsMap;


var artVersion = "2026-04-07 12:52:07 PDT";
// hard-coded (for now)



kellsMap = new Map();
kellsMap.set('008r.jpg', ['8r', 1022, 994]);
kellsMap.set('013r.jpg', ['13r', 1022, 384]);
kellsMap.set('015v.jpg', ['15v', 1022, 463]);
kellsMap.set('019v.jpg', ['19v', 1022, 433]);
kellsMap.set('034r.jpg', ['34r', 759, 1022]);
kellsMap.set('043v.jpg', ['43v', 1022, 553]);
kellsMap.set('045r.jpg', ['45r', 1022, 995]);
kellsMap.set('114v.jpg', ['114v', 1022, 853]);
kellsMap.set('124r.jpg', ['124r', 1022, 729]);
kellsMap.set('130r.jpg', ['130r', 729, 1022]);
kellsMap.set('130rc.jpg', ['130r', 1022, 766]);
kellsMap.set('130rc2.jpg', ['130r', 1022, 677]);
kellsMap.set('250v.jpg', ['250v', 609, 1022]);
kellsMap.set('254r.jpg', ['254r', 452, 1022]);
kellsMap.set('257r.jpg', ['257r', 451, 1022]);
kellsMap.set('257v.jpg', ['257v', 615, 1022]);
kellsMap.set('269r.jpg', ['269r', 554, 700]);
kellsMap.set('269v.jpg', ['269v', 434, 1022]);
kellsMap.set('273v.jpg', ['273v', 535, 778]);
kellsMap.set('291v.jpg', ['291v', 798, 1022]);
kellsMap.set('Lindisfarne_139r1.jpg', ['139r', 788, 1022]);       
kellsMap.set('Lindisfarne_139r2.jpg', ['139r', 1022, 585]);
kellsMap.set('LindisfarneChiRiho.jpg', ['?', 981, 1022]);       
kellsMap.set('LindisfarneChiRiho2.jpg', ['?', 1022, 645]);    
kellsMap.set('anni1.jpg', ['?', 1022, 746]);
kellsMap.set('3-man.jpg', ['mandala', 1022, 1022]);
kellsMap.set('2-man.jpg', ['mandala', 1022, 1022]);
kellsMap.set('1-man.jpg', ['mandala', 1022, 1022]);
kellsMap.set('4-man.jpg', ['mandala', 1022, 1022]);
kellsMap.set('5-man.jpg', ['mandala', 1022, 1022]);
kellsMap.set('6-man.jpg', ['mandala', 1022, 1022]);
kellsMap.set('thing.jpg', ['rob', 1022,1022]);
            

kellsArray = Array.from(kellsMap.keys());
var out = "";

for (const [key, value] of kellsMap) {
  var aspect = value[1] / value[2];
  out += key + ' in folio ' + value[0]
    + ' of size ' + value[1] + 'x' + value[2] + ' (' + aspect.toFixed(3) + ')\n';
}
console.log(out);

let renderer, scene, camera;

init();


function init() {

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

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  render();

}

var mesh;
const toplabelText = document.getElementById("toplabel");


function loadImage(imageIndex) {
  var imageInfo = kellsMap.get(kellsArray[imageIndex]);

  var scale = 2.5;
  var xpos = 2;
  var aspect = imageInfo[1] / imageInfo[2];
  var image = "./art/" + kellsArray[imageIndex];
    
   
  console.log("loading " + image + " in folio " + imageInfo[0]
    + ' with aspect ' + aspect.toFixed(3));

  const loader = new TIFFLoader();


  const geometry = new THREE.PlaneGeometry(scale * aspect, scale);


  loader.load(image, function (texture) {

    texture.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.MeshBasicMaterial({
      map: texture
    });

    if (mesh != undefined) {

      // 1. Remove from scene
      mesh.removeFromParent();

      // 2. Dispose geometry
      mesh.geometry.dispose();

      // 3. Dispose material(s)
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
    if (kellsArray[imageIndex][0] == 'a')
       toplabelText.innerHTML = "Anni Albers - Enmeshed I";  
    else if (imageInfo [0] == 'rob')
      toplabelText.innerHTML = "Some Thing -  Rob Scharein";
    else if (imageInfo [0] == 'mandala')
         toplabelText.innerHTML = "Leonardo da Vinci - rendering by Rob Scharein";
    else if (kellsArray[imageIndex][0] == 'L')
         toplabelText.innerHTML = "Lindisfarne Gospels - folio " +  imageInfo[0];
  
     else
         toplabelText.innerHTML = "Book of Kells - folio " +  imageInfo[0];
      

  });

}

var currentImage = 0;

loadImage(0);
//

function render() {

  renderer.render(scene, camera);

}

const subTitle = document.getElementById ("subTitle");
subTitle.innerHTML = artVersion;


const btpp = document.getElementById('btn-prev');
btpp.addEventListener('click', () => {
  currentImage = (currentImage + kellsArray.length - 1) % kellsArray.length;
  loadImage(currentImage);
})

const btpx = document.getElementById('btn-next');
btpx.addEventListener('click', () => {
  currentImage = (currentImage + 1) % kellsArray.length;
  loadImage(currentImage);
})

const btpr = document.getElementById('btn-random');
btpr.addEventListener('click', () => {
  var cimg = currentImage;
  do {
    currentImage = Math.floor(Math.random() * kellsArray.length);
  } while (cimg == currentImage);
  loadImage(currentImage);
})
