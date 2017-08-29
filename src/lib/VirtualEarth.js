
import {Game} from '../Game';
import * as THREE from 'three';
import {SatTracks} from '../SatTracks'
import {Atmosphere} from './Atmosphere'
// convert the positions from a lat, lon to a position on a sphere.
// http://www.smartjava.org/content/render-open-data-3d-world-globe-threejs
function latLonToVector3(lat, lon, radius, height) {
    var phi = (lat)*Math.PI/180;
    var theta = (lon-180)*Math.PI/180;
    var x = -(radius+height) * Math.cos(phi) * Math.cos(theta);
    var y =  (radius+height) * Math.sin(phi);
    var z =  (radius+height) * Math.cos(phi) * Math.sin(theta);
    return new THREE.Vector3(x,y,z);
}

// return random numver in [low,high]
function uniform(low,high)
{
    var r = Math.random();
    return low + r*(high-low);
}

function ranVertex(rMin, rMax) {
    var r = uniform(rMin, rMax);
    var lat = uniform(-Math.PI, Math.PI);
    var theta = uniform(0, 2*Math.PI);
    var z = r*Math.sin(lat);
    var rxy = r*Math.cos(lat);
    var x = rxy*Math.cos(theta);
    var y = rxy*Math.sin(theta);
    return new THREE.Vector3(x,y,z);
}

function setNumBlobs(geom, n, posfun) {
    var v = geom.vertices;
    if (v.length > n) {
        v.length = n;
    }
    else {
        for (var i = v.length; i < n; i++ ) {
            v.push(posfun());
        }
    }
    geom.vertices = v;
    geom.verticesNeedUpdate = true;
}

class BlobSet {
    constructor(opts, ranVertexFun) {

        opts = opts || {};
        var n = opts.n || 1000;
        var size = opts.size || 20;
        var color = opts.color || 0xff0000;
        var opacity = opts.opacity || 0.3;
        this.geometry = new THREE.Geometry();
        var sprite = null;
        var texPath = opts.texture || "textures/sprites/disc.png";
        sprite = new THREE.TextureLoader().load( texPath );
        var rMin = opts.rMin || this.radius*1.1;
        var rMax = opts.rMax || this.radius*1.2;
        setNumBlobs(this.geometry, n, ranVertexFun);
        this.material = new THREE.PointsMaterial({
            size: size, sizeAttenuation: false,
            map: sprite,
            color: color,
            opacity: 0.3,
            alphaTest: 0.1,
            transparent: true
        });
        this.particles = new THREE.Points( this.geometry, this.material );
    }
}

class Planet {

    constructor(game, opts) {
        console.log("Planet this: "+this);
        this.startTime = new Date().getTime()/1000.0;
        this.game = game;
        var radius = opts.radius || 2;
        var inst = this;
        this.name = "";
        if (opts && opts.name)
        this.name = opts.name;
        console.log("*** Planet "+this.name +" "+JSON.stringify(opts));
        this.radius = radius;
        this.loaded = false;
        this.dataViz = null;
        this.satTracks = null;
        this.group = new THREE.Group();
        this.group.earth = this;
        var loader = new THREE.TextureLoader();
        //var texPath = opts.texture || 'textures/land_ocean_ice_cloud_2048.jpg';
        var texPath = opts.texture;
        console.log("*** Planet.loading "+texPath);
        this.geometry = new THREE.SphereGeometry( radius, 30, 30 );
        if (texPath) {
            loader.load( texPath, function ( texture ) {
                var material = new THREE.MeshPhongMaterial( { map: texture, overdraw: 0.5 } );
                inst.mesh = new THREE.Mesh( inst.geometry, material );
                inst.mesh.name = inst.name;
                inst.group.add(inst.mesh);
                inst.loaded = true;
            });
        }
        else {
            var material = new THREE.MeshPhongMaterial( { overdraw: 0.5 } );
            inst.mesh = new THREE.Mesh( inst.geometry, material );
            inst.mesh.name = inst.name;
            inst.group.add(inst.mesh);
            inst.loaded = true;
        }
        if (opts.dataViz)
        this.dataViz = new DataViz(this, opts);
        if (opts.satTracks) {
            console.log("************* VirtualEarth: satTracks: ", opts.satTracks);
            var satOpts = {};
            if (typeof opts.satTracks === "object") {
                satOpts = opts.satTracks;
            }
            satOpts.radius = satOpts.radius || this.radius;
            satOpts.parent = satOpts.parent || opts.name;
            this.satTracks = new SatTracks(this.game, satOpts);
        }
        if (opts.atmosphere) {
            //this.haze = new Haze(game.scene, this, radius);
            //this.glow = new Glow(game.scene, this, radius);
            this.atmosphere = new Atmosphere(game.scene, this, opts.atmosphere);
        }
    }

