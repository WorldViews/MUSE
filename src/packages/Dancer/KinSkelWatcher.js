
import * as THREE from 'three';
import {Game} from 'core/Game';
import {MUSENode} from 'core/Node';
import {Node3D} from 'core/Node3D';
import { sprintf } from "sprintf-js";
import {Util} from 'core/Util';
//import {Body,Bodies} from './KinBody';


console.log("Loading MUSEControl.js");

function _getParameterByName(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

function getClockTime() { return new Date()/1000.0; }

if (typeof io == "undefined") {
    var io = require("socket.io-client");
}

//
function dist2(v1, v2) {
    var d2 = 0;
    for (var i=0; i<v1.length; i++) {
        var d = v1[i]-v2[i];
        d2 += d*d;
    }
    return d2;
}

function vecStr(vec, fmt) {
    //console.log("vec", vec);
    fmt = fmt || "%5.2f %5.2f %5.2f"
    return sprintf(fmt, vec[0], vec[1], vec[2])
}

function getWPos(jrec) {
    return [jrec.cameraX, jrec.cameraY, jrec.cameraZ];
}

/*
This helper class is for 'debouncing'.  It watches discrete
states being tracked, and keeps track of how long a new state
has been in.  After an observed state change, the actual state
is considered to be transient (represented by null value)
until a given time duration passes in which only one value of
state is observed.
*/
class State {
    constructor(name) {
        console.log("State " + name);
        this.name = name;
        this.state = null;
        this.lastObservedState = null;
        this.lastChangeTime = getClockTime();
        this.minChangeTime = 0.2;
    }

    observe(state) {
        this.state = state;
    }

    noticeNewState(state) {
        console.log(sprintf("******* %s: %s", this.name, state));
    }

    hasState() {
        return self.state != null;
    }

    getState() {
        return this.state;
    }

    get() { return this.state; }
}

class BooleanState extends State {
    constructor(name) {
        super(name);
        console.log("BooleanState " + name);
    }

    observe(state) {
        if (state == this.state) {
            return state;
        }
        this.state = null;
        var t = getClockTime();
        if (state == this.lastObservedState) {
            var dt = t - this.lastChangeTime;
            if (dt >= this.minChangeTime) {
                this.state = state;
                this.noticeNewState(state);
            }
        }
        else {
            this.lastObservedState = state;
            this.lastChangeTime = t;
        }
        return this.state;
    }

}

/*
var JOINT_PAIRS = [
    ["LEFT_HAND", "LEFT_ELBOW"],
    ["LEFT_ELBOW", "LEFT_SHOULDER"],
    ["LEFT_SHOULDER", "NECK"],
    ["RIGHT_HAND", "RIGHT_ELBOW"],
    ["RIGHT_ELBOW", "RIGHT_SHOULDER"],
    ["RIGHT_SHOULDER", "NECK"],
    ["LEFT_SHOULDER", "RIGHT_SHOULDER"],
    ["NECK", "HEAD"],
    //
    ["RIGHT_HIP", "RIGHT_KNEE"],
    ["RIGHT_KNEE", "RIGHT_FOOT"],
    ["LEFT_HIP", "LEFT_KNEE"],
    ["LEFT_KNEE", "LEFT_FOOT"],
    ["LEFT_HIP", "BASE_SPINE"],
    ["RIGHT_HIP", "BASE_SPINE"],
    ["BASE_SPINE", "MID_SPINE"],
    ["MID_SPINE", "NECK"],
];
*/
/*
This is a class for keeping track of a body.
*/
var JointType = {
    spineBase: 0,
    spineMid: 1,
    neck: 2,
    head: 3,
    shoulderLeft: 4,
    elbowLeft: 5,
    wristLeft: 6,
    handLeft: 7,
    shoulderRight: 8,
    elbowRight: 9,
    wristRight: 10,
    handRight: 11,
    hipLeft: 12,
    kneeLeft: 13,
    ankleLeft: 14,
    footLeft: 15,
    hipRight: 16,
    kneeRight: 17,
    ankleRight: 18,
    footRight: 19,
    spineShoulder: 20,
    handTipLeft: 21,
    thumbLeft: 22,
    handTipRight: 23,
    thumbRight: 24
}


var JT = JointType;
var JOINT_PAIRS = [
    [JT.shoulderLeft, JT.neck],
    [JT.elbowLeft, JT.shoulderLeft],
    [JT.wristLeft, JT.elbowLeft],
    [JT.handLeft, JT.wristLeft],
    [JT.handTipLeft, JT.handLeft],
    [JT.thumbLeft, JT.handLeft],
    [JT.shoulderRight, JT.neck],
    [JT.elbowRight, JT.shoulderRight],
    [JT.wristRight, JT.elbowRight],
    [JT.handRight, JT.wristRight],
    [JT.handTipRight, JT.handRight],
    [JT.thumbRight, JT.handRight],
    [JT.neck, JT.head],
    [JT.spineMid, JT.neck],
    [JT.spineBase, JT.spineMid],
    [JT.hipLeft, JT.spineBase],
    [JT.kneeLeft, JT.hipLeft],
    [JT.ankleLeft, JT.kneeLeft],
    [JT.footLeft, JT.ankleLeft],
    [JT.hipRight, JT.spineBase],
    [JT.kneeRight, JT.hipRight],
    [JT.ankleRight, JT.kneeRight],
    [JT.footRight, JT.ankleRight]
];

window.JT = JT;
window.JOINT_PAIRS = JOINT_PAIRS;
/*
This class is for keeping track of information about a particular
tracked body.   At a given time if there are n skeletons being
tracked there should b n Body objects.
*/

class Body {
    constructor(id, bodyRec) {
        Body.numBodies++;
        this.bodyNum = Body.numBodies;
        this.id = id;
        this.lastBodyRec = bodyRec;
        this.lastTimeSeen = getClockTime();
    }

    handleRec(bodyRec, t, frame) {
        this.lastBodyRec = bodyRec;
        this.lastTimeSeen = t;
    }

    destroy() {
        console.log("Body "+this.id+" dying");
    }
}

Body.numBodies = 0;

/*
This is a subclass of Body where particular things are
being kept track of, that may be application specific.
*/
class RiggedBody extends Body {
    constructor(id, bodyRec) {
        super(id, bodyRec);
        this.DLR =              new State("DLR"); // dist Left to Right
        this.LEFT_UP =          new BooleanState("LEFT_UP");
        this.RIGHT_UP =         new BooleanState("RIGHT_UP");
        this.HANDS_TOGETHER =   new BooleanState("HANDS_TOGETHER");
        this.TRIGGER =          new BooleanState("TRIGGER");
    }

    handleRec(bodyRec, t, frame) {
        super.handleRec(bodyRec, t, frame);
        var J = JointType;
        //
        this.DLR.observe(this.wdist(J.handLeft, J.handRight));
        var lup = this.above(J.handLeft, J.head);
        var rup = this.above(J.handRight, J.head);
        var tog = this.together(J.handLeft, J.handRight);
        this.LEFT_UP.observe(lup);
        this.RIGHT_UP.observe(rup);
        this.HANDS_TOGETHER.observe(tog);
        this.TRIGGER.observe(lup && rup && tog);
    }

    above(j1, j2) {
        //console.log(sprintf("above %s %s", j1, j2));
        var pos1 = this.lastBodyRec.joints[j1];
        var pos2 = this.lastBodyRec.joints[j2];
        //console.log(" pos1:", pos1);
        //console.log(" pos2:", pos2);
        var y1 = 1.0 - pos1.colorY;
        var y2 = 1.0 - pos2.colorY;
        //console.log(sprintf("y1: %6.1f  y2: %6.1f", y1, y2))
        return y1 > y2;
    }

    // get world distance between j1 and j2
    wdist(j1, j2) {
        var wpos1 = getWPos(this.lastBodyRec.joints[j1]);
        var wpos2 = getWPos(this.lastBodyRec.joints[j2]);
        //console.log(" wpos1:", wpos1);
        //console.log(" wpos2:", wpos2);
        var d2 = dist2(wpos1, wpos2);
        return Math.sqrt(d2);
    }

    together(j1, j2) {
        //console.log(sprintf("above %s %s", j1, j2));
        //console.log(sprintf("y1: %6.1f  y2: %6.1f", y1, y2))
        //console.log("d2: ", d2);
        return (this.wdist(j1,j2) < 0.1);
    }

    getWPos(j) {
        return getWPos(this.lastBodyRec.joints[j]);
    }
    
    static statusHeader() {
        return "Num    LEFTUP RIGHTUP TOGETHER TRIGGER  DLR\n" +          
               "      LHAND               RHAND                  HEAD\n" +
               "------------------------------------------------------------\n";
    }

    statusStr() {
        var J = JointType;
        var line1 = sprintf("%3d   %7s %7s %7s %7s %7.2f\n",
            this.bodyNum,
            this.LEFT_UP.get(),
            this.RIGHT_UP.get(),
            this.HANDS_TOGETHER.get(),
            this.TRIGGER.get(),
            this.DLR.get()
        );
        var line2 = sprintf("  %10s   %10s   %10s\n",
            vecStr(getWPos(this.lastBodyRec.joints[J.handLeft])),
            vecStr(getWPos(this.lastBodyRec.joints[J.handRight])),
            vecStr(getWPos(this.lastBodyRec.joints[J.head])),
        );
        return line1 + line2;
    }
}



class Bone {
    constructor(body, j1, j2) {
        this.body = body;
        this.j1 = j1;
        this.j2 = j2;
        this.geometry = new THREE.Geometry();
        this.material = new THREE.LineBasicMaterial({ color: 0xff00ff, linewidth: 2 });
        var vertices = this.geometry.vertices;
        this.v1 = new THREE.Vector3(0, 0, 0);
        this.v2 = new THREE.Vector3(1000, 1000, 1000);
        vertices.push(this.v1);
        vertices.push(this.v2);
        this.line = new THREE.Line(this.geometry, body.material);
        body.skel.add(this.line);
    }
}

class KBody extends RiggedBody {
        constructor(id, bodyRec, parent) {
        super(id, bodyRec);
        this.bodyNum = KBody.numBodies;
        this.joints = {};
        this.bones = [];
        this.skel = null;
        this.parent = parent;
        //this.LEFT_UP = false;
        //this.RIGHT_UP = false;
        this.setupSkel();
     }

     handleRec(bodyRec, t, frame) {
        super.handleRec(bodyRec, t, frame);
        this.bodyRec = bodyRec;
        this.updateSkel();
     }

    setupSkel() {
        this.bones = [];
        this.skel = new THREE.Object3D();
        if (this.parent) {
            this.parent.add(this.skel);
        }
        else {
            this.skel.scale.set(.001,.001,.001);
            game.scene.add(this.skel);
        }
        JOINT_PAIRS.forEach(jp => {
            var bone = new Bone(this, jp[0], jp[1]);
            this.bones.push(bone);
        })
        //this.lines = new THREE.Line(this.geometry, this.material);
    }

    updateSkel() {
        if (!this.bodyRec)
            return;
        this.bones.forEach(bone => {
            var j1 = this.getJoint(bone.j1);
            var j2 = this.getJoint(bone.j2);
            if (j1.pos && j2.pos) {
                bone.v1.set(j1.pos[0], j1.pos[1], j1.pos[2]);
                bone.v2.set(j2.pos[0], j2.pos[1], j2.pos[2]);
            }
            else {
                console.log("Cant get bone info");
            }
            bone.geometry.verticesNeedUpdate = true;
        });
    }

    getJoint(jointName) {
       // console.log("getJoint", jointName);
        var joint = this.joints[jointName];
        if (!joint) {
            joint = {name: jointName, bodyId: this.id};
            this.joints[jointName] = joint;
        }
        var p = this.getWPos(jointName);
        //var s = 1000.0;
        var s = 1.0;
        joint.pos = [s*p[0], s*p[1], s*p[2]];
        joint.conf = 1;
        if (joint.bodyId != this.id) {
            alert("Joint bodyId inconsistency");
        }
        //console.log("joint", joint);
        return joint;
    }

    update() {
        return;
        if (this.skel)
            this.updateSkel(this.skel);
    }

    destroy() {
        if (this.skel && this.skel.parent)
            this.skel.parent.remove(this.skel);
    }
}
KBody.numBodies = 0;

class SkelWatcher
{
    constructor(parent, opts) {
        opts = opts || {};
        this.parent = parent;
        this.bodies = {};
        this.numRecs = 0;
        this.startTime = getClockTime();
        this.sioServerURL = null;
        this.socket = opts.socket;
        if (!this.socket) {
            /*
            this.sioServerURL = opts.sioServerURL ||
            getParameterByName_("sioServerURL") || '/';
            */
           this.sioServerURL = "http://localhost:8002";
            console.log("connecting to socket.io server", this.sioServerURL);
            this.socket = io.connect(this.sioServerURL);
        }
        this.socket.on('bodyFrame', this.handleBodyFrame.bind(this));
    }

    handleBodyFrame(frame) {
        //console.log("frame", frame);
        this.numRecs++;
        var t = getClockTime();
        var frameNum = frame.frameNum;
        var bodyRecs = frame.bodies;
        bodyRecs.forEach(bodyRec => {
            if (!bodyRec.tracked)
                return;
            var bid = bodyRec.trackingId;
            //console.log("bid", bid);
            var body = this.bodies[bid];
            if (!body) {
                body = this.makeNewBody(bid, bodyRec);
                this.bodies[bid] = body;
                this.handleNewBody(body);
            }
            body.handleRec(bodyRec, t, frame);
        });
        this.pruneZombies();
        this.showStatus();
    }

    pruneZombies() {
        var t = getClockTime();
        var deadIds = [];
        for (var id in this.bodies) {
            var body = this.bodies[id];
            if (t - body.lastTimeSeen > 2)
                deadIds.push(id);
        }
        deadIds.forEach(id => {
            this.handleRemovedBody(this.bodies[id]);
            delete this.bodies[id];
        })
    }

    makeNewBody(bid, bodyRec) {
       // return new RiggedBody(bid, bodyRec);
        return new KBody(bid, bodyRec, this.parent);
    }
    
    handleNewBody(body) {
        console.log("New Body", body.id, body);
    }

    handleRemovedBody(body) {
        console.log("removing", body.id);
        body.destroy();
    }

    showStatus() {
        if (0) {
            console.log(RiggedBody.statusHeader());
            for (var bid in this.bodies) {
                console.log(this.bodies[bid].statusStr());
            }
        }
        var t = getClockTime();
        var dt = t - this.startTime;
        var nrecs = this.numRecs;
        var fps = nrecs / (dt + 1.0E-6);
        var statStr = sprintf("Running %6.1f  NRecs: %5d  FPS: %4.1f", dt, nrecs, fps);
        $("#bodyStatus").html(statStr+"\n\n");
        $("#bodyStatus").append(RiggedBody.statusHeader() + "<br>\n");
        for (var bid in this.bodies) {
            var body = this.bodies[bid];
            $("#bodyStatus").append(body.statusStr());
        }
    }
}

/*
class DancingBody extends Body {
    constructor(id, parent) {
        super(id, parent);
        //alert("New body "+id);
        //this.pSystems = {};
        this.trailNames = ["LEFT_HAND", "RIGHT_HAND"];
        this.sparkler = new MUSE.Sparkler("sparkler_"+id, this.trailNames);
        //this.sparkler.addSparklers(parent);
        this.sparkler.addSparklers();
        this.setupSkel();
        window.DANCER_BODY = this;
    }

    handleJoint(msg, joint) {
      //console.log("handleJoint "+joint+" "+this.id);
      var pos = msg[joint];
      if (!pos)
        return;
      var v = new THREE.Vector3(pos[0], pos[1], pos[2]);
      //v.multiplyScalar(.001);
      this.parent.localToWorld(v);
      this.sparkler.setPosition(joint, v);
    }

    handleMsg(msg) {
        super.handleMsg(msg);
        //console.log("dancing body "+this.id);
        var lh = msg.LEFT_HAND;
        var rh = msg.RIGHT_HAND;
        if (!(lh && rh)) {
            return;
        }
        this.handleJoint(msg, "LEFT_HAND");
        this.handleJoint(msg, "RIGHT_HAND");
    }

    destroy() {
        console.log("DancingBody.destroy "+this.id);
        this.sparkler.destroy();
        super.destroy();
    }

    update() {
        super.update();
        this.sparkler.update();
    }
}
*/

// This class watches Kinect messages and maintains
// list of bodies with poses.  The bodies can be used
// as dancers with sparkles.
class KinSkelWatcher extends Node3D
{
    constructor(game, opts)
    {
        console.log("****** KinSkelWatcher", opts);
        super(game, opts);
        this.game = game;
        opts = opts || {};
	    //opts.scale = opts.scale || 0.06;
        this.checkOptions(opts);
        var obj3d = new THREE.Object3D();
        obj3d.name = this.name;
        game.addToGame(obj3d, obj3d.name, opts.parent);
        game.setFromProps(obj3d, opts);
        this.setObject3D(obj3d);
        this.skelWatcher = new SkelWatcher(obj3d, opts);
        this.color = new THREE.Color();
        /*
        if (game.netLink) {
            game.netLink.registerKinectWatcher(this);
        }
        else {
            //alert("No NetLink");
        }
        */
        this.color = new THREE.Color();
        var inst = this;
        //game.state.on(this.name, state => inst.setProps(state));
        //game.state.on("cmpColorHue", h => inst.setHue(h));
        //this.bodies = new Bodies(DancingBody, obj3d);
        this._visible = true;
    }

    setVisible(v) {
        this._visible = v;
    }

    getVisible() {
        return this._visible;
    }

    setHue(h) {
        this.color.setHSL(h,.9,.5);
        this.setColor(this.color);
    }

    setColor(c) {
        this.color.copy(c);
        return;
    }

    update() {
        if (!this.getVisible())
	       return;
    }
}

MUSENode.defineFields(KinSkelWatcher, [
    "skelColor"
]);

function addKinSkelWatcher(game, opts)
{
    //var name = opts.name || 'kinectWatcher';
    let kw = new KinSkelWatcher(game, opts);
    game.registerController(kw.name, kw);
    return kw;
}

Game.registerNodeType("KinSkelWatcher", addKinSkelWatcher);

export {KinSkelWatcher};
