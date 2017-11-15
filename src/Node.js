
import * as THREE from 'three';
import {MUSE} from './MUSE';
import * as Util from './Util';
//import {testNode} from '../test/testNode'
//import '../test/testNode'

var REGISTER_NODES = true;
var nodeTypes = {};
var nodesByType = {};

var numObjs = 0;

function getUniqueId(class_) {
    return (class_+'_'+numObjs);
}

class MUSENode {
    static getAllNodeTypes() {
        return nodeTypes;
    }

    static defineFields(class_, fields) {
        nodeTypes[class_.name] = class_;
        var FIELDS = {};
        fields.forEach(field => {
            FIELDS[field] = field;
        });
        class_.FIELDS = FIELDS;
    }

    constructor(game, opts)
    {
        opts = opts || {};
        this.game = game;
        var class_ = this.getClassName();
        if (REGISTER_NODES) {
            if (!nodesByType[class_])
                nodesByType[class_] = [];
            nodesByType[class_].push(this);
        }
        this.id = opts.id || getUniqueId(class_);
        this.name = opts.name || this.id;
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

//MUSE.Node = MUSENode;

MUSENode.defineFields(MUSENode, [
    "type",
    "id",
    "name"
]);

//window.testNode = testNode;
window.MUSENode = MUSENode;
window.nodeTypes = nodeTypes;
window.nodesByType = nodesByType;
//window.Tiger = Tiger;

export {MUSENode};
