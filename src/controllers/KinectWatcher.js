
import * as THREE from 'three';
import {Game} from '../Game';
import {MUSENode} from '../Node';
import {Node3D} from '../Node3D';
import { sprintf } from "sprintf-js";

class KinectWatcher extends Node3D
{
    constructor(game, opts)
    {
        super(game, opts);
        this.game = game;
        opts = opts || {};
	    //opts.scale = opts.scale || 0.06;
        this.checkOptions(opts);
        this.pSystems = [];
        this.color = new THREE.Color();
        if (game.netLink) {
            game.netLink.registerKinectWatcher(this);
        }
        else {
            alert("No NetLink");
        }
        var inst = this;
        game.state.on(this.name, state => inst.setProps(state));
        game.state.on("cmpColorHue", h => inst.setHue(h));
    }

    setHue(h) {
        this.color.setHSL(h,.9,.5);
        this.setColor(this.color);
    }

    setColor(c) {
        this.color.copy(c);
        this.pSystems.forEach(pSys => pSys.setColor(c));
    }

    update() {
        if (!this.visible)
	       return;
    }

    handleMessage(msg) {
        //console.log("KinectWatcher....... msg: "+JSON.stringify(msg, null, 3));
        var lh = msg.LEFT_HAND;
        var rh = msg.RIGHT_HAND;
        if (!(lh && rh)) {
            return;
        }
        console.log(sprintf("lh: %6.2f %6.2f %6.2f  rh: %6.2f %6.2f %6.2f",
            lh[0], lh[1], lh[2],  rh[0], rh[1], rh[2]));
    }
}

// A particle system attached to a given Object3D That
// can generate a trail along the path of that object.
class KPSys {
    constructor(name, obj3D, parent)
    {
        parent = parent || game.scene;
        this.obj3D = obj3D;
        this.tick = 0;
        this.clock = new THREE.Clock();
        //this.axes = new THREE.AxisHelper(500);
        //this.obj3D.add(this.axes);
        this.particleSystem = new THREE.GPUParticleSystem( {
				maxParticles: 250000
			} );
        parent.add(this.particleSystem);
        this.options = {
				position: new THREE.Vector3(),
				positionRandomness: .2,
				velocity: new THREE.Vector3(),
				velocityRandomness: .2,
				color: 0xaa88ff,
				colorRandomness: .2,
				turbulence: .35,
				lifetime: 10,
				size: 4,
				sizeRandomness: 1
			};
        this.spawnerOptions = {
				spawnRate: 15000,
				horizontalSpeed: 1.5,
				verticalSpeed: 1.33,
				timeScale: 1
			};
    }

    setColor(c) {
        //console.log("PSys setColor ", c);
        this.options.color = c;
    }

    update() {
        var options = this.options;
        var spawnerOptions = this.spawnerOptions;
        var delta = this.clock.getDelta() * spawnerOptions.timeScale;
        this.tick += delta;
        if ( this.tick < 0 ) this.tick = 0;
        var pos = this.obj3D.getWorldPosition();
        //var s = 0.06;
        if ( delta > 0 ) {
            options.position.copy(pos);
            //options.position.x = Math.sin( this.psTick * spawnerOptions.horizontalSpeed ) * 20;
            //options.position.y = Math.sin( this.psTick * spawnerOptions.verticalSpeed ) * 10;
            //options.position.z = Math.sin( this.psTick * spawnerOptions.horizontalSpeed + spawnerOptions.verticalSpeed ) * 5;
            for ( var x = 0; x < spawnerOptions.spawnRate * delta; x++ ) {
                // Yep, that's really it.	Spawning particles is super cheap, and once you spawn them, the rest of
                // their lifecycle is handled entirely on the GPU, driven by a time uniform updated below
                this.particleSystem.spawnParticle( options );
            }
        }
        this.particleSystem.update( this.tick );
    }
}

MUSENode.defineFields(KinectWatcher, [
    "skelColor"
]);

function addKinectWatcher(game, opts)
{
    //var name = opts.name || 'kinectWatcher';
    let kw = new KinectWatcher(game, opts);
    game.registerController(name, kw.name);
    //game.registerPlayer(dancer);
    //var readyPromise = dancer.readyPromise;
    //return readyPromise;
    return kw;
}

Game.registerNodeType("KinectWatcher", addKinectWatcher);

export {KinectWatcher};
