
import * as THREE from 'three';
import { sprintf } from "sprintf-js";
import {Game} from './Game';
import satellite from 'satellite.js';
import {Loader} from './Loader';
import {getJSON} from './Util';
import * as Util from './Util';

function getClockTime() { return new Date().getTime()/1000.0; }

var TLE = ['1 25544U 98067A   13149.87225694  .00009369  00000-0  16828-3 0  9031',
    '2 25544 051.6485 199.1576 0010128 012.7275 352.5669 15.50581403831869'];
var SAT_LIST = [
    {tle: TLE},
    {tle: TLE},
    {tle: TLE}
];
SAT_LIST = [];

var DATA_URLS = [
    "/data/satellites/geostationary.txt",
    "/data/satellites/iridium-33-debris.txt",
    "/data/satellites/1999-025.txt"
];

var DATA_SETS = [
    "geostationary",
    "1999-025",
    "2012-044",
    "cubesat",
    "glo-ops",
    "goes",
    "gps-ops",
    "intelsat",
    "iridium",
    "iridium-33-debris",
    "iridium-NEXT",
    "noaa",
    "orbcomm",
    "resource",
    "ses",
    "stations",
    "weather"
];

var TEST_DATA_SETS = [
    "geostationary",
];

var DATA_URL_PREFIX = "data/satellites/";

// return random numver in [low,high]
function uniform(low,high)
{
    var r = Math.random();
    return low + r*(high-low);
}

function showPosVel(pv, t)
{
    //console.log("positionAndVelocity: "+JSON.stringify(pv));
    var p = pv.position;
    var v = pv.velocity;
    if (!t)
        t= 0;
    console.log(sprintf("%12.2f   %10.2f %10.2f %10.2f   %10.2f %10.2f %10.2f",
        t, p.x, p.y, p.z, v.x, v.y, v.z));
}

class SatTracks {
    constructor(game, opts) {
        opts = opts || {};
        this.radiusVEarth = opts.radius || 1.0;
        this.opts = opts;
        this.game = game;
        this.models = {};
        this.t = new Date().getTime()/1000.0;
        this.filterHack = 0;
        if (opts.filterHack != null)
            this.filterHack = opts.filterHack;
        //this.satrecs = [];
        this.sats = {};
        this.loader = new Loader(game, []);
        this.initGraphics(opts);
        this.radiusEarthKm = 6378.1;
        this._playSpeed = 60.0;
        this.setPlayTime(getClockTime());
        var inst = this;
        this.game.program.formatTime = t => inst.formatTime(t);
        //DATA_SETS.forEach(name => inst.loadSats(name));
        this.loadAllSats(opts.dataSet);
        if (opts.models) {
            this.loadModels(opts);
        }
    }

    formatTime(t) {
        return Util.formatDatetime(t);
        /*
        //return ""+new Date(t*1000);
        //return t;
        var d = new Date(t*1000);
        return sprintf("%s/%s/%s %s:%s:%s",
                    d.getMonth(), d.getDate(), d.getFullYear(),
                    d.getHours(), d.getMinutes(), d.getSeconds());
                    */
    }

    loadModels(opts) {
        console.log(">>>>>>>>>>>>>>>>>> SatTracks loading "+opts.models);
        //var obj = {type: 'Model', path: opts.models, name:'satMod1', scale: 1.0};
        //var obj = {type: 'Model', path: opts.models, scale: [0.5,0.5,0.5]};
        var s = 0.001;
        var ids = [0,50,100,200, 300, 302];
        ids = [];
        for (var k=0; k<10; k++) { ids.push(k)};
        var j=0;
        var n = opts.models.length;
        ids.forEach(id => {
            var modelPath = opts.models[j % n];
            var satName = "satMod_"+id;
            var obj = {type: 'Model', path: modelPath, name: satName, scale: s};
            this.loader.load([obj]);
            this.models[id] = satName;
            j++;
        })
    }
    loadSats(dataSetName) {
        var url = DATA_URL_PREFIX+dataSetName+".txt";
        console.log("Getting Satellite data for "+name+" url:"+url);
        var inst = this;
        $.get(url)
            .done(function(data, status) {
                //console.log("loaded:\n"+data);
                inst.handleSatsData(data, dataSetName, url);
            })
            .fail(function(jqxhr, settings, ex) {
                console.log("error: ", ex);
            });
    }

    loadAllSats(dataSet) {
        dataSet = dataSet || "allSats.json";
        var url = DATA_URL_PREFIX+dataSet;
        console.log("Getting All Satellite data from: " + url);
        var inst = this;
        /*
        $.getJSON(url)
            .done(function(data, status) {
                inst.handleAllSatsData(data, url);
            })
            .fail(function(jqxhr, settings, ex) {
                console.log("error: ", ex);
            });
            */
        getJSON(url, data => inst.handleAllSatsData(data, url));
    }

