import * as THREE from '../three/build/three.module.js';


import {
  Utilities
} from "./Utilities.js";


var Questions = function () {}   

var question;
var developer = false;   

Questions.setDeveloper = function (value) {
  developer = value;
  if (developer) console.log ("Questions developer true");
}

var questionsAvailableCallback;

function addQuestions (csv) {
  for (var c = 0; c < csv.length; c++) {
    //console.log (c + " " + csv [c][0] + " zoik " + csv [c][1]);
    question.set (csv [c][0], csv [c][1]);
  }
  questionsAvailableCallback ();
}

Questions.load = function (callback) {
  question = new Map();
  questionsAvailableCallback = callback;
  Utilities.loadCSV ('questions.csv', addQuestions);
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