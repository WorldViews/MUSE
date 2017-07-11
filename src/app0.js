import * as THREE from 'three';

//import OrbitControls from './lib/controls/OrbitControls';
//import CMP_Controls from './lib/controls/CMP_Controls';
import {CMPProgram} from './CMPProgram';
import {Game} from './Game';
import Marquee from './Marquee';
import StarsController from './controllers/StarsController';

import {addPlanet, addPlanets} from './lib/Planet';
import Stars from './lib/Stars';
import {DanceController} from './controllers/DanceController';
import loadModels from './loadModels';
import {loadScreen, loadScreens} from './loadScreen';
import CMPController from './controllers/CMPController';
import {setupLights} from './setupLights';
import {animTest, Anim} from './animTest';
import {setupHtmlControls} from './htmlControls';
import setupMarquee from './setupMarquee';

import {screen1,labelsScreen,screen2,screen3,coverScreen} from './const/screen';

let {degToRad} = THREE.Math;

let VIDEO_PATH = 'videos/Climate-Music-V3-Distortion_HD_540.webm';
let VIDEO2_PATH = 'http://dvr4.paldeploy.com/video/Sakura/WashingtonDCCherryBlossomFestival360.mp4';

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

var programControl = new CMPProgram(game);
setupHtmlControls(game, programControl);
game.events.addEventListener('valueChange', msg => {
    console.log("valueChange: "+JSON.stringify(msg));
});

//game.addOrbitControls();
//game.addCMPControls();
game.addMultiControls();
let scene = game.scene;

game.gss = new GSS.SpreadSheet();

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
game.addToGame(game.marquee, "marquee1");
setupMarquee(game);

//game.reparent(game.camera, 'station');

function start()
{
    console.log("animTest: ... ");
    window.Anim = Anim;
    window.animTest = animTest;
    addPlanets(game);
    var vEarth =  addPlanet(game, 'vEarth',   1.2, 0, 2, 0, null, game.defaultGroupName);
    var SF = {lat: 37.4, lon: -122};
    vEarth.addMarker(SF.lat, SF.lon)
    loadModels(MODEL_SPECS, game);
    loadScreens(game);
    //loadScreen(game, screen1, VIDEO_PATH);
    //loadScreen(game, labelsScreen, VIDEO_PATH);
    //loadScreen(VIDEO_PATH, game, coverScreen);
    //loadScreen(VIDEO2_PATH, game, screen3);
    setupLights(game);
    game.animate();
}

window.start = start;
window.attach = THREE.SceneUtils.attach;
window.detach = THREE.SceneUtils.detach;

window.reparent = function(obj, parent)
{
    parent.updateMatrixWorld();
    attach(obj, game.scene, parent);
}


window.moveIntoShip = function()
{
    var ship = game.models.platform.scene;
    attach(game.camera, game.scene, ship);
}