    initGraphics(opts) {
        var size = opts.size || 3;
        var color = opts.color || 0xff0000;
        var opacity = opts.opacity || 0.3;
        this.geometry = new THREE.Geometry();
        //this.satrecs.forEach(sr => {
        for (var key in this.sats) {
            var satrec = this.sats[key].satrec;
            this.geometry.vertices.push(new THREE.Vector3());
        };
        this.material = new THREE.PointsMaterial(
            { size: size, sizeAttenuation: false,
                color: color, opacity: 0.9, alphaTest: 0.1, transparent: true } );
        this.particles = new THREE.Points( this.geometry, this.material );
        //this.particles = new THREE.Points( this.geometry, this.material );
        //this.game.addToGame(this.particles);
    }

    handleSatsData(data, dataSetName, url) {
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
            var tle = [lines[3*i+1], lines[3*i+2]];
            //console.log("name: "+name);
            //console.log("tle: "+tle+"\n");
            satList.push({name: name, tle: tle, dataSet: dataSetName});
        };
        this.addSats(satList);
    }

    handleAllSatsData(data,url) {
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

    getUniqueSatName(baseName) {
        var i=1;
        var name = baseName;
        while (this.sats[name] != null) {
            name = baseName+"_"+i;
            i += 1;
        }
        return name;
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
            var name = sat.name;
            if (this.sats[name]) {
                //console.log("***** Warning -- replacing record for satellite "+name);
                //console.log(" prev dataSet "+this.sats[name].dataSet);
                //console.log(" new  dataSet "+sat.dataSet);
                name = this.getUniqueSatName(name);
                //console.log("using new name "+name);
            }
            if (!this.sats[name]) {
                this.geometry.vertices.push(new THREE.Vector3());
            }
            this.sats[name] = sat;
            var satrec = satellite.twoline2satrec(tle[0], tle[1]);
            sat.satrec = satrec;
            var pv = satellite.propagate(satrec, now);
            //showPosVel(pv);
        });
        //this.particles = new THREE.Points( this.geometry, this.material );
        //this.game.addToGame(this.particles);
        //this.geometry.verticesNeedUpdate = true;
        //this.game.addToGame(this.particles);
        this.geometry.verticesNeedUpdate = true;
        if (this.particles) {
            var parent = this.particles.parent;
            if (parent)
                parent.remove(this.particles);
        }
        this.particles = new THREE.Points( this.geometry, this.material );
        this.game.addToGame(this.particles, 'satellites', this.opts.parent);
    }

    setPlayTime(t, f) {
        console.log("SatTracks.setPlayTime "+t);
        this._fraction = f;
        this._prevPlayTime = t;
        this._prevClockTime = getClockTime();
        console.log("playTime "+this.t+"  "+new Date(t*1000));
    }

    getPlayTime(t) {
        var t = getClockTime();
        var dt = t - this._prevClockTime;
        this._prevPlayTime += dt*this._playSpeed;
        this._prevClockTime = t;
        return this._prevPlayTime;
    }

    setPlaySpeed(s) {
        this.getPlayTime();
        this._playSpeed = s;
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

    updateSats() {
        this.t = this.getPlayTime();
        var time = new Date(1000*this.t);
        //console.log("playTime "+this.t+"  "+time);
        //var nsats = this.satrecs.length;
        var n = Object.keys(this.sats).length;
        var nv = this.geometry.vertices.length;
        if (n != nv) {
            console.log("Inconsisitency in vertices for satellites");
        }
        var i=0;
        //this.checkProximities();
        var numErrs = 0;
        var errName = "";
        var nsats = this.geometry.vertices.length;
        for (var satName in this.sats) {
            var sat = this.sats[satName];
            var satrec = sat.satrec;
            if (i==0)
                window.SATREC0 = satrec;
            var pv = satellite.propagate(satrec, time);
            //showPosVel(pv, this.t);
            var p = pv.position;
            if (!p) {
                numErrs++;
                if (numErrs < 2) {
                    //console.log("Problem with satellite "+satName);
                    errName = satName;
                }
                continue;
            }
            var v3 = this.geometry.vertices[i];
            v3.set(p.x, p.z, -p.y);
            if (this.filterHack && this._fraction != null) {
                var f = i/(nsats+0.0);
                if (f > this._fraction)
                    v3.set(0,0,0);
            }
            //v3.normalize();
            v3.multiplyScalar(this.radiusVEarth/this.radiusEarthKm);
            if (this.models[i]) {
                var m = this.game.models[this.models[i]];
                if (m) {
                    window.SATMOD = m;
                    //console.log("set position "+this.models[i]+" "+v3.x+" "+v3.y+" "+v3.z);
                    m.position.set(v3.x, v3.y,v3.z);
                }
            }
            i++;
        }
        if (numErrs) {
            console.log(sprintf("Num sat errors: %d - %s", numErrs, errName));
        }
        this.geometry.verticesNeedUpdate = true;
    }

    update() {
        this.updateSats();
    }
}

window.SatTracks = SatTracks;

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

export {SatTracks};
