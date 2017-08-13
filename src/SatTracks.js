
import * as THREE from 'three';
import { sprintf } from "sprintf-js";
import {Game} from './Game';
import satellite from 'satellite.js';


function showPosVel(pv, t)
{
    //console.log("positionAndVelocity: "+JSON.stringify(pv));
    var p = pv.position;
    var v = pv.velocity;
    if (!t)
        t= 0;
    console.log(sprintf("%12.2f   %10.2f %10.2f %10.2f   %10.2f %10.2f %10.2f",
                        t, p.x, p.y, p.z, v.x, v.y, v.z));
    //console.log("pos: "+pv.position+"   vel: "+pv.velocity);
}

function orbitTest()
{
/*
    var tle = '0 LEMUR-2 JEROEN\n1 40934U 15052E   15306.10048119  .00001740  00000-0  15647-3 0  9990\n2 40934   6.0033 141.2190 0010344 133.6141 226.4604 14.76056230  5130';
    console.log("tle:" + tle);
    val = jspredict.observe(tle, null);
    console.log("val:", val);
*/
    // Sample TLE 
    var tleLine1 = '1 25544U 98067A   13149.87225694  .00009369  00000-0  16828-3 0  9031',
        tleLine2 = '2 25544 051.6485 199.1576 0010128 012.7275 352.5669 15.50581403831869';
 
    // Initialize a satellite record 
    var satrec = satellite.twoline2satrec(tleLine1, tleLine2);
    console.log("satrec:", satrec);

    //  Propagate satellite using time since epoch (in minutes). 
    var timeSinceTleEpochMinutes = 1000;
    var positionAndVelocity = satellite.sgp4(satrec, timeSinceTleEpochMinutes);
    showPosVel(positionAndVelocity);

    //  Or you can use a JavaScript Date
    var positionAndVelocity = satellite.propagate(satrec, new Date());
    showPosVel(positionAndVelocity);

    var now = new Date();
    var t = now.getTime()/1000.0;
    for (var i=0; i<100; i++) {
        t += 60;
        var pv = satellite.propagate(satrec, new Date(1000*t));
        showPosVel(pv, t);
    }
    
    // The position_velocity result is a key-value pair of ECI coordinates. 
    // These are the base results from which all other coordinates are derived. 
    var positionEci = positionAndVelocity.position,
    velocityEci = positionAndVelocity.velocity;
 
    // Set the Observer at 122.03 West by 36.96 North, in RADIANS 
}

class SatTracks {
    constructor() {
        this.t = new Date().getTime()/1000.0;
        this.initSat();
        for (var i=0; i<10; i++) {
            this.updateSat();
        }
    }

    initSat() {
        // Sample TLE 
        var tleLine1 = '1 25544U 98067A   13149.87225694  .00009369  00000-0  16828-3 0  9031',
            tleLine2 = '2 25544 051.6485 199.1576 0010128 012.7275 352.5669 15.50581403831869';
 
        // Initialize a satellite record 
        this.satrec = satellite.twoline2satrec(tleLine1, tleLine2);
        console.log("satrec:", this.satrec);

        //  Or you can use a JavaScript Date
        var positionAndVelocity = satellite.propagate(this.satrec, new Date());
        showPosVel(positionAndVelocity);
    }
    
    updateSat() {
        this.t += 60;
        var positionAndVelocity = satellite.propagate(this.satrec, new Date(1000*this.t));
        //showPosVel(positionAndVelocity, this.t);
        showPosVel(positionAndVelocity, this.t);
    }

    update() {
        this.updateSat();
    }
}

window.orbitTest = orbitTest;
window.SatTracks = SatTracks;

export {SatTracks};
