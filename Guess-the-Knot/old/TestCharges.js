
import * as THREE from '../../three-js/build/three.module.js';


var fixedCharges = [];
var addToConsole;
var scene;
const maxParticleCount = 1022;
var particleBuffer;
var location;
var particlesData = [];
var particleCount;
var pointCloud;
var rollingIndex;
var frozen;
var isReady = false;
var maxCoordValue, minCoordValue;

const TWOPI = 6.28318530717958647693;
var dampedDynamics = false;

var TestCharges = function () {


};

function storagePosition() { // where inactive particles are stored
  var position = new THREE.Vector3();
  position.x = 0.1 * (Math.random () - 0.5);
  position.y = 0.1 * (Math.random () - 0.5);
  position.z = 0.1 * (Math.random () - 0.5);
  return position;
}

TestCharges.Init = function (add2con, theScene) {
  addToConsole = add2con;
  scene = theScene;
  rollingIndex = 0;
  particleCount = maxParticleCount - 2;
  maxCoordValue = 7;
  minCoordValue = -maxCoordValue;

  var pointMaterial = new THREE.PointsMaterial({
    color: 0xFFFFFF,
    size: 0.007,
    blending: THREE.AdditiveBlending,
    transparent: true,
    sizeAttenuation: true
  });


  particleBuffer = new THREE.BufferGeometry();
  location = new Float32Array(maxParticleCount * 3);

  for (var i = 0; i < maxParticleCount; i++) {
    var r = 3.0 * Math.random();
    var theta = TWOPI * Math.random();

    var startPos = storagePosition();
    location[i * 3] = startPos.x;
    location[i * 3 + 1] = startPos.y;
    location[i * 3 + 2] = startPos.z;

    // add it to the geometry
    particlesData.push({
      velocity: new THREE.Vector3(0, 0, 0),
      charge: 1.0,
      active: false
    });
  }

  particleBuffer.setDrawRange(0, particleCount);
  particleBuffer.setAttribute('position',
    new THREE.BufferAttribute(location, 3).setUsage(THREE.DynamicDrawUsage));

  // create the particle system
  pointCloud = new THREE.Points(particleBuffer, pointMaterial);
  pointCloud.name = "Test Charges";
  scene.add(pointCloud);

  isReady = true;
}

TestCharges.SetFixedCharges = function (value) {
  fixedCharges = value;
}

TestCharges.ToggleDamped = function (value) {
  dampedDynamics = !dampedDynamics;  
  var s = "switched to ";
  if (!dampedDynamics)
    s += "un";
  s += "damped dynamics";
  addToConsole (s);
}

TestCharges.ListFixedCharges = function () {
  addToConsole("fixedCharges.length is " + fixedCharges.length);

  for (var i = 0; i < fixedCharges.length; i++) {
    var c = fixedCharges[i];
    var p = c.position;
    addToConsole(c.name + " " + c.userData.charge + " at ("
      + p.x.toFixed(2) + ", "
      + p.y.toFixed(2) + ", "
      + p.z.toFixed(2) + ")"
    );
  }
}

function ppVector (vect) {  // pretty print a vector
  var s = "(";
  s += vect.x.toFixed (2) + ", ";
  s += vect.y.toFixed (2) + ", ";
  s += vect.z.toFixed (2) + ")";
  return s;
}

TestCharges.QueryParticleState = function () {
  var numActive = 0;
  var numInactive = 0;
  var partLocation = new THREE.Vector3();
  var i3 = 0,
    i3p = 1,
    i3pp = 2;
  
  var activeBounds = new THREE.Box3 ();
  var inactiveBounds = new THREE.Box3 ();

  for (var i = 0; i < particleCount; i++, i3 += 3, i3p += 3, i3pp += 3) {
    var part = particlesData[i];
 
    partLocation.x = location[i3];
    partLocation.y = location[i3p];
    partLocation.z = location[i3pp];
    
    if (part.active) {
      numActive++;
      activeBounds.expandByPoint (partLocation);
    }
    else {
      numInactive++;
      inactiveBounds.expandByPoint (partLocation);
    }
  }
  
  var s;
  s = "active: " + numActive + " " + ppVector (activeBounds.min) + " " + ppVector (activeBounds.max);
  console.log (s);
  s = "inactive: " + numInactive + " " + ppVector (inactiveBounds.min) + " " + ppVector (inactiveBounds.max);
  console.log (s);
}

TestCharges.Inject = function (position) {
  rollingIndex = (rollingIndex + 1) % particleCount;
  location[rollingIndex * 3] = position.x;
  location[rollingIndex * 3 + 1] = position.y;
  location[rollingIndex * 3 + 2] = position.z;
  particlesData[rollingIndex].velocity.setScalar(0);
  if (Math.random() < 0.5)
    particlesData[rollingIndex].charge = 1.0;
  else
    particlesData[rollingIndex].charge = -1.0;

  particlesData[rollingIndex].active = true;

  pointCloud.geometry.attributes.position.needsUpdate = true;
}

TestCharges.Update = function (delta) {
  if (!isReady)
    return;

  var force = new THREE.Vector3();
  var partLocation = new THREE.Vector3();
  var dir = new THREE.Vector3();
  var deltaMult = 0.5;
  var mult = delta * deltaMult;
  var i3 = 0,
    i3p = 1,
    i3pp = 2;

  for (var i = 0; i < particleCount; i++, i3 += 3, i3p += 3, i3pp += 3) {
    var part = particlesData[i];
    if (!part.active)
      continue;

    partLocation.x = location[i3];
    partLocation.y = location[i3p];
    partLocation.z = location[i3pp];

    if (
      partLocation.x > maxCoordValue || partLocation.x < minCoordValue
      || partLocation.y > maxCoordValue || partLocation.y < minCoordValue
      || partLocation.z > maxCoordValue || partLocation.z < minCoordValue
    ) {
      // stow this particle away
      partLocation = storagePosition ();
      location [i3] =   partLocation.x;
      location [i3p] =  partLocation.y;
      location [i3pp] = partLocation.z;
      part.active = false;
    } 
    else {
      force.setScalar(0.0);
      if (dampedDynamics)
        part.velocity.setScalar (0.0);

      for (var fc = 0; fc < fixedCharges.length; fc++) {
        var fcPosition = fixedCharges[fc].position;
        var fcData = fixedCharges[fc].userData;

        var forceMag = part.charge * fcData.charge / fcPosition.distanceToSquared(partLocation);
        dir.subVectors(partLocation, fcPosition);
        dir.normalize();
        dir.multiplyScalar(forceMag);
        force.add(dir);
      }

      force.multiplyScalar(mult);
      part.velocity.add(force);

      location[i3] += part.velocity.x * mult;
      location[i3p] += part.velocity.y * mult;
      location[i3pp] += part.velocity.z * mult;
    }

  }


  pointCloud.geometry.attributes.position.needsUpdate = true;

}

export {
  TestCharges
}
