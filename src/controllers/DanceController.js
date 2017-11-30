
import * as THREE from 'three';

import {BVHLoader} from '../BVHLoader';
import {Game} from '../Game';
import {MUSENode} from '../Node';
import {Node3D} from '../Node3D';

let BVH_PATH1 = './assets/models/bvh/MasterLiuPerformanceChar00.bvh';
let BVH_PATH2 = '/assets/motionCapture/lauren_duality_edit.bvh';
let BVH_PATH = BVH_PATH1;

class DanceController extends Node3D
{
    constructor(game, opts)
    {
        super(game, opts);
        this.game = game;
        opts = opts || {};
        opts.motionUrl = opts.motionUrl || BVH_PATH;
	    opts.scale = opts.scale || 0.06;
        this.checkOptions(opts);
        //this.name = opts.name || "dancer";
        this.clock = new THREE.Clock();
        this.skeletonHelper = null;
        this.dancer = null;
        this.mixer = null;
        this.opts = opts;
        this.ready = false;
        this.readyPromise = null;
        this.head = null;
        this.particleSystem = null;
        this.loadBVH(opts.motionUrl);
        var inst = this;
        game.state.on(this.name, state => inst.setProps(state));
        //game.loadSpecs({type: "Axes", name: "dancerAxes", parent: opts.parent});
    }

    setProps(props) {
        console.log("DancerController.setProps "+JSON.stringify(props));
        if (props.motionUrl)
            this.loadBVH(props.motionUrl);
    }

    update() {
        if (!this.visible)
	       return;
        //console.log("DanceController.update...");
        if ( this.mixer ) this.mixer.update( this.clock.getDelta() );
        if ( this.skeletonHelper ) this.skeletonHelper.update();
        if (this.particleSystem) {
            this.psUpdate();
        }
        //console.log("head: " + head.position.x+" "+head.position.y+" "+head.position.z);
        //this.axes.position.copy(head.position);
    }
/*
    loadBVH(bvhPath) {
        console.log("loadBVH: "+this.name+" "+bvhPath);
        var opts = this.opts;
        var loader = new BVHLoader();
        var inst = this;
        loader.load( bvhPath, function( bvh ) {
            inst._setupBVH(bvh, inst.opts);
        });
    }
*/
    loadBVH(bvhPath) {
        console.log("loadBVH: "+this.name+" "+bvhPath);
        var opts = this.opts;
        var loader = new BVHLoader();
        var inst = this;
        this.readyPromise = new Promise((resolve, reject) => {
            loader.load( bvhPath, function( bvh ) {
                inst._setupBVH(bvh, inst.opts);
                resolve(this);
            });
        });
    }

    _setupBVH(bvh, opts) {
        var inst = this;
        console.log("_setupBVH: ", bvh);
        //var dancer = new THREE.Object3D();
        var dancer = new THREE.Group();
        game.setFromProps(dancer, opts)
        if (inst.dancer) {
            dancer.visible = inst.dancer.visible;
            inst._removeDancer(inst.dancer);
        }
        var skeletonHelper = new THREE.SkeletonHelper( bvh.skeleton.bones[ 0 ] );
        skeletonHelper.skeleton = bvh.skeleton;
        // allow animation mixer to bind to SkeletonHelper directly
        skeletonHelper.material.depthTest = true;
        var boneContainer = new THREE.Group();
        boneContainer.add( bvh.skeleton.bones[ 0 ] );
        dancer.add( skeletonHelper );
        dancer.add( boneContainer );
        console.log(dancer);
        game.addToGame(dancer, opts.name, opts.parent);
        inst.mixer = new THREE.AnimationMixer( skeletonHelper );
        //inst.mixer.clipAction( bvh.clip ).setEffectiveWeight( 1.0 ).play();
        inst.action = inst.mixer.clipAction( bvh.clip ).setEffectiveWeight( 1.0 );
        inst.action.play();
        inst.dancer = dancer;
        inst.skeletonHelper = skeletonHelper;
        inst.game.models[name] = dancer;
        inst.ready = true;
        this.head = this.skeletonHelper.bones[14];
        //this.psSetup();
        inst.update();
    }

