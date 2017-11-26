/**
 */

import * as THREE from 'three';
import { sprintf } from "sprintf-js";
import { getCameraParams } from '../../Util';
//import {MUSE} from '../../MUSE';
import {MUSENode} from '../../Node';
import Util from '../../Util';

// The four arrow keys
var KEYS = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40,
             B: 66, W: 87, S: 83, A: 65, D: 68, SHIFT: 16, CTL: 17};

var toDeg = THREE.Math.radToDeg;

function bind( scope, fn ) {
    return function () {
        fn.apply( scope, arguments );
    };
}

class PositionConstraint
{
    constructor(h) {
        this.setHeight(h);
    }

    setHeight(h) {
        this.height = h;
    }

    constrain(p) {
        p.y = this.height;
    }
}

class MultiControls extends MUSENode
{
    constructor(game, domElement, opts) {
        super(game, opts);
        this.checkOptions(opts);
        console.log("****** MultiControls.constructor()", opts);
        var inst = this;
        this.ignoredModels = ["stars"];
        this.game = game;
        game.xc = this; // debugging convenience
        this.object = game.camera;
        this.target = new THREE.Vector3( 0, 0, 0 );
        this.positionConstraint = new PositionConstraint(2);
        this.domElement = ( domElement !== undefined ) ? domElement : document;
        this.enabled = true;
        console.log("domElement "+this.domElement);

        this.downKeys = {};
        this.keyPanSpeed = opts.keyPanSpeed || 0.005;
        this.keyMoveSpeed = opts.keyMoveSpeed || 0.06;
        this.whichButton = null;
        this.mouseDragOn = false;
        this.mousePtDown = null;
        this.mouseDownTime = 0;
        this.anglesDown = null;
        this.camPosDown = null;
        this.panRatio = 0.005;
        this.pitchRatio = 0.005;
        this.lookSense = 1; // if 1, cam moves with mouse, if -1 opposite of mouse
        this.prevView = null;
        this.prevScreen = null;
        this.speedRight = 0;
        this.speedForward = 0;
        this.speedRotateY = 0;
        this.raycaster = new THREE.Raycaster();
        this.raycastPt = new THREE.Vector2()

        this._onMouseMove = bind( this, this.onMouseMove );
        this._onMouseDown = bind( this, this.onMouseDown );
        this._onMouseWheel = bind( this, this.onMouseWheel );
        this._onMouseUp = bind( this, this.onMouseUp );
        //this._onClick = bind( this, this.onClick ); // see comment at onClick
        this._onDoubleClick = bind( this, this.onDoubleClick );
        this._onContextMenu = bind(this, this.onContextMenu );

        this._onKeyDown = bind( this, this.onKeyDown );
        this._onKeyUp = bind( this, this.onKeyUp );
        /*
         */
        this.domElement.addEventListener( 'contextmenu',   this._onContextMenu, false );
        this.domElement.addEventListener( 'dblclick',      this._onDoubleClick, false );
        //this.domElement.addEventListener( 'click',         this._onClick, false );
        this.domElement.addEventListener( 'mousedown',     this._onMouseDown, false );
        this.domElement.addEventListener( 'mouseup',       this._onMouseUp, false );
        this.domElement.addEventListener( 'mousemove',     this._onMouseMove, false );
        this.domElement.addEventListener( 'wheel',         this._onMouseWheel, false);
        this.domElement.addEventListener( 'DOMMouseScroll',this._onMouseWheel, false);
        window.addEventListener( 'keydown',       this._onKeyDown, false);
        window.addEventListener( 'keyup',       this._onKeyUp, false);
    }

    onContextMenu( event ) {
        event.preventDefault();
    }

    onMouseDown( event ) {
        //console.log("MultiControls.onMouseDown button:" +event.button);
        if ( this.domElement !== document ) {
            this.domElement.focus();
        }
        event.preventDefault();
        //event.stopPropagation();
        this.whichButton = event.button;
        this.mouseDragOn = true;
        this.mouseDownTime = Util.getClockTime();
        this.mousePtDown = this.getMousePt(event);
        this.anglesDown = this.getCamAngles();
        this.camPosDown = this.game.camera.position.clone();
        this.getTarget();
    };

