
import * as THREE from 'three';
import { sprintf } from "sprintf-js";
import satellite from 'satellite.js';
import {getJSON} from './Util';
import * as Util from './Util';

function getClockTime() { return new Date().getTime()/1000.0; }

var DATA_URL_PREFIX = "data/satellites/";

const SecsPerDay = 86400;
const MinsPerDay = 1440;

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

class SatTrackDB {
    constructor(dataSet, onLoadedFun) {
        window.satDB = this;
        this.onLoadedFun = onLoadedFun;
        this.catalog = null;
        this.dataSets = null;
        this.sats = {};
        this.tzo = new Date().getTimezoneOffset();
        this._t = new Date()/1000.0;
        if (dataSet)
            this.loadData(dataSet);
    }

    loadData(dataSetName) {
        if (dataSetName.endsWith("stdb.json")) {
            this.loadSTDB(dataSetName);
        }
        else if (dataSetName.endsWith(".txt") || dataSetName.endsWith(".3le")) {
            this.loadTLEFileData(dataSetName);
        }
        else {
            this.loadJSONSatsData(dataSetName);
        }
    }

    loadTLEFileData(dataSetName) {
        //var url = DATA_URL_PREFIX+dataSetName+".txt";
        var url = DATA_URL_PREFIX+dataSetName;
        console.log("Getting Satellite data for "+name+" url:"+url);
        var inst = this;
        $.get(url)
            .done(function(data, status) {
                //console.log("loaded:\n"+data);
                inst.handleTLEFileData(data, dataSetName, url);
            })
            .fail(function(jqxhr, settings, ex) {
                console.log("error: ", ex);
            });
    }

    loadJSONSatsData(dataSet) {
        dataSet = dataSet || "allSats.json";
        var url = DATA_URL_PREFIX+dataSet;
        console.log("Getting All Satellite data from: " + url);
        var inst = this;
        getJSON(url, data => inst.handleJSONSatsData(data, url));
    }

    loadSTDB(dataSet) {
        dataSet = dataSet || "all_stdb.json";
        var url = DATA_URL_PREFIX+dataSet;
        console.log("Getting SpaceTrackDB from: " + url);
        var inst = this;
        getJSON(url, data => inst.handleSTDBData(data, url));
    }

    handleTLEFileData(data, dataSetName, url) {
        data = data || defaultSatData;
        var lines = data.split('\n');
        lines = lines.map(s => s.trim());
        //console.log("lines:", lines);
        var n = lines.length;
        var m = Math.floor(n/3);
        //console.log("n: "+n+"   m: "+m);
        var satList = [];
        for (var i=0; i<m; i++) {
            var name = lines[3*i].trim();
            var tle1 = lines[3*i+1];
            var tle2 = lines[3*i+2];
            var tle = [tle1, tle2];
            var id = tle1.slice(2,7);
            //console.log("name: "+name);
            //console.log("tle: "+tle+"\n");
            satList.push({id: id, name: name, tle: tle, dataSet: dataSetName});
        };
        this.addSats(satList);
    }

    handleJSONSatsData(data, url) {
        console.log("***** handleAllSatsData "+url);
        var satList = [];
        var j = 0;
        for (var name in data) {
            //console.log("name: "+name);
            var TLEs = data[name].TLEs;
            var tle = TLEs[0];
            var dataSet = tle[0];
            tle = tle[1];
            var sat = {name, tle, dataSet};
            satList.push(sat);
            if (data[name].model) {
                var satId = 'sat_'+j;
                var s = 0.001;
                if (data[name].modelScale) {
                    s = data[name].modelScale;
                }
                var obj = {type: 'Model',
                           path: data[name].model,
                           name: satId,
                           scale: s};
                this.loader.load([obj]);
                this.models[j] = satId;
            }
            j++;
            //console.log("name: "+name+" "+sat);
        }
        this.addSats(satList);
    }

    handleSTDBData(stdb, url) {
        window.STDB = stdb;
        console.log("***** handleSTDBData "+url);
        var satList = [];
        var j = 0;
        this.dataSets = stdb.dataSets;
        this.catalog = stdb.catalog;
        var dataSet = null;
        for (var epoch in this.dataSets) {
            dataSet = this.dataSets[epoch];
        }
        if (dataSet == null) {
            console.log("No dataSets available");
            return;
        }
        var dataObjects = dataSet.objects;
        for (var id in dataObjects) {
            var obj = this.catalog.objects[id];
            if (obj == null) {
                console.log("No catalog entry for "+id);
                continue;
            }
            var dObj = dataObjects[id];
            var tleObj = dObj.TLEs[0];
            var name = obj.OBJECT_NAME;
            //console.log("name: "+name);
            var tle = [tleObj.TLE_LINE1, tleObj.TLE_LINE2];
            //var sat = {id: tleObj.id, tle: tle, dataSet: epoch};
            var sat = {id: id, name: name, tle: tle, dataSet: epoch, catalogEntry: obj};
            sat.startTime = obj.startTime;
            if (j < 10) {
                console.log("id: "+id);
                console.log("name: "+name);
                console.log("sat "+j, sat);
            }
            satList.push(sat);
            j++;
            //console.log("name: "+name+" "+sat);
        };
        console.log("created satList");
        this.addSats(satList);
        console.log("added satellites");
    }

