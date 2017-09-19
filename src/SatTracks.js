
import * as THREE from 'three';
import { sprintf } from "sprintf-js";
import {Game} from './Game';
import satellite from 'satellite.js';
import {Loader} from './Loader';
import {getJSON} from './Util';
import {SatTrackDB} from './SatTrackDB';
import * as Util from './Util';

function getClockTime() { return new Date().getTime()/1000.0; }

function showPosVel(pv, t)
{
    //console.log("positionAndVelocity: "+JSON.stringify(pv));
    var p = pv.position;
    var v = pv.velocity;
    if (!p) {
        console.log("no position available");
        return;
    }
    if (!t)
        t= 0;
    console.log(sprintf("%12.2f   %10.2f %10.2f %10.2f   %10.2f %10.2f %10.2f",
        t, p.x, p.y, p.z, v.x, v.y, v.z));
}

class SatTracks {
    constructor(game, opts) {
        window.satTracks = this;
        opts = opts || {};
        this.radiusVEarth = opts.radius || 1.0;
        this.opts = opts;
        this.game = game;
        this.models = {};
        this.t = new Date().getTime()/1000.0;
        //this.filterHack = 0;
        if (opts.filterHack != null) {
            alert("FilterHack no longer supported");
            //this.filterHack = opts.filterHack;
        }
        //this.satrecs = [];
        this.loader = new Loader(game, []);
        this.initGraphics(opts);
        this.radiusEarthKm = 6378.1;
        this._playSpeed = 60.0;
        this.startTime = game.program.playTime;
        //this.setPlayTime(getClockTime());
        var inst = this;
        this.game.program.formatTime = t => Util.formatDatetime(t);
        this.db = new SatTrackDB(opts.dataSet, () => inst.onLoaded());
        if (opts.models) {
            this.loadModels(opts);
        }
    }

    loadModels(opts) {
        console.log("******** SatTracks loading ", opts.models);
        var s = 0.005;
        for (var id in opts.models) {
            var obj = opts.models[id];
            var satName = "satMod_"+id;
            if (typeof obj === "string") {
                obj = {path: model, scale: s};
            }
            obj.type = 'Model';
            obj.name = satName;
            //var modelPath = model.path;
            console.log("************** model id"+id, obj);
            //var obj = {type: 'Model', path: modelPath, name: satName, scale: s};
            this.loader.load([obj]);
            this.models[id] = satName;
        }
    }

    onLoaded(sats) {
        console.log(">>> SatTracks.onLoaded...");
        //if (this.filterHack) {
        //    this.db.setupFakeTimes(this.game.program.startTime, this.game.program.duration);
        //}
        var now = new Date();
        var geometry = new THREE.Geometry();
        this.geometry = geometry;
        for (var name in this.db.sats) {
            var sat = this.db.sats[name];
            geometry.vertices.push(new THREE.Vector3());
        }
        geometry.verticesNeedUpdate = true;
        if (this.particles) {
            var parent = this.particles.parent;
            if (parent) {
                console.log("Removing particles");
                parent.remove(this.particles);
            }
        }
        this.particles = new THREE.Points( geometry, this.material );
        console.log("Adding particles");
        this.game.addToGame(this.particles, 'satellites', this.opts.parent);
    }

    checkProximities() {
        var v = this.geometry.vertices;
        var d2min = 1000000;
        var imin = null;
        var jmin = null;
        for (var i=0; i<v.length; i++) {
            var vi = v[i];
            for (var j=0; j<i; j++) {
                var d2 = vi.distanceToSquared(v[j]);
                if (d2 == 0.0)
                    break;
                if (d2 < d2min) {
                    d2min = d2;
                    imin = i;
                    jmin = j;
                }
            }
        }
        console.log("d2min: "+d2min+"  i: "+i+"  j: "+j);
    }

    initGraphics(opts) {
        var size = opts.size || 3;
        var color = opts.color || 0xff0000;
        var opacity = opts.opacity || 0.3;
        this.geometry = new THREE.Geometry();
        this.material = new THREE.PointsMaterial(
            { size: size, sizeAttenuation: false,
                color: color, opacity: 0.9, alphaTest: 0.1, transparent: true } );
        this.particles = new THREE.Points( this.geometry, this.material );
        this.game.addToGame(this.particles);
    }

    updateSats() {
        var db = this.db;
        var ns = Object.keys(db.sats).length;
        var nv = this.geometry.vertices.length;
        if (ns != nv) {
            console.log(sprintf("Inconsisitency: nvertices %d != nsatellites %d", nv, ns));
            return;
        }
        this.t = this.game.program.getPlayTime();
        //this.t = this.getPlayTime();
        db.setTime(this.t);
        var i = -1;
        for (var satName in db.sats) {
            //console.log("satName: "+satName);
            i++;
            var sat = db.sats[satName];
            //console.log("sat:", sat);
            //var satrec = sat.satrec;
            var v3 = this.geometry.vertices[i];
            if (sat.stateVec) {
                var p = sat.stateVec.position;
                if (p) {
                    v3.set(p.x, p.z, -p.y);
                }
            }
            else {
                v3.set(0,0,0);
            }
            v3.multiplyScalar(this.radiusVEarth/this.radiusEarthKm);
            if (this.models[satName]) {
                var m = this.game.models[this.models[satName]];
                if (m) {
                    window.SATMOD = m;
                    //console.log("set position "+this.models[i]+" "+v3.x+" "+v3.y+" "+v3.z);
                    m.position.set(v3.x, v3.y,v3.z);
                }
            }
        }
        this.geometry.verticesNeedUpdate = true;
        this.game.setValue("spaceStatus", db.statusStr);
        //$("#spaceStatusText").html(db.statusStr);
        var dbEpoch = "none";
        if (db.currentDataSet)
            dbEpoch = db.currentDataSet.epoch;
        this.game.setValue("dbEpoch", dbEpoch);
    }

    update() {
        this.updateSats();
    }
}

export {SatTracks};
