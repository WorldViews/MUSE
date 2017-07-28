import * as THREE from 'three';

import { CMPDataVizController } from './controllers/CMPDataVizController';
import { Scripts } from './Scripts';
import { PanoPortal } from './lib/PanoPortal';
import { CMPProgram } from './CMPProgram';
import { Screens } from './Screens';
import { Game, getParameter } from './Game';
import { Dancer } from './controllers/DanceController';
import NavigationController from './controllers/NavigationController';
import SolarSystemController from './controllers/SolarSystemController';
import StarsController from './controllers/StarsController';
import UIController from './controllers/UIController';
import VRGame from './VRGame';
import WebVR from './lib/vr/WebVR';

import { ViewManager } from './ViewManager';
import { addLight, setupLights } from './Lights';
import Marquee from './Marquee';
import { DynamicObjectDB_test } from './lib/DynamicObjectDB';
import { SlidePlayer } from './lib/SlideShow';

let {degToRad} = THREE.Math;

function start(config) {
    config = config || {};
    var specs = config.specs || SPECS;
    let vr = config.vr || getParameter("vr");

    if (vr) {
        window.game = new VRGame('canvas3d');
        let navigationController = new NavigationController(game.body, game.camera, game.plControls);
        game.registerController('navigation', navigationController);
        game.body.position.set(2, 1.5, 2);
    } else { // if(config.preferredControl === 'multi')
        window.game = new Game('canvas3d');
        game.addMultiControls();
        game.camera.position.set(2, 1.5, 2.);
    }

    game.defaultGroupName = 'station';

    let cmpProgram = new CMPProgram(game);
    game.setProgram(cmpProgram);
    
    let uiController = new UIController({
        game: game,
        playerControl: cmpProgram
    });
    let scriptControls = new Scripts(game, uiController);
    game.viewManager = new ViewManager(game, uiController);

    game.registerController('ui', uiController);
    game.registerController('scripts', scriptControls);
    game.registerController("viewManager", game.viewManager);
    game.load(specs);

    game.animate(0);
}

window.start = start;
