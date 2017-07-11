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
        name: 'platform',
        parent: 'station',
        //path: 'models/PlayDomeSkp.dae',
        path: 'models/PlayDomeSkp_v1.dae',
        position: [0, 0, 0],
        //rotation: [0, degToRad(90), 0],
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

window.game = new Game();
game.defaultGroupName = "station";

let starsController = new StarsController(game.scene, [0, 0, 0]);
game.registerController('stars', starsController);

//game.addOrbitControls();
//game.addCMPControls();
game.addMultiControls();

game.gss = new GSS.SpreadSheet();

var cmpProgram = new CMPProgram(game);
setupHtmlControls(game, cmpProgram);

let cmpController = new CMPController(game.renderer, game.scene, game.camera, {
    position: [0, 3, 0],
    rotation: [0, 0, 0],
    scale: [1.5, 1, 1.5]
});
game.registerController('cmp', cmpController);

var dancer = new DanceController(game);
game.registerController('dancer', dancer);
programControl.registerPlayer(dancer);

game.marquee = new Marquee();
game.addToGame(game.marquee, "marquee1"); // cause it to get grouped properly
setupMarquee(game);

function start()
{
    loadModels(MODEL_SPECS, game);
    loadScreens(game);
    addPlanets(game);
    window.Anim = Anim;
    window.animTest = animTest;
    var vEarth =  addPlanet(game, 'vEarth',   1.2, 0, 2, 0, null, game.defaultGroupName);
    var SF = {lat: 37.4, lon: -122};
    vEarth.addMarker(SF.lat, SF.lon)
    setupLights(game);
    //game.body.position.set(2, 1.5, 2);
    game.animate();
}

window.start = start;