    onMouseUp( event ) {
        //console.log("MultiControls.onMouseUp");
        event.preventDefault();
        //event.stopPropagation();
        this.mouseDragOn = false;
        var mousePtUp = this.getMousePt(event);
        if (mousePtUp.x == this.mousePtDown.x && mousePtUp.y == this.mousePtDown.y) {
            var t = Util.getClockTime();
            var dt = t - this.mouseDownTime;
            if (dt < 0.6)
                this.onClick( event );
            else {
                console.log("Lazy click... ignored...");
            }
        }
    };

    // this is a dirty special hack that will be replaced by
    // a more general event mechanism.
    dispatchDoubleClick(obj) {
        console.log("MultiControl.dispatchDoubleClick");
        while (obj) {
            var userData = obj.userData;
            if (userData && userData.doubleClick) {
                report("******** BINGO Double Click!!!! *******");
                break;
            }
            obj = obj.parent;
        }
        if (!obj)
            return null;
            //if (obj.name && obj.name.startsWith("vidBub")) {
        if (obj.name) {
            var position = obj.getWorldPosition();
            var rotation = new THREE.Euler(0,0,0);
            var view = {position, rotation};
            this.prevView = this.game.viewManager.getCurrentView();
            this.prevScreen = this.game.screens[obj.name];
            this.game.viewManager.goto(view, 2);
            this.game.screens[obj.name].play();
        }
        return obj;
    }

    // Note that we did not use the 'click' event because it
    // seems to trigger even if the mouse moved between down and up.
    // we made our own using mouseDown and mouseUp to just call This
    // if the mouse doesn't move, and the down and up are in rapid succession.
    onClick( event ) {
        console.log("MultiControl.onClick");
        this.handleRaycast(event, 1);
        var obj = this.pickedObj;
        console.log("MultiControl.onClick pickedObj: ", obj);
        if (obj)
            Util.dispatchMuseEvent('click', obj);
    }

    onDoubleClick( event ) {
        console.log("MultiControl.onDoubleClick");
        this.handleRaycast(event, 1);
        var obj = this.pickedObj;
        console.log("MultiControl.onDoubleClick pickedObj: ", obj);
        if (obj)
            this.dispatchDoubleClick(obj);
    }

    onMouseWheel(evt) {
        //console.log("LookControls.onMouseWheel...");
        evt.preventDefault();
        if (evt.shiftKey)
            this.handleChangeFOV(evt);
        else
            this.handleDolly(evt);
    }

    onMouseMove( event ) {
        //this.handleRaycast(event);
        if (!this.mouseDragOn || !this.enabled)
            return;
        this.handleRaycast(event);
        //console.log("MultiControls.onMouseMove");
        var pt = this.getMousePt(event);
        var dx = pt.x - this.mousePtDown.x;
        var dy = pt.y - this.mousePtDown.y;
        //console.log("MultiControls.onMouseMove button:" +event.button+"  dx: "+dx+"  dy: "+dy);
        if (event.shiftKey || this.whichButton == 2) {
            this.handlePan(dx,dy);
            return;
        }
        if (this.whichButton == 0) {
            this.handleLook(dx,dy);
        }
        if (this.whichButton == 1) {
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
        } else if (evt.wheelDelta) {    // Opera / IE9
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
        } else if (evt.wheelDelta) {    // Opera / IE9
            dx -= evt.wheelDelta * sf;
        } else if (evt.detail) { // Firefox
            dx += evt.detail * sf;
        }
        //console.log(sprintf("handleDolly dx: %f", dx));
        this.dolly(dx);
    }

    dolly(dx) {
        this.getTarget();
        var cam = this.game.camera;
        var camPos = cam.position;
        var d = camPos.distanceTo(this.target);
        //console.log(sprintf("dolly dx: %f", dx));
        //var wv = cam.getWorldDirection();
        var wv = this.getCamForward();
        var ds = dx < 0 ? 0.1*d : -0.1*d;
        camPos.addScaledVector(wv, ds);
    }

    handleRaycast(event, verbosity) {
        var x = (event.pageX / window.innerWidth)*2 - 1;
        var y = - (event.pageY / window.innerHeight)*2 + 1;
        return this.raycast(x,y, verbosity);
    }

