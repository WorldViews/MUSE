
import * as THREE from 'three';
import {Game} from '../Game';
import {MUSENode} from '../Node';
import {Node3D} from '../Node3D';
import { sprintf } from "sprintf-js";
//import {ParticleSys} from '../lib/ParticleSys';
import {Util} from '../Util';
import {Body,Bodies} from './KinBody';

class DancingBody extends Body {
    constructor(id) {
        super(id);
        //alert("New body "+id);
        //this.pSystems = {};
        this.trailNames = ["LEFT_HAND", "RIGHT_HAND"];
        this.sparkler = new MUSE.Sparkler("sparkler_"+id, this.trailNames);
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
      v.multiplyScalar(.001);
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
    }

    update() {
        super.update();
        this.sparkler.update();
    }
}


// This class watches Kinect messages and maintains
// list of bodies with poses.  The bodies can be used
// as dancers with sparkles.
class KinectWatcher extends Node3D
{
    constructor(game, opts)
    {
        super(game, opts);
        this.game = game;
        opts = opts || {};
	    //opts.scale = opts.scale || 0.06;
        this.checkOptions(opts);
        this.color = new THREE.Color();
        if (game.netLink) {
            game.netLink.registerKinectWatcher(this);
        }
        else {
            //alert("No NetLink");
        }
        this.color = new THREE.Color();
        var inst = this;
        //game.state.on(this.name, state => inst.setProps(state));
        game.state.on("cmpColorHue", h => inst.setHue(h));
        this.bodies = new Bodies(DancingBody);
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
        this.bodies.update();
    }

    handleMessage(msg) {
        this.bodies.handleMsg(msg);
    }
}

MUSENode.defineFields(KinectWatcher, [
    "skelColor"
]);

function addKinectWatcher(game, opts)
{
    //var name = opts.name || 'kinectWatcher';
    let kw = new KinectWatcher(game, opts);
    game.registerController(kw.name, kw);
    //game.registerPlayer(dancer);
    //var readyPromise = dancer.readyPromise;
    //return readyPromise;
    return kw;
}

Game.registerNodeType("KinectWatcher", addKinectWatcher);

export {KinectWatcher};
