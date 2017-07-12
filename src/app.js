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
import {loadScreens,loadScreen} from './loadScreen';
import {setupLights} from './setupLights';
import {animTest, Anim} from './animTest';
import {setupHtmlControls} from './htmlControls';
import setupMarquee from './setupMarquee';

let {degToRad} = THREE.Math;

function start(useVR) {
    console.log("************************** app.js: useVR: "+useVR);

    let MODEL_SPECS = [
        {   name: 'station'  },
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

    if (useVR) {
        window.game = new VRGame('canvas3d');
    }
    else {
        window.game = new Game();
        //game.addOrbitControls();
        //game.addCMPControls();
        game.addMultiControls();
    }
    window.game = game;
    game.useVR = useVR;
    game.defaultGroupName = 'station';

    game.gss = new GSS.SpreadSheet();
    let cmpProgram = new CMPProgram(game);
    setupHtmlControls(game, cmpProgram);

    let solarSystemController = new SolarSystemController(game);
    let starsController = new StarsController(game.scene, [0, 0, 0]);
    var renderer = useVR ? game.renderer.getUnderlyingRenderer() : game.renderer;
    let cmpController = new CMPController(renderer, game.scene, game.camera, {
        position: [0, 3, 0],
        rotation: [0, 0, 0],
        scale: [1.5, 1, 1.5]
    });

    var dancer = null;
    if (useVR) {
        let bodyAnimationController = new BodyAnimationController(game.body);
        let navigationController = new NavigationController(game.body, game.camera, game.plControls);
        game.registerController('body', bodyAnimationController);
        game.registerController('navigation', navigationController);
    }
    else {
	dancer = new DanceController(game);
        game.registerController('dancer', dancer);
        cmpProgram.registerPlayer(dancer);
    }
    game.registerController('stars', starsController);
    game.registerController('cmp', cmpController);
    game.registerController('solarSystem', solarSystemController);

    game.marquee = new Marquee();
    game.addToGame(game.marquee, "marque1"); // cause it to get grouped properly
    setupMarquee(game);

    loadModels(MODEL_SPECS, game);
    loadScreens(game);
    if (!useVR) {
	console.log("hello");
	var screen3 = {
	    name: "bubbleScreen1",
	    radius: 0.5,
	    path: 'videos/YukiyoCompilation.mp4',
	    //    phiStart: 0,
	    //    phiLength: 90,
	    position: [3,3,0]
	}
	loadScreen(game, screen3);
    }
    setupLights(game);
    if (useVR) {
        game.body.position.set(2, 1.5, 2);
    }
    game.animate(0);
}

window.start = start;

