
import * as THREE from 'three';
import { sprintf } from "sprintf-js";
import {Game} from './Game';
import satellite from 'satellite.js';

var TLE = ['1 25544U 98067A   13149.87225694  .00009369  00000-0  16828-3 0  9031',
                   '2 25544 051.6485 199.1576 0010128 012.7275 352.5669 15.50581403831869'];
var SAT_LIST = [
    {tle: TLE, delay: 100.0},
    {tle: TLE, delay: 500.0},
    {tle: TLE, delay: 1000.0},
];

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
        this.game = game;
        this.t = new Date().getTime()/1000.0;
        this.satrecs = [];
        this.delays = [];
        this.satList = SAT_LIST;
        this.initGraphics(opts);
        var inst = this;
        var dataUrls = [
            "/data/satellites/geostationary.txt",
            "/data/satellites/iridium-33-debris.txt"
        ];
        //var dataUrl = "https://www.celestrak.com/NORAD/elements/geo.txt"
        dataUrls.forEach(url => inst.loadSats(url));
        setTimeout(() => inst.handleSatsData(), 1000);
    }

    loadSats(url) {
        var inst = this;
        console.log("Getting Satelline data file "+url);
        $.get(url)
            .done(function(data, status) {
                console.log("loaded:\n"+data);
                inst.handleSatsData(data);
            })
            .fail(function(jqxhr, settings, ex) {
                console.log("error: ", ex);
            });
    }
    
    initGraphics(opts) {
        var size = opts.size || 5;
        var color = opts.color || 0xff0000;
        var opacity = opts.opacity || 0.3;
        this.geometry = new THREE.Geometry();
        this.satrecs.forEach(sr => {
            this.geometry.vertices.push(new THREE.Vector3());
        });
        
        this.material = new THREE.PointsMaterial(
            { size: size, sizeAttenuation: false,
              color: color, opacity: 0.9, alphaTest: 0.1, transparent: true } );
        this.particles = new THREE.Points( this.geometry, this.material );
        //this.particles = new THREE.Points( this.geometry, this.material );
        //this.game.addToGame(this.particles);
    }
    
    handleSatsData(data) {
        data = data || defaultSatData;
        var lines = data.split('\n');
        lines = lines.map(s => s.trim());
        //console.log("lines:", lines);
        var n = lines.length;
        var m = Math.floor(n/3);
        console.log("n: "+n+"   m: "+m);
        var satList = [];
        for (var i=0; i<m; i++) {
            var name = lines[3*i].trim();
            var tle = [lines[3*i+1], lines[3*i+2]];
            console.log("name: "+name);
            console.log("tle: "+tle+"\n");
            satList.push({name: name, tle: tle});
        };
        this.addSats(satList);
    }
    
    addSats(satList) {
        satList.forEach(sat => {
            var tle = sat.tle;
            var delay = sat.delay || 0.0;
            var satrec = satellite.twoline2satrec(tle[0], tle[1]);
            console.log("name: "+sat.name);
            console.log("tle-1: "+tle[0]);
            console.log("tle-2: "+tle[1]);
            console.log("satrec:", satrec);
            this.satrecs.push(satrec);
            this.delays.push(delay);
            this.geometry.vertices.push(new THREE.Vector3());
            //  Or you can use a JavaScript Date
            var pv = satellite.propagate(satrec, new Date());
            showPosVel(pv);
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
        this.game.addToGame(this.particles);
    }
    
    updateSats() {
        this.t += 60;
        for (var i=0; i<this.satrecs.length; i++) {
            var satrec = this.satrecs[i];
            var delay = this.delays[i];
            var pv = satellite.propagate(satrec, new Date(1000*(this.t + delay)));
            //showPosVel(pv, this.t);
            var p = pv.position;
            var v3 = this.geometry.vertices[i];
            v3.set(p.x, p.y, p.z);
            v3.normalize();
            v3.multiplyScalar(3);
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
