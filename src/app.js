import * as THREE from 'three';

import { CMPDataVizController } from './controllers/CMPDataVizController';
import { Scripts } from './Scripts';
import { PanoPortal } from './lib/PanoPortal';
import { CMPProgram } from './CMPProgram';
import { Screens } from './Screens';
import { Game } from './Game';
import Util from './Util';
import { Dancer } from './controllers/DanceController';
import NavigationController from './controllers/NavigationController';
import SolarSystemController from './controllers/SolarSystemController';
import StarsController from './controllers/StarsController';
import StatsController from './controllers/StatsController';
import UIController from './controllers/UIController';
import VRGame from './VRGame';
import WebVR from './lib/vr/WebVR';

import { ViewManager } from './ViewManager';
import { addLight, setupLights } from './Lights';
import Marquee from './Marquee';
import { DynamicObjectDB_test } from './lib/DynamicObjectDB';
import { SlidePlayer } from './lib/SlideShow';
import { Hurricane } from './lib/Hurricane';
import { VirtualEarth } from './lib/VirtualEarth';

let {degToRad} = THREE.Math;

let DEFAULT_SPECS = "configs/cmp_imaginarium.js";
function getStartPosition() {
    var lookAt = new THREE.Vector3(0,2,0);
    var start = new THREE.Vector3(4, 2,-5);
    if (Util.getParameterByName("user")) {
        // figure out a random start position
        let radius = Util.randomFromInterval(3, 8);
        let angle = Util.randomFromInterval(0, 2*Math.PI);
        let height = Util.randomFromInterval(1.5, 5);
        let x = Math.cos(angle)*radius;
        let z = Math.sin(angle)*radius;
        let start = new THREE.Vector3(x, height, z);
        let lookAt = new THREE.Vector3(0, 1.5, 0);
    }
    return { start, lookAt };
}

function start(config) {
    config = config || {};
    var specs = config.specs;

    console.log(Util);
    if (Util.getParameterByName("specs"))
        specs = Util.getParameterByName("specs");
    if (Util.getParameterByName("config")) {
        specs = "configs/"+Util.getParameterByName("config")+".js";
    }
    if (!specs)
        specs = DEFAULT_SPECS;
    let vr = config.vr || Util.getParameterByName("vr");

    let pos = getStartPosition();

    if (vr) {
        window.game = new VRGame('canvas3d');
        let navigationController = new NavigationController(game.body, game.camera, game.plControls);
        game.registerController('navigation', navigationController);
        game.body.position.set(pos.start.x, 1.5, pos.start.z);
    } else { // if(config.preferredControl === 'multi')
        window.game = new Game('canvas3d');
        game.addMultiControls();
        game.camera.position.set(pos.start.x, pos.start.y, pos.start.z);
        game.camera.up = new THREE.Vector3(0,1,0);
        game.camera.lookAt(pos.lookAt);
    }

    game.defaultGroupName = 'station';

    let cmpProgram = new CMPProgram(game);
    game.setProgram(cmpProgram);

    let uiController = new UIController({
        game: game,
        playerControl: cmpProgram
    });
    game.registerController('ui', uiController);
    let scriptControls = new Scripts(game, uiController);
    //    game.viewManager = new ViewManager(game, uiController);
    game.registerController('scripts', scriptControls);
    //    game.registerController("viewManager", game.viewManager);
    game.load(specs);

    game.animate(0);
}

window.start = start;
