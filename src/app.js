import * as THREE from 'three';

import {MUSE} from './MUSE';
import { CMPDataUpdater } from './controllers/CMPData';
import { CMPDataVizController } from './controllers/CMPDataVizController';
import { Scripts } from './Scripts';
import { PanoPortal } from './lib/PanoPortal';
import { CMPProgram } from './CMPProgram';
import './Screens';
import { Game } from './Game';
import Util from './Util';
import { Dancer } from './controllers/DanceController';
import NavigationController from './controllers/NavigationController';
import SolarSystemController from './controllers/SolarSystemController';
import StarsController from './controllers/StarsController';
import StatsController from './controllers/StatsController';
import {ReactControls} from './controllers/ReactControls';
import {JQControls} from './controllers/JQControls';
import DATGUIControls from './controllers/DATGUIControls';
import VRGame from './VRGame';
import WebVR from './lib/vr/WebVR';

import { ViewManager } from './ViewManager';
import { addLight, setupLights } from './Lights';
import { DynamicObjectDB_test } from './lib/DynamicObjectDB';
import { SlidePlayer } from './lib/MediaControl';
import { Hurricane } from './lib/Hurricane';
import { VirtualEarth } from './lib/VirtualEarth';
import { Kessler } from './KesslerNode';

import { Player0 } from './interfaces/PlayerInterface';
import {Route} from './Route';
import '../test/testNode';

let {degToRad} = THREE.Math;

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
    Util.getJSONFromScript(path,
        function(obj) {
                if (!obj) {
                    alert("No value from config -- please fix file "+path);
                    obj = window.CONFIG;
                }
                console.log("Loaded CONFIG: ", obj);
                if (!obj) {
                    var errStr = "**** No CONFIG defined (maybe syntax error)";
                    alert(errStr);
                    return;
                }
                start(obj);
        },
        function(jqxhr, settings, ex) {
                console.log("error: ", ex);
                alert("Cannot load "+path);
        }
    );
}


function loadModel(modelPath) {
    console.log("***** loadModel "+modelPath);
    var config = {
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
    console.log("CONFIG: "+JSON.stringify(config));
    start(config);
}

/*
Do this so that if JQControls UI is used, when it starts, the document is
already complete.  That simplifies its initialization because it can build
all its elements before it returns.
*/
function start(config) {
    $(document).ready(e => start_(config));
}

function start_(config) {
    console.log("app.start", config);
    // this provides a way to view a model by constructiong
    // a default config for viewing it.
    if (config == null && Util.getParameterByName("model")) {
        var modelPath = Util.getParameterByName("model");
        loadModel(modelPath);
        return;
    }
    if (config == null && Util.getParameterByName("config")) {
        var configPath = Util.getParameterByName("config");
        if (!configPath.endsWith(".js")) {
            var configPath = "configs/"+configPath+".js";
        }
        loadConfig(configPath);
        return;
    }
    config = config || {};
    let vr = config.vr || Util.getParameterByName("vr");

    let pos = getStartPosition();

    if (vr) {
        window.game = new VRGame('canvas3d', config.gameOptions);
        let navigationController = new NavigationController(game.body, game.camera, game.plControls);
        game.registerController('navigation', navigationController);
        game.body.position.set(pos.start.x, 1.5, pos.start.z);
    } else {
        window.game = new Game('canvas3d', config.gameOptions);
        var cameraControls = config.cameraControls || "MultiControls";
        game.addControls(Util.getTypedObj(cameraControls));
        game.camera.position.set(pos.start.x, pos.start.y, pos.start.z);
        game.camera.up = new THREE.Vector3(0,1,0);
        game.camera.lookAt(pos.lookAt);
    }
    game.defaultGroupName = 'station';

    let program = new CMPProgram(game, config.program);

    if (config.ui) {
        alert("config.ui deprecated - please use config.webUI");
        config.webUI = config.ui;
    }
    if (config.webUI) {
        game.loadSpecs(Util.getTypedObj(config.webUI), "webUI");
    }

    var parts = [];
    if (config.venue)
        parts.push(game.loadSpecs(config.venue, "venue"));
    if (config.specs)
        parts.push(game.loadSpecs(config.specs, "specs"));
    Promise.all(parts).then(() => {
        console.log("loaded elements");
        console.log("****************** Starting game ******************");
        game.config = config;
        if (config.onStart) {
            config.onStart(game);
        }
        game.animate(0);
    });
}

window.start = start;
