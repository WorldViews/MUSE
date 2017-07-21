/**
 */

import * as THREE from 'three';
import { sprintf } from "sprintf-js";
import { getCameraParams } from '../../Util';

var toDeg = THREE.Math.radToDeg;

function bind( scope, fn ) {
    return function () {
	fn.apply( scope, arguments );
    };
}

class XControls
{

    constructor(game, domElement) {
        console.log("******************** XControls.constructor()");
        var inst = this;
        this.game = game;
        game.xc = this; // debugging convenience
        this.object = game.camera;
        this.target = new THREE.Vector3( 0, 0, 0 );

        this.domElement = ( domElement !== undefined ) ? domElement : document;
        this.enabled = true;
        console.log("domElement "+this.domElement);

        this.mouseDragOn = false;
        this.mousePtDown = null;
        this.anglesDown = null;
        this.camPosDown = null;
        this.panRatio = 0.005;
        this.pitchRatio = 0.005;

        this.raycaster = new THREE.Raycaster();
        this.raycastPt = new THREE.Vector2()

        this._onMouseMove = bind( this, this.onMouseMove );
        this._onMouseDown = bind( this, this.onMouseDown );
        this._onMouseWheel = bind( this, this.onMouseWheel );
        this._onMouseUp = bind( this, this.onMouseUp );
/*
        this._onKeyDown = bind( this, this.onKeyDown );
        this._onKeyUp = bind( this, this.onKeyUp );
*/
        //this.domElement.addEventListener( 'contextmenu', contextmenu, false );
/*
*/
        this.domElement.addEventListener( 'mousedown',     this._onMouseDown, false );
        this.domElement.addEventListener( 'mouseup',       this._onMouseUp, false );
        this.domElement.addEventListener( 'mousemove',     this._onMouseMove, false );
        this.domElement.addEventListener( 'wheel',         this._onMouseWheel, false);
        this.domElement.addEventListener( 'DOMMouseScroll',this._onMouseWheel, false);

        console.log("set the mouse bindings!!!");
    }

    onMouseDown( event ) {
        console.log("XControls.onMouseDown");
        if ( this.domElement !== document ) {
	    this.domElement.focus();
        }
        event.preventDefault();
        //event.stopPropagation();
        this.mouseDragOn = true;
        this.mousePtDown = this.getMousePt(event);
        this.anglesDown = this.getCamAngles();
        this.camPosDown = this.game.camera.position.clone();
        this.getTarget();
    };

    onMouseUp( event ) {
        console.log("XControls.onMouseUp");
        event.preventDefault();
        //event.stopPropagation();
        this.mouseDragOn = false;
    };

    onMouseWheel(evt) {
	//console.log("LookControls.onMouseWheel...");
	evt.preventDefault();
        if (evt.shiftKey)
            this.handleChangeFOV(evt);
        else
            this.handleDolly(evt);
    }

    onMouseMove( event ) {
        this.handleRaycast(event);
        if (!this.mouseDragOn || !this.enabled)
	    return;
        //console.log("XControls.onMouseMove");
        var pt = this.getMousePt(event);
        var dx = pt.x - this.mousePtDown.x;
        var dy = pt.y - this.mousePtDown.y;
        //console.log("XControls.onMouseMove dx: "+dx+"  dy: "+dy);
        if (event.button == 0) {
            this.handleLook(dx,dy);
        }
        if (event.button == 1) {
            this.handleOrbit(dx,dy);
        }
    }

    getMousePt(event)
    {
        return {x: event.pageX, y: event.pageY };
    }

    handleChangeFOV(evt)
    {
	var sf = 0.015;
        var camera = this.game.camera;
	if (evt.wheelDeltaY) { // WebKit
	    camera.fov -= evt.wheelDeltaY * sf;
	} else if (evt.wheelDelta) { 	// Opera / IE9
	    camera.fov -= evt.wheelDelta * sf;
	} else if (evt.detail) { // Firefox
	    camera.fov += evt.detail * 1.0;
	}
	//camera.fov = Math.max(20, Math.min(100, camera.fov));
	camera.fov = Math.max(10, Math.min(140, camera.fov));
	camera.updateProjectionMatrix();
    }

    handleDolly(evt)
    {
	var sf = 0.015;
	var dx = 0;
        var camera = this.game.camera;
	if (evt.wheelDeltaY) { // WebKit
	    dx -= evt.wheelDeltaY * sf;
	} else if (evt.wheelDelta) { 	// Opera / IE9
	    dx -= evt.wheelDelta * sf;
	} else if (evt.detail) { // Firefox
	    dx += evt.detail * 1.0;
	}
        var zf = 1.01;
        console.log(sprintf("handleDolly dx: %f  f: %f", dx, zf));
        if (dx > 0)
            this.dolly(zf);
        if (dx < 0)
            this.dolly(-zf);
    }

