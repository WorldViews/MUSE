
import * as THREE from 'three';

let loadBVH = function(game, bvh) {
    var scene = game.scene;
    var loader = new THREE.BVHLoader();
    loader.load( bvh, function( result ) {
        console.log("BVH: ", result);
        var dancer = new THREE.Object3D();
        skeletonHelper = new THREE.SkeletonHelper( result.skeleton.bones[ 0 ] );
        skeletonHelper.skeleton = result.skeleton; // allow animation mixer to bind to SkeletonHelper directly
	skeletonHelper.material.depthTest = true;
        var boneContainer = new THREE.Group();
        boneContainer.add( result.skeleton.bones[ 0 ] );
        dancer.add( skeletonHelper );
        dancer.add( boneContainer );
        console.log(dancer);
        dancer.scale.x = 0.06;
        dancer.scale.y = 0.06;
        dancer.scale.z = 0.06;
        scene.add(dancer);
        // play animation
        mixer = new THREE.AnimationMixer( skeletonHelper );
        mixer.clipAction( result.clip ).setEffectiveWeight( 1.0 ).play();
    } );
}

export {loadBVH};
