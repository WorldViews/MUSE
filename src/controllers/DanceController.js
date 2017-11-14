
import * as THREE from 'three';

import {BVHLoader} from '../BVHLoader';
import {Game} from '../Game';
import {Node} from '../Node';
import {Node3D} from '../Node3D';

let BVH_PATH1 = './models/bvh/MasterLiuPerformanceChar00.bvh';
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
        this.loadBVH(opts.motionUrl);
        var inst = this;
        game.state.on(this.name, state => inst.setProps(state));
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
        inst.update();
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
}

Node.defineFields(DanceController, [
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