    psSetup()
    {
        this.psTick = 0;
        this.axes = new THREE.AxisHelper(500);
        this.psClock = new THREE.Clock();
        this.head.add(this.axes);
        this.particleSystem = new THREE.GPUParticleSystem( {
				maxParticles: 250000
			} );
        this.head.add(this.particleSystem);
        this.psOptions = {
				position: new THREE.Vector3(),
				positionRandomness: .3,
				velocity: new THREE.Vector3(),
				velocityRandomness: .1,
				color: 0xaa88ff,
				colorRandomness: .2,
				turbulence: .5,
				lifetime: 20,
				size: 5,
				sizeRandomness: 1
			};
        this.psSpawnerOptions = {
				spawnRate: 15000,
				horizontalSpeed: 1.5,
				verticalSpeed: 1.33,
				timeScale: 1
			};
    }

    psUpdate() {
        var options = this.psOptions;
        var spawnerOptions = this.psSpawnerOptions;
        var delta = this.psClock.getDelta() * spawnerOptions.timeScale;
        this.psTick += delta;
        if ( this.psTick < 0 ) this.psTick = 0;
        if ( delta > 0 ) {
            //options.position.x = Math.sin( this.psTick * spawnerOptions.horizontalSpeed ) * 20;
            //options.position.y = Math.sin( this.psTick * spawnerOptions.verticalSpeed ) * 10;
            //options.position.z = Math.sin( this.psTick * spawnerOptions.horizontalSpeed + spawnerOptions.verticalSpeed ) * 5;
            for ( var x = 0; x < spawnerOptions.spawnRate * delta; x++ ) {
                // Yep, that's really it.	Spawning particles is super cheap, and once you spawn them, the rest of
                // their lifecycle is handled entirely on the GPU, driven by a time uniform updated below
                this.particleSystem.spawnParticle( options );
            }
        }
        this.particleSystem.update( this.psTick );
    }

    _removeDancer(dancer) {
        dancer.parent.remove(dancer);
        this.dancer = null;
        this.action = null;
        this.mixer = null;
        this.skeletonHelper = null;
        this.ready = false;
        //dancer.destroy() //TODO: is more cleanup necessary?
    }

    setScale(s) {
        if (!this.ready) { console.log("Dancer not ready"); return};
        this.dancer.scale.set(s,s,s);
    }

    get visible() {
        return this.dancer !=null && this.dancer.visible;
    }

    set visible(v) {
        if (this.dancer)
            this.dancer.visible = v;
    }

    // Player Interface methods
    getPlayTime() {
        if (!this.ready) { console.log("Dancer not ready"); return};
        return this.mixer.time;
    }

    setPlayTime(t) {
        //this.mixer.time = t;
        if (!this.ready) { console.log("Dancer not ready"); return};
        this.action.time = t;
    }

    getPlaySpeed() {
        if (!this.ready) { console.log("Dancer not ready"); return};
        return this.mixer.timeScale;
    }

    setPlaySpeed(s) {
        if (!this.ready) { console.log("Dancer not ready"); return};
        this.mixer.timeScale = s;
    }

    play() {
        this.mixer.timeScale = 1;
    }

    pause() {
        this.mixer.timeScale = 0;
    }
}

MUSENode.defineFields(DanceController, [
    "motionUrl"
]);

function addDancer(game, opts)
{
    let dancer = new DanceController(game, opts);
    var name = opts.name || 'dancer';
    game.registerController(name, dancer);
    game.registerPlayer(dancer);
    var readyPromise = dancer.readyPromise;
    return readyPromise;
}

Game.registerNodeType("Dancer", addDancer);
window.BVH1 = BVH_PATH1;
window.BVH2 = BVH_PATH2;
export {DanceController};
