// 2026-03-27 21:58:17 UTC

import * as THREE from '../three/build/three.module.js';


'use strict';

var KnotPlotBinaryLoaderMovie = function () {

}

var currentKnotName;
var isPL_info;
var META_map;

KnotPlotBinaryLoaderMovie.load = function (modelName, callback) {

  isPL_info = "";
  META_map = new Map();
  META_map.set("model", modelName);

  THREE.Cache.enabled = true;
  console.log("KnotPlot Binary File Loader - 2026-03-27 21:58:17 UTC - Friday");
  const loader = new THREE.FileLoader();
  loader.setResponseType("blob");
  loader.load(
    modelName,

    // onLoad
    function (dataBlob) {
      getTheData(dataBlob, modelName, callback);
    },

    // onProgress
    function (xhr) {


    },

    // onError
    function (err) {
      console.error("an error happened trying to load " + modelName);
    }
  );
}

class Filament {
  constructor(index) {
    this.index = index;

    // topological / geometric properties
    this.vertex = [];
    this.closed = true;

    // display properties
    this.name = "comp" + this.index;
    this.colour = "unset";
    this.radius = "unset";
    this.PL = "unset";
  }
}

class ByteReader {
  constructor(arrayBuffer, callback, modelName, kount) {
    this.arrayBuffer = arrayBuffer;
    this.dataView = new DataView(arrayBuffer);
    this.callback = callback;
    this.modelName = modelName;
    this.kount = kount;
    this.filamentArray = [];
    this.filament = new Filament();
    this.index = 0;
    this.byteLength = this.arrayBuffer.byteLength;
    this.knotName = "unset";
  }
  readSByte() {
    return this.dataView.getInt8(this.index++);
  }
  readByte() {
    return this.dataView.getUint8(this.index++);
  }
  readBytes(numBytes) {
    for (var i = 0; i < numBytes; i++)
      this.readByte();
  }
  getString(length) {
    var s = "";
    for (var i = 0; i < length; i++) {
      s += String.fromCharCode(this.readByte());
    }
    return s;
  }
  readInt() {
    var buf = new ArrayBuffer(4);
    var view = new DataView(buf);
    for (var i = 0; i < 4; i++) {
      view.setUint8(i, this.readByte());
    }
    return view.getInt32(0);
  }
  readUnsignedShort() {
    var buf = new ArrayBuffer(2);
    var view = new DataView(buf);
    view.setUint8(0, this.readByte());
    view.setUint8(1, this.readByte());
    return view.getUint16(0);
  }
  readFloat() {
    var buf = new ArrayBuffer(4);
    var view = new DataView(buf);
    for (var i = 0; i < 4; i++) {
      view.setUint8(i, this.readByte());
    }
    return view.getFloat32(0);
  }
  readFVector() {
    var fv = new THREE.Vector3();
    fv.x = this.readFloat();
    fv.y = this.readFloat();
    fv.z = this.readFloat();
    return fv;
  }
  readDouble() {
    var buf = new ArrayBuffer(8);
    var view = new DataView(buf);
    for (var i = 0; i < 8; i++) {
      view.setUint8(i, this.readByte());
    }
    return view.getFloat64(0);
  }
}

var verbose = true;

function IsUpper(s) {
  var t = s.toUpperCase();
  if (s == t)
    return true;
  else
    return false;
}

function handleUnknownSection(br, chunkID) {
  console.log("ignoring section: " + chunkID);

  if (IsUpper(chunkID.charAt(0))) {
    if (IsUpper(chunkID.charAt(1))) { // array chunk
      var numToSkip = br.readInt();
      if (verbose)
        console.log("skipping " + numToSkip + " bytes in array chunk " + chunkID);
      br.readBytes(numToSkip);
    } else { // data chunk
      var value = br.readInt();
      if (verbose)
        console.log("skipping value of " + value + " in data chunk " + chunkID);
    }
  } else { // signal chunk
    if (verbose)
      console.log("skipping signal chunk " + chunkID);
  }

}

