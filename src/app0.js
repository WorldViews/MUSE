import * as THREE from 'three';

import TrackballControls from './lib/controls/TrackballControls';
import OrbitControls from './lib/controls/OrbitControls';
import CMP_Controls from './lib/controls/CMP_Controls';
import initGame from './initGame';

import {addPlanet} from './lib/Planet';
import Stars from './lib/Stars';

import loadModels from './loadModels';
import loadScreen from './loadScreen';
import setupLights from './setupLights';

let {degToRad} = THREE.Math;

let VIDEO_PATH = 'videos/Climate-Music-V3-Distortion_HD_540.webm';
let VIDEO2_PATH = 'http://dvr4.paldeploy.com/video/Sakura/WashingtonDCCherryBlossomFestival360.mp4';

let MODEL_SPECS = [{
    path: 'models/PlayDomeSkp.dae',
    position: [0, 0, 0],
    //rotation: [0, degToRad(90), 0],
    rotation: [0, degToRad(0), 0],
    //scale: [0.025, 0.025, 0.025]
    //scale: [0.03, 0.03, 0.03]
    scale: 0.025
}];

let game = initGame();
let scene = game.scene;
let starsGroup = new THREE.Group();
scene.add(starsGroup);
//addLights(scene);
let stars = new Stars(starsGroup, 2500, {name: 'Stars'});
starsGroup.position.set(0, 0, 0);


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
    loadModels(MODEL_SPECS, scene);
    loadScreen(VIDEO_PATH, scene);
    //loadScreen(VIDEO_PATH, scene, screen2);
    loadScreen(VIDEO2_PATH, scene, screen3);
    console.log("****** adding planets ******");
    var vEarth =  addPlanet(scene, 'Earth',   1.2, 0, 2, 0);
    var earth =   addPlanet(scene, 'Earth',   1000, -2000, 0, 0);
    var mars =    addPlanet(scene, 'Mars',    200,   2000, 0, 2000,  './textures/Mars_4k.jpg');
    var jupiter = addPlanet(scene, 'Jupiter', 300,   1500, 0, -1500, './textures/Jupiter_Map.jpg');
    var nepture = addPlanet(scene, 'Nepture', 100,  -1000, 0, -1000, './textures/Neptune.jpg');
    var SF = {lat: 37.4, lon: -122};
    vEarth.addMarker(SF.lat, SF.lon)
    setupLights(scene);
    game.animate();
}

window.start = start;
