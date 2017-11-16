
//import * as THREE from 'three';
//import * as Util from './Util';
import {MUSENode} from './Node';

class Node3D extends MUSENode {

    set visible(val) {
        this.setVisible(val);
    }

    get visible() {
        this.getVisible();
    }

    setVisible(val) {
        console.log("Node3D.setVisible not implemented "+this.getClassName());
    }

    getVisible() {
        console.log("Node3D.setVisible not implemented "+this.getClassName());
        return false;
    }
}

MUSENode.defineFields(Node3D, [
    "parent",
    "position",
    "scale",
    "rotation",
    "visible"
]);

export {Node3D};