// have an option to signal that coords should be interpreted as Y up

function formatVector(v) {
  return (v.x.toFixed(4) + ", "
    + v.y.toFixed(4) + ", "
    + v.z.toFixed(4));
}

function printFilament(filament, kount) {
  var fc = "unset";
  if (filament.colour != "unset")
    fc = formatVector(filament.colour);
  var rad = "unset";
  if (filament.radius != "unset")
    rad = filament.radius.toFixed(2);

  console.log(filament.name + ": "
    + filament.vertex.length + " beads, radius = " + rad + "\n"
    + "              first " + formatVector(filament.vertex[0]) + "\n"
    + "              last  " + formatVector(filament.vertex[filament.vertex.length - 1]) + "\n"
    + "              colour = " + fc + "   PL = " + filament.PL + "\n"
    + "              closed = " + filament.closed + "\n"
  );
}

function handleLOCF(br) {
  var N = br.readInt() / 12; // number of vertices in this section
  //console.log ("LOCF chunk with %d vertices\n", N);

  for (var i = 0; i < N; i++) {
    var v = br.readFVector();
    br.filament.vertex.push(v);
  }

  br.filamentArray.push(br.filament);
}

function handleLOCS(br) {
  // LOCS files take up about half the space of LOCF files
  // without visible differences (in most cases).

  var N = (br.readInt() - 16) / 6; // number of vertices in this section
  //console.log ("LOCS chunk with %d vertices\n", N);
  var scale_factor = br.readFloat();
  var offset = br.readFVector();

  for (var i = 0; i < N; i++) {
    var v = new THREE.Vector3();
    v.x = br.readUnsignedShort();
    v.y = br.readUnsignedShort();
    v.z = br.readUnsignedShort();
    v.multiplyScalar(scale_factor);
    v.add(offset);
    br.filament.vertex.push(v);
  }

  br.filamentArray.push(br.filament);
}

function handleLOCD(br) {
  var N = br.readInt() / 24; // number of vertices in this section
  //console.log ("LOCD chunk with %d vertices\n", N);

  for (var i = 0; i < N; i++) {
    var x = br.readDouble();
    var y = br.readDouble();
    var z = br.readDouble();
    br.filament.vertex.push(new THREE.Vector3(x, y, z));
  }

  br.filamentArray.push(br.filament);
}

function handleLOCI(br) {
  var N = br.readInt() / 12; // number of vertices in this section
  //console.log ("LOCI chunk with %d vertices\n", N);

  // assume (for now) that such a filament is PL
  br.filament.PL = true;

  for (var i = 0; i < N; i++) {
    var x = br.readInt();
    var y = br.readInt();
    var z = br.readInt();
    br.filament.vertex.push(new THREE.Vector3(x, y, z));
  }

  br.filamentArray.push(br.filament);
}

function handleLOCC(br) {
  var N = (br.readInt() - 21) / 3; // number of vertices in this section
  console.log("LOCC chunk with %d vertices\n", N);

  var delta = br.readFVector(); // possibly non-proportional scaling in the three directions
  var start = br.readFVector(); // starting location
  br.filament.vertex.push(start);

  var prev = start;

  for (var i = 1; i < N; i++) {
    var loc = new THREE.Vector3();

    loc.x = prev.x + br.readSByte() * delta.x;
    loc.y = prev.y + br.readSByte() * delta.y;
    loc.z = prev.z + br.readSByte() * delta.z;
    br.filament.vertex.push(loc);
    prev = loc;
  }

  br.filamentArray.push(br.filament);
}

function handleMcyl(br) {
  br.filament.radius = br.readFloat();
}

function handleAttr(br) {
  var attributes = br.readInt();
  if ((attributes & 1) == 1)
    br.filament.closed = true;
  else
    br.filament.closed = false;
}

