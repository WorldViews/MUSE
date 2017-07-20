/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author paulirish / http://paulirish.com/
 */

import * as THREE from 'three';
import { sprintf } from "sprintf-js";
import { getCameraParams } from '../../Util';

function bind( scope, fn ) {
    return function () {
	fn.apply( scope, arguments );
    };
}


//THREE.LookControls = function ( object, domElement )
class XControls
{

    constructor(game, domElement) {
        console.log("******************** XControls.constructor()");
        var inst = this;
        this.game = game;
        this.object = game.camera;
        this.target = new THREE.Vector3( 0, 0, 0 );

        this.domElement = ( domElement !== undefined ) ? domElement : document;
        this.enabled = true;
        console.log("domElement "+this.domElement);

        this.movementSpeed = 3.0;
        //this.lookSpeed = 0.005;
        this.lookSpeed = 0.05;

        this.lookVertical = true;
        this.verticalMin = 0;
        this.verticalMax = Math.PI;

        this.mouseX = 0;
        this.mouseY = 0;

        this.phi = THREE.Math.degToRad(90);
        this.theta = 0;

        this.mouseDragOn = false;

        this.viewHalfX = 0;
        this.viewHalfY = 0;
        this.mousePtDown = null;
        this.phiDown = null;
        this.thetaDown = null;
        this.panRatio = 0.2;
        this.pitchRatio = 0.2;

        this.raycaster = new THREE.Raycaster();
        this.raycastPt = new THREE.Vector2()

        this._onMouseMove = bind( this, this.onMouseMove );
        this._onMouseDown = bind( this, this.onMouseDown );
        this._onMouseWheel = bind( this, this.onMouseWheel );
        this._onMouseUp = bind( this, this.onMouseUp );
/*
        var _onKeyDown = bind( this, this.onKeyDown );
        var _onKeyUp = bind( this, this.onKeyUp );
*/
        //this.domElement.addEventListener( 'contextmenu', contextmenu, false );
/*
*/
        this.domElement.addEventListener( 'mousedown',     this._onMouseDown, false );
        this.domElement.addEventListener( 'mouseup',       this._onMouseUp, false );
        this.domElement.addEventListener( 'mousemove',     this._onMouseMove, false );
        this.domElement.addEventListener( 'wheel',         this._onMouseWheel, false);
        this.domElement.addEventListener('DOMMouseScroll', this._onMouseWheel, false);

        console.log("set the mouse bindings!!!");
        this.handleResize();
    }

    getPhi() {
	return this.phi;
    }

    setPhi(phi) {
	this.phi = phi;
    }

    getTheta() {
        return this.theta;
    }

    setTheta(theta) {
        this.theta = theta;
    }
    
    handleResize() {
        if ( this.domElement === document ) {
	    this.viewHalfX = window.innerWidth / 2;
	    this.viewHalfY = window.innerHeight / 2;
        } else {
	    this.viewHalfX = this.domElement.offsetWidth / 2;
	    this.viewHalfY = this.domElement.offsetHeight / 2;
        }
    };

    onMouseDown( event ) {
        console.log("XControls.onMouseDown");
        if ( this.domElement !== document ) {
	    this.domElement.focus();
        }
        event.preventDefault();
        //event.stopPropagation();
        this.mouseDragOn = true;
        this.mousePtDown = this.getMousePt(event);
        this.phiDown = this.phi;
        this.thetaDown = this.theta;
    };

    onMouseUp( event ) {
        console.log("XControls.onMouseUp");
        event.preventDefault();
        //event.stopPropagation();
        this.mouseDragOn = false;
    };

    onMouseWheel(evt) {
	console.log("------>>>>>> LookControls.onMouseWheel...");
	evt.preventDefault();
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

    getMousePt(event)
    {
        return {x: event.pageX, y: event.pageY };
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

    handleRaycast(event) {
        var pt = new THREE.Vector2()
        this.raycastPt.x = (event.pageX / window.innerWidth)*2 - 1;
        this.raycastPt.y = - (event.pageY / window.innerHeight)*2 + 1;
        this.raycaster.setFromCamera(this.raycastPt, this.game.camera);
        var objs = this.game.scene.children;
        var intersects = this.raycaster.intersectObjects(objs, true);
        var i = 0;
        console.log(sprintf("raycast %f %f -> %d objs %d isects",
                            this.raycastPt.x, this.raycastPt.y, objs.length, intersects.length));
        intersects.forEach(isect => {
            i++;
            var obj = isect.object;
            console.log("isect "+i+" "+obj.name);
        })
    }
    
    handleLook(dx, dy)
    {
        console.log("XControls.handleLook dx: "+dx+"  dy: "+dy);
	this.theta = this.thetaDown + this.panRatio * THREE.Math.degToRad( dx );
	this.phi = this.phiDown + this.pitchRatio * THREE.Math.degToRad( dy );
    }

    handleOrbit(dx, dy)
    {
        console.log("XControls.handleOrbit dx: "+dx+"  dy: "+dy);
	this.theta = this.thetaDown + this.panRatio * THREE.Math.degToRad( dx );
	this.phi = this.phiDown + this.pitchRatio * THREE.Math.degToRad( dy );
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

    update( delta ) {
        //console.log("FPC update....");
        delta = 0.01;
        if ( this.enabled === false ) return;

        if (!this.mouseDragOn)
	    return;

        var targetPosition = this.target;
        var position = this.object.position;

        targetPosition.x = position.x + 100 * Math.sin( this.phi ) * Math.cos( this.theta );
        targetPosition.y = position.y + 100 * Math.cos( this.phi );
        targetPosition.z = position.z + 100 * Math.sin( this.phi ) * Math.sin( this.theta );
        this.object.lookAt( targetPosition );

    };

    //contextmenu( event ) {
    //    event.preventDefault();
    //}

    dispose() {
        this.domElement.removeEventListener( 'contextmenu', contextmenu, false );
        this.domElement.removeEventListener( 'mousedown', _onMouseDown, false );
        this.domElement.removeEventListener( 'mousemove', _onMouseMove, false );
        this.domElement.removeEventListener( 'mouseup', _onMouseUp, false );
        window.removeEventListener( 'keydown', _onKeyDown, false );
        window.removeEventListener( 'keyup', _onKeyUp, false );
    };

};

export {XControls};
