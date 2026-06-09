import * as THREE from '../three/build/three.module.js';

import {
  OBJLoader
} from '../three/examples/jsm/loaders/OBJLoader.js';

const version = "2026-04-05 12:33:55 PDT - 13";

var Utilities = function () {

}

var developer = false;

Utilities.setDeveloper = function (value) {
  developer = value;
  if (developer) console.log("Utilities developer true");
}


var scene;


Utilities.version = function (s) {
  scene = s;
  console.log("Utilities version\n" + version);
}



var OBJ_data;
var OBJ_loader;

function OBJ_info() {
  console.log ("OBJ info:");
    //OBJ_data.scale.x = OJB_data.scale.y = OBJ_data.scale.z = 0.1;

 // OBJ_loader.parse (OBJ_data);
}

Utilities.test = async function () {
  console.log("GUMBY!!!");
  OBJ_loader = new OBJLoader();
  
  OBJ_data = await OBJ_loader.loadAsync('./models/gumby.obj', 
        (object) => {
    object.traverse((child) => {
        if (child.isMesh) {
            // 1. Get the position attribute
            const positions = child.geometry.attributes.position;
            
            // 2. Iterate through each vertex
            for (let i = 0; i < positions.count; i++) {
                const x = positions.getX(i);
                const y = positions.getY(i);
                const z = positions.getZ(i);
                
                console.log(`Vertex ${i}: x=${x}, y=${y}, z=${z}`);
            }
        }
    }                               
                                       
                                       
                                       );
  scene.add( OBJ_data );
  console.log("OBJ file loaded (maybe)");
  setTimeout(() => {
    OBJ_info();
  }, 2000);
}

Utilities.test2 = function () {

}


export {
  Utilities
}
