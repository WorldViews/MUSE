
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
            this.addSatellites(opts);
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
        /*
	var phi = (90-lat)*Math.PI/180;
	var theta = (lon+90)*Math.PI/180;
	lg.rotation.set(phi, theta, 0, "YXZ");
	*/
        lg.add(marker);
        //var axisHelper = new THREE.AxisHelper( 10*h );
        //lg.add( axisHelper );
        return lg;
    }

    addSatellite(lat, lon, h, s)
    {
        return this.addMarker(lat, lon, h, s);
    }
    
    addSatellites(opts) {
        var n = opts.satellites || 500;
        this.sats = [];
        for (var i=0; i<n; i++) {
            var q = Math.random();
            var lat = uniform(-90,90);
            var lon = uniform(-180,180);
            var h = uniform(this.radius*0.3, this.radius*0.6);
            var s = this.radius*0.02;
            var sat = this.addSatellite(lat, lon, h, s);
            sat.lat = lat;
            sat.lon = lon;
            sat.h = h;
            sat.omega = uniform(.01, .1);
            this.sats.push(sat);
        }
    }

    update() {
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
