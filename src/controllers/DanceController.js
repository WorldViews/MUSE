
import * as THREE from 'three';

import {BVHLoader} from '../BVHLoader';
import {Game} from '../Game';

let BVH_PATH = './models/bvh/MasterLiuPerformanceChar00.bvh';

class DanceController
{
    constructor(game, opts)
    {
        this.game = game;
        opts = opts || {};
        var bvhPath = opts.path || BVH_PATH;
        if (!opts.scale)
	    opts.scale = 0.06;
        this.name = opts.name || "dancer";
        this.clock = new THREE.Clock();
        this.loadBVH(this.name, bvhPath, opts);
        this.skeletonHelper = null;
        this.dancer = null;
        this.mixer = null;
    }

    update() {
        if (!this.visible)
	    return;
        //console.log("DanceController.update...");
        if ( this.mixer ) this.mixer.update( this.clock.getDelta() );
        if ( this.skeletonHelper ) this.skeletonHelper.update();
    }

    loadBVH(name, bvhPath, opts) {
        opts = opts || {};
        console.log("loadBVH: "+name+" "+bvhPath);
        //var scene = this.game.scene;
        //var loader = new THREE.BVHLoader();
        var loader = new BVHLoader();
        var inst = this;
        loader.load( bvhPath, function( result ) {
            console.log("BVH: ", result);
            //var dancer = new THREE.Object3D();
            var dancer = new THREE.Group();
	    game.setFromProps(dancer, opts)
            var skeletonHelper = new THREE.SkeletonHelper( result.skeleton.bones[ 0 ] );
            skeletonHelper.skeleton = result.skeleton;
	              // allow animation mixer to bind to SkeletonHelper directly
	    skeletonHelper.material.depthTest = true;
            var boneContainer = new THREE.Group();
            boneContainer.add( result.skeleton.bones[ 0 ] );
            dancer.add( skeletonHelper );
            dancer.add( boneContainer );
            console.log(dancer);
            //scene.add(dancer);
	    game.addToGame(dancer, opts.name, opts.parent);
            // play animation
            inst.mixer = new THREE.AnimationMixer( skeletonHelper );
            //inst.mixer.clipAction( result.clip ).setEffectiveWeight( 1.0 ).play();
            inst.action = inst.mixer.clipAction( result.clip ).setEffectiveWeight( 1.0 );
	    inst.action.play();
	    inst.dancer = dancer;
	    inst.skeletonHelper = skeletonHelper;
	    inst.game.models[name] = dancer;
	    inst.update();
        } );
    }

    //setScale(s) {
    //   this.dancer.scale.set(s,s,s);
    //}
    
    get visible() {
        return this.dancer !=null && this.dancer.visible;
    }

    set visible(v) {
        this.dancer.visible = v;
    }

    // Player Interface methods
    get playTime() {
        return this.mixer.time;
    }

    set playTime(t) {
        //this.mixer.time = t;
        this.action.time = t;
    }

    get playSpeed() {
        return this.mixer.timeScale;
    }

    set playSpeed(s) {
        this.mixer.timeScale = s;
    }
}

function addDancer(game, opts)
{
    let dancer = new DanceController(game, opts);
    var name = opts.name || 'dancer';
    game.registerController(name, dancer);
    game.registerPlayer(dancer);
    return dancer;
}

Game.registerNodeType("Dancer", addDancer);

export {DanceController};