function handleCOLR(br) {
  br.readInt(); // always 12
  var r = br.readFloat();
  var g = br.readFloat();
  var b = br.readFloat();
  var colour = new THREE.Vector3(r, g, b);
  br.filament.colour = colour;
}

function handleMETA(br) {
  var N = br.readInt();
  var sizeKey = br.readInt();
  var sizeValue = N - sizeKey - 4;
  var key = br.getString(sizeKey);
  var value = br.getString(sizeValue);
  if (key == "isPL")
    isPL_info = value;
  META_map.set(key, value);
  //console.log ("meta info %s:%s\n", key, value);
  //currentKnot.meta = 
}

function handleNAME(br) {
  var N = br.readInt();
  var name = br.getString(N);
  currentKnotName = name;
  console.log("******* knot name is " + name + ", " + currentKnotName);

}

function handlecomp(br, index) {
  //console.log ("new component");
  br.filament = new Filament(index);
}

function handleisPL(br) {
  br.filament.PL = true;
}

function parseKnotPlotFormat(br) {
  console.log("BR #" + br.kount + " started loading KnotPlot file " + br.modelName);

  if (br.arrayBuffer.byteLength < 15) {
    console.log(br.modelName + " doesn't have enough data!");
    return;
  }
  var header = br.getString(12);
  //console.log("header is `" + header + "'");
  if ("KnotPlot 1.0" != header) {
    console.error("file " + br.modelName + " is not a KnotPlot binary file!");
    return;
  }

  while (true) {
    var b = br.readByte();
    if (b == 12)
      break;
  }

  br.readByte(); // skip one character

  var index = 0;
  var looping = true;
  currentKnotName = "unset";

  // start reading data chunks
  do {
    var chunkID = br.getString(4);
    if (chunkID == "endf") {
      console.log("read file " + br.modelName + " good");
      looping = false;
    } else if (chunkID == "LOCF") {
      handleLOCF(br);
    } else if (chunkID == "LOCS") {
      handleLOCS(br);
    } else if (chunkID == "LOCD") {
      handleLOCD(br);
    } else if (chunkID == "LOCI") {
      handleLOCI(br);
    } else if (chunkID == "LOCC") {
      handleLOCC(br);
    } else if (chunkID == "Attr") {
      handleAttr(br);
    } else if (chunkID == "COLR") {
      handleCOLR(br);
    } else if (chunkID == "NAME") {
      handleNAME(br);
    } else if (chunkID == "META") {
      handleMETA(br);
    } else if (chunkID == "Mcyl") {
      handleMcyl(br);
    } else if (chunkID == "comp") {
      handlecomp(br, index++);
    } else if (chunkID == "isPL") {
      handleisPL(br);
    } else {
      handleUnknownSection(br, chunkID);
    }
  } while (looping);

  if (isPL_info != "") {
    // a string of the form 6-10, indicating a range of component numbers that are PL
    var s = isPL_info.split("-");
    for (i = Number(s[0]); i <= Number(s[1]); i++) {
      br.filamentArray[i].PL = true;
      console.log("*** isPL " + i);
    }
  }

  if (verbose) {
    for (var i = 0; i < br.filamentArray.length; i++) {
      printFilament(br.filamentArray[i], i);
    }
  }
  console.log("KnotPlotBinaryLoaderMovie #" + br.kount + " finished loading KnotPlot file " + br.modelName);

  br.callback(br.modelName,
    br.filamentArray,
    currentKnotName,
    META_map); // added 21 March 2026

}

var brKount = 0;

function getTheData(dataBlob, modelName, callback) {
  let fileReader = new FileReader();
  fileReader.onload = function (event) {
    var br = new ByteReader(fileReader.result, callback, modelName, brKount++);
    parseKnotPlotFormat(br);
  }
  fileReader.onerror = function () {
    console.error("some error happened loading file " + modelName);
  }
  fileReader.readAsArrayBuffer(dataBlob);
}


export {
  KnotPlotBinaryLoaderMovie
}


