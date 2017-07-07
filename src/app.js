import * as THREE from 'three';
import CMPDataViz from './lib/CMPDataViz';
import Earth from './lib/EARTH';
import Marquee from './Marquee';
import VRGame from './VRGame';

import BodyAnimationController from './controllers/BodyAnimationController';
import NavigationController from './controllers/NavigationController';
import StarsController from './controllers/StarsController';

import {Easing, Tween} from 'tween.js';

import {addPlanet} from './lib/Planet';
import loadCollada from './loadCollada';
import loadModels from './loadModels';
import {loadScreen} from './loadScreen';
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

let game = new VRGame('canvas3d');
window.game = game;

let bodyAnimationController = new BodyAnimationController(game.body);
let navigationController = new NavigationController(game.body, game.camera, game.plControls);
let starsController = new StarsController(game.scene, [0, 0, 0]);
let cmpController = new CMPDataViz(game.renderer.getUnderlyingRenderer(), game.scene, game.camera, {
  position: [0, 3, 1.5]
});

game.registerController(bodyAnimationController);
game.registerController(navigationController);
game.registerController(starsController);
game.registerController(cmpController);

let marqueeGroup = new THREE.Group();
scene.add(marqueeGroup);
let marquee = new Marquee();
marqueeGroup.add(marquee);
marqueeGroup.position.y = 3;

function initAnimations() {
    body.position.set(500, 250, 200);
    // TODO: figure out algo for looking
    // plControls.lookAt(new THREE.Vector3(0, 0, 0));

    let anim = new Tween(body.position)
        .to({x: 2, y: 2, z: 2}, 10000)
        .easing(Easing.Quadratic.In);

    bodyAnimationController.enqueue(anim);
}

function start() {
  loadModels(MODEL_SPECS, game);
  loadScreen(VIDEO_PATH, game);

  console.log("****** adding planets ******");
  let earth = addPlanet(game.scene, 'Earth', 1000, -2000, 0, 0);
  let mars = addPlanet(game.scene, 'Mars', 200, 2000, 0, 2000, './textures/Mars_4k.jpg');
  let jupiter = addPlanet(game.scene, 'Jupiter', 300, 1500, 0, -1500, './textures/Jupiter_Map.jpg');
  let nepture = addPlanet(game.scene, 'Nepture', 100, -1000, 0, -1000, './textures/Neptune.jpg');
  
  setupLights(game.scene);

  game.body.position.set(2, 2, 2);

  game.animate(0);
}

window.start = start;