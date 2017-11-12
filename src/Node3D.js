
//import * as THREE from 'three';
//import * as Util from './Util';
import {Node} from './Node';

class Node3D extends Node {
}

Node.defineFields(Node3D, [
    "parent",
    "position",
    "scale",
    "rotation",
    "visible"
]);

export {Node3D};
