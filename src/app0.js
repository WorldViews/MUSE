import * as THREE from 'three';

import TrackballControls from './lib/controls/TrackballControls';
import OrbitControls from './lib/controls/OrbitControls';
import CMP_Controls from './lib/controls/CMP_Controls';
//import initGame from './initGame';
import {Game} from './Game';
//import {MyGame} from './MyGame';

import {addPlanet, addPlanets} from './lib/Planet';
import Stars from './lib/Stars';

import loadChart from './loadChart';
import loadModels from './loadModels';
import loadScreen from './loadScreen';
import CMPDataViz from './lib/CMPDataViz';
import setupLights from './setupLights';
// import {animTest, Anim} from './animTest';
import {setupHtmlControls} from './htmlControls';

//import TWEEN from 'tween';
//import {interpolate} from 'd3-interpolate';
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
    //scale: [0.025, 0.025, 0.025]
    //scale: [0.03, 0.03, 0.03]
    scale: 0.025
}];

/*
class MyGame extends Game()
{
    constructor(elemId) {
	super(elemId);
    }
}
*/

var playerControl = {}
playerControl.setPlayTime = function(t)
{
    console.log(">>>> noticeTime "+t);
}

//window.game = new MyGame();
window.game = new Game();
setupHtmlControls(playerControl);
//game.addCMPControls();
game.addOrbitControls();
let scene = game.scene;
let starsGroup = new THREE.Group();
scene.add(starsGroup);
let stars = new Stars(starsGroup, 2500, {name: 'Stars'});
starsGroup.position.set(0, 0, 0);

let screen1 = {
    radius: 8.8,
    phiStart: 32,
    phiLength: 49,
    thetaStart: 110,
    thetaLength: 140
};

var labelsScreen = {
    radius: 8.6,
    phiStart: 32,
    phiLength: 49,
    thetaStart: -90,
    thetaLength: 60
}

let screen2 = {
    radius: 1.0,
    phiStart: 10,
    phiLength: 80,
    thetaStart: 40,
    thetaLength: 160,
    position: [0,3,0]
};

let screen3 = {
    radius: 0.5,
//    phiStart: 0,
//    phiLength: 90,
    position: [3,3,0]
};


function start()
{
    console.log("animTest: ... ");
    //animTest();
    //deleteMe();
    // window.Anim = Anim;
    CMP = new CMPDataViz(game.renderer, game.scene, game.camera);
    CMP.resize(window.innerWidth, window.innerHeight);
    game.CMP = CMP;
    game.registerUpdateHandler(() => game.CMP.update());
    loadChart(renderer, scene, camera).then(({context}) => {
      mathboxContext = context;
      game.mathboxContext = context;
    });

    addPlanets(scene);
    var vEarth =  addPlanet(scene, 'Earth',   1.2, 0, 2, 0);
    var SF = {lat: 37.4, lon: -122};
    vEarth.addMarker(SF.lat, SF.lon)
    loadModels(MODEL_SPECS, scene, game);
/*
    loadScreen(VIDEO_PATH, game.scene, screen1);
    loadScreen(VIDEO_PATH, game.scene, labelsScreen);
    loadScreen(VIDEO2_PATH, game.scene, screen3);
*/
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


/*
function vec(a) {
    var v = new THREE.Vector3(a[0],a[1],a[2]);
    console.log("v: "+JSON.stringify(v));
    return v;
}
console.log("====================================");
window.nkt = new THREE.NumberKeyframeTrack("nkt",
					   [0, 5, 6, 20],
					   [0, 2.0, 5.3, 15.0]);
console.log("====================================");
window.vcs = [[0,0,0],
	      [10,5,5],
	      [15,7,8],
	      [20,6,0]].map(vec);
window.vkt = new THREE.VectorKeyframeTrack("vkt",
					  [0, 5, 6, 20],
					   vcs);
*/
/*
window.coords = { x: 0, y: 0 };
window.tween = new TWEEN.Tween(coords)
        .to({ x: 100, y: 100 }, 30000)
	.onUpdate(function() {
		console.log(this.x, this.y);
	});

window.TWEEN = TWEEN;
window.i2 = interpolate(10,20);
window.iv2 = interpolate([0,0,0], [5,1,2]);
window.io = interpolate({'pos': [0,0,0], 'color': 'red'}, {pos: [5,3,1], color: 'green'});
var xx=25;
*/
