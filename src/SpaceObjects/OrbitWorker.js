
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
        this.worker = new Worker('src/workers/satTrackWorker.js');
        this.worker.onmessage = e => {
            console.log("SatTracks.onmessage "+e.data);
        };
        var msg = {type: 'greeting', text: "please start working"};
        this.worker.postMessage(msg);
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
}


export {OrbitWorker};
