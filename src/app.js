import * as THREE from 'three';

import {MUSE} from 'core/MUSE';
import { CMPDataUpdater } from 'packages/CMPViz/CMPData';
import { CMPDataVizController } from 'packages/CMPViz/CMPDataVizController';
import { Scripts } from 'core/Scripts';
import { PanoPortal } from 'packages/PanoPortal/PanoPortal';
import { Program } from 'core/Program';
import 'core/Screens';
import { Game } from 'core/Game';
import { NetLink } from 'core/NetLink';
import Util from 'core/Util';
import { Dancer } from 'packages/Dancer/DanceController';
import { KinectWatcher } from 'packages/Dancer/KinectWatcher';
import { KinSkelWatcher } from 'packages/Dancer/KinSkelWatcher';
import 'packages/Astro/CelestialBodies';
import StatsController from 'gui/StatsController';
import {JQControls} from 'gui/JQControls';
import DATGUIControls from 'gui/DATGUIControls';
import VRGame from 'core/VRGame';
import WebVR from 'lib/vr/WebVR';

import { ViewManager } from 'core/ViewManager';
import { addLight, setupLights } from 'core/Lights';
import { DynamicObjectDB_test } from 'lib/DynamicObjectDB';
import { SlidePlayer } from 'lib/MediaControl';
import { Hurricane } from 'lib/Hurricane';
import { VirtualEarth } from 'packages/Astro/VirtualEarth';
import { Kessler } from 'packages/Kessler/KesslerNode';
import 'packages/Samples/OpenPerformer';
import 'packages/Samples/ExampleNode';

import { Player0 } from 'interfaces/PlayerInterface';
import {Route} from 'core/Route';
import '../test/testNode';
import 'packages/Miura/Miura';
import 'packages/Community/Community';
import 'packages/Midi/MidiPlayer';
import 'packages/Spirals/Spirals';
import 'packages/Cloth/Cloth';

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
        if (config.nodes)
            parts.push(game.loadSpecs(config.nodes, "nodes"));
        Promise.all(parts).then(() => {
            console.log("****************** Starting game ******************");
            game.config = config;
            game.startGame();
        });
    });
}

window.start = start;
