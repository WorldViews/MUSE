import * as THREE from 'three';

import TrackballControls from './lib/controls/TrackballControls';
import OrbitControls from './lib/controls/OrbitControls';
import CMP_Controls from './lib/controls/CMP_Controls';

//mport Earth from './lib/EARTH';
//import Planet from './lib/Planet';
import {addPlanet} from './lib/Planet';
import Stars from './lib/Stars';

import loadModels from './loadModels';
import loadScreen from './loadScreen';
import setupLights from './setupLights';

let {degToRad} = THREE.Math;

let Y_AXIS = new THREE.Vector3(0, 1, 0);

let MTL_PATH = 'models/derrick.mtl';
let OBJ_PATH = 'models/derrick.obj';

let VIDEO_PATH = 'videos/Climate-Music-V3-Distortion_HD_540.webm';

let MODEL_SPECS = [{
    path: 'models/PlayDomeSkp.dae',
    position: [0, 0, 0],
    //rotation: [0, degToRad(90), 0],
    rotation: [0, degToRad(0), 0],
    //scale: [0.025, 0.025, 0.025]
    //scale: [0.03, 0.03, 0.03]
    scale: 0.025
}];

let canvas3d = document.getElementById('canvas3d');
canvas3d.height = window.innerHeight;
canvas3d.width = window.innerWidth;

let renderer = new THREE.WebGLRenderer({ canvas: canvas3d, antialias: true });
renderer.setSize(canvas3d.width, canvas3d.height);
renderer.setPixelRatio(window.devicePixelRatio);

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, canvas3d.width / canvas3d.height, 1, 4000);
scene.add(camera);

let starsGroup = new THREE.Group();
scene.add(starsGroup);
//addLights(scene);
let stars = new Stars(starsGroup, 2500, {name: 'Stars'});
starsGroup.position.set(0, 0, 0);

//let controls = new TrackballControls(camera);
let controls = new OrbitControls(camera);
//let controls = new CMP_Controls(camera);
camera.position.z = 1;
controls.addEventListener('change', render);
controls.keys = [65, 83, 68];

camera.lookAt(new THREE.Vector3());

window.camera = camera;
window.scene = scene;
window.controls = controls;

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});


function animate() {
  // Do not allow gamepad controls when pointerlock controls are enabled.
  controls.update();
  render();

  window.requestAnimationFrame(animate);
}

function render(vrDisplay) {
  renderer.render(scene, camera);
}

function start()
{
    loadModels(MODEL_SPECS, scene);
    loadScreen(VIDEO_PATH, scene);
    console.log("****** adding planets ******");
    var earth =   addPlanet(scene, 'Earth',   1000, -2000, 0, 0);
    var mars =    addPlanet(scene, 'Mars',    200,   2000, 0, 2000,  './textures/Mars_4k.jpg');
    var jupiter = addPlanet(scene, 'Jupiter', 300,   1500, 0, -1500, './textures/Jupiter_Map.jpg');
    var nepture = addPlanet(scene, 'Nepture', 100,  -1000, 0, -1000, './textures/Neptune.jpg');
    setupLights(scene);
    animate();
}

window.start = start;
