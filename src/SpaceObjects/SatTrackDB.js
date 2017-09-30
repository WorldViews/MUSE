
import * as THREE from 'three';
import { sprintf } from "sprintf-js";
import satellite from 'satellite.js';
import * as Util from '../Util';

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

/*
This class is intended for a set of TLE's at approximately the same period of time.
It is a collection of objects records, indexed by NORAD_CAT_ID.  Each record may
contain of list of TLE records for that object.  The TLE records contain the two
TLE lines and the epoch for the TLE.
There is an overall epoch associated with the dataSet but the individual
TLE epochs are used for propogation.
*/
class DataSet {
    constructor(epoch, data) {
        this.epoch = epoch;
        this.epochUTC = Util.toTime(epoch);
        this.objects = null;
        this.requestTime = 0;
        if (data)
            this.addData(data);
    }

    addData(data) {
        this.objects = data.objects;
        if (!data.objects) {
            console.log("empty data set");
        }
    }

    requestData(onLoadedFun) {
        //console.log("dataSet request data "+this.epoch);
        if (this.objects) {
            console.log("Already have data");
            return;
        }
        if (this.requestTime) {
            return;
        }
        this.requestTime = Util.getClockTime();
        var url = DATA_URL_PREFIX+"stdb/dataSets/"+this.epoch+".json";
        var inst = this;
        console.log("******** requestData "+this.epoch+" url: "+url)
        Util.getJSON(url, data => inst.handleLoadedData(data, url, onLoadedFun));
    }

    handleLoadedData(data, url, onLoadedFun) {
        console.log("*** DataSet.handleLoadedData from "+url);
        this.addData(data);
        if (onLoadedFun) {
            onLoadedFun(this);
        }
    }
}

class SatTrackDB {
    constructor(dataSet, onLoadedFun) {
        window.satDB = this;
        this.onLoadedFun = onLoadedFun;
        this.catalog = null;
        this.dataSets = {};
        this.epochs = [];
        this.sats = {};
        this.currentDataSet = null;
        this.tzo = new Date().getTimezoneOffset();
        this._t = new Date()/1000.0;
        this.numActive = 0;
        this.numErrs = 0;
        this.numKepler = 0;
        this.worstDelta = 0;
        this.worstSat = null;
        this.adjusting = false;
        this.FAKE_PROP_TIME = 3*365*24*3600; // 3 years
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
        Util.getJSON(url, data => inst.handleJSONSatsData(data, url));
    }

    loadSTDB(dataSet) {
        dataSet = dataSet || "all_stdb.json";
        var url = DATA_URL_PREFIX+dataSet;
        console.log("Getting SpaceTrackDB from: " + url);
        var inst = this;
        Util.getJSON(url, data => inst.handleSTDBData(data, url));
    }

    handleTLEFileData(data, dataSetName, url) {
        console.log("handleTLEData: "+dataSetName+" from "+url);
        var epoch;
        data = data || defaultSatData;
        var lines = data.split('\n');
        lines = lines.map(s => s.trim());
        //console.log("lines:", lines);
        var n = lines.length;
        var m = Math.floor(n/3);
        //console.log("n: "+n+"   m: "+m);
        var objects = {};
        for (var i=0; i<m; i++) {
            var name = lines[3*i].trim();
            var tle1 = lines[3*i+1];
            var tle2 = lines[3*i+2];
            var tle = [tle1, tle2];
            var id = tle1.slice(2,7);
            //console.log(sprintf("id: %5s name: %20s", id, name));
            //console.log(sprintf("  line1: %s", tle1));
            //console.log(sprintf("  line2: %s", tle2));
            var obj = objects[id];
            if (!obj) {
                obj = {NORAD_CAT_ID: id, OBJECT_NAME: name, TLEs: []};
                objects[id] = obj;
            }
            var tleObj = {TLE_LINE1: tle1, TLE_LINE2: tle2};
            var satrec = satellite.twoline2satrec(tle1, tle2);
            var jdepoch = satrec.jdsatepoch;
            var epochUTC = this.julianToTime(jdepoch);
            epoch = Util.formatDatetime(epochUTC);
            tleObj.EPOCH = epoch;
            tleObj.NORAD_CAT_ID = id;
            obj.TLEs.push(tleObj);
        };
        var data = {objects, epoch: epoch, type: 'dataSet'};
        var dataSet = new DataSet(epoch, data);
        if (dataSetName == "iridiumCosmos.3le")
            this.handleCollisionHacks(dataSet, 1234284979.8560574 );
        this.setDataSet(dataSet);
    }

