
import * as THREE from 'three';

import {Game} from '../Game';
import {MUSENode} from '../Node';
import {Node3D} from '../Node3D';
import Util from '../Util';

// A particle system attached to a given Object3D That
// can generate a trail along the path of that object.
class ParticleSys {
    constructor(name, obj3D, parent)
    {
        console.log("creating ParticleSys "+name, obj3D, parent);
        parent = parent || game.scene;
        this.obj3D = obj3D;
        this.tick = 0;
        this.name = name;
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

    destroy() {
      console.log("destroying "+this.name);
      var ps = this.particleSystem;
      if (ps) {
        ps.parent.remove(ps);
      }
      else {
        console.log("*** no particleSystem for psys");
      }
      this.particleSystem = null;
    }
}

MUSE.ParticleSys = ParticleSys;

MUSE.SparklerOptions = {
    turbulence: .01,
    size: 19,
    lifetime: 13.5,
    positionRandomness: .055,
    velocityRandomness: .026
};

class Sparkler {
    constructor(name) {
        this.name = name || "sparkler";
        this.trailNames = ["left", "right"];
        this.pSystems = null;
        console.log("new Sparkler "+this.name);
        this.verbosity = 0;
        this.ps = null;
        this.pos = null;
        //this.addSparklers();
        game.registerController(this.name, this);
    }

    setColor(c) {
        console.log("Sparkler.setColor "+c);
        for (var name in this.pSystems) {
            var pSys = this.pSystems[name];
            pSys.options.color = c;
        }
    }

    getPsys(tname) {
        if (!this.pSystems) {
            console.log("No trails");
            return null;
        }
        var pSys = this.pSystems[tname];
        if (!pSys) {
            console.log("No trail named "+tname);
            return null;
        }
        return pSys;
    }

    trackObject(tname, obj3d) {
      console.log("Sparkler.trackObject "+tname, obj3d)
        var pSys = this.getPsys(tname);
        if (!pSys)
            return;
        pSys.trackedObject = obj3d;
    }

    setPosition(tname, pos) {
        var pSys = this.getPsys(tname);
        if (!pSys)
            return;
        var pos = Util.toVector3(pos);
        pSys._pos.copy(pos);
    }

    addSparklers(parent) {
        console.log("add sparkler");
        if (this.pSystems) {
            console.log("********************** already have sparkler!! ****");
            return;
        }
        this.pSystems = {};
        var x = 0;
        var y = 1;
        this.trailNames.forEach(name => {
            var pSys = new MUSE.ParticleSys(name, null, parent);
            var options = MUSE.SparklerOptions;
            pSys.options.turbulence = options.turbulence;
            pSys.options.size = options.size;
            pSys.options.lifetime = options.lifetime;
            pSys.options.positionRandomness = options.positionRandomness;
            pSys.options.velocityRandomness = options.velocityRandomness;
            /*
            pSys.options.turbulence = .01;
            pSys.options.size = 19;
            pSys.options.lifetime = 13.5;
            pSys.options.positionRandomness = .055;
            pSys.options.velocityRandomness = .026;
            */
            pSys._pos = new THREE.Vector3(x, y, 0);
            x += 1;
            this.pSystems[name] = pSys;
        })
    }

    removeSparklers() {
        console.log("remove sparklers");
        if (!this.pSystems) {
            console.log("No sparklers to remove");
            return;
        }
        for (var name in this.pSystems) {
            var pSys = this.pSystems[name];
            pSys.destroy();
        }
        this.pSystems = null;
    }

    toggle() {
        if (this.pSystems) {
            this.removeSparklers();
        }
        else {
            this.addSparklers();
        }
    }

    update() {
        if (this.verbosity) {
            console.log("sparkler.update");
        }
        if (!this.pSystems)
            return;
        for (var name in this.pSystems) {
            var pSys = this.pSystems[name];
            if (pSys.trackedObject) {
                var wp = pSys.trackedObject.getWorldPosition();
                pSys.update(wp);
            }
            else {
                pSys.update(pSys._pos);
            }
        }
    }
}

MUSE.Sparkler = Sparkler;

export {ParticleSys,Sparkler};
