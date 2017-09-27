
import * as THREE from 'three';
import { sprintf } from "sprintf-js";
import {Game} from '../Game';
import * as Util from '../Util';


class OrbitRaycaster {
    constructor(satTracks, dom) {
        this.game = satTracks.game;
        this.satTracks = satTracks;
        this.dom = dom;
        if (!dom) {
            console.log("No domElement available");
            alert("too bad");
            return;
        }
        this.raycaster = new THREE.Raycaster();
        this.threshold = 0.1;
        this.raycaster.params.Points.threshold = this.threshold;
        this.raycastPt = new THREE.Vector2()
        var inst = this;
        dom.addEventListener( 'mousedown', e => inst._onMouseDown(e), false );
        //dom.addEventListener( 'mouseup',   e => inst._onMouseUp(e), false );
        dom.addEventListener( 'mousemove', e => inst._onMouseMove(e), false );
    }

    _onMouseDown(e) {
        console.log("SatTracks........ mouseDown ......");
        this.handleRaycast(e, true);
    }

    _onMouseMove(e) {
        //console.log("SatTracks........ mouseMove ......");
        this.handleRaycast(e, false);
    }

    handleRaycast(event, isSelect) {
        var x = (event.pageX / window.innerWidth)*2 - 1;
        var y = - (event.pageY / window.innerHeight)*2 + 1;
        //console.log("handleRaycast "+x+" "+y+" select: "+isSelect);
        this.satTracks.mouseOverSat = null;
        this.raycastPt.x = x;
        this.raycastPt.y = y;
        this.raycaster.setFromCamera(this.raycastPt, this.game.camera);
        var objs = this.game.scene.children;
        var intersects = this.raycaster.intersectObjects(objs, true);
        if (intersects.length == 0)
            return null;
        var isect = null;
        var pickedObj = null;
        for (var i=0; i<intersects.length; i++) {
            isect = intersects[i];
            //console.log( "dtr: "+isect.distanceToRay);
            if (isect.distanceToRay > this.threshold)
                continue;
            pickedObj = isect.object;
            if (pickedObj && pickedObj.rtype)
                break;
        }

        //var isect = intersects[0];
        //var pickedObj = isect.object;
        if (pickedObj && pickedObj.rtype) {
            window.ISECT = isect;
            var rtype = pickedObj.rtype;
            var idx = isect.index;
            //console.log(" group: "+ pickedObj.name+" "+idx);
            //console.log(" distToRay "+isect.distanceToRay)
            var id = rtype.ids[idx];
            var sat = this.satTracks.db.sats[id];
            if (sat) {
                //console.log(" sat "+sat.name);
                this.satTracks.mouseOverSat = sat;
                if (isSelect) {
                    this.satTracks.selectedSat = sat;
                }
            }
            else {
                console.log("**** SatTracks raycast unknown id: "+id);
            }
        }
    }
}



export {OrbitRaycaster};
