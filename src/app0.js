import * as THREE from 'three';
import TrackballControls from './lib/controls/TrackballControls';
import Earth from './lib/EARTH';
import Stars from './lib/Stars';

import loadCollada from './loadCollada';

import {R, TH_LEN, TH_MIN, PH_LEN, PH_MIN} from './const/screen';

let Y_AXIS = new THREE.Vector3(0, 1, 0);
let NINETY = Math.PI / 2;
let DAE_PATH = 'models/PlayDomeSkp.dae';
let MTL_PATH = 'models/derrick.mtl';
let OBJ_PATH = 'models/derrick.obj';
let VIDEO_PATH = 'videos/Climate-Music-V3-Distortion_HD_540.webm';

let {degToRad} = THREE.Math;

let canvas3d = document.getElementById('canvas3d');
canvas3d.height = window.innerHeight;
canvas3d.width = window.innerWidth;

let renderer = new THREE.WebGLRenderer({ canvas: canvas3d, antialias: true });
renderer.setSize(canvas3d.width, canvas3d.height);
renderer.setPixelRatio(window.devicePixelRatio);

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, canvas3d.width / canvas3d.height, 1, 4000);
scene.add(camera);
let sphere = new THREE.SphereGeometry( 0.5, 16, 8 );

let color1 = 0xffaaaa;
let light1 = new THREE.PointLight(color1, 2, 50);
light1.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: color1 } ) ) );
light1.position.y = 30;
light1.position.x = -10;
light1.position.z = -10;
scene.add(light1);

let color2 = 0xaaffaa;
let light2 = new THREE.PointLight(color2, 2, 50);
light2.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: color2 } ) ) );
light2.position.y = 30;
light2.position.x = -10;
light2.position.z = 5;
scene.add(light2);

let color3 = 0xaaaaff;
let light3 = new THREE.PointLight(color3, 2, 50);
light3.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: color3 } ) ) );
light3.position.y = 30;
light3.position.x = -10;
light3.position.z = -5;
scene.add(light3);

let starsGroup = new THREE.Group();
scene.add(starsGroup);
let stars = new Stars(starsGroup, 2500, {name: 'Stars'});
starsGroup.position.set(0, 0, 0);

let controls = new TrackballControls(camera);
camera.position.z = 1;
controls.addEventListener('change', render);
controls.keys = [65, 83, 68];

camera.lookAt(light3.position);

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

loadCollada(
  DAE_PATH,
  {
    position: [0, 0, 0],
    rotation: [0, degToRad(90), 0],
    scale: [0.025, 0.025, 0.025]
  }
).then((collada) => {
  scene.add(collada.scene);
  animate();
});
