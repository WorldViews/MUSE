
//import * as THREE from 'three';
import Util from './Util';
//import {MUSENode} from './Node';
//import {MUSE} from './MUSE';
import {MUSENode} from './Node';

var EVENT_TYPES = ["click", "doubleClick"];

// This is a base class for MUSE Nodes that correspond
// to THREE 3D objects.
// Those Node implementations should attach an Object3D
// property to this class, which is the top level THREE Object3D
// being used in the implementation of the node.
//
class Node3D extends MUSENode {

    set visible(val) {
        this.setVisible(val);
    }

    get visible() {
        this.getVisible();
    }

    setVisible(val) {
        //console.log("Node3D.setVisible not implemented "+this.getClassName());
        if (this.object3D)
            this.object3D.visible = val;
    }

    getVisible() {
        //console.log("Node3D.getVisible not implemented "+this.getClassName());
        if (this.object3D)
            return this.object3D.visible;
        return false;
    }

    getObject3D() {
        return this.object3D;
    }

    setObject3D(obj3D) {
        this.object3D = obj3D;
        if (!obj3D.userData) {
            obj3D.userData = {};
        };
        obj3D.userData.node = this;
        var museEvents = this.options.onMuseEvent;
        if (museEvents) {
            for (var evType in museEvents) {
                this.onMuseEvent(evType, museEvents[evType]);
            }
        }
    }

    onMuseEvent(evtType, fun) {
        console.log("******************* setting up museEvetn "+evtType, fun);
        if (EVENT_TYPES.indexOf(evtType) < 0) {
            Util.reportError("Unknown Event type: "+evtType);
        }
        var obj = this.object3D;
        if (!obj) {
            alert("Cannot add MUSE events to Nodes that don't have object3D property");
            return;
        }
        if (!obj.userData) {
            obj.userData = {};
        }
        if (obj.userData[evtType]) {
            alert("Overriding existing MUSE event");
        }
        obj.userData[evtType] = fun;
    }
}

MUSENode.defineFields(Node3D, [
    "parent",
    "position",
    "scale",
    "rotation",
    "visible",
    "onMuseEvent",
    "museIgnorePicking"
]);

export {Node3D};
