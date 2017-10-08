
import * as THREE from 'three';
import {Math} from 'three';
import {Game} from './Game';
import ImageSource from './lib/ImageSource';

function toRad(v)
{
    return v ? Math.degToRad(v) : v;
}

class Screen
{
    constructor(game, spec, path) {
        console.log("---------------- Screen", spec);
        this.game = game;
        var name = spec.name || "movieScreen";
        var path = path || spec.path;
        console.log('****** Loading screen... video: '+path);
        console.log("spec: "+JSON.stringify(spec));
        this.geometry = new THREE.SphereGeometry(
            spec.radius, 40, 40,
            toRad(spec.thetaStart),  toRad(spec.thetaLength),
            toRad(spec.phiStart),    toRad(spec.phiLength)
        );
        //let sourceSpec = getTypeFromURL(url);
        this.imageSource = ImageSource.getImageSource(path);
        var videoTexture = this.imageSource.createTexture();
        this.material = new THREE.MeshBasicMaterial({
            map: videoTexture,
            transparent: true,
            side: THREE.DoubleSide
        });
        let screenObject = new THREE.Mesh(this.geometry, this.material);
        var s = spec.screenScale || 1.0;
        screenObject.scale.set(-s, s, s);
        let screenParent = new THREE.Object3D();
        screenParent.add(screenObject);
        game.setFromProps(screenParent, spec);
        game.addToGame(screenParent, spec.name, spec.parent);

        if (spec.name)
            game.screens[spec.name] = this;
    }

    play() {
        this.imageSource.play();
    }

    pause() {
        this.imageSource.pause();
    }

    setPlayTime(t) {
        this.imageSource.setPlayTime(t);
    }

    updateImage(url) {
        console.log("Getting ImageSource "+url);
        if (this.imageSource) {
            this.imageSource.dispose();
        }
        this.imageSource = ImageSource.getImageSource(url);
        let texture = this.imageSource.createTexture();
        this.material.map = texture;
        this.texture = texture;
        this.play();
    }
}

function loadScreen(game, opts)
{
    return new Screen(game, opts);
}

Game.registerNodeType("Screen", loadScreen);

export {loadScreen};
