
import {Game} from '../Game';
import * as THREE from 'three';

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

class Planet {

    constructor(game, opts) {
        console.log("Planet this: "+this);
        var radius = opts.radius || 2;
        var inst = this;
        this.name = "";
        if (opts && opts.name)
	    this.name = opts.name;
        console.log("*** Planet "+this.name +" "+JSON.stringify(opts));
        this.radius = radius;
        this.loaded = false;
        this.satTracker = null;
        this.dataViz = null;
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
        if (opts.satellites)
            this.satTracker = new SatTracker(this, opts);
        if (opts.dataViz)
            this.dataViz = new DataViz(this, opts);
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
        opts = opts || {};
        var n = opts.n || 1000;
        var size = opts.size || 20;
        var color = opts.color || 0xff0000;
        var opacity = opts.opacity || 0.3;
        var geometry = new THREE.Geometry();
	var sprite = null;
        var texPath = opts.texture || "textures/sprites/disc.png";
	sprite = new THREE.TextureLoader().load( texPath );
        var rMin = opts.rMin || this.radius*1.1;
        var rMax = opts.rMax || this.radius*1.2;
	for (var i = 0; i < n; i++ ) {
            var r = uniform(rMin, rMax);
            var lat = uniform(-Math.PI, Math.PI);
            var theta = uniform(0, 2*Math.PI);
            var z = r*Math.sin(lat);
            var rxy = r*Math.cos(lat);
            var x = rxy*Math.cos(theta);
            var y = rxy*Math.sin(theta);
	    var vertex = new THREE.Vector3(x,y,z);
	    geometry.vertices.push( vertex );
	}
	var material = new THREE.PointsMaterial( { size: size, sizeAttenuation: false,
                                                   map: sprite,
                                                   color: color,
                                                   opacity: 0.3,
                                                   alphaTest: 0.1,
                                                   transparent: true } );
	//material.color.setHSL( 1.0, 0.3, 0.7 );
        var particles = new THREE.Points( geometry, material );
	this.group.add( particles );
        return {geometry, material, particles};
    }

    update() {
        if (this.satTracker)
            this.satTracker.update();
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
        this.addCo2(opts);
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

    addEnergy(opts) {
        var material, particles;
        var res = this.earth.addBlobs({n: 5000, size: 5, color: 0xFF0000, opacity: 1,
                                       rMin: this.rMin, rMax: this.rMax});
        this.energInMat = res.material;
        this.energyInBlobs = res.particles;
        var res = this.earth.addBlobs({n: 5000, size: 5, color: 0xFFFF00, opacity: 1,
                                       rMin: this.rMin, rMax: this.rMax});
        this.energOutMat = res.material;
        this.energyOutBlobs = res.particles;
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
        if (this.energyInBlobs) {
            /*
            var s = this.energyInBlobs.scale.x;
            s -= .004;
            if (s < .8)
                s = 1.6;
            this.energyBlobs.scale.set(s,s,s);
            */
            var vertices = this.energyInBlobs.geometry.vertices;
            var d2Min = this.rMin*this.rMin;
            var d2Max = this.rMax*this.rMax;
            var s0 = d2Max/d2Min;
            var s1 = .99;
            for (var i=0; i<vertices.length; i++) {
                var d2 = vertices[i].lengthSq();
                vertices[i].multiplyScalar(d2 < d2Min ? s0 : s1);
            }
            this.energyInBlobs.geometry.verticesNeedUpdate = true;
        }
        if (this.energyOutBlobs) {
            var vertices = this.energyOutBlobs.geometry.vertices;
            var d2Min = this.rMin*this.rMin;
            var d2Max = this.rMax*this.rMax;
            var s0 = d2Min/d2Max;
            var s1 = 1/0.99;
            for (var i=0; i<vertices.length; i++) {
                var d2 = vertices[i].lengthSq();
                vertices[i].multiplyScalar(d2 > d2Max ? s0 : s1);
            }
            this.energyOutBlobs.geometry.verticesNeedUpdate = true;
        }
    }
}

class SatTracker {
    constructor(earth, opts) {
        opts = opts || {};
        this.earth = earth;
        this.satMat = null;
        this.satHue = 0;
        this.satPoints = null;
        this.addSatellites(opts);
    }

    addSatellites(opts) {
        var material, particles;
        var n = opts.satellites || 500;
        var res = this.earth.addBlobs(opts);
        this.satMat = res.material;
        this.satPoints = res.particles;
    }

    update() {
        if (this.satPoints)
            this.satPoints.rotation.y += 0.01;
        if (this.satMat) {
            this.satHue += 0.001;
            if (this.satHue > 1)
                this.satHue = 0;
	    this.satMat.color.setHSL( this.satHue, 0.6, 0.7 );
        }
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
    return ve;
}

Game.registerNodeType("VirtualEarth", addVirtualEarth);

//export {VirtualEarth};
