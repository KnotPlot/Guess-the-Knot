// 2026-03-27 23:12:17 UTC

import * as THREE from '../three/build/three.module.js';


'use strict';

var KnotPlotMovieLoader = function () {

}


import {
  KnotPlotBinaryLoaderMovie
} from "./KnotPlotBinaryLoaderMovie.js";

var frame;

function addFrameToMovie (modelname, filamentArray, ignore, META_map) {
  var nframes = frame.push (filamentArray);
  console.log ("adding frame " + nframes);
}

KnotplotMovieLoader.load = function (filename, callback) {
  frame = new Array ();
  
}


export {
  KnotPlotMovieLoader
}