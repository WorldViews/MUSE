/*
This module keeps track of the body skeleton state for a Kinect.
After each 'frame' in which skeleton poses have been updated, it
calls registered updateHandlers, that can use the poses for UI
purposes.

This gets updated by messages of type kinect.skel, but could be
easily modified to get updated via OSC messages.

*/
"use strict";

var MSG = null;
var KIN_WATCHER = null;

function getClockTime() {
    return new Date()/1000.0;
}

function int(f) { return Math.floor(f+0.5); }

function above(msg, j1, j2)
{
   var c1 = msg[j1+"_c"];
   var c2 = msg[j2+"_c"];
   if (c1 < 0.5 || c2 < 0.5) {
       //console.log("c1: "+c1+ "  c2: "+c2);
       return false;
   }
    if (!msg[j1] || !msg[j2]) {
	console.log("above: no joint info");
	return false;
    }
   var y1 = msg[j1][1];
   var y2 = msg[j2][1];
   //console.log("v1: "+y1+"   v2: "+y2);
   return y1 > y2;
}

/*
This helper class is for 'debouncing'.  It watches discrete
states being tracked, and keeps track of how long a new state
has been in.  After an observed state change, the actual state
is considered to be transient (represented by null value)
until a given time duration passes in which only one value of
state is observed.
*/
class StateWatcher {

    constructor(name) {
        console.log("StateWatcher "+name);
        this.name = name;
        this.state = null;
        this.lastObservedState = null;
        this.lastChangeTime = getClockTime();
        this.minChangeTime = 0.2;
    }

    observe(state)
    {
        if (state == this.state) {
            return;
        }
        this.state = null;
	    var t = getClockTime();
	    if (state == this.lastObservedState) {
	        var dt = t - this.lastChangeTime;
	        if (dt >= this.minChangeTime) {
		        this.state = state;
	        }
	    }
	    else {
	        this.lastObservedState = state;
	        this.lastChangeTime = t;
	    }
    }

    getState() {
        return this.state;
    }
}

var JOINT_PAIRS = [
    ["LEFT_HAND", "LEFT_ELBOW"],
    ["LEFT_ELBOW", "LEFT_SHOULDER"],
    ["LEFT_SHOULDER", "NECK"],
    ["RIGHT_HAND", "RIGHT_ELBOW"],
    ["RIGHT_ELBOW", "RIGHT_SHOULDER"],
    ["RIGHT_SHOULDER", "NECK"],
    ["NECK", "HEAD"]
];

var JX = 0;
var JY = 0;
var JZ = 0;
class Bone {
    constructor(body, j1, j2) {
        this.body = body;
        this.j1 = j1;
        this.j2 = j2;
        this.geometry = new THREE.Geometry();
        this.material = new THREE.LineBasicMaterial({ color: 0xff00ff });
        var vertices = this.geometry.vertices;
        this.v1 = new THREE.Vector3(JX, JY, JZ);
        JX += .2;
        JY += .5;
        JZ += .3;
        this.v2 = new THREE.Vector3(JX, JY, JZ);
        JX += -.1;
        JY += .5;
        JZ += .3;
        vertices.push(this.v1);
        vertices.push(this.v2);
        this.line = new THREE.Line(this.geometry, body.material);
        body.skel.add(this.line);
    }
}

class Body {
    constructor(bodyId) {
        Body.numBodies++;
        this.id = bodyId;
        this.bodyNum = Body.numBodies;
        this.joints = {};
        this.skel = null;
        //this.LEFT_UP = false;
        //this.RIGHT_UP = false;
        this.LEFT_UP = new StateWatcher("LEFT_UP");
        this.RIGHT_UP = new StateWatcher("RIGHT_UP");
        this.lastTime = getClockTime();
    }

    setupSkel() {
        this.bones = [];
        this.skel = new THREE.Object3D();
        this.skel.scale.set(.001,.001,.001);
        game.scene.add(this.skel);
        JOINT_PAIRS.forEach(jp => {
            var bone = new Bone(this, jp[0], jp[1]);
            this.bones.push(bone);
        })
        //this.lines = new THREE.Line(this.geometry, this.material);
    }

