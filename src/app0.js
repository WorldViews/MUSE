import * as THREE from 'three';
import TrackballControls from './lib/controls/TrackballControls';
import Earth from './lib/EARTH';
import Stars from './lib/Stars';

import {R, TH_LEN, TH_MIN, PH_LEN, PH_MIN} from './const/screen';

let Y_AXIS = new THREE.Vector3(0, 1, 0);
let NINETY = Math.PI / 2;
let MTL_PATH = 'models/derrick.mtl';
let OBJ_PATH = 'models/derrick.obj';
let VIDEO_PATH = 'videos/Climate-Music-V3-Distortion_HD_540.webm';

var canvas3d = document.getElementById('canvas3d');
canvas3d.height = window.innerHeight;
canvas3d.width = window.innerWidth;

var renderer = new THREE.WebGLRenderer({ canvas: canvas3d, antialias: true });
renderer.setSize(canvas3d.width, canvas3d.height);
renderer.setPixelRatio(window.devicePixelRatio);
//renderer.autoClear = false;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, canvas3d.width / canvas3d.height, 1, 4000);
scene.add(camera);
var sphere = new THREE.SphereGeometry( 0.5, 16, 8 );

var myvar =5;

var color1 = 0xffaaaa;
var light1 = new THREE.PointLight(color1, 2, 50);
light1.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: color1 } ) ) );
light1.position.y = 30;
light1.position.x = -10;
light1.position.z = -10;
scene.add(light1);

var color2 = 0xaaffaa;
var light2 = new THREE.PointLight(color2, 2, 50);
light2.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: color2 } ) ) );
light2.position.y = 30;
light2.position.x = -10;
light2.position.z = 5;
scene.add(light2);

var color3 = 0xaaaaff;
var light3 = new THREE.PointLight(color3, 2, 50);
light3.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: color3 } ) ) );
light3.position.y = 30;
light3.position.x = -10;
light3.position.z = -5;
scene.add(light3);

var starsGroup = new THREE.Group();
scene.add(starsGroup);
var stars = new Stars(starsGroup, 2500, {name: 'Stars'});
starsGroup.position.set(0, 0, 0);

//var controls = new TrackballControls(camera);
var controls = new TrackballControls(camera);
camera.position.z = 1;
controls.addEventListener('change', render);
controls.keys = [65, 83, 68];

console.log("pointing camera");
camera.lookAt(light3.position);

window.camera = camera;
window.scene = scene;
window.controls = controls;

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

//  effect.setSize( window.innerWidth, window.innerHeight );
});


function animate() {

  // Do not allow gamepad controls when pointerlock controls are enabled.
  controls.update();
  render();

  window.requestAnimationFrame(animate);
}

function render(vrDisplay) {
    //console.log("render...");
    renderer.render(scene, camera);
}

var x=3;

function handleError(error) {
  console.log(error);
}

animate();

