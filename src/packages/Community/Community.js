
import * as THREE from 'three';
import dat from 'dat-gui';
import {Game} from 'core/Game';
import {MUSENode} from 'core/Node';
import {Node3D} from 'core/Node3D';
import Util from 'core/Util';

var RADIUS = 0.1;
var LINE_MATERIAL = new THREE.LineBasicMaterial({color: 0x0000ff, lineWidth: 2});
var SPHERE_GEOMETRY = new THREE.SphereGeometry( RADIUS, 32, 32 );
var ACTION_GEOMETRY = new THREE.SphereGeometry( RADIUS/3.0, 20, 20 );
function Vector2(x,y) { return new THREE.Vector2(x,y); };
function Vector3(x,y,z) { return new THREE.Vector3(x,y,z); };

var PARAMS = {
    rate: 0.01,
    pSmile: .7,
    pFrown: .7,
};

var NEUTRAL_COLOR = new THREE.Color("gray");

var STATE_COLORS = {
    'happy':   new THREE.Color("green"),
    'sad':     new THREE.Color("brown"),
    'angry':   new THREE.Color("red"),
    'neutral': new THREE.Color("gray"),
};

var ACTION_COLORS = {
    'smile':   new THREE.Color("green"),
    'frown':   new THREE.Color("red"),
    'neutral': new THREE.Color("gray"),
};

class Person {
    constructor(id, pos) {
        this.id = id;
        this.x = 0;
        this.y = 0;
        this.pos = pos;
        this.neighbors = {};
        this.graphic = null;
        this.state = "neutral";
        //this.state = "happy";
        this.friends = [];
    }

    setPosition(x,y) {
        this.x = x;
        this.y = y;
    }

    addFriend(p) {
        this.friends.push(p);
    }

    setState(state) {
        this.state = state;
        this.updateGraphic();
    }

    addGraphic(parent) {
        var personGraphic = new THREE.Group();
        personGraphic.position.x = this.x;
        personGraphic.position.z = this.y;
        parent.add(personGraphic);
        this.parent = parent;
        this.graphic = personGraphic;
        this.ballMaterial = new THREE.MeshPhongMaterial( { color: 0x331111} );
        this.ballGeometry = SPHERE_GEOMETRY;
        this.actionGeometry = ACTION_GEOMETRY;
        this.ball = new THREE.Mesh(this.ballGeometry, this.ballMaterial);
        this.ball.name = this.id;
        this.lines = new THREE.Geometry();
        this.actions = {};
        this.actionStartTimes = {};
        this.actionGraphics = {};
        this.friendsGraphics = null;
        this.graphic.add(this.ball);
     }

    addFriendsGraphics() {
        this.friendsGraphics = new THREE.LineSegments(this.lines, LINE_MATERIAL);
        this.friendsGraphics.userData = {museIgnorePicking: true};
        this.friends.forEach(friend => {
            //this.lines.vertices.push(new THREE.Vector3(0,0.05,0));
            this.lines.vertices.push(new THREE.Vector3(0,0.0,0));
            this.lines.vertices.push(new THREE.Vector3(0,0,0));
            var actionMaterial = new THREE.MeshPhongMaterial( { color: 0x331111} );
            var actionGraphic = new THREE.Mesh(this.actionGeometry, actionMaterial);
            this.actionGraphics[friend.id] = actionGraphic;
            this.graphic.add(actionGraphic);
            //this.parent.add(actionGraphic);
        });
        this.graphic.add(this.friendsGraphics);
    }

    updateGraphic() {
        var t = Util.getClockTime();
        if (!this.graphic) {
            return;
        }
        this.graphic.position.x = this.x;
        this.graphic.position.z = this.y;
        if (!this.friendsGraphics) {
            this.addFriendsGraphics();
            //this.updateActionGraphic();
        }
        this.updateActionGraphic(t);
        var color = STATE_COLORS[this.state];
        var ball = this.ball;
        ball.material.color.copy(color);
        ball.material.needsUpdate = true;

        var vertices = this.lines.vertices;
        var i = 0;
        var f = 0.3;
        this.friends.forEach(friend => {
            var v = vertices[i+1];
            i += 2;
            //v.set(friend.x, -0.05, friend.y);
            v.set(friend.x, 0.0, friend.y);
            this.graphic.worldToLocal(v);
       });
        this.graphic.needsUpdate = true;
        this.lines.verticesNeedUpdate = true;
        this.lines.needsUpdate = true;
    }