    addSats(sats) {
        var now = new Date();
        sats.forEach(sat => {
            var tle = sat.tle;
            if (0) {
                console.log("name: "+sat.name);
                console.log("tle-1: "+tle[0]);
                console.log("tle-2: "+tle[1]);
            }
            var id = sat.id;
            var name = sat.name;
            if (this.sats[id]) {
                console.log("***** Warning -- replacing record for satellite "+id);
            }
            this.sats[id] = sat;
            sat.satrec = satellite.twoline2satrec(tle[0], tle[1]);
            var jdepoch = sat.satrec.jdsatepoch;
            sat.epochUTC = this.julianToTime(jdepoch);
            var meanMotion = sat.satrec.no; // in radians per minute;
            sat.period = 60*2*Math.PI/meanMotion; // secs per orbit
            sat.stateVec = satellite.propagate(sat.satrec, now);
            //showPosVel(pv);
        });
        if (this.onLoadedFun)
            this.onLoadedFun();
    }

    setTime(t) {
        //console.log("SatTrackDB.setTime "+t);
        this._t = t;
        this._update(t);
    }

    getTime(t) {
        return this._t;
    }

    _update(t) {
        var time = new Date(1000*t);
        var numErrs = 0;
        var errName = "";
        var i = -1;
        var worstSat = null;
        var worstDelta = 0;
        var maxDiff = 0;
        this.numActive = 0;

        for (var satName in this.sats) {
            //console.log("satName: "+satName);
            i++;
            var sat = this.sats[satName];
            //console.log("sat:", sat);
            if (sat.bad || (sat.startTime && sat.startTime >= t)) {
                sat.stateVec = null;
                continue;
            }
            this.numActive++;
            var deltaT = t - sat.epochUTC;
            var diff = Math.abs(deltaT);
            if (diff > maxDiff) {
                worstSat = sat.id;
                worstDelta = deltaT;
                maxDiff = diff;
            }
            sat.stateVec = satellite.propagate(sat.satrec, time);
            if (!sat.stateVec.position) {
                //sat.bad = true;
                numErrs++;
                if (numErrs < 2) {
                    //console.log("Problem with satellite "+satName);
                    errName = satName;
                }
                sat.stateVec = null;
            }
        }
        if (numErrs) {
            console.log(sprintf("Num sat errors: %d - %s", numErrs, errName));
        }
        this.worstSat = worstSat;
        this.worstDelta = worstDelta;
        //console.log(sprintf("Worst sat: %d  deltaT: %s", worstSat, worstDelta/SecsPerDay))
    }

    setupFakeTimes(startTime, duration) {
        console.log("****************************** FAKE TIMES ***************************");
        console.log("startTime: "+startTime);
        console.log("duration: "+duration);
        var i = 0;
        var nsats = Object.keys(this.sats).length;
        console.log("Num sats: "+nsats);
        for (var satName in this.sats) {
            var sat = this.sats[satName];
            var f = i/(nsats+0.0);
            sat.startTime = startTime + f*duration;
            //console.log("sat "+satName+" "+Util.toDate(startTime));
            i++;
        }
    }

    timeToJulian(t) {
        // t should be in seconds.
        if (t == null)
            t = new Date().getTime()/1000.0;
        var jt = (t / SecsPerDay) - this.tzo/MinsPerDay + 2440587.5;
        return jt;
    }

    julianToTime(jt) {
        var t = SecsPerDay * (jt + this.tzo/MinsPerDay - 2440587.5);
        return t;
    }

    dump(pat) {
        //this.dumpCatalog();
        this.dumpSats(pat);
    }

    dumpCatalog() {
        if (!this.catalog) {
            console.log("No catalog available");
            return;
        }
        for (var id in this.catalog.objects) {
            var obj = this.catalog.objects[id];
            console.log("id: "+id+" name: "+obj.name);
        }
    }

    dumpSats(pat) {
        for (var id in this.sats) {
            var obj = this.sats[id];
            var name = obj.name;
            if (pat && name.indexOf(pat) < 0)
                continue;
            console.log(sprintf("id: %6s name: %20s  startTime: %12s %s",
                    id, name, obj.startTime, Util.formatDatetime(obj.startTime)));
            var satrec = obj.satrec;
            if (satrec.satnum != id) {
                console.log("*** inconsistency..."+id+" != "+satrec.satnum);
            }
            var dt = this._t - obj.epochUTC;
            var et = obj.epochUTC;
            console.log(sprintf(" TLE epoch  jdate: %10s utc: %12.3f  %s",
                        obj.satrec.jdsatepoch, et, Util.formatDatetime(et)));
            console.log(sprintf(" period: %6.2fhours  delta: %s  %s days",
                        obj.period/3600.0, dt, dt/(24*60*60)));
        }
    }
}

var defaultSatData =
`TDRS 3
1 19548U 88091B   17227.19367062 -.00000311  00000-0  00000+0 0  9991
2 19548  14.4451   7.3550 0033429 308.2509  15.6794  1.00269343 92995
SKYNET 4C
1 20776U 90079A   17226.05407248  .00000118  00000-0  00000-0 0  9995
2 20776  13.8510  15.5236 0002805 140.2713 219.8059  1.00270391 98562
TDRS 5
1 21639U 91054B   17227.22902649  .00000073  00000-0  00000+0 0  9992
2 21639  14.4110  20.7852 0020380 349.0255 228.7943  1.00268863 95349
TDRS 6
1 22314U 93003B   17227.46534889 -.00000306  00000-0  00000+0 0  9992
2 22314  13.9453  23.7292 0002306 263.4207 158.5150  1.00267710 90018
ASTRA 1D
1 23331U 94070A   17227.46183741 -.00000282  00000-0  00000+0 0  9997
2 23331   7.6486  48.8467 0003598  99.4143 269.5400  1.00273321 83801
BRASILSAT B2
1 23536U 95016A   17226.96367247 -.00000293  00000-0  00000+0 0  9996
2 23536   7.2697  50.7187 0001851 116.3611  75.4177  1.00271417 81940
`;

export {SatTrackDB};
