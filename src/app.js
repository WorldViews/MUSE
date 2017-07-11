import * as THREE from 'three';
import Earth from './lib/EARTH';
import Marquee from './Marquee';
import VRGame from './VRGame';

import BodyAnimationController from './controllers/BodyAnimationController';
import {CMPProgram} from './CMPProgram';
import CMPController from './controllers/CMPController';
import NavigationController from './controllers/NavigationController';
import StarsController from './controllers/StarsController';

import {addPlanet} from './lib/Planet';
import loadCollada from './loadCollada';
import loadModels from './loadModels';
import {loadScreen} from './loadScreen';
import {setupLights} from './setupLights';
import {setupHtmlControls} from './htmlControls';
import setupMarquee from './setupMarquee';

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
game.defaultGroupName = 'station';

let bodyAnimationController = new BodyAnimationController(game.body);
let navigationController = new NavigationController(game.body, game.camera, game.plControls);
let starsController = new StarsController(game.scene, [0, 0, 0]);
let cmpController = new CMPController(game.renderer.getUnderlyingRenderer(), game.scene, game.camera, {
    position: [0, 3, 0],
    rotation: [0, 0, 0],
    scale: [1.5, 1, 1.5]
});

game.registerController('body', bodyAnimationController);
game.registerController('navigation', navigationController);
game.registerController('stars', starsController);
game.registerController('cmp', cmpController);

game.gss = new GSS.SpreadSheet();

let cmpProgram = new CMPProgram(game);
setupHtmlControls(game, cmpProgram);

game.marquee = new Marquee();
game.addToGame(game.marquee, "marque1"); // cause it to get grouped properly
setupMarquee(game);

function start() {
    loadModels(MODEL_SPECS, game);
    loadScreen(VIDEO_PATH, game);

    console.log("****** adding planets ******");
    let earth = addPlanet(game, 'Earth', 1000, -2000, 0, 0);
    let mars = addPlanet(game, 'Mars', 200, 2000, 0, 2000, './textures/Mars_4k.jpg');
    let jupiter = addPlanet(game, 'Jupiter', 300, 1500, 0, -1500, './textures/Jupiter_Map.jpg');
    let nepture = addPlanet(game, 'Nepture', 100, -1000, 0, -1000, './textures/Neptune.jpg');

    setupLights(game);

    game.body.position.set(2, 1.5, 2);

    game.animate(0);
}

window.start = start;
window.game = game;
