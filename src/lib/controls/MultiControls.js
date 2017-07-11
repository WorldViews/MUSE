/**
 */

import * as THREE from 'three';
import OrbitControls from './OrbitControls';
import CMP_Controls from './CMP_Controls';

//THREE.CMP_Controls = function ( object, domElement )
class MultiControls {

    constructor(game, object, domElement) {
        var inst = this;
        this.domElement = ( domElement !== undefined ) ? domElement : document;
        this.game = game;
        this.camera = object;
        this.target = new THREE.Vector3( 0, 0, 0 );
        //this.orbitControls = new OrbitControls(this.camera, game.renderer.domElement);
        this.orbitControls = new OrbitControls(this.camera, domElement);
        //this.orbitControls.addEventListener('change', e=> inst.onChange(e));
        this.orbitControls.keys = [65, 83, 68];
        this.camera.lookAt(new THREE.Vector3());
        this.camera.position.z = 1;

        this.cmpControls = new CMP_Controls(this.camera, domElement);
        this.enabled = true;
        this.shiftDown = false;
        window.addEventListener( 'keydown', e=> inst.onKeyDown(e), false );
        window.addEventListener( 'keyup', e=>inst.onKeyUp(e), false );
    }

    onKeyDown( event ) {
        var kc = event.keyCode;
        //console.log("MC.onKeyDown "+kc);
        //event.preventDefault();
        this.shiftDown = true;
    }

    onKeyUp( event ) {
        var kc = event.keyCode;
        //console.log("MC.onKeyUp "+kc);
        this.shiftDown = false;
    }

    update() {
        var type = this.shiftDown ? "CMP" : "Orbit";
        console.log("MultiControls.update "+this.shiftDown+" "+type);
        if (type == "CMP") {
            this.orbitControls.enabled = false;
	    this.cmpControls.enabled = true;
	    this.cmpControls.update();
        }
        else {
            this.orbitControls.enabled = true;
	    this.cmpControls.enabled = false;
            this.orbitControls.update();
        }
    }
}

export {MultiControls};
