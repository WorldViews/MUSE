import * as THREE from 'three';

import CMPController from './controllers/CMPController';
import {PanoPortal0} from './lib/PanoPortal0';
import {PanoPortal} from './lib/PanoPortal';
import { CMPProgram } from './CMPProgram';
import { Game } from './Game';
import { Dancer } from './controllers/DanceController';
import Marquee from './Marquee';
import NavigationController from './controllers/NavigationController';
import { Scripts } from './Scripts';
import SolarSystemController from './controllers/SolarSystemController';
import StarsController from './controllers/StarsController';
import UIController from './controllers/UIController';
import VRGame from './VRGame';
import WebVR from './lib/vr/WebVR';

import { ViewManager } from './ViewManager';
import { NetLink } from './NetLink';
//import loadModels from './loadModels';
import {Loader} from './Loader';
import { loadScreens, loadScreen } from './Screens';
import { addLight, setupLights } from './Lights';
import setupMarquee from './setupMarquee';

function getParameterByName(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

let {degToRad} = THREE.Math;

var SPECS = [
    {  type: 'Group',  name: 'station' },
    {  type: 'Group',  name: 'g2',
       position: [200,0,0],
       children: {type: 'Axes'}
    },
    {  type: 'Group',  name: 'g3',
       position: [200,-500,0],
       rotation: [0,0,0.2],
       children: [
           {  type: 'Axes', name: 'axis3',
              visible: false
           }
       ]
    },
    {  type: 'Axes',   name: 'xyz' },
    {  type: 'Model', name: 'platform',
       parent: 'station',
       path: 'models/PlayDomeSkp_v1.dae',
       position: [0, 0, 0],
       rotation: [0, degToRad(0), 0],
       scale: 0.025
    },
    {   type: 'Model', name: 'bmw',
        parent: 'station',
        path: 'models/bmw/model.dae',
        position: [0.2, 0, 1.6],
        //rotation: [0, degToRad(90), 0],
        rotation: [0, degToRad(0), 0],
        scale: 0.020,
        visible: false
    },
    {  type: 'Dancer', name: 'dancer',
       scale: .1, visible: false
    }
]

function start(config) {
    let MODEL_SPECS = config.specs || [
        {
            type: 'Group', name: 'station',
        },
        {   type: 'Model', name: 'platform',
            parent: 'station',
            path: 'models/PlayDomeSkp_v1.dae',
            position: [0, 0, 0],
            rotation: [0, degToRad(0), 0],
            scale: 0.025
        },
        {   type: 'Model', name: 'bmw',
            parent: 'station',
            path: 'models/bmw/model.dae',
            position: [0.2, 0, 1.6],
            //rotation: [0, degToRad(90), 0],
            rotation: [0, degToRad(0), 0],
            scale: 0.020,
            visible: false
        },
        {   type: 'Screen', name: 'mainScreen',
            parent: 'station', radius: 8.8,
            path: 'videos/Climate-Music-V3-Distortion_HD_540.webm',
            phiStart: 34, phiLength: 47,
            thetaStart: 110, thetaLength: 140
        }
    ];

    let isVRWithFallbackControl =
        config.preferredControl === 'vr' ||
        config.fallbackControl === 'pointerlock';

    if (isVRWithFallbackControl) {
        window.game = new VRGame('canvas3d');
    } else if (config.preferredControl === 'multi') {
        window.game = new Game('canvas3d');
        game.addMultiControls();
    }

    window.game = game;
    game.defaultGroupName = 'station';
    game.gss = new GSS.SpreadSheet();

    let cmpProgram = new CMPProgram(game);
    game.setProgram(cmpProgram);
    
    let solarSystemController = new SolarSystemController(game);
    let starsController = new StarsController(game.scene, [0, 0, 0]);
    let renderer = isVRWithFallbackControl ? game.renderer.getUnderlyingRenderer() : game.renderer;
    let cmpController = new CMPController(renderer, game.scene, game.camera, {
        position: [0, 2, 0],
        rotation: [0, 0, 0],
        scale: [1.5, 1, 1.5],
        visible: false
    });
    let uiController = new UIController({
        game: game,
        playerControl: cmpProgram
    });
    let scriptControls = new Scripts(game, uiController);
    game.viewManager = new ViewManager(game, uiController);

    if (isVRWithFallbackControl) {
        let navigationController = new NavigationController(game.body, game.camera, game.plControls);
        game.registerController('navigation', navigationController);
    }

    game.registerController('stars', starsController);
    game.registerController('cmp', cmpController);
    game.registerController('solarSystem', solarSystemController);
    game.registerController('ui', uiController);
    game.registerController('scripts', scriptControls);
    game.registerController("viewManager", game.viewManager);

    game.user = getParameterByName("user");
    if (game.user) {
        let netLink = new NetLink(game);
        game.registerController("netLink", netLink);
    }

    game.marquee = new Marquee();
    game.addToGame(game.marquee, "marque1"); // cause it to get grouped properly
    setupMarquee(game);

    //loadModels(MODEL_SPECS, game);
    game.loader = new Loader(game, MODEL_SPECS);
    //loadModels(MODEL_SPECS, game);
    //loadScreens(game);

    if (!isVRWithFallbackControl) {
        //game.portal0 = new PanoPortal0(game);
        //game.portal0 = new PanoPortal(game);
    }

    setupLights(game);

    if (isVRWithFallbackControl) {
        game.body.position.set(2, 1.5, 2);
    }
    else {
        game.camera.position.set(100, 200, 150);
    }

    game.animate(0);
}

window.start = start;
