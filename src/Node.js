
import * as THREE from 'three';
import * as Util from './Util';

var NodeTypes = {};

class Node {
    static getAllNodeTypes() {
        return NodeTypes;
    }

    static defineFields(class_, fields) {
        NodeTypes[class_.name] = class_;
        var FIELDS = {};
        fields.forEach(field => {
            FIELDS[field] = field;
        });
        class_.FIELDS = FIELDS;
    }

    constructor(game, opts)
    {
        this.game = game;
        //this.checkOpts(opts);
    }

    checkOptions(opts) {
        var fields = this.getAllFields();
        console.log("fields: "+JSON.stringify(fields));
        for (var key in opts) {
            if (!fields[key]) {
                var errStr = "*** Unexpected option "+key+" in "+this.getClassName()+": "+JSON.stringify(opts);
                Util.reportWarning(errStr);
            }
        }
    }

    getFields() {
        return this.constructor.FIELDS;
    }

    // return all fields associated with this object and its class hierarchy
    // TODO:  probably this should be done at the time fields are registered
    // by defineFields instead of every time.
    getAllFields() {
        var fields = {};
        var po = Object.getPrototypeOf(this);
        while (po) {
            console.log("class "+po.constructor.name+" fields "+po.constructor.FIELDS);
            Object.assign(fields, po.constructor.FIELDS);
            po = Object.getPrototypeOf(po);
        }
        return fields;
    }

    getClassName() {
        return Object.getPrototypeOf(this).constructor.name;
    }

    dumpClassHierarchy() {
        var po = Object.getPrototypeOf(this);
        while (po) {
            console.log("class "+po.constructor.name);
            po = Object.getPrototypeOf(po);
        }
    }
}

Node.defineFields(Node, [
    "type",
    "id",
    "name"
]);

/*
class Node3D extends Node {
}

Node.defineFields(Node3D, [
    "position",
    "scale",
    "rotation",
    "visible"
]);
*/

//Node.constructor.FIELDS = ["name"];

class Thing extends Node {
    constructor (x, opts) {
        super(x,opts);
    }
}

//Thing.FIELDS = ["home", "color"];
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
    var foo = new Foo();
}

window.testNode = testNode;
window.Node = Node;
window.Tiger = Tiger;

export {Node};
