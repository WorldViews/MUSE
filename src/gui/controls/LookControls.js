/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author paulirish / http://paulirish.com/
 */

import * as THREE from 'three';
import { sprintf } from "sprintf-js";
import { getCameraParams } from 'core/Util';

var toDeg = THREE.Math.radToDeg;

//THREE.LookControls = function ( object, domElement )
var LookControls = function ( object, domElement )
{
    this.object = object;
    this.target = new THREE.Vector3( 0, 0, 0 );

    this.domElement = ( domElement !== undefined ) ? domElement : document;

    this.enabled = true;

    this.movementSpeed = 10.0;
    //this.lookSpeed = 0.005;
    this.lookSpeed = 0.05;

    this.lookVertical = true;
    this.autoForward = false;

    this.activeLook = true;

    this.heightSpeed = false;
    this.heightCoef = 1.0;
    this.heightMin = 0.0;
    this.heightMax = 1.0;

    this.constrainVertical = false;
    this.verticalMin = 0;
    this.verticalMax = Math.PI;

    this.autoSpeedFactor = 0.0;

    this.mouseX = 0;
    this.mouseY = 0;

    this.phi = THREE.Math.degToRad(90);
    this.theta = 0;

    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;

    this.mouseDragOn = false;

    this.viewHalfX = 0;
    this.viewHalfY = 0;
    this.mousePtDown = null;
    this.phiDown = null;
    this.thetaDown = null;
    this.panRatio = 0.2;
    this.pitchRatio = 0.2;

    //if ( this.domElement !== document ) {
    //    this.domElement.setAttribute( 'tabindex', - 1 );
    //}

    this.getPhi = function() {
        return this.phi;
    }

    this.setPhi = function(phi) {
        this.phi = phi;
    }

    this.getTheta = function() { return this.theta; }

    this.handleResize = function () {
        if ( this.domElement === document ) {
            this.viewHalfX = window.innerWidth / 2;
            this.viewHalfY = window.innerHeight / 2;
        } else {
            this.viewHalfX = this.domElement.offsetWidth / 2;
            this.viewHalfY = this.domElement.offsetHeight / 2;
        }
    };

    this.onMouseDown = function ( event ) {

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

    this.onMouseUp = function ( event ) {
        event.preventDefault();
        //event.stopPropagation();
        this.mouseDragOn = false;
        this.moveForward = false;
        this.moveBackward = false;
    };

    function onMouseWheel (evt) {
        console.log("------>>>>>> LookControls.onMouseWheel...");
        evt.preventDefault();
        var sf = 0.015;
        if (evt.wheelDeltaY) { // WebKit
            camera.fov -= evt.wheelDeltaY * sf;
        } else if (evt.wheelDelta) {    // Opera / IE9
            camera.fov -= evt.wheelDelta * sf;
        } else if (evt.detail) { // Firefox
            camera.fov += evt.detail * 1.0;
        }
        //camera.fov = Math.max(20, Math.min(100, camera.fov));
        camera.fov = Math.max(10, Math.min(140, camera.fov));
        camera.updateProjectionMatrix();
    }

    this.getMousePt = function(event)
    {
        return {x: event.pageX, y: event.pageY };
    }

    this.onMouseMove = function ( event ) {
        if (!this.mouseDragOn || !this.enabled)
            return;
        this.getParamsFromCamera();
        var pt = this.getMousePt(event);
        var dx = pt.x - this.mousePtDown.x;
        var dy = pt.y - this.mousePtDown.y;
        //console.log("dx: "+dx+"  dy: "+dy);
        if (event.button == 0) {
            this.theta = this.thetaDown + this.panRatio * THREE.Math.degToRad( dx );
            this.phi = this.phiDown + this.pitchRatio * THREE.Math.degToRad( dy );
        }
        if (event.button == 2) {
            this.theta = this.thetaDown + this.panRatio * THREE.Math.degToRad( dx );
            if (dy > 0) {
                this.moveForward = false;
                this.moveBackward = true;
            }
            if (dy < 0) {
                this.moveForward = true;
                this.moveBackward = false;
            }
        }
        this.setDirection();
    }

    this.onKeyDown = function ( event ) {
        var kc = event.keyCode;

        //if (kc == ' '.charCodeAt(0)) {
        if (kc == 32) {
            return this.dumpInfo();
        }
        //console.log("onKeyUp "+kc);

        //event.preventDefault();

        switch ( kc ) {

        case 38: /*up*/
        case 87: /*W*/ this.moveForward = true; break;

        case 37: /*left*/
        case 65: /*A*/ this.moveLeft = true; break;

        case 40: /*down*/
        case 83: /*S*/ this.moveBackward = true; break;

        case 39: /*right*/
        case 68: /*D*/ this.moveRight = true; break;

        case 82: /*R*/ this.moveUp = true; break;
        case 70: /*F*/ this.moveDown = true; break;

        }

    };

    this.onKeyUp = function ( event ) {
        var kc = event.keyCode;
        console.log("onKeyUp "+kc);
        //if (kc == ' '.charCodeAt(0)) {
        if (kc == 32) {
            return this.dumpInfo();
        }
        switch ( kc ) {

        case 38: /*up*/
        case 87: /*W*/ this.moveForward = false; break;

        case 37: /*left*/
        case 65: /*A*/ this.moveLeft = false; break;

        case 40: /*down*/
        case 83: /*S*/ this.moveBackward = false; break;

        case 39: /*right*/
        case 68: /*D*/ this.moveRight = false; break;

        case 82: /*R*/ this.moveUp = false; break;
        case 70: /*F*/ this.moveDown = false; break;

        }

    };

    this.update = function( delta ) {
        //console.log("FPC update....");
        delta = 0.01;
        if ( this.enabled === false ) return;

        this.getParamsFromCamera();

        if ( this.heightSpeed ) {

            var y = THREE.Math.clamp( this.object.position.y, this.heightMin, this.heightMax );
            var heightDelta = y - this.heightMin;

            this.autoSpeedFactor = delta * ( heightDelta * this.heightCoef );

        } else {

            this.autoSpeedFactor = 0.0;

        }

        var actualMoveSpeed = delta * this.movementSpeed;

        if ( this.moveForward || ( this.autoForward && ! this.moveBackward ) )
            this.object.translateZ( - ( actualMoveSpeed + this.autoSpeedFactor ) );

        if ( this.moveBackward ) this.object.translateZ( actualMoveSpeed );

        if ( this.moveLeft ) this.object.translateX( - actualMoveSpeed );
        if ( this.moveRight ) this.object.translateX( actualMoveSpeed );

        if ( this.moveUp ) this.object.translateY( actualMoveSpeed );
        if ( this.moveDown ) this.object.translateY( - actualMoveSpeed );

        var actualLookSpeed = delta * this.lookSpeed;

        if ( ! this.activeLook ) {
            actualLookSpeed = 0;
        }

        var verticalLookRatio = 1;

        if ( this.constrainVertical ) {
            verticalLookRatio = Math.PI / ( this.verticalMax - this.verticalMin );
        }

        //console.log("mouse x: "+this.mouseX+" y: "+this.mouseY);
        if (!this.mouseDragOn)
            return;

        if ( this.constrainVertical ) {
            this.phi = THREE.Math.mapLinear( this.phi, 0, Math.PI, this.verticalMin, this.verticalMax );
        }
        this.setDirection();
    };

    this.setDirection = function()
    {
        var targetPosition = this.target;
        var position = this.object.position;
        console.log("getting pos phi: %6.2f theta: %6.2f", toDeg(this.phi), toDeg(this.theta));
        targetPosition.x = position.x + 100 * Math.sin( this.phi ) * Math.cos( this.theta );
        targetPosition.y = position.y + 100 * Math.cos( this.phi );
        targetPosition.z = position.z + 100 * Math.sin( this.phi ) * Math.sin( this.theta );
        //this.object.lookAt( targetPosition );
        game.camera.lookAt( targetPosition );
        //game.camera.updateProjectionMatrix();
    }

    function contextmenu( event ) {
        event.preventDefault();
    }

    this.dispose = function() {

        this.domElement.removeEventListener( 'contextmenu', contextmenu, false );
        this.domElement.removeEventListener( 'mousedown', _onMouseDown, false );
        this.domElement.removeEventListener( 'mousemove', _onMouseMove, false );
        this.domElement.removeEventListener( 'mouseup', _onMouseUp, false );

        window.removeEventListener( 'keydown', _onKeyDown, false );
        window.removeEventListener( 'keyup', _onKeyUp, false );

    };

    var _onMouseMove = bind( this, this.onMouseMove );
    var _onMouseDown = bind( this, this.onMouseDown );
    var _onMouseWheel = bind( this, this.onMouseWheel );
    var _onMouseUp = bind( this, this.onMouseUp );
    var _onKeyDown = bind( this, this.onKeyDown );
    var _onKeyUp = bind( this, this.onKeyUp );

    this.domElement.addEventListener( 'contextmenu', contextmenu, false );
    this.domElement.addEventListener( 'mousemove', _onMouseMove, false );
    this.domElement.addEventListener( 'mousedown', _onMouseDown, false );
    this.domElement.addEventListener( 'mouseup', _onMouseUp, false );
    //    this.domElement.addEventListener('wheel', _onMouseWheel, false);
    //    this.domElement.addEventListener('DOMMouseScroll', _onMouseWheel, false);
    window.addEventListener( 'keydown', _onKeyDown, false );
    window.addEventListener( 'keyup', _onKeyUp, false );

    function bind( scope, fn ) {
        return function () {
            fn.apply( scope, arguments );
        };
    }

    this.handleResize();

    this.getParamsFromCamera = function() {
        console.log("LookControls.setParamsFromCamera");
        var vals = getCameraParams();
        console.log(sprintf("< phi: %6.2f  theta: %6.2f", toDeg(this.phi), toDeg(this.theta)));
        this.phi = vals.phi;
        //this.theta = vals.theta;
        console.log(sprintf("> phi: %6.2f  theta: %6.2f", toDeg(this.phi), toDeg(this.theta)));
    }

    /*
      this.getCameraParams = function(cam) {
      console.log("LookControls.getCameraParams");
      cam = cam || window.game.camera;
      var wv = cam.getWorldDirection();
      //console.log("wv: "+JSON.stringify(wv));
      var s = new THREE.Spherical();
      s.setFromVector3(wv);
      console.log(sprintf("cam phi: %6.2f theta: %6.2f", toDeg(s.phi), toDeg(s.theta)));
      return {phi: s.phi, theta: s.theta};
      }
    */

    this.dumpInfo = function() {
        //var c = this.object;
        var c = window.game.camera;
        var wv = c.getWorldDirection();
        console.log("wv: "+JSON.stringify(wv));
        var s = new THREE.Spherical();
        s.setFromVector3(wv);
        console.log(sprintf("cam  phi: %6.2f  theta: %6.2f", toDeg(s.phi), toDeg(s.theta)));
        console.log(sprintf("this phi: %6.2f  theta: %6.2f", toDeg(this.phi), toDeg(this.theta)));
    }
};

export default LookControls;
