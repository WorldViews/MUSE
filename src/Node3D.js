
//import * as THREE from 'three';
//import * as Util from './Util';
import {MUSENode} from './Node';

class Node3D extends MUSENode {
}

MUSENode.defineFields(Node3D, [
    "parent",
    "position",
    "scale",
    "rotation",
    "visible"
]);

export {Node3D};
