import * as THREE from 'three';
import Marquee from './Marquee';
import {Game} from './Game';
import VRGame from './VRGame';

import BodyAnimationController from './controllers/BodyAnimationController';
import {CMPProgram} from './CMPProgram';
import CMPController from './controllers/CMPController';
import NavigationController from './controllers/NavigationController';
import StarsController from './controllers/StarsController';

import {addPlanet, addPlanets} from './lib/Planet';
import {DanceController} from './controllers/DanceController';
import loadModels from './loadModels';
import {loadScreens} from './loadScreen';
import {setupLights} from './setupLights';
import {animTest, Anim} from './animTest';
import {setupHtmlControls} from './htmlControls';
import setupMarquee from './setupMarquee';

let {degToRad} = THREE.Math;

let MODEL_SPECS = [
    {   name: 'station'  },
    {
        path: 'models/PlayDomeSkp.dae',
        position: [0, 0, 0],
        rotation: [0, degToRad(0), 0],
        scale: 0.025
    }];

window.game = new VRGame('canvas3d');
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
    loadScreens(game);
    addPlanets(game);
    var vEarth =  addPlanet(game, 'vEarth',   1.2, 0, 2, 0, null, game.defaultGroupName);
    var SF = {lat: 37.4, lon: -122};
    vEarth.addMarker(SF.lat, SF.lon)
    setupLights(game);
    game.body.position.set(2, 1.5, 2);
    game.animate(0);
}

window.start = start;