    dolly(zf) {
        console.log(sprintf("dolly zf: %f", zf));
        var cam = this.game.camera;
        var wv = cam.getWorldDirection();
        cam.position.addScaledVector(wv, zf);
    }

    handleRaycast(event) {
        var x = (event.pageX / window.innerWidth)*2 - 1;
        var y = - (event.pageY / window.innerHeight)*2 + 1;
        this.raycast(x,y);
    }

    raycast(x,y)
    {
        this.raycastPt.x = x;
        this.raycastPt.y = y;
        this.raycaster.setFromCamera(this.raycastPt, this.game.camera);
        var objs = this.game.scene.children;
        var intersects = this.raycaster.intersectObjects(objs, true);
        var i = 0;
        if (intersects.length <= 1)
            return;
        this.pickedName = "";
        var inst = this;
        intersects.forEach(isect => {
            i++;
            var obj = isect.object;
            if (!obj.name || obj.name == "Stars")
                return;
            inst.pickedName = obj.name;
            console.log("isect "+i+" "+obj.name);
        })
        this.game.setStatus(this.pickedName);
        if (intersects.length) {
            return intersects[0];
        }
        return null;
    }
    
    handleLook(dx, dy)
    {
        console.log("XControls.handleLook dx: "+dx+"  dy: "+dy);
	var theta = this.anglesDown.theta - this.panRatio   * dx;
	var phi =   this.anglesDown.phi   + this.pitchRatio * dy;
        this.setCamAngles(theta, phi);
    }

    handleOrbit(dx, dy)
    {
        console.log("XControls.handleOrbit dx: "+dx+"  dy: "+dy);
        var camPos = this.object.position;
        var d = camPos.distanceTo(this.target);
        var target = this.target;
        console.log("Target:", target);
        console.log("Cam Pos:", camPos);
        console.log("d: "+d);
	var theta = this.anglesDown.theta - this.panRatio   * dx;
	var phi =   this.anglesDown.phi   + this.pitchRatio * dy;
        camPos.subVectors(target, this.getVec(theta, phi, d));
        this.object.lookAt( this.target );
    }

    onKeyDown( event ) {
        var kc = event.keyCode;
        //console.log("onKeyUp "+kc);
        //event.preventDefault();
    };

    onKeyUp( event ) {
        var kc = event.keyCode;
        console.log("onKeyUp "+kc);
    };

    update() {}

    getTarget()
    {
        console.log("getTarget");
        var isect = this.raycast(0.5,0.5);
        if (isect) {
            console.log("setting target from intersect");
            this.target = isect.point.clone();
        }
        else {
            console.log("setting target without intersect");
            var cam = this.game.camera;
            var wv = cam.getWorldDirection();
            var d = 100;
            this.target = cam.position.clone();
            this.target.addScaledVector(wv, d);
        }
        console.log("Target:", this.target);
    }
    
    getCamAngles()
    {
        var cam = this.game.camera;
        var wv = cam.getWorldDirection();
        var sp = new THREE.Spherical();
        sp.setFromVector3(wv);
        return {theta: sp.theta, phi: sp.phi};
    }
    
    setCamAngles(theta, phi) {
        var targetPos = new THREE.Vector3();
        targetPos.addVectors(this.object.position, this.getVec(theta, phi));
        this.object.lookAt( targetPos );
    };

    getVec(theta, phi, d)
    {
        d = d || 1.0;
        theta = Math.PI/2 - theta;
        var v = new THREE.Vector3();
        v.x = d * Math.sin( phi ) * Math.cos( theta );
        v.y = d * Math.cos( phi );
        v.z = d * Math.sin( phi ) * Math.sin( theta );
        return v;
    }
    
    dispose() {
        this.domElement.removeEventListener( 'contextmenu', this.contextmenu, false );
        this.domElement.removeEventListener( 'mousedown',   this._onMouseDown, false );
        this.domElement.removeEventListener( 'mousemove',   this._onMouseMove, false );
        this.domElement.removeEventListener( 'mouseup',     this._onMouseUp, false );
        window.removeEventListener( 'keydown',              this._onKeyDown, false );
        window.removeEventListener( 'keyup',                this._onKeyUp, false );
    };

};

export {XControls};
