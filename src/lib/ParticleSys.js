
import * as THREE from 'three';

import {Game} from '../Game';
import {MUSENode} from '../Node';
import {Node3D} from '../Node3D';


// A particle system attached to a given Object3D That
// can generate a trail along the path of that object.
class ParticleSys {
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
        /*
        options = {
				position: new THREE.Vector3(),
				positionRandomness: .3,
				velocity: new THREE.Vector3(),
				velocityRandomness: .5,
				color: 0xaa88ff,
				colorRandomness: .2,
				turbulence: .5,
				lifetime: 2,
				size: 5,
				sizeRandomness: 1
			};
			spawnerOptions = {
				spawnRate: 15000,
				horizontalSpeed: 1.5,
				verticalSpeed: 1.33,
				timeScale: 1
			};
        */
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

    update(pos) {
        var options = this.options;
        var spawnerOptions = this.spawnerOptions;
        var delta = this.clock.getDelta() * spawnerOptions.timeScale;
        this.tick += delta;
        if ( this.tick < 0 ) this.tick = 0;
        if (!pos) {
            if (!this.obj3D) {
                console.log("No way to get position");
                return;
            }
            pos = this.obj3D.getWorldPosition();
        }
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

export {ParticleSys};
