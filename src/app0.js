
import * as THREE from 'three';

import TrackballControls from './lib/controls/TrackballControls';
import OrbitControls from './lib/controls/OrbitControls';
import CMP_Controls from './lib/controls/CMP_Controls';
import {Game} from './Game';
import {PlayerControl} from './PlayerControl';

import {addPlanet, addPlanets} from './lib/Planet';
import Stars from './lib/Stars';
import {loadBVH} from './loadBVH';
import loadModels from './loadModels';
import {loadScreen} from './loadScreen';
import CMPController from './controllers/CMPController';
import setupLights from './setupLights';
import {animTest, Anim} from './animTest';
import {setupHtmlControls} from './htmlControls';

import {screen1,labelsScreen,screen2,screen3} from './const/screen';

let {degToRad} = THREE.Math;

let mathboxContext;
let CMP;

let VIDEO_PATH = 'videos/Climate-Music-V3-Distortion_HD_540.webm';
let VIDEO2_PATH = 'http://dvr4.paldeploy.com/video/Sakura/WashingtonDCCherryBlossomFestival360.mp4';

let MODEL_SPECS = [{
    name: 'platform',
    path: 'models/PlayDomeSkp.dae',
    position: [0, 0, 0],
    //rotation: [0, degToRad(90), 0],
    rotation: [0, degToRad(0), 0],
    scale: 0.025
}];

let BVH_PATH = './models/bvh/MasterLiuPerformanceChar00.bvh';

window.game = new Game();
var playerControl = new PlayerControl(game);
setupHtmlControls(game, playerControl);
game.events.addEventListener('valueChange', msg => {
    console.log("valueChange: "+JSON.stringify(msg));
});

game.addOrbitControls();
let scene = game.scene;
game.gss = new GSS.SpreadSheet();
let starsGroup = new THREE.Group();
scene.add(starsGroup);
let stars = new Stars(starsGroup, 2500, {name: 'Stars'});
starsGroup.position.set(0, 0, 0);

//let cmpController = new CMPController(game.renderer.getUnderlyingRenderer(), game.scene, game.camera, {
let cmpController = new CMPController(game.renderer, game.scene, game.camera, {
  position: [0, 3, 0],
  rotation: [0, 0, 0],
  scale: [1.5, 1, 1.5]
});
game.registerController('cmp', cmpController);

loadBVH(game, 'dancer', BVH_PATH);

function start()
{
    console.log("animTest: ... ");
    window.Anim = Anim;
    addPlanets(game);
    var vEarth =  addPlanet(game, 'vEarth',   1.2, 0, 2, 0);
    var SF = {lat: 37.4, lon: -122};
    vEarth.addMarker(SF.lat, SF.lon)
    loadModels(MODEL_SPECS, game);
    loadScreen(VIDEO_PATH, game, screen1);
    loadScreen(VIDEO_PATH, game, labelsScreen);
    loadScreen(VIDEO2_PATH, game, screen3);
    setupLights(scene);
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


