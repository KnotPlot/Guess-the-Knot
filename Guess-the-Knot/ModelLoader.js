import * as THREE from '../three/build/three.module.js';

var ModelLoaderVersion = "2026-06-05 17:54:03 CEST";

'use strict';

var ModelLoader = function () {

}


var developer = false;   

ModelLoader.setDeveloper = function (value) {
  developer = value;
  if (developer) console.log ("ModelLoader developer true");
}

ModelLoader.version = function () {
  console.log("ModelLoader version\n" + ModelLoaderVersion);
}

var isPL = false;
ModelLoader.setPL = function (value) {
  isPL = value;
  //console.log("ModelLoader: isPL set to " + isPL);
}

import {  
  KnotPlotBinaryLoader
} from "./KnotPlotBinaryLoader.js";


function formatVector(v) {
  return (v.x.toFixed(4) + ", "
    + v.y.toFixed(4) + ", "
    + v.z.toFixed(4));
}


var verbose = false;
var blurt = true;

var settings = {
  "knotFromCatalogue": "10.102",
  "catalogue": "basic",
  "isPL": "unset",
  "hueStart": 33,
  "hueIncr": "auto",
  "smoothRad": 0.9,
  "cylinderRad": 0.1,
  "beadRad": 0.14,
  "ncur": 1,
  "nseg": 8,
  "gui": false,
  "axes": false,
  "scale": 1,
  "console": false
};


const xAxis = new THREE.Vector3(1, 0, 0);
const yAxis = new THREE.Vector3(0, 1, 0);
const zAxis = new THREE.Vector3(0, 0, 1);

var filamentGroup;
var parentContainerGroup;
var knotMap = new Map();


function sphere(location, radius) {
  radius = 0.18;
  const geometry = new THREE.SphereGeometry(radius, 32, 32);
  const material = new THREE.MeshPhongMaterial({
    color: 'gold'
  });
  const sphere = new THREE.Mesh(geometry, material);
  sphere.position.x = location.x;
  sphere.position.y = location.y;
  sphere.position.z = location.z;
  sphere.castShadow = true;
  return sphere;
}


function cylinder(from, to, radius, colour_not_used) {
  var height = from.distanceTo(to);
  var centre = new THREE.Vector3();
  centre.lerpVectors(from, to, 0.5);

  // TEMPORARRY!!! 
  radius = 0.06;
  var colour = new THREE.Vector3(.2, .3, .4);

  var geometry = new THREE.CylinderGeometry(radius, radius, height, 12);
  var material = new THREE.MeshPhongMaterial({
    color: new THREE.Color(
      colour.x,
      colour.y,
      colour.z)
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


function addPLFilament(filament) {
  if (verbose) {
    console.log("adding " + filament.name + " as PL, radius "
      + filament.radius.toFixed(2) + ", colour " + formatVector(filament.colour));
  }
  var lastVertex = filament.vertex.length - 1;


  for (var i = 0; i <= lastVertex; i++) {
    if (i != lastVertex || filament.closed) {
      var from = filament.vertex[i];
      var to = filament.vertex[(i + 1) % filament.vertex.length];
      var mesh = cylinder(from, to, settings.cylinderRad, filament.colour);
      filamentGroup.add(mesh);
    }
    var beadMesh = sphere(filament.vertex[i], 1.4 * settings.beadRad);
    filamentGroup.add(beadMesh);
  }
}

function addSmoothFilament(filament, colour, radius) {
  var sampleClosedSpline = new THREE.CatmullRomCurve3(filament.vertex);

  sampleClosedSpline.curveType = 'catmullrom';
  sampleClosedSpline.closed = filament.closed;
  //console.log("filament " + filament.index + " colour is " + colour.getStyle());

  var material = new THREE.MeshPhongMaterial({
    color: colour
  });


  var geometry = new THREE.TubeGeometry(sampleClosedSpline,
    filament.vertex.length,
    radius,
    settings.nseg,
    filament.closed
  );
  var mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;


  filamentGroup.add(mesh);
}


var kount = 0;

function plural(kount, name) {

}

function printFilaments(verbose) {
  if (knotMap.size < 1) {
    console.log("no filaments loaded");
    return;
  }
  let text = "--- printFilaments " + kount + " knotMap:\n";

  knotMap.forEach(function (value, key) {
    text += key + "\n";
  });
  //console.log(text);

  
}

var caller;

function addFilaments(modelName, filamentArray, knotName, META_map) {
  // see if this case has already been loaded
  var fname = modelName + "-" + isPL;
  // first hide all previous filamentGroups
  if (knotMap.size > 0) {
    knotMap.forEach(function (value, key) {
      //console.log("hiding " + key);
      value.visible = false;
    });

    if (knotMap.has(fname)) {
      if (developer)
        console.log('fetching ' + fname);
      knotMap.get(fname).visible = true;
      return;
    } 
  }

 
  filamentGroup = new THREE.Group();
  //console.log("-------- addFilaments isPL = " + isPL);
  //console.log(modelName + " filamentArray has length " + filamentArray.length + ", name is " + knotName);

  if (isPL) {
    for (var i = 0; i < filamentArray.length; i++) {
      var filament = filamentArray[i];
      addPLFilament(filament);
    }
  } else {
    for (var i = 0; i < filamentArray.length; i++) {
      var filament = filamentArray[i];
      //console.log ("filament #" + i + " which PL is " + filament.PL);
      if (filament.PL != "unset")
        addPLFilament(filament);
      else {
        var colour = new THREE.Color();
        var hstart = 33.0;

        if (filament.colour == "unset") { // change to HSV!!
          var hincr = 360.0 / filamentArray.length;
          var hue = (hstart + filament.index * hincr) / 360.0;
          if (hue > 1.0)
            hue -= 1.0;
          var s = 1.0;
          var l = 0.5;
          colour.setHSL(hue, s, l);
        } else {
          colour.setRGB(filament.colour.x, filament.colour.y, filament.colour.z);
        }
        var radius = settings.smoothRad;
        if (filament.radius != "unset")
          radius = filament.radius;
        addSmoothFilament(filament, colour, radius);
      }
    }
  }

  var s = 0.05 * settings.scale;
  filamentGroup.scale.x = s;
  filamentGroup.scale.y = s;
  filamentGroup.scale.z = s;
  parentContainerGroup.add(filamentGroup);
  knotMap.set(fname, filamentGroup);
  kount++;
  if (META_map.size > 0) {
    caller(META_map);
  }


  //printFilaments(false);
}

var x = -1;

function testSphere(s) {
  var position = new THREE.Vector3(x, .3, .4);
  x += 0.4;
  console.log("adding test sphere at " + formatVector(position));
  s.add(sphere(position, 0.003));
}

ModelLoader.loadKPF = function (modelName, parentGroup, the_caller) {
  var dotK = modelName + ".k";
  //console.log("about to load `" + dotK + "'");
  caller = the_caller;
  KnotPlotBinaryLoader.load(dotK, addFilaments);

  parentContainerGroup = parentGroup;
}


export {
  ModelLoader
}