    updateActionGraphic(t) {
        if (!this.graphic) {
            return;
        }
        var f = 0.3;
        this.friends.forEach(friend => {
            //var u = new THREE.Vector3(this.x, 0, this.y);
            var v = new THREE.Vector3(friend.x, 0, friend.y);
            this.graphic.worldToLocal(v);
            var actionGraphic = this.actionGraphics[friend.id];
            var action = this.actions[friend.id];
            var t0 = this.actionStartTimes[friend.id];
            var dt = t - t0;
            f = dt/1.0;
            if (f > 1)
                f = 1;
            var color = NEUTRAL_COLOR;
            if (action) {
                  color = ACTION_COLORS[action];
            }
            actionGraphic.material.color.copy(color);
            actionGraphic.material.needsUpdate = true;
            actionGraphic.position.set(v.x*f,   0,   v.z*f);
        });
        this.graphic.needsUpdate = true;
   }

    handleAction0(action) {
        var r = Math.random();
        var s = this.state;
        //this.state = "neutral";
        if (s == "happy") {
            if (r < .001)
                this.state = "sad";
        }
        if (r > .999)
            this.state = "happy";
        this.updateGraphic();
    }

    handleAction(action) {
         if (action == "smile") {
            if (this.state == "angry")
                this.state = "neutral";
            else
                this.state = "happy";
         }
        if (action == "frown") {
            if (this.state == "happy")
                this.state = "neutral";
            else if (this.state == "sad" || this.state == "angry")
                this.state = "angry";
            else
                this.state = "sad";
        }
    }

    handleStep(t) {
        this.friends.forEach(p => {
            var action = this.actions[p.id];
            if (action) {
                this.updateAction(action, p, t);
                return;
            }
            var r = Math.random();
            if (r > PARAMS.rate)
                return;
            r = Math.random();
            if (this.state == "happy" && r < PARAMS.pSmile) {
                this.startAction("smile", p, t);
            }
            if (this.state == "angry" && r < PARAMS.pFrown) {
                this.startAction("frown", p, t);
            }
        });
    }

    updateAction(action, p, t) {
        var t0 = this.actionStartTimes[p.id];
        var dt = t - t0;
        if (dt > 1) {
            p.handleAction(action);
            this.actions[p.id] = null;
        }
    }

    startAction(action, p, t) {
        this.actions[p.id] = action;
        this.actionStartTimes[p.id] = t;
    }

    reset() {
        this.state = "neutral";
        this.actions = {};
        this.actionStartTimes = {};
    }

    getJSON() {
        var obj = {
            type: "Person",
            id: this.id,
            state: this.state,
            pos: [this.x, this.y],
            friends: [],
            pSmile: PARAMS.pSmile,
            pFrown: PARAMS.pFrown
        }
        this.friends.forEach(p => {
            obj.friends.push(p.id);
        })
        return obj;
    }

    dump() {
        console.log("Person "+this.id+" "+this.state, this.friends);
    }
}

class Community {
    constructor(nrows, ncols) {
        this.people = {};
        for (var i=0; i<nrows; i++) {
            for (var j=0; j<ncols; j++) {
                var id = i+"_"+j;
                var pos = new THREE.Vector2(i,j);
                var person = new Person(id, pos);
                this.people[id] = person;
            }
        }
        this.addLinks();
        this.dump();
    }

    addLinks() {
        console.log("*** addLinks ***");
        for (var id1 in this.people) {
            var p1 = this.people[id1];
            for (var id2 in this.people) {
                var p2 = this.people[id2];
                if (p1 == p2)
                    continue;
                var d = p1.pos.distanceTo(p2.pos);
                //console.log(id1+" "+id2+": "+d);
                if (d >= 2)
                    continue;
                p1.addFriend(p2);
                //p2.addFriend(p1);
            }
        }
    }

    getPerson(id) {
        return this.people[id];
    }

    step() {
        //console.log("step");
        var t = Util.getClockTime();
        this.lastT = t;
        for (var id in this.people) {
            var person = this.people[id];
            person.handleStep(t);
            person.updateGraphic();
        }
    }

    handleClick(id, evt) {
        var person = this.people[id];
        if (!person) {
            console.log("No person for id: "+id);
            return;
        }
        person.setState(evt.ctrlKey ? "angry" : "happy");
        person.dump();
    }

