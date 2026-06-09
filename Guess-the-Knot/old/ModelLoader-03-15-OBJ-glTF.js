import * as THREE from '../../three-js/build/three.module.js';

var ModelLoaderVersion = "2026-03-16 19:40:19 UTC";

'use strict';

var ModelLoader = function () {

}

ModelLoader.version = function () {
  console.log ("modelLoader version is " + ModelLoaderVersion);
}



import {
  MTLLoader
} from "../../three-js/examples/jsm/loaders/MTLLoader.js";
import {
  OBJLoader2
} from "../../three-js/examples/jsm/loaders/OBJLoader2.js"; 
import {
  MtlObjBridge
} from "../../three-js/examples/jsm/loaders/obj2/bridge/MtlObjBridge.js";

import { GLTFLoader } from '../../three-js/examples/jsm/loaders/GLTFLoader.js';

ModelLoader.glTF = function (modelName, parent) {
  const loader = new GLTFLoader ();
  const fileName = 'models/' + modelName + ".glb";
  loader.load(
    fileName,

    // called when the resource is loaded
    function (gltf) {
      parent.add (gltf.scene);
    },

    // called while loading is progressing
    function (xhr) {

      console.log ((xhr.loaded / xhr.total * 100) + '% loaded');

    },
    // called when loading has errors
    function (error) {

      console.log (error + ' An error happened loading ' + fileName);

    }
  );
}


ModelLoader.OBJ = function (modelName, parent) {


  var mtlLoader = new MTLLoader ();


  var fileMTL = "models/" + modelName + ".mtl";


  mtlLoader.load (fileMTL,

    function (mtlParseResult) { // onLoad
      loadOBJ (modelName, mtlParseResult, parent);
    },
    function () { // onProgress

    },
    function () { // onError
      console.log ("error in loading " + fileMTL);
    }
  );
}

function loadOBJ (modelName, mtlParseResult, parent) {
  var objLoader2 = new OBJLoader2();

  var fileOBJ = "models/" + modelName + ".obj";
  objLoader2.setModelName (modelName);
  objLoader2.setLogging (true, true);
  objLoader2.addMaterials (MtlObjBridge.addMaterialsFromMtlLoader (mtlParseResult), true);

  objLoader2.load (fileOBJ,
    function (object3d) { // onLoad
      console.log ("did load " + fileOBJ);
      object3d.name = "KP " + modelName;
      parent.add (object3d);
    },
    function () { // onProgress

    },
    function () { // onError
      console.log ("error loading " + file);
      return undefined;
    });

}


ModelLoader.loadKPF = function (modelName, parent) {
  var dotK = modelName + ".k";
  console.log ("want to load `" + dotK + "'");
}


export {
  ModelLoader
}
