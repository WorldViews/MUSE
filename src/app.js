import * as THREE from 'three';

import CMPController from './controllers/CMPController';
import {PanoPortal} from './lib/PanoPortal';
import { CMPProgram } from './CMPProgram';
import { DanceController } from './controllers/DanceController';
import { Game } from './Game';
import Marquee from './Marquee';
import NavigationController from './controllers/NavigationController';
import { Scripts } from './Scripts';
import SolarSystemController from './controllers/SolarSystemController';
import StarsController from './controllers/StarsController';
import UIController from './controllers/UIController';
import VRGame from './VRGame';
import WebVR from './lib/vr/WebVR';

import loadModels from './loadModels';
import { loadScreens, loadScreen } from './loadScreen';
import { setupLights } from './setupLights';
import setupMarquee from './setupMarquee';

let {degToRad} = THREE.Math;

function start(config) {
  let MODEL_SPECS = [
    {
      name: 'station'
    },
    {
      name: 'platform',
      parent: 'station',
      //path: 'models/PlayDomeSkp.dae',
      path: 'models/PlayDomeSkp_v1.dae',
      position: [0, 0, 0],
      rotation: [0, degToRad(0), 0],
      scale: 0.025
    },
    {
      name: 'bmw',
      parent: 'station',
      path: 'models/bmw/model.dae',
      position: [0.2, 0, 1.6],
      //rotation: [0, degToRad(90), 0],
      rotation: [0, degToRad(0), 0],
      scale: 0.020,
      visible: false
    }
  ];

  let isVRWithFallbackControl =
      config.preferredControl === 'vr' ||
      config.fallbackControl === 'pointerlock'; 

  if (isVRWithFallbackControl) {
    window.game = new VRGame('canvas3d');   
  } else if (config.preferredControl === 'multi') {
    window.game = new Game();
    game.addMultiControls();
  }

  window.game = game;
  game.defaultGroupName = 'station';

  game.gss = new GSS.SpreadSheet();
  let cmpProgram = new CMPProgram(game);

  let solarSystemController = new SolarSystemController(game);
  let starsController = new StarsController(game.scene, [0, 0, 0]);
  let renderer = isVRWithFallbackControl ? game.renderer.getUnderlyingRenderer() : game.renderer;
  let cmpController = new CMPController(renderer, game.scene, game.camera, {
    position: [0, 3, 0],
    rotation: [0, 0, 0],
    scale: [1.5, 1, 1.5]
  });
  let uiController = new UIController({
    game: game,
    playerControl: cmpProgram
  });
  let scriptControls = new Scripts(game, uiController);

  if (isVRWithFallbackControl) {
    let navigationController = new NavigationController(game.body, game.camera, game.plControls);
    game.registerController('navigation', navigationController);
  } else {
    let dancer = new DanceController(game);
    game.registerController('dancer', dancer);
    cmpProgram.registerPlayer(dancer);
  }

  game.registerController('stars', starsController);
  game.registerController('cmp', cmpController);
  game.registerController('solarSystem', solarSystemController);
  game.registerController('ui', uiController);
  game.registerController('scripts', scriptControls);

  game.marquee = new Marquee();
  game.addToGame(game.marquee, "marque1"); // cause it to get grouped properly
  setupMarquee(game);

  loadModels(MODEL_SPECS, game);
  loadScreens(game);

  if (!isVRWithFallbackControl) {

    let screen3 = {
      name: "bubbleScreen1",
      radius: 0.5,
      path: 'videos/YukiyoCompilation.mp4',
      //    phiStart: 0,
      //    phiLength: 90,
      position: [3, 3, 0]
    }
    loadScreen(game, screen3);
  }

  setupLights(game);
  
  if (isVRWithFallbackControl) {
    game.body.position.set(2, 1.5, 2);
  }
  
  game.animate(0);
}

window.start = start;
