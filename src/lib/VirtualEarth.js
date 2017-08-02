
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

    addMarker(lat, lon) {
        var h = 0.004*this.radius;
        var geometry = new THREE.SphereGeometry( h, 20, 20 );
        var material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
        var marker = new THREE.Mesh( geometry, material );
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
    var ve = new VirtualEarth(game, opts);
    game.setFromProps(ve.group, opts);
    game.addToGame(ve.group, opts.name, opts.parent);
    return ve;
}

Game.registerNodeType("VirtualEarth", addVirtualEarth);

//export {VirtualEarth};
