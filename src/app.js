import * as THREE from 'three';

import {MUSE} from 'MUSE';
import { CMPDataUpdater } from 'controllers/CMPData';
import { CMPDataVizController } from 'controllers/CMPDataVizController';
import { Scripts } from 'Scripts';
import { PanoPortal } from 'lib/PanoPortal';
import { Program } from 'Program';
import 'Screens';
import { Game } from 'Game';
import { NetLink } from 'NetLink';
import Util from 'Util';
import { Dancer } from 'controllers/DanceController';
import { KinectWatcher } from 'controllers/KinectWatcher';
import NavigationController from 'controllers/NavigationController';
import 'lib/CelestialBodies';
//import StarsController from 'controllers/StarsController';
import StatsController from 'controllers/StatsController';
import {ReactControls} from 'controllers/ReactControls';
import {JQControls} from 'controllers/JQControls';
import DATGUIControls from 'controllers/DATGUIControls';
import VRGame from 'VRGame';
import WebVR from 'lib/vr/WebVR';

import { ViewManager } from 'ViewManager';
import { addLight, setupLights } from 'Lights';
import { DynamicObjectDB_test } from 'lib/DynamicObjectDB';
import { SlidePlayer } from 'lib/MediaControl';
import { Hurricane } from 'lib/Hurricane';
import { VirtualEarth } from 'lib/VirtualEarth';
import { Kessler } from 'KesslerNode';
import 'Samples/OpenPerformer';
import 'Samples/ExampleNode';


import { Player0 } from 'interfaces/PlayerInterface';
import {Route} from 'Route';
import '../test/testNode';
import 'packages/Miura/Miura';

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
        gameOptions: {ambientLightIntensity: 2},
        specs: [
            {type: 'Model', 'name': 'model', 'path': modelPath,
             fitTo: {position:[0,0,0], scale: 1}}
        ]
    };
    console.log("CONFIG: "+JSON.stringify(config));
    start(config);
}

/*
start processes a configuration and begins the game.  The argument can
either be a configuation object, a URL to a .js or .json for the configuration
object.   If no configuration is given, the query string is checked.  If a
config option is given in the query string, that is used to get a URL for
the config.  If a "model" option is given, a simple configuration is set
up to display that model.

Not that this first waits until document is fully loaded, which makes
initializeion of DOM related stuff (e.g. by JQControls) simpler.
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
    if (typeof config == "string") {
        loadConfig(config);
        return;
    }
    config = config || {};
    let vr = config.vr || Util.getParameterByName("vr");

    let pos = getStartPosition();

    if (vr) {
        window.game = new VRGame('canvas3d', config.gameOptions);
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

    var parts = [];
    console.log("****** Getting program *******");
    var getProgram;
    if (!config.program)
        config.program = {type: "Program"};
    var getProgram = game.loadSpecs(config.program, "Program", "Program");
    getProgram.then(() => {
        console.log("**************** Program Loaded ********************");
        if (config.webUI)
            parts.push(game.loadSpecs(Util.getTypedObj(config.webUI), "webUI"));
        if (config.venue)
            parts.push(game.loadSpecs(config.venue, "venue"));
        if (config.environment)
            parts.push(game.loadSpecs(config.environment, "environment"));
        if (config.specs)
            parts.push(game.loadSpecs(config.specs, "specs"));
        Promise.all(parts).then(() => {
            console.log("****************** Starting game ******************");
            game.config = config;
            game.startGame();
        });
    });
}

window.start = start;
