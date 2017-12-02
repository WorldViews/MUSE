
import * as THREE from 'three';
import {Game} from '../Game';
import {MUSENode} from '../Node';
import {Node3D} from '../Node3D';
import { sprintf } from "sprintf-js";
import {ParticleSys} from '../lib/ParticleSys';
import {Util} from '../Util';

class KinectWatcher extends Node3D
{
    constructor(game, opts)
    {
        super(game, opts);
        this.game = game;
        opts = opts || {};
	    //opts.scale = opts.scale || 0.06;
        this.checkOptions(opts);
        //this.pSystems = [];
        this.color = new THREE.Color();
        if (game.netLink) {
            game.netLink.registerKinectWatcher(this);
        }
        else {
            //alert("No NetLink");
        }
        this.color = new THREE.Color();
        this.pSystems = {};
        var inst = this;
        //game.state.on(this.name, state => inst.setProps(state));
        game.state.on("cmpColorHue", h => inst.setHue(h));
        //this.setupLines();
    }

    setupLines() {
        this.material = new THREE.LineBasicMaterial({ color: 0x0000ff });
        this.geometry = new THREE.Geometry();
        var vertices = this.geometry.vertices;
        vertices.push(new THREE.Vector3(0, 0, 0));
        vertices.push(new THREE.Vector3(0, 10, 0));
        vertices.push(new THREE.Vector3(10, 0, 0));
        vertices.push(new THREE.Vector3(0, 0, 0));
        this.line = new THREE.Line(this.geometry, this.material);
        this.game.scene.add(this.line);
    }

    setVisible(v) {
    }

    getVisible() {
        return false;
    }

    setHue(h) {
        this.color.setHSL(h,.9,.5);
        this.setColor(this.color);
    }

    setColor(c) {
        this.color.copy(c);
        for (var id in this.pSystem) {
          var ps = this.pSystem[id];
          ps.setColor(c);
        }
    }

    update() {
        if (!this.visible)
	       return;
        this.pruneOld();
    }

    pruneOld() {
      var t = MUSE.Util.getClockTime();
      for (var id in this.pSystems) {
        var ps = this.pSystems[id];
        var dt = t - ps.lastTime;
        if (dt > 2) {
          delete this.pSystems[id];
          ps.destroy();
        }
      }
    }

    handleJoint(msg, joint) {
      var bodyId = msg.bodyId;
      var pos = msg[joint];
      //console.log("bodyId "+bodyId+" "+joint+" "+pos);
      if (!pos)
        return;
      var v = new THREE.Vector3(pos[0], pos[1], pos[2]);
      var pid = bodyId+"_"+joint;
      if (!this.pSystems[pid]) {
        this.pSystems[pid] = new ParticleSys(pid, null);
      }
      var ps = this.pSystems[pid];
      v.multiplyScalar(.001);
      ps.update(v);
      ps.lastTime = MUSE.Util.getClockTime();
      this.pruneOld();
    }

    handleMessage(msg) {
        //console.log("KinectWatcher....... msg: "+JSON.stringify(msg, null, 3));
        //console.log("KinectWatcher msg bodyId: "+msg.bodyId);
        var lh = msg.LEFT_HAND;
        var rh = msg.RIGHT_HAND;
        if (!(lh && rh)) {
            return;
        }
        this.handleJoint(msg, "LEFT_HAND");
        this.handleJoint(msg, "RIGHT_HAND");
        return;
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
