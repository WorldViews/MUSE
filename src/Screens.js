
import * as THREE from 'three';
import loadVideo from './loadVideo'
import {Math} from 'three';
import {Game} from './Game';
import ImageSource from './lib/ImageSource';

window.VIDURL = 'videos/Climate-Music-V3-Distortion_HD_540.webm';

//import {R, TH_LEN, TH_MIN, PH_LEN, PH_MIN} from './const/screen';
import {screen1} from './const/screen';

//var spec = screen1;
//console.log("spec: "+spec);

function toRad(v)
{
    return v ? Math.degToRad(v) : v;
}

class Screen
{
    constructor(game, spec, path) {
        console.log("---------------- Screen", spec);
        spec = spec || screen1;
        this.game = game;
        this.imageSource = null;
        var scene = game.scene;
        var path = path || spec.path;
        console.log('****************************** Loading screen... video: '+path);
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

            //scene.add(screenParent);
            this.imageSource = imageSource;
            this.material = videoMaterial;
            game.addToGame(screenParent, spec.name, spec.parent);
        });
        if (spec.name)
            game.screens[spec.name] = this;
    }

    setPlayTime(t) {
        this.imageSource.setPlayTime(t);
    }

    updateImage(url) {
        console.log("Getting ImageSource "+url);
        this.imageSource = new ImageSource({
            //type: ImageSource.TYPE.VIDEO,
            type: ImageSource.TYPE.IMAGE,
            url: url
        });
        let texture = this.imageSource.createTexture();
        this.material.map = texture;
        this.texture = texture;
        /*
        let videoMaterial = new THREE.MeshBasicMaterial({
            map: videoTexture,
            transparent: true,
            side: THREE.DoubleSide
        });
        */
    }

    updateVideo(videoUrl) {
        console.log("Getting ImageSource "+videoUrl);
        this.imageSource = new ImageSource({
            type: ImageSource.TYPE.VIDEO,
            url: videoUrl
        });
        let texture = this.imageSource.createTexture();
        this.material.map = texture;
    }
}

function loadScreen(game, opts)
{
    return new Screen(game, opts);
}

function loadScreens(game)
{
    loadScreen(game, screen1);
}

Game.registerNodeType("Screen", loadScreen);

export {loadScreen, loadScreens};
