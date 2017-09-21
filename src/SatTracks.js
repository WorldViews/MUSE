
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
        this.rsoTypes = {};
        this.rsoTypes['ROCKET BODY'] = {color: 0x00FF00};
        this.rsoTypes['PAYLOAD'] = {color: 0x0000FF};
        this.rsoTypes['DEBRIS'] = {color: 0xFF2222};
        this.rsoTypes['tba'] = {color: 0x888888};
        this.defaultType = this.rsoTypes['DEBRIS'];
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
        this.startTime = game.program.getPlayTime();
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
        for (var name in this.rsoTypes) {
            var rtype = this.rsoTypes[name];
            var geometry = new THREE.Geometry();
            rtype.geometry = geometry;
            for (var id in this.db.sats) {
                var sat = this.db.sats[id];
                if (name == sat.type)
                    sat.rtype = rtype;
                geometry.vertices.push(new THREE.Vector3());
            }
            geometry.verticesNeedUpdate = true;
            if (rtype.particles) {
                var parent = rtype.particles.parent;
                if (parent) {
                    console.log("Removing particles");
                    parent.remove(rtype.particles);
                }
            }
            rtype.particles = new THREE.Points( geometry, rtype.material );
            console.log("Adding particles");
            this.game.addToGame(rtype.particles, 'satellites', this.opts.parent);
        }
    }

    checkProximities() {
        rtype = this.rsoTypes['satellites'];
        var v = rtype.geometry.vertices;
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
        for (var name in this.rsoTypes) {
            var rtype = this.rsoTypes[name];
            rtype.geometry = new THREE.Geometry();
            rtype.material = new THREE.PointsMaterial(
                { size: size, sizeAttenuation: false,
                    color: rtype.color, opacity: 0.9, alphaTest: 0.1, transparent: true } );
            rtype.particles = new THREE.Points( rtype.geometry, rtype.material );
            this.game.addToGame(rtype.particles);
        }
    }

    setPlayTime(t, isAdjust) {
        //console.log("**** satTracks setPlayTime "+t+" "+(isAdjust ? "adjust" : "set"));
        this.db.adjusting = isAdjust;
    }

    updateSats() {
        var db = this.db;
        this.t = this.game.program.getPlayTime();
        db.setTime(this.t);
        var i = -1;
        var rtypes = Object.values(this.rsoTypes);
        var ntypes = rtypes.length;
        var v = new THREE.Vector3();
        for (var satName in db.sats) {
            //console.log("satName: "+satName);
            i++;
            var sat = db.sats[satName];
            var stype = sat.rtype || this.defaultType;
            //console.log("sat:", sat);
            //var satrec = sat.satrec;
            if (sat.stateVec && sat.stateVec.position) {
                var p = sat.stateVec.position;
                v.set(p.x, p.z, -p.y);
                v.multiplyScalar(this.radiusVEarth/this.radiusEarthKm);
            }
            else {
                v.set(0,0,0);
            }
            rtypes.forEach( rtype => {
                if (stype == rtype) {
                    rtype.geometry.vertices[i].set(v.x, v.y, v.z);
                }
                else {
                    rtype.geometry.vertices[i].set(0, 0, 0);
                }
            });
            if (this.models[satName]) {
                var m = this.game.models[this.models[satName]];
                if (m) {
                    window.SATMOD = m;
                    //console.log("set position "+this.models[i]+" "+v3.x+" "+v3.y+" "+v3.z);
                    m.position.set(v.x, v.y, v.z);
                }
            }
        }
        rtypes.forEach( rtype => rtype.geometry.verticesNeedUpdate = true );

        var dbEpoch = db.currentDataSet ? db.currentDataSet.epoch : "none";
        var statusStr = sprintf(
            `Num Active: %d<br>
             playback speed: %.1f<br>
             max dt: %.1f (days)<br>
             errs: %d kep: %d<br>
             DB epoch: %s`,
            db.numActive,
            this.game.program.getPlaySpeed(),
            db.worstDelta/(24*3600),
            db.numErrs, db.numFakes,
            dbEpoch);
        this.game.setValue("spaceStatus", statusStr);
    }

    update() {
        this.updateSats();
    }
}

export {SatTracks};
