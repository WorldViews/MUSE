
import loadVideo from './loadVideo'
import * as THREE from 'three';
import {Math} from 'three';

//import {R, TH_LEN, TH_MIN, PH_LEN, PH_MIN} from './const/screen';
import {screen1} from './const/screen';

//var spec = screen1;
//console.log("spec: "+spec);

function toRad(v)
{
    return v ? Math.degToRad(v) : v;
}

function loadScreen(path, game, spec)
{
    var screenObj = {ready: false};
    var scene = game.scene;
    spec = spec || screen1;
    console.log('Loading screen... video: '+path);
    console.log("spec: "+JSON.stringify(spec));
    //var spec = {x: 5.5, y: 2.5, z: -0.1, width: 6.5, height: 4.0};
    //loadVideo(VIDEO_PATH).then(({imageSource, videoMaterial}) => {
    loadVideo(path).then(({imageSource, videoMaterial}) => {
	console.log('Creating video geometry...');

	// note that the theta and phi arguments are reversed
	// from what is described in THREE.SphereGeometry documenation.
	let geometry = new THREE.SphereGeometry(
	    spec.radius,
	    40,
	    40,
	    toRad(spec.thetaStart),
	    toRad(spec.thetaLength),
	    toRad(spec.phiStart),
	    toRad(spec.phiLength)
	);
	let screenObject = new THREE.Mesh(geometry, videoMaterial);
	
	var s = 1.0;
	if (spec.scale)
	    s = spec.scale;
	screenObject.scale.x = -1*s;
	screenObject.scale.y = s;
	screenObject.scale.z = s;
	screenObject.position.y = 0;
	if (spec.position)
	    screenObject.position.fromArray(spec.position);
	screenObject.name = "movieScreen";

	let screenParent = new THREE.Object3D();
	screenParent.add(screenObject);
	screenParent.rotation.z = 0;

	scene.add(screenParent);
	screenObj.imageSource = imageSource;
	screenObj.ready = true;
    });
    if (spec.name)
	game.screens[spec.name] = screenObj;
    return screenObj;
}

export {loadScreen};
