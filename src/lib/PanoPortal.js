
import loadVideo from '../loadVideo'
import * as THREE from 'three';
import {Math} from 'three';

var pspec = {
    name: "bubbleScreen1",
    radius: 0.5,
    path: 'videos/YukiyoCompilation.mp4',
    //    phiStart: 0,
    //    phiLength: 90,
    position: [3,.8,0]
}

function toRad(v)
{
    return v ? Math.degToRad(v) : v;
}

//export default class PanoPortal {
class PanoPortal {

    constructor(game, spec) {
        spec = spec || pspec;
        var screenObj = {ready: false};
        var scene = game.scene;
        var path = spec.path;
        var radius = spec.radius || 1;
        var baseRadius = spec.baseRadius || 0.7*radius;
        var baseHeight = spec.baseHeight || 1.0;
        var innerRadius = spec.innerRadius || 0.1;
        var height = spec.height || 0.5;
        console.log('Loading screen... video: '+path);
        console.log("spec: "+JSON.stringify(spec));
        //var spec = {x: 5.5, y: 2.5, z: -0.1, width: 6.5, height: 4.0};
        //loadVideo(VIDEO_PATH).then(({imageSource, videoMaterial}) => {
        loadVideo(path).then(({imageSource, videoMaterial}) => {
            console.log('Creating video geometry...');
            // note that the theta and phi arguments are reversed
            // from what is described in THREE.SphereGeometry documenation.
            //meshMaterial new THREE.MeshBasicMaterial( { color: 0xffaa00, transparent: true, blending: THREE.AdditiveBlending } ) );

            var baseMaterial = new THREE.MeshBasicMaterial( { color: 0xaa6600 } );
            let sphereGeo = new THREE.SphereGeometry(
                spec.radius,
                40,
                40,
                toRad(spec.thetaStart),
                toRad(spec.thetaLength),
                toRad(spec.phiStart),
                toRad(spec.phiLength)
            );
            let cylGeo = new THREE.CylinderGeometry(0.1*spec.radius, spec.radius, height, 60, 40, true);
            let baseGeo = new THREE.CylinderGeometry(radius, baseRadius, baseHeight, 60, 40, true);
            var geo = cylGeo;
            var geo = cylGeo;
            let screenMesh = new THREE.Mesh(geo, videoMaterial);
            let baseMesh = new THREE.Mesh(baseGeo, baseMaterial);
            var s = 1.0;
            if (spec.scale)
                s = spec.scale;
            screenMesh.scale.x = -1*s;
            screenMesh.scale.y = s;
            screenMesh.scale.z = s;
            screenMesh.position.y = baseHeight/2 - height/2;
            //if (spec.position)
            //screenMesh.position.fromArray(spec.position);
            screenMesh.name = "movieScreen";
            baseMesh.scale.y = 1;
            baseMesh.position.y = -baseHeight/2;
            let screenParent = new THREE.Object3D();
            screenParent.add(screenMesh);
            screenParent.add(baseMesh);
            screenParent.rotation.z = 0;

            //scene.add(screenParent);
            screenObj.imageSource = imageSource;
            screenObj.ready = true;
            game.addToGame(screenParent, spec.name, spec.parent);
            game.setFromProps(screenParent, spec);
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

export {PanoPortal};
