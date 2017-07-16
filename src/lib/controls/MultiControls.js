/**
 */

import * as THREE from 'three';
import OrbitControls from './OrbitControls';
import LookControls from './LookControls';

let {degToRad,radToDeg} = THREE.Math;

let LOOK = "LOOK";
let ORBIT = "ORBIT";

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
        this.lookControls = new LookControls(this.camera, domElement);
        this.enabled = true;
        //this.shiftDown = false;
        window.addEventListener( 'keydown', e=> inst.onKeyDown(e), false );
        window.addEventListener( 'keyup', e=>inst.onKeyUp(e), false );
	this.setModeOrbit();
    }

    onKeyDown( event ) {
        var kc = event.keyCode;
        console.log("MC.onKeyDown "+kc);
        //event.preventDefault();
        //this.shiftDown = true;
	if (kc == 16 || kc == 76) { //16=shift 76=L
	    this.setModeLook();
	}
	else if (kc == 79) {// 79 =O
	    this.setModeOrbit();
	}
    }

    onKeyUp( event ) {
        var kc = event.keyCode;
        //event.preventDefault();
        console.log("MC.onKeyUp "+kc);
        //this.shiftDown = false;
	if (kc == 16) { //16=shift 76=L
	    this.setModeOrbit();
	}
    }

    update() {
        //var type = this.shiftDown ? "CMP" : "Orbit";
        //console.log("MultiControls.update "+this.shiftDown+" "+type);
        if (this.mode == LOOK) {
            this.orbitControls.enabled = false;
	    this.lookControls.enabled = true;
	    this.lookControls.update();
        }
        else {
            this.orbitControls.enabled = true;
	    this.lookControls.enabled = false;
            this.orbitControls.update();
        }
    }

    showInfo()
    {
	var ophi = radToDeg(this.orbitControls.getPolarAngle());
	var otheta = radToDeg(this.orbitControls.getAzimuthalAngle());
	var lphi = radToDeg(this.lookControls.getPhi());
	var ltheta = radToDeg(this.lookControls.getTheta());
	console.log("orbit phi: "+ophi+"  "+"theta: "+otheta);
	console.log("look  phi: "+lphi+"  "+"theta: "+ltheta);
    }

    setModeOrbit() {
	console.log("************* setModeOrbit");
	if (this.mode == ORBIT) {
	    return;
	}
	this.showInfo();
	if (this.mode == LOOK) {
	    var lphi = radToDeg(this.lookControls.getPhi());
	    var ltheta = radToDeg(this.lookControls.getTheta());
	    var ophi = 180 - lphi;
            this.orbitControls.setPhi(degToRad(ophi));
	}
	this.lookControls.enabled = false;
        this.orbitControls.enabled = true;
	this.mode = ORBIT;
	this.update();
    }
    
    setModeLook() {
	console.log("************* setModeLook");
	if (this.mode == LOOK) {
	    return;
	}
	this.showInfo();
	var ophi = radToDeg(this.orbitControls.getPolarAngle());
	var otheta = radToDeg(this.orbitControls.getAzimuthalAngle());
	var lphi = 180 - ophi;
	this.lookControls.setPhi(degToRad(lphi));
        this.orbitControls.enabled = false;
	this.lookControls.enabled = true;
	this.mode = LOOK;
	this.update();
    }
}

export {MultiControls};