    handleCollisionHacks(dataSet, collisionTime) {
        console.log("*************** handleCollisionHacks **************");
        //var t0 = 1234285388.354863;
        //var t0 = 1234285080.354863;
        //var t0 = 1234284979.8560574;
        var dataObjects = dataSet.objects;
        for (var id in dataObjects) {
            var obj = dataObjects[id];
            var name = obj.OBJECT_NAME;
            if (name.indexOf("DEB") >= 0) {
                obj.startTime = collisionTime;
            }
            else {
                obj.endTime = collisionTime;
            }
            console.log(sprintf("id: %5s name: %20s start: %15s end: %15s", id, name, obj.startTime));
        }
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
        this.dataSets = {};
        this.catalog = stdb.catalog;
        console.log("epochs:");
        stdb.epochs.forEach(epoch => {
            this.dataSets[epoch] = new DataSet(epoch);
        });
        this.epochs = Object.keys(this.dataSets);
        this.epochs.sort();
        var dataSet = null;
        for (var epoch in stdb.dataSets) {
            dataSet = this.dataSets[epoch];
            dataSet.addData(stdb.dataSets[epoch]);
        }
        if (dataSet == null) {
            console.log("No dataSets available");
            return;
        }
        this.setDataSet(dataSet);
    }

    setDataSet(dataSet) {
        console.log("***** setDataSet "+dataSet.epoch);
        var dataObjects = dataSet.objects;
        if (!dataObjects) {
            console.log("**** No data objects");
            return;
        }
        this.currentDataSet = dataSet;
        var epoch = dataSet.epoch;
        var j=0;
        var satList = [];
        var catalog = this.catalog;
        if (!catalog) {
            console.log("*** no catalog");
        }
        for (var id in dataObjects) {
            var dObj = dataObjects[id];
            var tleObj = dObj.TLEs[0];
            //console.log("name: "+name);
            var tle = [tleObj.TLE_LINE1, tleObj.TLE_LINE2];
            var name = dObj.OBJECT_NAME;
            var startTime = dObj.startTime;
            var endTime = dObj.endTime;
            var type = null;
            if (catalog && catalog.objects[id]) {
                var obj = catalog.objects[id];
                name = obj.OBJECT_NAME;
                startTime = obj.startTime;
                endTime = obj.endTime;
                type = obj.OBJECT_TYPE;
            }
            else {
                //console.log("No catalog entry for "+id);
            }
            if (!name)
                name = "norad_id_"+id;
            //var sat = {id: tleObj.id, tle: tle, dataSet: epoch};
            var sat = {id, name, tle, startTime, endTime, dataSet: epoch};
            if (type)
                sat.type = type;
            if (j < 0) {
                console.log(sprintf("id: %5s  name: %20s", id, name));
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
                //console.log("***** Warning -- replacing record for satellite "+id);
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

    findNearestDataSet(t) {
        var dtMin = 1E100;
        var bestDataSet = null;
        for (var i=0; i<this.epochs.length; i++) {
            var epoch = this.epochs[i];
            var dataSet = this.dataSets[epoch];
            var dt = Math.abs(dataSet.epochUTC - t);
            if (dt < dtMin) {
                dtMin = dt;
                bestDataSet = dataSet;
            }
        }
        return bestDataSet;
    }

    setTime(t, noUpdate) {
        //console.log("SatTrackDB.setTime "+t);
        var inst = this;
        if (!this.adjusting) {
            var dataSet = this.findNearestDataSet(t);
            if (dataSet && dataSet != this.currentDataSet) {
                if (dataSet.objects) {
                    this.setDataSet(dataSet);
                    // Should install new data now...
                }
                else {
                    //dataSet.requestData(dataSet => inst.setDataSet(dataSet));
                    dataSet.requestData();
                }
            }
        }
        else {
            //console.log("ignoring dataSet fetches during adjustment...")
        }
        this._t = t;
    }

    getTime(t) {
        return this._t;
    }

    updatePositions() {
        this._update(this._t);
    }

    _update(t) {
        var time = new Date(1000*t);
        this.numErrs = 0;
        this.numActive = 0;
        this.numKepler = 0;
        var errName = "";
        this.worstSat = null;
        this.worstDelta = 0;
        var maxDiff = 0;

        var i = -1;
        for (var satName in this.sats) {
            //console.log("satName: "+satName);
            i++;
            var sat = this.sats[satName];
            //console.log("sat:", sat);
            if ((sat.startTime && sat.startTime >= t) ||
                (sat.endTime && sat.endTime <= t)) {
                sat.stateVec = null;
                sat.active = false;
                continue;
            }
            sat.active = true;
            this.numActive++;
            var deltaT = t - sat.epochUTC;
            var diff = Math.abs(deltaT);
            if (diff > maxDiff) {
                this.worstSat = sat.id;
                this.worstDelta = deltaT;
                maxDiff = diff;
            }
            if (this.FAKE_PROP_TIME && (diff > this.FAKE_PROP_TIME)) {
                this.numKepler++;
                var deltaT_mod_period = deltaT % sat.period;
                var t2 = sat.epochUTC + deltaT_mod_period;
                sat.stateVec = satellite.propagate(sat.satrec, new Date(t2*1000));
            }
            else {
                sat.stateVec = satellite.propagate(sat.satrec, time);
            }
            if (!sat.stateVec.position) {
                this.numErrs++;
                if (this.numErrs < 2) {
                    //console.log("Problem with satellite "+satName);
                    errName = satName;
                }
                sat.stateVec = null;
            }
        }
        if (this.numErrs) {
            //console.log(sprintf("Num sat errors: %d - %s", numErrs, errName));
        }
        //console.log("worstDelta: "+this.worstDelta)
    }

    getSatState(id, t) {
        if (t == null)
            t = this._t;
        var sat = this.sats[id];
        if (!sat)
            return null;
        var deltaT = t - sat.epochUTC;
        if (this.FAKE_PROP_TIME && (Math.abs(deltaT) > this.FAKE_PROP_TIME)) {
            var deltaT_mod_period = deltaT % sat.period;
            t = sat.epochUTC + deltaT_mod_period;
        }
        sat.stateVec = satellite.propagate(sat.satrec, new Date(1000*t));
        return sat;
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
        console.log("   Id            Name             startTime             Epoch         diff(days)  period  type");
        console.log("----------------------------------------------------------------------------------------------");
        for (var id in this.sats) {
            var obj = this.sats[id];
            var name = obj.name;
            if (pat && name.indexOf(pat) < 0)
                continue;
            if (!obj.active)
                continue;
            var satrec = obj.satrec;
            //if (satrec.satnum != id) {
            //    console.log("*** inconsistency..."+id+" != "+satrec.satnum);
            //}
            var et = obj.epochUTC;
            var dt = this._t - et;
            console.log(sprintf("%5s %24s  %19s %19s  %8.1f %6.2f %s",
                    id, name, Util.formatDatetime(obj.startTime),
                    Util.formatDatetime(et), dt/(24*60*60), obj.period/3600.0), obj.type);
            /*
            console.log(sprintf(" TLE epoch  jdate: %10s utc: %12.3f  %s",
                        obj.satrec.jdsatepoch, et, Util.formatDatetime(et)));
            console.log(sprintf(" period: %6.2fhours  delta: %s  %s days",
                        obj.period/3600.0, dt, dt/(24*60*60)));
            */
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
