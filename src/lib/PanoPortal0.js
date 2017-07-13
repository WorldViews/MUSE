
import loadVideo from '../loadVideo'
import * as THREE from 'three';
import {Math} from 'three';

export let screen1 = {
    name: "portal",
    parent: 'station',
    path: 'videos/Climate-Music-V3-Distortion_HD_540.webm',
    radius: 8.8,
    phiStart: 34,
    phiLength: 47,
    thetaStart: 110,
    thetaLength: 140
};

var screen3 = {
    name: "bubbleScreen1",
    radius: 0.5,
    path: 'videos/YukiyoCompilation.mp4',
    //    phiStart: 0,
    //    phiLength: 90,
    position: [3,1,0]
}

function toRad(v)
{
    return v ? Math.degToRad(v) : v;
}

//export default class PanoPortal {
class PanoPortal0 {

    constructor(game, spec) {
	spec = spec || screen3;
	var screenObj = {ready: false};
	var scene = game.scene;
	var path = path || spec.path;
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
            let screenMesh = new THREE.Mesh(geometry, videoMaterial);
            var s = 1.0;
            if (spec.scale)
		s = spec.scale;
            screenMesh.scale.x = -1*s;
            screenMesh.scale.y = s;
            screenMesh.scale.z = s;
            screenMesh.position.y = 0;
            if (spec.position)
		screenMesh.position.fromArray(spec.position);
            screenMesh.name = "movieScreen";

            let screenParent = new THREE.Object3D();
            screenParent.add(screenMesh);
            screenParent.rotation.z = 0;

            //scene.add(screenParent);
            screenObj.imageSource = imageSource;
            screenObj.ready = true;
            game.addToGame(screenParent, spec.name, spec.parent);
	    this.screenParent = screenParent;
	    this.mesh = screenMesh;
	});
	if (spec.name)
            game.screens[spec.name] = screenObj;
    }

    play() {
	console.log("play");
    }

    pause() {
	console.log("pause");
    }

    get visible() {
	if (!this.screenParent) {
	    console.log("PanoPortal.set no screenParent");
	    return false;
	}
	return this.screenParent.visible;
    }

    set visible(v) {
	console.log("PanoPortal.set visible "+v);
	if (!this.screenParent) {
	    console.log("PanoPortal.set no screenParent");
	}
	this.screenParent.visible = v;
    }
}

export {PanoPortal0};
