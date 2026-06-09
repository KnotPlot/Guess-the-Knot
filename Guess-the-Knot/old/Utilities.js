import * as THREE from '../three/build/three.module.js';

import {
  OBJLoader
} from '../three/examples/jsm/loaders/OBJLoader.js';

import {
  FileLoader
} from '../three/src/loaders/FileLoader.js';

const version = "2026-04-07 16:15:59 CEST";

var Utilities = function () {

}  

var developer = false;  

Utilities.setDeveloper = function (value) {
  developer = value;
  if (developer) console.log("Utilities developer true");
}


Utilities.version = function () {
  console.log("Utilities version\n" + version);
}

function OBJ_info(mesh) {
  var kount = 1;
  mesh.traverse(function (child) {

    if (child.isMesh) {
      console.log('mesh ' + kount++);
      child.castShadow = true;
      const positions = child.geometry.attributes.position;

      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const z = positions.getZ(i);

        if (i < 11)
          console.log(i + ": " + x.toFixed (6) + ' ' + y.toFixed (6) + ' ' + z.toFixed (6));
      }
    }
  });
}

Utilities.loadOBJ = async function (filename, callback) {
  const loader = new OBJLoader();
  const mesh = await loader.loadAsync(filename,
  );
  callback (mesh);
  //OBJ_info(mesh);
}


Utilities.load = async function (filename, callback) {
  const loader = new FileLoader ();
  const contents = await loader.loadAsync (filename);
  console.log (contents);
}

Utilities.loadCSV = async function (filename, callback) {
  const loader = new FileLoader ();
  const contents = await loader.loadAsync (filename);
  //console.log (contents);
  
  var csvArray = new Array ();
  
  // create an array of arrays
  const line = contents.split ('\n');
  for (var i = 0; i < line.length; i++) {
    csvArray.push (line[i].split (','));
  }
  
  callback (csvArray);
}

function printCSV (csv) {
  console.log (csv.length + ' lines');
  for (var i = 0; i < csv.length; i++) {
    var t = i + ':\n';
    for (var j = 0; j < csv [i].length; j++) {
      t += csv [i][j] + '!';
    }
    
    
    console.log (t);
  }
}

Utilities.test = function (filename) {
  const stuff = Utilities.loadCSV (filename, printCSV);
}

export {
  Utilities
}