    reset() {
        for (var id in this.people) {
            this.people[id].reset();
        }
    }

    getJSON() {
        var obj = {people: []};
        for (var id in this.people) {
            var p = this.people[id];
            obj.people.push(p.getJSON());
        }
        return obj;
    }

    dump() {
        for (var id in this.people) {
            this.people[id].dump();
        }
    }
}

class CommunityNode extends Node3D
{
    constructor(game, opts)
    {
        super(game, opts);
        var opts = this.options; // super may have filled in some things
        this.game = game;
        this.checkOptions(opts);
        var n = 40;
        this.psmile = .1;
        this.pfrown = .1;
        this.nrows = opts.nrows || n;
        this.ncols = opts.ncols || n;
        this.length = 10;
        this.texturePath = "src/packages/Miura/textures/dollarBothSides.jpg";
        this.texture = null;
        this.group = new THREE.Group();
        this.group.name = this.name;
        this.setObject3D(this.group);
        this.net = null;
        var inst = this;
        this.onMuseEvent("click", (obj, evt, pickedObj) => inst.handleClick(obj,evt,pickedObj));
        this.addNetwork();
        game.setFromProps(this.group, opts);
        game.addToGame(this.group, this.name, opts.parent);

        // This ensures we get update calls each frame
        game.registerController(this.options.name, this);
        if (1) {
            this.addGUI();
        }
    }

    handleClick(obj, evt, pickedObj) {
        console.log("Community.click ", obj, evt, pickedObj);
        this.community.handleClick(pickedObj.name, evt);
    }

    reset() {
        console.log("Reset");
        this.community.reset();
    }

    config1() {
        PARAMS.pSmile = .1;
        this.nrows = 4;
        this.ncols = 5;
        this.addNetwork();
    }

    config2() {
        PARAMS.pSmile = .1;
        this.nrows = 10;
        this.ncols = 10;
        this.addNetwork();
    }

    config3() {
        PARAMS.pSmile = .1;
        this.nrows = 2;
        this.ncols = 2;
        this.addNetwork();
    }

    addGUI() {
        var inst = this;
        this.gui = new dat.GUI({width:300});
        this.gui.add(PARAMS, 'rate', 0, 1.0).onChange(()=>inst.updateParams());
        this.gui.add(PARAMS, 'pSmile', 0, 1.0).onChange(()=>inst.updateParams());
        this.gui.add(PARAMS, 'pFrown', 0, 1.0).onChange(()=>inst.updateParams());
        this.gui.add(this, 'reset');
        this.gui.add(this, 'config1');
        this.gui.add(this, 'config2');
        this.gui.add(this, 'config3');
    }

    addNetwork()
    {
        if (this.net) {
            this.net.parent.remove(this.net);
        }
        this.net = new THREE.Object3D();
        var w = .5;
        var h = .5;
        this.community = new Community(this.nrows, this.ncols);
        var xlow = -w*this.nrows/2;
        var ylow = -h*this.ncols/2;
        for (var i=0; i<this.nrows; i++) {
            for (var j=0; j<this.ncols; j++) {
                var id = i+"_"+j;
                var person = this.community.getPerson(id);
                var x = xlow + i*w;
                var y = ylow + j*h;
                person.setPosition(x,y);
                person.addGraphic(this.net);
             }
        }
        this.group.add(this.net);
    }

    updateParams() {
        console.log("update mesh");
        var t0 = Util.getClockTime();
        this.nrows = Math.floor(this.nrows+0.5);
        this.ncols = Math.floor(this.ncols+0.5);
        this.addNetwork();
        var t1 = Util.getClockTime();
        console.log(Util.sprintf("finished updating mesh %.3f", t1-t0));
        //this.updateGeometry(this.geometry);
    }

    update() {
       this.community.step();
    }

    dump() {
        var obj = this.community.getJSON();
        console.log("community:\n"+JSON.stringify(obj, null, 3));
    }
}

// could add fields there.  If checkOptions is used, it
// complains about unexpected fields in options.
MUSENode.defineFields(CommunityNode, [
    "size"
]);

// note that this could return a promise instead.
// (See DanceController)
function addCommunityNode(game, options) {
    var op = new CommunityNode(game, options);
    return op;
}

Game.registerNodeType("Community", addCommunityNode);

MUSE.CommunityNode = CommunityNode;

export {CommunityNode};
