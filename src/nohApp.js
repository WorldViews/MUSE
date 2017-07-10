
import * as THREE from 'three';

import TrackballControls from './lib/controls/TrackballControls';
import OrbitControls from './lib/controls/OrbitControls';
import CMP_Controls from './lib/controls/CMP_Controls';

import loadModels from './loadModels';
import {loadScreen} from './loadScreen';
import setupLights from './setupLights';
import {Game} from './Game';
import {setupHtmlControls} from './htmlControls';
import {ProgramControl} from './ProgramControl';

let {degToRad} = THREE.Math;

let MTL_PATH = 'models/derrick.mtl';
let OBJ_PATH = 'models/derrick.obj';

let VIDEO_PATH = 'videos/Climate-Music-V3-Distortion_HD_540.webm';

let MODEL_SPECS = [{
    path: 'models/NOHSpace.dae',
    position: [0, 0, 0],
    //rotation: [0, degToRad(90), 0],
    rotation: [0, degToRad(0), 0],
    //scale: [0.025, 0.025, 0.025]
    //scale: [0.03, 0.03, 0.03]
    scale: 0.025
}];

var game = new Game();
game.addControls();
window.game = game;
var programControl = new ProgramControl(game);
setupHtmlControls(game, programControl);
//window.scene = scene;

function start()
{
    loadModels(MODEL_SPECS, game);
    loadScreen(VIDEO_PATH, game);
    console.log("****** adding planets ******");
    setupLights(game.scene);
    game.animate();
}

window.start = start;
