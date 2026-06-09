import * as THREE from '../three';

//	import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
//	import { TransformControls } from 'three/addons/controls/TransformControls.js';
import {
  OrbitControls
} from '../three/examples/jsm/controls/OrbitControls.js';
import {
  TransformControls
} from '../three/examples/jsm/controls/TransformControls.js';

let cameraPersp, cameraOrtho, currentCamera;
let scene, renderer, transformControl, orbit;

init();
render();

function init() {

  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const aspect = window.innerWidth / window.innerHeight;

  const frustumSize = 5;

  cameraPersp = new THREE.PerspectiveCamera(50, aspect, 0.1, 100);
  cameraOrtho = new THREE.OrthographicCamera(-frustumSize * aspect, frustumSize * aspect, frustumSize, -frustumSize, 0.1, 100);
  currentCamera = cameraPersp;

  currentCamera.position.set(5, 2.5, 5);

  scene = new THREE.Scene();
  scene.add(new THREE.GridHelper(5, 10, 0x888888, 0x444444));

  const ambientLight = new THREE.AmbientLight(0xffffff);
  scene.add(ambientLight);

  const light = new THREE.DirectionalLight(0xffffff, 4);
  light.position.set(1, 1, 1);
  scene.add(light);

  const texture = new THREE.TextureLoader().load('./textures/truchet.gif', render);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshLambertMaterial({
    map: texture
  });

  orbit = new OrbitControls(currentCamera, renderer.domElement);
  orbit.update();
  orbit.addEventListener('change', render);

  transformControl = new TransformControls(currentCamera, renderer.domElement);
  transformControl.addEventListener('change', render);
  transformControl.addEventListener('dragging-changed', function (event) {

    orbit.enabled = !event.value;

  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  transformControl.attach(mesh);

  const gizmo = transformControl.getHelper();
  scene.add(gizmo);

  // RGS:
  transformControl.setMode('translate');  //rgs
  transformControl.setSpace ('world');
  //transformControl.showX = false;
 // transformControl.showY = false;   
 // transformControl.showZ = false;
  //transformControl._gizmo.visible = false;
  // end RGS
  
  window.addEventListener('resize', onWindowResize);

  window.addEventListener('keydown', function (event) {

    switch (event.key) {

      case 'q':
        transformControl.setSpace(transformControl.space === 'local' ? 'world' : 'local');
        break;

      case 'Shift':
        transformControl.setTranslationSnap(1);
        transformControl.setRotationSnap(THREE.MathUtils.degToRad(15));
        transformControl.setScaleSnap(0.25);
        break;

      case 'w':
        transformControl.setMode('translate');
        break;

      case 'e':
        transformControl.setMode('rotate');
        break;

      case 'r':
        transformControl.setMode('scale');
        break;

      case 'c':
        const position = currentCamera.position.clone();

        currentCamera = currentCamera.isPerspectiveCamera ? cameraOrtho : cameraPersp;
        currentCamera.position.copy(position);

        orbit.object = currentCamera;
        transformControl.camera = currentCamera;

        currentCamera.lookAt(orbit.target.x, orbit.target.y, orbit.target.z);
        onWindowResize();
        break;

      case 'v':
        const randomFoV = Math.random() + 0.1;
        const randomZoom = Math.random() + 0.1;

        cameraPersp.fov = randomFoV * 160;
        cameraOrtho.bottom = -randomFoV * 500;
        cameraOrtho.top = randomFoV * 500;

        cameraPersp.zoom = randomZoom * 5;
        cameraOrtho.zoom = randomZoom * 5;
        onWindowResize();
        break;

      case '+':
      case '=':
        transformControl.setSize(transformControl.size + 0.1);
        break;

      case '-':
      case '_':
        transformControl.setSize(Math.max(transformControl.size - 0.1, 0.1));
        break;

      case 'x':
        transformControl.showX = !transformControl.showX;
        break;

      case 'y':
        transformControl.showY = !transformControl.showY;
        break;

      case 'z':
        transformControl.showZ = !transformControl.showZ;
        break;

      case ' ':
        transformControl.enabled = !transformControl.enabled;
        break;

      case 'Escape':
        transformControl.reset();
        break;

    }

  });

  window.addEventListener('keyup', function (event) {

    switch (event.key) {

      case 'Shift':
        transformControl.setTranslationSnap(null);
        transformControl.setRotationSnap(null);
        transformControl.setScaleSnap(null);
        break;

    }

  });

}

function onWindowResize() {

  const aspect = window.innerWidth / window.innerHeight;

  cameraPersp.aspect = aspect;
  cameraPersp.updateProjectionMatrix();

  cameraOrtho.left = cameraOrtho.bottom * aspect;
  cameraOrtho.right = cameraOrtho.top * aspect;
  cameraOrtho.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  render();

}

function render() {

  renderer.render(scene, currentCamera);

}
