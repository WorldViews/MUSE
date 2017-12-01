
import * as THREE from 'three';
import {Game} from '../Game';
import {MUSENode} from '../Node';
import {Node3D} from '../Node3D';
import { sprintf } from "sprintf-js";
import {ParticleSys} from '../lib/ParticleSys';

class KinectWatcher extends Node3D
{
    constructor(game, opts)
    {
        super(game, opts);
        this.game = game;
        opts = opts || {};
	    //opts.scale = opts.scale || 0.06;
        this.checkOptions(opts);
        this.pSystems = [];
        this.color = new THREE.Color();
        if (game.netLink) {
            game.netLink.registerKinectWatcher(this);
        }
        else {
            //alert("No NetLink");
        }
        this.color = new THREE.Color();
        this.lhSys = new ParticleSys("klh", null);
        this.rhSys = new ParticleSys("krh", null);
        this.pSystems.push(this.lhSys);
        this.pSystems.push(this.rhSys);
        var inst = this;
        //game.state.on(this.name, state => inst.setProps(state));
        game.state.on("cmpColorHue", h => inst.setHue(h));
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
        this.pSystems.forEach(pSys => pSys.setColor(c));
    }

    update() {
        if (!this.visible)
	       return;
    }

    handleMessage(msg) {
        //console.log("KinectWatcher....... msg: "+JSON.stringify(msg, null, 3));
        var lh = msg.LEFT_HAND;
        var rh = msg.RIGHT_HAND;
        if (!(lh && rh)) {
            return;
        }
        if (0) {
            console.log(sprintf("lh: %6.2f %6.2f %6.2f  rh: %6.2f %6.2f %6.2f",
            lh[0], lh[1], lh[2],  rh[0], rh[1], rh[2]));
        }
        var lhpos = new THREE.Vector3(lh[0], lh[1], lh[2]);
        lhpos.multiplyScalar(.001);
        var rhpos = new THREE.Vector3(rh[0], rh[1], rh[2]);
        rhpos.multiplyScalar(.001);
        this.lhSys.update(lhpos);
        this.rhSys.update(rhpos);
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
