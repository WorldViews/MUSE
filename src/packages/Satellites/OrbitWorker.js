
/*
This is the client side of a web worker for updating orbit postions.
It communicates with a working running the script workers/satTrackWorker.js
*/
import * as THREE from 'three';
import { sprintf } from "sprintf-js";
import satellite from 'satellite.js';
import {SatTrackDB} from './SatTrackDB';
import * as Util from 'core/Util';

class OrbitWorker {
    constructor(satTracks) {
        this.satTracks = satTracks;
        this.startWebWorker();
    }

    startWebWorker() {
        var inst = this;
        this.worker = new Worker('src/packages/Satellites/workers/satTrackWorker.js');
        this.worker.onmessage = e => { inst.handleMessage(e) };
        var msg = {type: 'greeting', text: "please start working"};
        this.worker.postMessage(msg);
    }

    handleMessage(e) {
        var msg = e.data;
        if (msg.type == 'newPositions') {
            this.handleNewPositions(msg);
            this.satTracks.copyPositionsFromDB();
        }
        else if (msg.type == 'status') {
            console.log("status: "+msg.text);
        }
        else {
            console.log("Unexpected msg: ", msg);
        }
    }

    handleNewPositions(msg) {
        console.log("handleNewPositions");
        var db = this.satTracks.db;
        var newPositions = msg.newPositions;
        var n = newPositions.length;
        //console.log(sprintf("Got %d new positions", n));
        //console.log("newPos: "+newPositions[0]);
        var numAdjusted = 0;
        newPositions.forEach(rec => {
            var id = rec[0];
            var sv = db.sats[id].stateVec;
            if (sv && sv.position) {
                sv.position.x = rec[1];
                sv.position.y = rec[2];
                sv.position.z = rec[3];
                numAdjusted++;
            }
        });
        //console.log("numActive: "+msg.numActive);
        //console.log("numErrs: "+msg.numErrs);
        //console.log("numKepler: "+msg.numKepler);
        var db = satTracks.db;
        db.numActive = msg.numActive;
        db.numErrs = msg.numErrs;
        db.numActive = msg.numActive;
        //console.log("numAdjusted "+numAdjusted);
    }

    sendSatInfo(id) {
        var db = this.satTracks.db;
        var satDat = [];
        var ids = [id];
        if (!id) {
            ids = Object.keys(db.sats);
        }
        ids.forEach(id => {
            //satDat.push([id, db.sats[id].tle]);
            var sat = db.sats[id];
            satDat.push({id:id, tle: sat.tle, startTime: sat.startTime, endTime: sat.endTime});
        })
        var msg = {type: 'satInfo', satDat}
        this.worker.postMessage(msg);
    }

    setTime(t) {
        var msg = {type: 'setTime', t: t}
        this.worker.postMessage(msg);
    }
}


export {OrbitWorker};