    raycast(x,y, verbosity)
    {
        //console.log("raycast "+x+" "+y);
        this.raycastPt.x = x;
        this.raycastPt.y = y;
        this.raycaster.setFromCamera(this.raycastPt, this.game.camera);
        var objs = game.collision;
        var intersects = this.raycaster.intersectObjects(objs, true);
        //var i = 0;
        if (intersects.length == 0)
            return null;
        this.pickedName = "";
        this.pickedObj = null;
        this.pickedIsect = null;
        var inst = this;
        for (var i=0; i<intersects.length; i++) {
            //intersects.forEach(isect => {
            //i++;
            var isect = intersects[i];
            var obj = isect.object;
            //console.log("isect "+i+" "+obj.name);
            if (verbosity) {
                console.log("isect "+i+" "+obj.name, obj);
            }
            if (this.ignoredModels.includes(obj.name))
                continue;
            if (obj.name && obj.name.startsWith("sat"))
                continue;
            inst.pickedObj = obj;
            inst.pickedName = obj.name;
            inst.pickedIsect = isect;
            break;
            //console.log("isect "+i+" "+obj.name);
        }
        this.game.setStatus(this.pickedName);
        /*
          if (intersects.length > 0) {
          var isect = intersects[0];
          if (isect.object.name != "Stars")
          return isect;
          }
        */
        return this.pickedIsect;
    }

    rotateCamera(dTheta, dPhi) {
        var angles = this.getCamAngles();
        this.setCamAngles(angles.theta + dTheta, angles.phi + dPhi);
    }

    handleLook(dx, dy)
    {
        //console.log("MultiControls.handleLook dx: "+dx+"  dy: "+dy);
        dx *= this.lookSense;
        dy *= this.lookSense;
        var theta = this.anglesDown.theta - this.panRatio * dx;
        var phi =   this.anglesDown.phi + this.pitchRatio * dy;
        this.setCamAngles(theta, phi);
    }

    handleOrbit(dx, dy)
    {
        //console.log("MultiControls.handleOrbit dx: "+dx+"  dy: "+dy);
        var camPos = this.object.position;
        var d = camPos.distanceTo(this.target);
        //console.log("Target:", this.target);
        //console.log("Cam Pos:", camPos);
        //console.log("d: "+d);
        var theta = this.anglesDown.theta - this.panRatio   * dx;
        var phi =   this.anglesDown.phi   + this.pitchRatio * dy;
        camPos.subVectors(this.target, this.getVec(theta, phi, d));
        this.object.lookAt( this.target );
    }

    handlePan(dx, dy)
    {
        var camPos = this.object.position;
        var f = 0.05;
        var dV = new THREE.Vector3();
        var vRight = this.getCamRight();
        var vUp = this.getCamUp();
        //console.log("pan vRight: ", vRight);
        //console.log("pan    vUp: ", vUp);
        dV.addScaledVector(vRight, -f*dx);
        dV.addScaledVector(vUp, f*dy);
        //console.log("pan     dV:", dV);
        camPos.addVectors(this.camPosDown, dV);
    }

    onKeyDown( event ) {
        var kc = event.keyCode;
        this.downKeys [kc] = true;
        if (this.positionConstraint)
            this.positionConstraint.setHeight(this.getCamPos().y);
        console.log("onKeyDown "+kc);
    };

    onKeyUp( event ) {
        var kc = event.keyCode;
        delete(this.downKeys[kc]);
        console.log("onKeyUp "+kc);
    };

    getCamPos() {
        return this.game.camera.position;
    }

