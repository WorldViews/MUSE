import * as THREE from 'three';
import Marquee from './Marquee';
import {Game} from './Game';
import VRGame from './VRGame';

import BodyAnimationController from './controllers/BodyAnimationController';
import {CMPProgram} from './CMPProgram';
import CMPController from './controllers/CMPController';
import NavigationController from './controllers/NavigationController';
import SolarSystemController from './controllers/SolarSystemController';
import StarsController from './controllers/StarsController';

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

function start() {
    window.game = new VRGame('canvas3d');
    game.defaultGroupName = 'station';

    let bodyAnimationController = new BodyAnimationController(game.body);
    let navigationController = new NavigationController(game.body, game.camera, game.plControls);
    let solarSystemController = new SolarSystemController(game);
    let starsController = new StarsController(game.scene, [0, 0, 0]);
    let cmpController = new CMPController(game.renderer.getUnderlyingRenderer(), game.scene, game.camera, {
        position: [0, 3, 0],
        rotation: [0, 0, 0],
        scale: [1.5, 1, 1.5]
    });
    //var dancer = new DanceController(game);

    game.registerController('body', bodyAnimationController);
    game.registerController('navigation', navigationController);
    game.registerController('stars', starsController);
    game.registerController('cmp', cmpController);
    game.registerController('solarSystem', solarSystemController);
    // game.registerController('dancer', dancer);

    game.gss = new GSS.SpreadSheet();

    let cmpProgram = new CMPProgram(game);
    setupHtmlControls(game, cmpProgram);
    //cmpProgram.registerPlayer(dancer);

    game.marquee = new Marquee();
    game.addToGame(game.marquee, "marque1"); // cause it to get grouped properly
    setupMarquee(game);

    loadModels(MODEL_SPECS, game);
    loadScreens(game);
    setupLights(game);

    game.body.position.set(2, 1.5, 2);
    game.animate(0);
}

window.start = start;

