
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
        this.spec = spec;
        var name = spec.name || "movieScreen";
        this.channel = spec.channel || name;
        var path = path || spec.path;
        console.log('****** Loading screen... video: '+path);
        console.log("spec: "+JSON.stringify(spec));
        this.geometry = new THREE.SphereGeometry(
            spec.radius, 40, 40,
            toRad(spec.thetaStart),  toRad(spec.thetaLength),
            toRad(spec.phiStart),    toRad(spec.phiLength)
        );
        //let sourceSpec = getTypeFromURL(url);
        this.imageSource = ImageSource.getImageSource(path, this.spec);
        var videoTexture = this.imageSource.createTexture();
        this.material = new THREE.MeshBasicMaterial({
            map: videoTexture,
            transparent: true,
            side: THREE.DoubleSide
        });
        let screenObject = new THREE.Mesh(this.geometry, this.material);
        screenObject.name = spec.name+"_mesh";
        var s = spec.screenScale || 1.0;
        screenObject.scale.set(-s, s, s);
        let screenParent = new THREE.Object3D();
        screenParent.add(screenObject);
        game.setFromProps(screenParent, spec);
        game.addToGame(screenParent, spec.name, spec.parent);
        screenParent.userData = {doubleClick: "FOO"};
        if (spec.name)
            game.screens[spec.name] = this;
        var inst = this;
        console.log("******************** registerWatcher: "+spec.name);
        game.state.on(this.channel, (name, oldProps, newProps) => inst.onChange(newProps));
    }

    //watchProperties(evt) {
    //    var props = evt.message;
    onChange(props) {
        console.log("Screen.onChange"+JSON.stringify(props));
        if (props.url)
            this.updateImage(props.url, props);
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

    updateImage(url, options) {
        console.log("Getting ImageSource "+url);
        if (this.imageSource) {
            this.imageSource.dispose();
        }
        this.imageSource = ImageSource.getImageSource(url, options);
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
