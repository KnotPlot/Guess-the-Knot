import * as THREE from '../three/build/three.module.js';

const version = "2026-06-05 17:54:03 CEST";

var KnotPlotDynamics = function () {

}

KnotPlotDynamics.version = () => {
  console.log("KnotPlotDynamics version\n" + version);
}

// this will be mimicking KnotPlot's old-fashioned style, until something better comes along

var MAX_NUMBER_BEADS;

KnotPlotDynamics.setValues = (maxnbeads) => {
  MAX_NUMBER_BEADS = maxnbeads;
  console.log('maximum number of beads is ' + MAX_NUMBER_BEADS);
}

const HOOKE_SCALE = 0.05;
const CHARGE_SCALE = 0.1;
const TIME_SCALE = 0.05;

var par_charge = 15;
var par_hooke = 1;
var min_elec_dist = 0.1;
var min_mech_dist = 0.1;
var min_elec_dist_sq = 0.01;
var min_mech_dist_sq = 0.01;
var par_electric_force_power = 6.0;
var hooke_scaled = par_hooke * HOOKE_SCALE;
var charge_scaled = par_charge * CHARGE_SCALE;
var par_time_increment = 15;
var time_increment_scaled = par_time_increment * TIME_SCALE;
var electric_force_power_mod = (par_electric_force_power + 1.0) / 2.0;


var force = new THREE.Vector3();
var gravity_direction = new THREE.Vector3();

var location;
var velocity;
var acceleration;
var next_bead;
var prev_bead;
var links;
var numSteps;

var dstep = 1;

var masterClock = new THREE.Clock();


var number_of_beads;
var number_of_components = 1; // for now

var allocated = false;

function stringVector3(v) {
  return v.x.toFixed(1) + ', ' + v.y.toFixed(1) + ', ' + v.z.toFixed(1);
}

function pv (v) {
  return stringVector3(v);
}

function update_constants() {
  hooke_scaled = par_hooke * HOOKE_SCALE;
  charge_scaled = par_charge * CHARGE_SCALE;
  time_increment_scaled = par_time_increment * TIME_SCALE;
  electric_force_power_mod = (par_electric_force_power + 1.0) / 2.0;
}


function allocateBeads() {
  console.log('allocating beads');

  location = new Array();
  velocity = new Array();
  acceleration = new Array();
  next_bead = new Array(MAX_NUMBER_BEADS);
  prev_bead = new Array(MAX_NUMBER_BEADS);


  for (var i = 0; i < MAX_NUMBER_BEADS; i++) {
    location.push(new THREE.Vector3());
    velocity.push(new THREE.Vector3());
    acceleration.push(new THREE.Vector3());
  }
  update_constants();
  allocated = true;
}


KnotPlotDynamics.load = (loc) => {
  if (!allocated)
    allocateBeads();

  number_of_beads = loc.length;
  console.log('loaded ' + number_of_beads + ' beads');
  if (number_of_beads > MAX_NUMBER_BEADS) {
    console.log('*** too many beads!! ' + number_of_beads);
    return;
  }


  for (var i = 0; i < loc.length; i++) {
    location[i].set(loc[i].x, loc[i].y, loc[i].z);
    next_bead[i] = (i + 1) % number_of_beads;
    prev_bead[i] = (i - 1 + number_of_beads) % number_of_beads;
  }
  numSteps = 0;

}


KnotPlotDynamics.updateLocations = (beadNumber, newLocation) => {
  for (var b = 0; b < beadNumber.length; b++) {
    var bead = beadNumber[b];
    console.log('moving bead ' + bead + ' from ' + stringVector3(location[bead]) + ' to ' + stringVector3(newLocation[b]));
    location[bead].x = newLocation[b].x;
    location[bead].y = newLocation[b].y;
    location[bead].z = newLocation[b].z;
  }
}

function elecforce(a, b) {
  var mag_sq, factor;

  force.set(location[a].x, location[a].y, location[a].z);
  force.sub(location[b]);

  var mag = force.length();
  mag_sq = mag * mag;

  if (mag_sq < min_elec_dist_sq) mag_sq = min_elec_dist_sq;
  factor = charge_scaled / Math.pow(mag_sq, electric_force_power_mod);
  force.multiplyScalar(factor);
}

function do_elec_forces() {
  for (var i = 0; i < number_of_beads; i++) {
    for (var j = i + 1; j < number_of_beads; j++) {
      if (i == next_bead[j] || i == prev_bead[j]) continue;
      elecforce(i, j);
      acceleration[i].add(force);
      acceleration[j].sub(force);
    }
  }
}


