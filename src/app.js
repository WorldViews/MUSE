import * as THREE from 'three';
import CMPDataViz from './lib/CMPDataViz';
import Earth from './lib/EARTH';
import NavigationController from './controllers/NavigationController';
import StarsController from './controllers/StarsController';

import {addPlanet} from './lib/Planet';
import attachPointerLock from './attachPointerLock';
import createControls from './createControls';
import createScene from './createScene';
import loadCollada from './loadCollada';
import loadModels from './loadModels';
import loadScreen from './loadScreen';
import loadVideo from './loadVideo';
import loadVR from './loadVR';
import setupLights from './setupLights';

let DAE_PATH = 'models/PlayDomeSkp.dae';
let VIDEO_PATH = 'videos/Climate-Music-V3-Distortion_HD_540.webm';

let {degToRad} = THREE.Math;

let MODEL_SPECS = [{
    path: 'models/PlayDomeSkp.dae',
    position: [0, 0, 0],
    rotation: [0, degToRad(0), 0],
    scale: 0.025
}];

let {camera, renderer, scene} = createScene();
let {plControls, vrControls, vrEffect} = createControls(renderer, scene, camera);

// The body is always create by the PointerLockContorls;
// regardless of whether it is the primary use of movement control.
let body = plControls.getObject();
body.position.set(2, 2, 2);
scene.add(body);

let navigationController = new NavigationController(body, camera, plControls);
let starsController = new StarsController(scene, [0, 0, 0]);
let CMP = new CMPDataViz(renderer, scene, camera);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  vrEffect.setSize(window.innerWidth, window.innerHeight);
  CMP.resize(window.innerWidth, window.innerHeight);
});

function animate() {
  CMP.update();
  navigationController.update();
  starsController.update();
  vrControls.update();

  render();

  vrEffect.requestAnimationFrame(animate);
}

function render(vrDisplay) {
  vrEffect.render(scene, camera);

  // Do this manually to support multiple scenes.
  if (vrDisplay && vrDisplay.isPresenting) {
    vrEffect.submitFrame();
  }
}

function start() {
    loadModels(MODEL_SPECS, scene);
    loadScreen(VIDEO_PATH, scene);
    CMP.resize(window.innerWidth, window.innerHeight);

    loadVR(renderer.domElement).then(({button, display}) => {
      document.body.appendChild(button);
      // Finally start animation loop
      render = render.bind(null, display);
      animate();
    }).catch(error => {
      // If VR is not available, do not worry about binding the VRDisplay.
      // Only use PointerLock if VR is not available, do not use both.
      if (!error.isVRAvailable) {
        attachPointerLock(plControls);
        animate();
      }
      else {
        console.log(error);
      }
    });

    console.log("****** adding planets ******");
    let earth = addPlanet(scene, 'Earth',   1000, -2000, 0, 0);
    let mars = addPlanet(scene, 'Mars',    200,   2000, 0, 2000,  './textures/Mars_4k.jpg');
    let jupiter = addPlanet(scene, 'Jupiter', 300,   1500, 0, -1500, './textures/Jupiter_Map.jpg');
    let nepture = addPlanet(scene, 'Nepture', 100,  -1000, 0, -1000, './textures/Neptune.jpg');
    setupLights(scene);
}

window.start = start;