    latLonToVector3(lat, lng, h)
    {
        if (!h)
        h = 1;
        //report(""+this.name+" h: "+h+" r: "+this.radius);
        return latLonToVector3(lat, lng, this.radius, h);
    }

    getLocalGroup(lat, lon, h) {
        var localGroup = new THREE.Group();
        localGroup.position.copy(this.latLonToVector3(lat, lon, h));
        var phi = (90-lat)*Math.PI/180;
        var theta = (lon+90)*Math.PI/180;
        localGroup.rotation.set(phi, theta, 0, "YXZ");
        this.group.add(localGroup);
        return localGroup;
    }

    addObject(obj, lat, lon, h) {
        if (!h)
        h = 0.02*this.radius;
        var lg = this.getLocalGroup(lat, lon, h);
        lg.add(obj);
        return lg;
    }

    addMarker(lat, lon, h, s) {
        h = h || 0.004*this.radius;
        s = s || 0.004*this.radius;
        if (!this.markerGeometry) {
            this.markerGeometry = new THREE.SphereGeometry( s, 20, 20 );
        }
        if (!this.markerMaterial) {
            this.markerMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
        }
        var marker = new THREE.Mesh( this.markerGeometry, this.markerMaterial );
        return this.addObject(marker, lat, lon, h);
        var lg = this.getLocalGroup(lat, lon, h);
        lg.add(marker);
        return lg;
    }

    addSatelliteMarker(lat, lon, h, s)
    {
        return this.addMarker(lat, lon, h, s);
    }

    addBlobs(opts)
    {
        var rMin = opts.rMin || this.radius*1.1;
        var rMax = opts.rMax || this.radius*1.2;
        var blobSet = new BlobSet(opts, () => ranVertex(rMin, rMax));
        this.group.add(blobSet.particles);
        return blobSet;
    }

    update() {
        if (this.satTracks)
        this.satTracks.update();
        if (this.dataViz)
        this.dataViz.update();
        /*
        if (this.satPoints)
        this.satPoints.rotation.y += 0.01;
        if (this.satMat) {
        this.satHue += 0.001;
        if (this.satHue > 1)
        this.satHue = 0;
        this.satMat.color.setHSL( this.satHue, 0.6, 0.7 );
    }
    */
    if (!this.sats)
    return;
    //this.group.rotation.y += 0.001;
    var i = 0;
    this.sats.forEach(sat => {
        i++;
        sat.lon += sat.omega;
        //var phi = (sat.lat)*Math.PI/180;
        //var theta = (sat.lon-180)*Math.PI/180;
        sat.position.copy(this.latLonToVector3(sat.lat, sat.lon, sat.h));
        //console.log("i: "+i+"  phi: "+phi+"  theta: "+theta);
        //sat.rotation.set(phi, theta, 0, "YXZ");
    });
}

pause() {
    if (this.satTracks)
    this.satTracks.pause();
}

play() {
    if (this.satTracks)
    this.satTracks.play();
}

setPlayTime(t) {
    var f = t / game.program.duration;
    console.log("VirtualEarth.setPlayTime "+t+" "+f);
    if (this.satTracks) {
        var st = this.startTime + 10*t;
        this.satTracks.setPlayTime(st, f);
    }
}

};

class DataViz {
    constructor(earth, opts) {
        opts = opts || {};
        this.earth = earth;
        this.rMin = earth.radius;
        this.rMax = earth.radius*2;
        this.co2Mat = null;
        this.co2Blobs = null;
        this.co2Density = 0.2;
        this.energyInMat = null;
        this.energyInBlobs = null;
        this.energyOutMat = null;
        this.energyOutBlobs = null;
        this.hue = 0;
        this.setCo2(1000);
        this.addEnergy(opts);
    }

