
import * as THREE from 'three';
import { sprintf } from "sprintf-js";
import {Game} from '../Game';
import satellite from 'satellite.js';
import {Loader} from '../Loader';
import {SatTrackDB} from './SatTrackDB';
import * as Util from '../Util';
import {GeoEvent, GeoEvents} from './GeoEvents';
import {OrbitRaycaster} from './OrbitRaycaster'
import {OrbitWorker} from './OrbitWorker';

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
        this.rsoTypes['ROCKET BODY'] = {color: 0x0000FF, ids: []};
        this.rsoTypes['PAYLOAD'] = {color: 0x00FF00, ids: []};
        this.rsoTypes['DEBRIS'] = {color: 0xFF2222, ids:[]};
        this.rsoTypes['tba'] = {color: 0x888888, ids: []};
        this.defaultType = this.rsoTypes['DEBRIS'];
        this.t = Util.getClockTime();
        this.events = null;
        this.loader = new Loader(game, [], null, "SatTracks");
        this.initGraphics(opts);
        this.radiusEarthKm = 6378.1;
        this._playSpeed = 60.0;
        this.mouseOverSat = "";
        this.selectedSat = "";
        this.startTime = game.program.getPlayTime();
        var inst = this;
        this.game.program.formatTime = t => Util.formatDatetime(t);
        this.db = new SatTrackDB(opts.dataSet, () => inst.onLoaded());
        if (opts.models) {
            this.loadModels(opts);
        }
        this.rayCaster = new OrbitRaycaster(this, game.renderer.domElement);
        this.worker = null;
        this.workerUpdateRate = 0;
        this.setWorkerRate(0);
    }

    setWorkerRate(rate) {
        this.workerUpdateRate = rate;
        if (!this.worker && rate > 0) {
            this.worker = new OrbitWorker(this);
            this.worker.sendSatInfo();
        }
    }

    addEvent(t, x, y, z, t0, r) {
        if (!this.events)
            this.events = new GeoEvents(this.game);
        this.events.addEvent(t, new THREE.Vector3(x,y,z), t0, r);
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
            rtype.particles.rtype = rtype;
            //this.game.addToGame(rtype.particles);
            var gname = ('satellites_x_'+name).replace(" ", "_");
            this.game.addToGame(rtype.particles, gname, this.opts.parent);
        }
    }

    onLoaded(sats) {
        console.log(">>> SatTracks.onLoaded...");
        var now = new Date();
        for (var name in this.rsoTypes) {
            var rtype = this.rsoTypes[name];
            var geometry = new THREE.Geometry();
            rtype.geometry = geometry;
            for (var id in this.db.sats) {
                var sat = this.db.sats[id];
                if (name == sat.type) {
                    sat.rtype = rtype;
                }
                var i = geometry.vertices.length;
                rtype.ids[i] = id;
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
            rtype.particles.rtype = rtype;
            console.log("Adding particles");
            var gname = ('satellites_'+name).replace(" ", "_");
            this.game.addToGame(rtype.particles, gname, this.opts.parent);
        }
        if (this.worker) {
            this.worker.sendSatInfo();
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

    setPlayTime(t, isAdjust) {
        //console.log("**** satTracks setPlayTime "+t+" "+(isAdjust ? "adjust" : "set"));
        this.db.adjusting = isAdjust;
    }

    getSatState(id, t) {
        var sat = this.db.getSatState(id);
        if (sat && sat.stateVec && sat.stateVec.position) {
            var p = sat.stateVec.position;
            sat.pos = new THREE.Vector3(p.x, p.z, -p.y);
            sat.pos.multiplyScalar(this.radiusVEarth/this.radiusEarthKm);
        }
        return sat;
    }

    updateSats(t) {
        var db = this.db;
        if (this.workerUpdateRate) {
            //db.setTime(this.t, true);
            db.setTime(this.t, true);
            this.worker.setTime(this.t);
            //this.copyPositionsFromDB();
        }
        else {
            db.setTime(this.t);
            db.updatePositions();
            this.copyPositionsFromDB();
        }
    }

    copyPositionsFromDB() {
        var db = this.db;
        //var rtypes = Object.values(this.rsoTypes);
        var rtypes = Util.values(this.rsoTypes);
        Object.keys(this.rsoTypes).map( k => this.rsoTypes[k])
        var ntypes = rtypes.length;
        var v = new THREE.Vector3();
        var i = -1;
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
        var satName = this.mouseOverSat ? this.mouseOverSat.name : "none";
        var selectedInfo = "<br><br><br>";
        if (this.selectedSat) {
            selectedInfo = sprintf("%6d<br>%s<br>%s",
                this.selectedSat.id, this.selectedSat.name,
                Util.formatDatetime(this.selectedSat.epochUTC));
        }
        var selectedSatName = this.selectedSat ? this.selectedSat.name : "";
        var statusStr = sprintf(
            `Num Active: %d<br>
             playback speed: %.1f<br>
             max dt: %.1f (days)<br>
             errs: %d kep: %d<br>
             DB epoch: %s<br>
             %s<br>
             <span style="color:yellow;">%s</span><br>`,
            db.numActive,
            this.game.program.getPlaySpeed(),
            db.worstDelta/(24*3600),
            db.numErrs, db.numKepler,
            dbEpoch,
            satName, selectedInfo);
        //console.log("status: "+statusStr);
        this.game.state.set("spaceStatus", statusStr);
    }

    update() {
        this.t = this.game.program.getPlayTime();
        this.updateSats(this.t);
        if (this.events)
            this.events.update(this.t);
    }

}

export {SatTracks};