    updateSkel() {
        if (!this.skel)
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

    handleMsg(msg) {
        if (msg.bodyId != this.id) {
            console.log("********* mismatched bodyId - should not happen");
            return;
        }
        this.msg = msg;
        this.lastTime = getClockTime();
    }

    getJoint(jointName) {
        var joint = this.joints[jointName];
        if (!joint) {
            joint = {name: jointName, bodyId: this.bodyId};
            this.joints[jointName] = joint;
        }
        joint.pos = this.msg[jointName];
        joint.conf = this.msg[jointName+"_c"];
        if (joint.bodyId != this.bodyId) {
            alert("Joint bodyId inconsistency");
        }
        return joint;
    }

    above(joint1, joint2)
    {
        return above(this.msg, joint1, joint2);
    }

    update() {
        if (this.skel)
            this.updateSkel(this.skel);
    }
}

Body.numBodies = 0;

// This is a collection of bodies currently tracked by the Kinect.
// This class handles dispatch of message to the appropriate instance
// of the Body class, and handles pruning of bodies that are no
// longer being tracked.
class Bodies {
    constructor(bodyClass) {
        this.bodyClass = bodyClass || Body;
        this.bodies = {};
        this.selectedBody = null;
        this.updateFuns = [];
    }

    registerUpdater(updateFun)
    {
        this.updateFuns.push(updateFun);
    }

    handleMsg(msg)
    {
        window.MSG = msg;
        var inst = this;
        //var str = JSON.stringify(msg);
        //console.log("msg: "+str);
        var bodyId = msg.bodyId;
        if (!bodyId) {
            console.log("msg has no bodyId");
        }
        var body = this.bodies[bodyId];
        if (!body) {
            //body = new Body(bodyId);
            body = new this.bodyClass(bodyId);
            this.bodies[bodyId] = body;
        }
        this.selectedBody = body;
        body.handleMsg(msg);
        //this.update();
    }

    pruneBodies()
    {
        var t = getClockTime();
        var deadBodyIds = [];
        for(var id in this.bodies) {
            var body = this.bodies[id];
            var dt = t - body.lastTime;
            //console.log("prune id: "+id+"  dt: "+dt);
            if (dt > 5) {
                deadBodyIds.push(id);
            }
        }
        deadBodyIds.forEach(id => {
            console.log("Removing body "+id);
            this.bodies[id].destroy();
            delete this.bodies[id];
        });
    }

    getSelectedBody() { return this.selectedBody; }

    update()
    {
        this.pruneBodies();
        for(var id in this.bodies) {
            this.bodies[id].update();
        }
        var inst = this;
        this.updateFuns.forEach(fun => fun(inst));
    }

}

class KinWatch extends Bodies {

    constructor(sioURL) {
        super();
        KIN_WATCHER = this;
        this.url = sioURL;
        console.log("getting socket at: "+sioURL);
        this.sock = io(sioURL);
        console.log("Got socket "+this.sock);
        var inst = this;
        this.sock.on('kinect.skel', msg => inst.handleMsg(msg));
        var inst = this;
        //setInterval(function() { inst.update(); }, 1000);
        setInterval(function() { inst.update(); }, 50);
    }

    sendMessage(msg, channel)
    {
        channel = channel || "pano";
        var jstr = JSON.stringify(msg);
        console.log("KinWatch.sendMessage "+channel+" "+ jstr);
        this.sock.emit(channel, jstr);
    }

    getClockTime() { return getClockTime(); }

    getStatusHTML()
    {
        var html = "";
        html += "<pre>";
        for (var bodyId in kinWatch.bodies) {
            var body = kinWatch.bodies[bodyId];
            //console.log("body: "+body);
            html += "Body "+body.bodyNum+" "+bodyId+"\n";
            body.LEFT_UP.observe(body.above('LEFT_HAND', 'HEAD'));
            body.RIGHT_UP.observe(body.above('RIGHT_HAND', 'HEAD'));
            //$("#status").html("LUP: "+lup+"  RUP: "+rup);
            html += " LUP: "+body.LEFT_UP.getState()+
            "  RUP: "+body.RIGHT_UP.getState();
            html += "\n";
            var str = "";
            var JOINTS = ['RIGHT_HAND', 'LEFT_HAND'];
            JOINTS.forEach(joint => {
                //console.log("joint: "+joint);
                str += " "+ joint + " ";
                var pos = body.msg[joint];
                if (pos) {
                    str += pos.map(int).join(" ");
                }
                str += "\n";
            });
            //$("#joints").html(str);
            html += str;
        };
        html += "</pre>\n";
        return html;
    }
}

/*
These are for testing.  We had a bug for a while
that if set yaw messages were sent at a high rate,
it would cause the viewer to screw  up when it got
several messages between frame renderings.
*/
var blasting = false;
var dummyYaw = 0;

function sendDummyYaw()
{
    dummyYaw += 1;
    var msg = {"name":"master",
	       "type":"pano.control",
	       "userId":"master",
	       "clientType":
	       "html.KinPanoControl",
	       "panoView":[dummyYaw,0],"num":3520,"t":1496186328.121}
    KIN_WATCHER.sendMessage(msg, "pano");
}


function blastYawMessages()
{
    blasting = true;
    var blastTimer = setInterval(sendDummyYaw, 8);
}

export {StateWatcher,Body,Bodies};