    addCo2(opts) {
        var material, particles;
        var res = this.earth.addBlobs({n: 5000, size: 20,
            texture: 'textures/sprites/clouds.png'
        });
        this.co2Mat = res.material;
        this.co2Blobs = res.particles;
    }

    setCo2(n) {
        var material, particles;
        if (this.co2Blobs)
        this.earth.group.remove(this.co2Blobs);
        var res = this.earth.addBlobs({n: n, size: 20, color: 0xFFFF00, opacity: 1,
            texture: 'textures/sprites/clouds.png'
        });
        //                                       rMin: this.rMin, rMax: this.rMax});
        this.co2Mat = res.material;
        this.co2Blobs = res.particles;
    }

    addEnergy(opts) {
        var size = 6;
        var material, particles;
        var res = this.earth.addBlobs({n: 5000, size: size, color: 0xFF0000, opacity: 1,
            rMin: this.rMin, rMax: this.rMax
        });
        this.energInMat = res.material;
        this.eInBlobs = res.particles;
        var res = this.earth.addBlobs({n: 5000, size: size, color: 0xFFFF00, opacity: 1,
            rMin: this.rMin, rMax: this.rMax
        });
        this.energOutMat = res.material;
        this.eOutBlobs = res.particles;
        this.d2Min = this.rMin*this.rMin;
        this.d2Max = this.rMax*this.rMax;
    }

    // We try just changing vertices and indicating needs update, but it doesn't work.
    setEnergyXXX(n) {
        var rMin = this.rMin;
        var rMax = this.rMax;
        var geo = this.eOutBlobs.geometry;
        setNumBlobs(this.eOutBlobs.geometry, n, () => ranVertex(this.rMin, this.rMax));
        geo.vertices = geo.vertices;
        this.eOutBlobs.geometry = null;
        this.eOutBlobs.geometry = geo;
    }

    setEnergy(n) {
        var material, particles;
        this.earth.group.remove(this.eOutBlobs);
        var res = this.earth.addBlobs({n: n, size: 5, color: 0xFFFF00, opacity: 1,
            rMin: this.rMin, rMax: this.rMax
        });
        this.energOutMat = res.material;
        this.eOutBlobs = res.particles;
    }

    update() {
        if (this.co2Blobs)
        this.co2Blobs.rotation.y += 0.005;
        if (this.co2Mat) {
            this.hue += 0.001;
            if (this.hue > 1)
            this.hue = 0;
            this.co2Mat.color.setHSL( this.hue, 0.6, 0.7 );
            this.co2Density += 0.002;
            if (this.co2Density > 1)
            this.co2Density = 0.3;
            this.co2Mat.opacity = this.co2Density;
        }
        if (this.eInBlobs) {
            var s0 = this.rMax/this.rMin;
            var s1 = .99;
            this.scaleVertices(
                this.eInBlobs.geometry,
                d2 => d2 < this.d2Min ? s0 : s1
            );
        }
        if (this.eOutBlobs) {
            var s0 = this.rMin/this.rMax;
            var s1 = 1/0.99;
            this.scaleVertices(this.eOutBlobs.geometry,
                d2 => d2 > this.d2Max ? s0 : s1
            );
        }
    }

    scaleVertices(geom, sfun) {
        var vertices = geom.vertices;
        for (var i=0; i<vertices.length; i++) {
            var d2 = vertices[i].lengthSq();
            vertices[i].multiplyScalar(sfun(d2));
        }
        geom.verticesNeedUpdate = true;
    }
}

class VirtualEarth extends Planet
{
    constructor(game, opts) {
        if (!opts.texture)
        opts.texture = 'textures/land_ocean_ice_cloud_2048.jpg';
        super(game, opts);
    }
}

function addVirtualEarth(game, opts)
{
    if (!opts.name)
    opts.name = "vEarth";
    var ve = new VirtualEarth(game, opts);
    game.setFromProps(ve.group, opts);
    game.addToGame(ve.group, opts.name, opts.parent);
    game.registerController(opts.name, ve);
    game.registerPlayer(ve);
    return ve;
}

Game.registerNodeType("VirtualEarth", addVirtualEarth);

//export {VirtualEarth};