function mechforce(a, b) {
  var mag_sq, factor;

  force.set(0, 0, 0);

  force.set(location[a].x, location[a].y, location[a].z);
  force.sub(location[b]);


  mag_sq = force.length() * force.length();
  var mag = Math.sqrt(mag_sq);


  if (mag_sq < min_mech_dist_sq)
    factor = 0.0;
  else
    factor = hooke_scaled * mag_sq;   


  force.multiplyScalar(factor);

}

function do_mech_forces() {
  for (var k = 0; k < number_of_beads; k++) {
    var j = next_bead[k];
    mechforce(k, j);
    acceleration[k].sub(force);
    acceleration[j].add(force);
  }

  
  if (!magnetOn || magnetBead == undefined)
    return;

  
   if (magnetBead.position.length() > 15) {
    console.log ('**** bad magnet position of ' + pv(magnetBead.position));
    magnetOn = false;
    return;
  }

  //console.log (stringVector3 (magnetPosition)); 
  force.set (magnetPosition.x, magnetPosition.y, magnetPosition.z);
  
  //console.log ('force ' + pv(force));
  //console.log ('mb ' + magnetBead.name + ' ' + pv (magnetBead.position) + ' index ' + magnetBeadIndex);
               
  force.sub(magnetBead.position);
  //console.log ('sub ' + pv(force));

  var mag_sq = force.length() * force.length();
  var mag = Math.sqrt(mag_sq);
  mag = Math.min (mag, 10.22);
  
  //console.log ('mag ' + mag);
  var factor;
  
  if (mag_sq < min_mech_dist_sq)
    factor = 0.0; 
  else
    factor = hooke_scaled * mag_sq;

  factor = Math.min (3, factor);
  if (factor > 10) {
    return;
  }
  force.multiplyScalar(factor);
  
  acceleration[magnetBeadIndex].add(force);  

  magnetOn = false;
  
}

var magnetOn = false;
var magnetPosition;
var magnetBead;
var magnetBeadIndex;

KnotPlotDynamics.setMagnet = (state, position, bead) => {
  magnetOn = state;
  magnetPosition = position;
  magnetBead = bead;
  var x = magnetBead.name.split (' ');
  magnetBeadIndex = parseInt (x [1]);  
}


function relax_knot_one_step() {
  masterClock.getDelta();
  for (var i = 0; i < number_of_beads; i++) {
    acceleration[i].set(0, 0, 0);
  }
  do_mech_forces();
  do_elec_forces();

  for (var i = 0; i < number_of_beads; i++) {
    location[i].add(acceleration[i].multiplyScalar(time_increment_scaled));
  }
  numSteps++;

}

var delta = masterClock.getDelta();
//console.log('delta is ' + delta);


var callback;

KnotPlotDynamics.setCallback = function (cb) {
  callback = cb;
}

var kount = 0;
var animating = true;

KnotPlotDynamics.step = function () {

  if (callback == undefined) {
    console.log('callback not defined!');
    return;
  }

  relax_knot_one_step();


  if (!animating) {
    console.log('step is ' + numSteps + ' ' + numSteps % dstep);
    /*
    if (numSteps % dstep != 1) {
      console.log ('return!');
      return;  
    }
    */
    console.log('update!');
  }
  callback(location, number_of_beads);
}


KnotPlotDynamics.infoLocation = function () {
  KnotPlotDynamics.info('location', location);
}

KnotPlotDynamics.info = function (what, whichArray) {
  var max = 0.0;
  var min = Infinity;
  var out = what + '  ' + number_of_beads + " beads\n";

  var beadMin, beadMax;

  for (var i = 0; i < number_of_beads; i++) {
    var loc = whichArray[i];
    var length = loc.length();
    if (length < min) {
      min = length;
      beadMin = i;
    }
    if (length > max) {
      max = length;
      beadMax = i;
    }

    out += i + ': ' + loc.x.toFixed(3) + ' ' + loc.y.toFixed(3) + ' ' + loc.z.toFixed(3)
      + '      ' + loc.length().toFixed(1)
      + '\n';
  }
  out += 'min length ' + min.toFixed(1) + ' (' + beadMin + ')'
    + ' max length ' + max.toFixed(1) + ' (' + beadMax + ')' + '\n';
  out += numSteps + ' relaxation steps';
  console.log(out);
}


export {
  KnotPlotDynamics
}
