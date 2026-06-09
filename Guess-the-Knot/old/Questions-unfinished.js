import * as THREE from '../three/build/three.module.js';


import {
  Utilities
} from "./Utilities.js";


var Questions = function () {
  
}   

const question = new Map();
var developer = false;   

Questions.setDeveloper = function (value) {
  developer = value;
  if (developer) console.log ("Questions developer true");
}

function addQuestion 
Questions.load = function () {

}



Questions.getQuestion = function (modelName) {
  if (developer) console.log('***** looking for question ' + modelName);

  if (!question.has(modelName)) {
    return "----";
  }
  return question.get(modelName);
}

export {
  Questions

}