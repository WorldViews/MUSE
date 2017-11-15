import assert from 'assert';
import * as THREE from 'three';
//import Promise from 'bluebird';
import {Node} from '../src/Node';

class Thing extends Node {
    constructor (x, opts) {
        super(x,opts);
    }
}

Node.defineFields(Thing, [
    "home",
    "color"]
);

class Animal extends Thing {
    constructor(x, opts) {
        super(x, opts);
        this.checkOptions(opts);
    }
}

Node.defineFields(Animal, [
        "type"
    ]
);

class Cat extends Animal {
    constructor(x, opts) {
        super(x, opts);
    }
}

Node.defineFields(Cat, [
        "furColor"
    ]
);

class Tiger extends Cat {
    constructor(game, opts) {
        super(game, opts);
    }
}

Node.defineFields(Tiger, [
    "toothSize"
]);

function testNode()
{
    var tiger = new Tiger({toothSize: "Big"});
    tiger.dumpClassHierarchy();
}

if (window) {
    window.testNode = testNode;
    window.Tiger = Tiger;
}

export {testNode};