    update()
    {
        var down = this.downKeys;
        var moveSpeed = this.keyMoveSpeed;
        var panSpeed = this.keyPanSpeed;
        if (down[KEYS.CTL]) {
            moveSpeed *= 2;
            panSpeed *= 2;
        }
        var constraint = this.positionConstraint;
        //console.log("downKeys:"+ JSON.stringify(down));
        var cam = this.game.camera;
/*
        if (down[KEYS.RIGHT]) {
            var camPos = cam.position;
            var v = this.getCamRight();
            camPos.addScaledVector(v, moveSpeed);
        }

        if (down[KEYS.LEFT]) {
            var camPos = cam.position;
            var v = this.getCamRight();
            camPos.addScaledVector(v, -moveSpeed);
        }
*/
        if (down[KEYS.RIGHT]) {
            this.rotateCamera(-panSpeed, 0);
        }

        if (down[KEYS.LEFT]) {
            this.rotateCamera(panSpeed, 0);
        }

        if (down[KEYS.UP]) {
            var camPos = cam.position;
            var v = this.getCamForward();
            camPos.addScaledVector(v, moveSpeed);
            if (constraint)
                constraint.constrain(camPos);
        }

        if (down[KEYS.BOTTOM]) {
            var camPos = cam.position;
            var v = this.getCamForward();
            camPos.addScaledVector(v, -moveSpeed);
            if (constraint)
                constraint.constrain(camPos);
        }

        if (down[KEYS.D]){
            var camPos = cam.position;
            var v = this.getCamRight();
            camPos.addScaledVector(v, moveSpeed);
            if (constraint)
                constraint.constrain(camPos);
        }

        if (down[KEYS.A]) {
            var camPos = cam.position;
            var v = this.getCamRight();
            camPos.addScaledVector(v, -moveSpeed);
            if (constraint)
                constraint.constrain(camPos);
        }

        if (down[KEYS.W]) {
            var camPos = cam.position;
            var v = this.getCamForward();
            camPos.addScaledVector(v, moveSpeed);
            if (constraint)
                constraint.constrain(camPos);
        }

        if (down[KEYS.S]) {
            var camPos = cam.position;
            var v = this.getCamForward();
            camPos.addScaledVector(v, -moveSpeed);
            if (constraint)
                constraint.constrain(camPos);
        }

        if (down[KEYS.B]) {
            if (this.prevView) {
                if (this.prevScreen)
                    this.prevScreen.pause();
                this.game.viewManager.goto(this.prevView, 2);
            }
        }

    }

    // This tries to find an appropriate target for trackballing
    // The first choice is the intersect with geometry direction
    // inline with camera center.  If there is none, a point 100
    // units in front of camera is used.
    getTarget()
    {
        //console.log("getTarget");
        var isect = this.raycast(0,0);
        if (isect) {
            console.log("setting target from intersect");
            this.target = isect.point.clone();
        }
        else {
            console.log("setting target without intersect");
            var cam = this.game.camera;
            //var wv = cam.getWorldDirection();
            var wv = this.getCamForward();
            var d = 100;
            this.target = cam.position.clone();
            this.target.addScaledVector(wv, d);
        }
        //console.log("Target:", this.target);
    }

    getCamAngles()
    {
        //var cam = this.game.camera;
        //var wv = cam.getWorldDirection();
        var wv = this.getCamForward();
        var sp = new THREE.Spherical();
        sp.setFromVector3(wv);
        return {theta: sp.theta, phi: sp.phi};
    }

    setCamAngles(theta, phi) {
        var targetPos = new THREE.Vector3();
        targetPos.addVectors(this.object.position, this.getVec(theta, phi));
        this.object.lookAt( targetPos );
    };

    // Get camera forward direction (direction it is looking)
    // in world coordinates.
    getCamForward()
    {
        return this.game.camera.getWorldDirection();
        /*
          var cam = this.game.camera;
          var vL = new THREE.Vector3(0,0,-1);
          var vW = vL.applyMatrix4(cam.matrixWorld);
          vW.sub(cam.position).normalize();
          return vW;
        */
    }

    getCamRight()
    {
        var cam = this.game.camera;
        cam.updateMatrixWorld();
        var vRightLocal = new THREE.Vector3(1,0,0);
        var vRightWorld = vRightLocal.applyMatrix4(cam.matrixWorld);
        vRightWorld.sub(cam.position).normalize();
        return vRightWorld;
    }

    getCamUp()
    {
        var cam = this.game.camera;
        cam.updateMatrixWorld();
        var vUpLocal = new THREE.Vector3(0,1,0);
        var vUpWorld = vUpLocal.applyMatrix4(cam.matrixWorld);
        vUpWorld.sub(cam.position).normalize();
        return vUpWorld;
    }

    // Return vector of given length in direction specified
    // by spherical coordinates theta,phi.
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
        this.domElement.removeEventListener( 'contextmenu', this._onContextMenu, false );
        window.removeEventListener( 'keydown',              this._onKeyDown, false );
        window.removeEventListener( 'keyup',                this._onKeyUp, false );
    };

};

MUSENode.defineFields(MultiControls, [
    "movementSpeed",
    "keyPanSpeed",
    "keyMoveSpeed",
    "distance"
]);

export {MultiControls};
