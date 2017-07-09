
import * as THREE from 'three';

var EARTH = {};

// convert the positions from a lat, lon to a position on a sphere.
// http://www.smartjava.org/content/render-open-data-3d-world-globe-threejs
EARTH.latLonToVector3 = function(lat, lon, radius, height) {
    var phi = (lat)*Math.PI/180;
    var theta = (lon-180)*Math.PI/180;

    var x = -(radius+height) * Math.cos(phi) * Math.cos(theta);
    var y =  (radius+height) * Math.sin(phi);
    var z =  (radius+height) * Math.cos(phi) * Math.sin(theta);

    return new THREE.Vector3(x,y,z);
}

//EARTH.Earth = function(group, radius, opts)
EARTH.Planet = function(group, radius, opts)
{
    console.log("EARTH.Planet this: "+this);
    radius = radius || 200;
    var inst = this;

    this.init = function() {
        this.name = "";
        if (opts && opts.name)
	    this.name = opts.name;
        console.log("*** Planet "+this.name +" "+JSON.stringify(opts));
        this.radius = radius;
        this.loaded = false;
        this.group = group;
        var loader = new THREE.TextureLoader();
        var texPath = opts.texture || 'textures/land_ocean_ice_cloud_2048.jpg';
        console.log("*** Planet.loading "+texPath);
        loader.load( texPath, function ( texture ) {
            var geometry = new THREE.SphereGeometry( radius, 30, 30 );
            var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );
            inst.mesh = new THREE.Mesh( geometry, material );
	    inst.mesh.name = "Earth";
            group.add(inst.mesh);
            inst.loaded = true;
        });
    }

    this.latLonToVector3 = function(lat, lng, h) {
        if (!h)
	    h = 1;
        //report(""+this.name+" h: "+h+" r: "+this.radius);
        return EARTH.latLonToVector3(lat, lng, this.radius, h);
    }

    this.getLocalGroup = function(lat, lon, h) {
        var localGroup = new THREE.Group();
        localGroup.position.copy(this.latLonToVector3(lat, lon, h));
        var phi = (90-lat)*Math.PI/180;
        var theta = (lon+90)*Math.PI/180;
        localGroup.rotation.set(phi, theta, 0, "YXZ");
        this.group.add(localGroup);
        return localGroup;
    }

    this.addObject = function(obj, lat, lon, h) {
        if (!h)
	    h = 0.02*this.radius;
        var lg = this.getLocalGroup(lat, lon, h);
        lg.add(obj);
        return lg;
    }

    this.addMarker = function(lat, lon) {
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

    this.init();
};

//EARTH.Earth = EARTH.Planet;
function addPlanet(game, name, radius, x, y, z, tex)
{
    console.log(">>> addPlanet "+name);
    var scene = game.scene;
    var group = new THREE.Group();
    game.models[name] = group;
    scene.add(group);
    var opts = {'name': name, 'texture': tex};
    var planet = new EARTH.Planet(group, radius, opts);
    planet.group.position.x = x;
    planet.group.position.y = y;
    planet.group.position.z = z;
    return planet;
}

function addPlanetOld(scene, name, radius, x, y, z, tex)
{
    console.log(">>> addPlanet "+name);
    var group = new THREE.Group();
    scene.add(group);
    var opts = {'name': name, 'texture': tex};
    var planet = new EARTH.Planet(group, radius, opts);
    planet.group.position.x = x;
    planet.group.position.y = y;
    planet.group.position.z = z;
    return planet;
}

function addPlanets(game)
{
    var earth =   addPlanet(game, 'Earth',   1000, -2000, 0, 0);
    var mars =    addPlanet(game, 'Mars',    200,   2000, 0, 2000,  './textures/Mars_4k.jpg');
    var jupiter = addPlanet(game, 'Jupiter', 300,   1500, 0, -1500, './textures/Jupiter_Map.jpg');
    var nepture = addPlanet(game, 'Nepture', 100,  -1000, 0, -1000, './textures/Neptune.jpg');
}

//export {addPlanet};
//export {addPlanet, Planet: EARTH.Planet};
//export {Planet: EARTH.Planet, addPlanet};
//export default EARTH.Planet;
let Planet = EARTH.Planet;
export {Planet, addPlanet, addPlanets};
