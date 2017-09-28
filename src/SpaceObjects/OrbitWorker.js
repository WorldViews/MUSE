
/*
This is the client side of a web worker for updating orbit postions.
It communicates with a working running the script workers/satTrackWorker.js
*/
import * as THREE from 'three';
import { sprintf } from "sprintf-js";
import satellite from 'satellite.js';
import {SatTrackDB} from './SatTrackDB';
import * as Util from '../Util';

class OrbitWorker {
    constructor(satTracks) {
        this.satTracks = satTracks;
        this.startWebWorker();
    }

    startWebWorker() {
        var inst = this;
        this.worker = new Worker('src/workers/satTrackWorker.js');
        this.worker.onmessage = e => { inst.handleMessage(e) };
        var msg = {type: 'greeting', text: "please start working"};
        this.worker.postMessage(msg);
    }

    handleMessage(e) {
        var msg = e.data;
        if (msg.type == 'newPositions') {
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
            //console.log("numAdjusted "+numAdjusted);
        }
        else if (msg.type == 'status') {
            console.log("status: "+msg.text);
        }
        else {
            console.log("Unexpected msg: ", msg);
        }
    }

    sendSatInfo(id) {
        var db = this.satTracks.db;
        var satDat = [];
        var ids = [id];
        if (!id) {
            ids = Object.keys(db.sats);
        }
        ids.forEach(id => {
            satDat.push([id, db.sats[id].tle]);
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
