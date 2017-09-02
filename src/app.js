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
//import {UIController} from './controllers/UIController';
import {ReactControls} from './controllers/ReactControls';
import {JQControls} from './controllers/JQControls';
import VRGame from './VRGame';
import WebVR from './lib/vr/WebVR';

import { ViewManager } from './ViewManager';
import { addLight, setupLights } from './Lights';
import Marquee from './Marquee';
import { DynamicObjectDB_test } from './lib/DynamicObjectDB';
import { SlidePlayer } from './lib/SlideShow';
import { Hurricane } from './lib/Hurricane';
import { VirtualEarth } from './lib/VirtualEarth';
import { Kessler } from './KesslerNode';

let {degToRad} = THREE.Math;
let CONFIG = null;
let SPECS = null;
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

function loadConfig(path)
{
    console.log("Loading config file "+path);
    $.getScript(path)
        .done(function(script, textStatus) {
            CONFIG = window.CONFIG;
            console.log("Loaded CONFIG: ", CONFIG);
            if (!CONFIG) {
                SPECS = window.SPECS;
                console.log("**** No CONFIG defined ... using SPECS");
                console.log("SPECS", SPECS);
                CONFIG = {specs: SPECS};
            }
            console.log("CONFIG", CONFIG);
            start(CONFIG);
        })
        .fail(function(jqxhr, settings, ex) {
            console.log("error: ", ex);
            alert("Cannot load "+path);
        });
}

function loadModel(modelPath) {
    console.log("***** loadModel "+modelPath);
    CONFIG = {
        cameraControls: 'Orbit',
        specs: [
            {type: 'PointLight', position: [100,0,0], distance: 1000},
            {type: 'PointLight', position: [0,100,0], distance: 1000},
            {type: 'PointLight', position: [0,0,100], distance: 1000},
            {type: 'PointLight', position: [-100,0,0], distance: 1000},
            {type: 'PointLight', position: [0,-100,0], distance: 1000},
            {type: 'PointLight', position: [0,0,-100], distance: 1000},
            {type: 'Model', 'name': 'model', 'path': modelPath, scale: 0.01}
        ]
    };
    console.log("CONFIG: "+JSON.stringify(CONFIG));
    start(CONFIG);
}

function start(config) {
    console.log("app.start", config);
    if (config == null && Util.getParameterByName("model")) {
        var modelPath = Util.getParameterByName("model");
        loadModel(modelPath);
        return;
    }
    if (config == null && Util.getParameterByName("config")) {
        var configName = Util.getParameterByName("config");
        var configPath = "configs/"+configName+".js";
        loadConfig(configPath);
        return;
    }
    config = config || {};
    var specs = config.specs;
    console.log("specs: ", specs);
//    if (Util.getParameterByName("specs"))
//        specs = Util.getParameterByName("specs");
    if (!specs)
        specs = DEFAULT_SPECS;
    let vr = config.vr || Util.getParameterByName("vr");
    console.log("specs: ", specs);

    let pos = getStartPosition();

    if (vr) {
        window.game = new VRGame('canvas3d');
        let navigationController = new NavigationController(game.body, game.camera, game.plControls);
        game.registerController('navigation', navigationController);
        game.body.position.set(pos.start.x, 1.5, pos.start.z);
    } else {
        window.game = new Game('canvas3d');
        if (config.cameraControls == 'Orbit')
            game.addOrbitControls();
        else
            game.addMultiControls();
        game.camera.position.set(pos.start.x, pos.start.y, pos.start.z);
        game.camera.up = new THREE.Vector3(0,1,0);
        game.camera.lookAt(pos.lookAt);
    }

    game.defaultGroupName = 'station';

    let cmpProgram = new CMPProgram(game, config.program);
    game.setProgram(cmpProgram);

    console.log("loading specs", specs);
    game.load(specs);
    console.log("loaded specs", specs);
    if (config.onStart) {
        config.onStart(game);
    }
    game.animate(0);
}

window.start = start;
