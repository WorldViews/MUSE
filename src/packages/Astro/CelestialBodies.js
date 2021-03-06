
import * as THREE from 'three'
import {Game} from 'core/Game'
import {MUSE} from 'core/MUSE'
import {MUSENode} from 'core/Node'
import {Node3D} from 'core/Node3D'
import {SatTracks} from 'packages/Satellites/SatTracks'
import {Atmosphere} from './Atmosphere'
import {CMPDataViz2} from 'packages/CMPViz/CMPDataViz2'
import ImageSource from 'lib/ImageSource';
import {Anim} from 'core/Anim';

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


class CelestialBody extends Node3D {

    constructor(game, opts) {
        super(game, opts);
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
        this.setObject3D(this.group);
        this.material = null;
        var loader = new THREE.TextureLoader();
        //var texPath = opts.texture || 'textures/land_ocean_ice_cloud_2048.jpg';
        var texPath = opts.texture;
        this.imageSource = null;
        this.satTracks = null;
        console.log("*** Planet.loading "+texPath);
        this.geometry = new THREE.SphereGeometry( radius, 30, 30 );
        if (opts.videoTexture) {
            this.imageSource = new ImageSource({
                type: ImageSource.TYPE.VIDEO,
                url: opts.videoTexture
            });
            let texture = this.imageSource.createTexture();
            inst._addBody(texture);
        }
        else if (texPath) {
            loader.load( texPath, function ( texture ) {
                inst._addBody(texture);
            });
        }
        else {
            inst._addBody();
        }
        if (opts.atmosphere) {
            //this.atmosphere = new Atmosphere(game.scene, this, opts.atmosphere);
            this.atmosphere = new Atmosphere(this.group, this, opts.atmosphere);
        }
        if (opts.dataViz) {
            this.addDataViz();
        }
        if (opts.satTracks) {
            this.addSatTracks(opts.satTracks);
        }
        if (game.program) {
            this.setPlayTime(game.program.getPlayTime());
        }
        else {
            console.log("CelestialBody "+this.name+" ... no program yet");
            this.setPlayTime(0);
        }
    }

    addDataViz(opts) {
        opts = opts || this.options;
        if (!this.dataViz) {
            this.dataViz = new CMPDataViz2(this, opts);
        }
        var visible = opts.visible == false ? false : true;
        this.dataViz.setVisible(visible);
    }

    // Note that everything to do with Satellites should probably
    // be removed from here.  SatTracks doesn't even seem to know which
    // which node or object it is associated with, so that should be easy.
    addSatTracks(satOpts) {
        console.log("************* VirtualEarth: addSatTracks: ", satOpts);
        if (this.satTracks) {
            console.log("Already have satTracks");
            return;
        }
        if (typeof satOpts !== "object") {
            satOpts = { dataSet: 'stdb/all_stdb.json' };
        }
        satOpts.radius = satOpts.radius || this.radius;
        satOpts.parent = satOpts.parent || this.name;
        this.satTracks = new SatTracks(this.game, satOpts);
        return this.satTracks;
    }

    setVisible(v) {
        this.group.visible = v;
        if (this.atmosphere)
            this.atmosphere.visible = v;
        if (this.dataViz)
            this.dataViz.visible = v;
        if (v) {
            // could try to start playing...
        }
        else {
            console.log("Trying to pause image source for planet "+this.name);
            if (this.imageSource)
                this.imageSource.pause();
        }
    }

    getVisible() {
        return this.group.visible;
    }

    _addBody(texture) {
        var matOpts = { map: texture, overdraw: 0.5 };
        if (this.options.side)
            matOpts.side = this.options.side;
        if (this.options.material)
            this.material = new THREE[this.options.material]( matOpts );
        else
            this.material = new THREE.MeshPhongMaterial( { map: texture, overdraw: 0.5 } );
        //this.material = new THREE.MeshPhongMaterial( matOpts );
        this.mesh = new THREE.Mesh( this.geometry, this.material );
        this.mesh.name = this.name;
        this.group.add(this.mesh);
        if (this.options.color) {
            var c = this.options.color;
            this.material.color.setRGB(c[0],c[1],c[2]);
        }
        this.loaded = true;
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

    update() {
        if (this.satTracks)
        this.satTracks.update();
        if (this.dataViz)
        this.dataViz.update();
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
    }

    play() {
    }

    setPlayTime(t, isAdjust) {
        if (this.satTracks) {
            //console.log("VirtualEarth.setPlayTime "+t+" isInput: "+isInput);
            this.satTracks.setPlayTime(t, isAdjust);
        }
    }

    setSurfaceImage(url) {
        console.log("Getting ImageSource "+url);
        if (this.imageSource)
            this.imageSource.destroy();
        this.imageSource = new ImageSource({
            //type: ImageSource.TYPE.VIDEO,
            type: ImageSource.TYPE.IMAGE,
            url: url
        });
        let texture = this.imageSource.createTexture();
        this.material.map = texture;
        this.texture = texture;
    }

    setSurfaceVideo(videoUrl) {
        console.log("Getting ImageSource "+videoUrl);
        if (this.imageSource) {
            this.imageSource.dispose();
        }
        this.imageSource = new ImageSource({
            type: ImageSource.TYPE.VIDEO,
            url: videoUrl
        });
        let texture = this.imageSource.createTexture();
        this.material.map = texture;
    }

    testVideo() {
        var url = "assets/video/GlobalWeather2013.mp4";
        this.setSurfaceVideo(url);
    }
};

class Planet extends CelestialBody {
};

function addBody(game, opts)
{
    var body = new CelestialBody(game, opts);
    game.setFromProps(body.group, opts);
    game.addToGame(body.group, opts.name, opts.parent);
    game.registerController(opts.name, body);
    game.registerPlayer(body);
    return body;
}

Game.registerNodeType("CelestialBody", addBody);

// From https://nssdc.gsfc.nasa.gov/planetary/factsheet/
// distances are in km
// rotationalPeriods are in getHours
// orbitPeriods are in days
var PLANET_DATA = {
    sun: {
        diameter: 1.3914E06,
        distSun: 0,
        rotationPeriod: 24.47*24,
        orbitPeriod: 0,
    },
    earth: {
        diameter: 12756,
        distSun: 149.6E6,
        rotationPeriod: 23.9,
        orbitPeriod: 365.2
    },
    mars: {
        diameter: 6792,
        distSun: 227.9E06,
        rotationPeriod: 24.6,
        orbitPeriod: 687.0
    },
    jupiter: {
        diameter: 142984,
        distSun: 778.6E06,
        rotationPeriod: 9.9,
        orbitPeriod: 4331,
    },
    neptune: {
        diameter: 49528,
        distSun: 4495.1E06,
        rotationPeriod: 16.1,
        orbitPeriod: 59800,
    },
}


class SolarSystem {
    constructor(game, options) {
        options = options || {};
        if (!options.name)
            options.name = "solarSystem";
        var parent = "solarSystem";
        game.getGroup("solarPivot");
        game.getGroup("solarSystem", {parent: "solarPivot"});
        //var dat = SQUEEZED_PLANET_DATA;
        //var sunPosition = dat.sun.position;
        this.earthGamePosition = [-80,30,0];
        this.camCalc = new THREE.PerspectiveCamera(); // dummy camera just used for computing view info
        var sunPosition = this.getPosition('sun');
        var sunLight = {  type: 'PointLight', name: 'sunLight', position: sunPosition,
                    parent,
                       color: 0xffffff, distance: 8000, intensity: 6.6};
        game.loadSpecs(sunLight);

        addBody(game, {name: 'sun', parent, radius: 1,
                //position: dat.sun.position,
                texture: './textures/sun_surface1.jpg', color: [80,50,20],
                atmosphere: {'name': 'photosphere', opacity: .02}});
        addBody(game, {name: 'earth', parent, radius: 1,
                //position: dat.earth.position,
                texture: './textures/land_ocean_ice_cloud_2048.jpg'});
        addBody(game, {name: 'mars', parent, radius: 1,
                //position: dat.mars.position,
                texture: './textures/Mars_4k.jpg'});
        addBody(game, {name: 'jupiter', parent, radius: 1,
                //position: dat.jupiter.position,
                texture: './textures/Jupiter_Map.jpg'});
        addBody(game, {name: 'neptune', parent, radius: 1,
                //position: dat.neptune.position,
                texture: './textures/Neptune.jpg'});
        this.updatePlanetParams(1);
        if (this.earthGamePosition) {
            //this.alignPosition([80,0, 0]);
            this.alignPosition(this.earthGamePosition);
        }
        game.registerController(options.name, this);
    }

    getPosition(name) {
        var dSun = PLANET_DATA[name].distSun;
        dSun = Math.pow(dSun, .5);
        return [0,0,dSun];
    }

    getRadius(name) {
        var r = PLANET_DATA[name].diameter/2.0;
        return 2*Math.pow(r, .25);
    }

    //
    // This repositions solarSystem so that the specified body is at the specified
    // position in world coordinates.
    //
    alignPosition(pos, bodyName)
    {
        bodyName = bodyName || "earth";
        var ss = game.models.solarSystem;
        var bpos = this.getPosition(bodyName);
        ss.position.set(pos[0]-bpos[0], pos[1]-bpos[1], pos[2]-bpos[2]);
    }

    updatePlanetParams(sf) {
        sf = sf || 1;
        var planetData = PLANET_DATA;
        var names = ["sun", "earth", "mars", "jupiter", "neptune"];
        names.forEach(name => {
            var model = game.models[name];
            var r = sf*this.getRadius(name);
            model.scale.set(r,r,r);
            var pos = this.getPosition(name);
            model.position.set(pos[0], pos[1], pos[2]);
        })
    }

    update() {
        //this.solarSystem.rotation.y += 0.0001;
    }

    getViewpoint(name) {
        var pos = this.getPosition(name);
        var cam = this.camCalc;
        //position[0] -= 100;
        //var position = {x: pos[0]-100, y: pos[1], z: pos[2]};
        var model = game.models[name];
        var modelWorldPos = model.getWorldPosition();
        cam.position.copy(modelWorldPos);
        cam.position.x -= 100;
        //var rotation = {x: 0, y: 0, z: 0};
        cam.lookAt(modelWorldPos);
        return {position: cam.position.clone(), rotation: cam.rotation.clone()};
    }

    goto(name) {
        var vp = this.getViewpoint(name);
        game.viewManager.goto(vp, 10, name);
    }

    getTour() {
        var tour = new PlanetaryTour(this);
        return tour;
    }
};

/*
function toTime(t)
{
    if (typeof t != "string")
        return t;
    }
    var parts = t.split(:)
}
*/


class PlanetaryTour {
    constructor(solarSystem) {
        this.t0 = 0;
        this.solarSystem = solarSystem;
        this.initTour();
    }

    // tour related stuff...
    addPosition(bodyName, t, offset, ease) {
        if (!ease) {
            ease = createjs.Ease.getPowInOut(1)
        }
        t += this.t0;
        console.log("addPosition "+bodyName+" "+t);
        var anim = this.anim;
        var prevT = this.anim.getDuration();
        if (t < prevT) {
            alert("Cannot add positions to tour out of order");
            return;
        }
        var dur = t - prevT;
        offset = offset || [200,0,-200];
        var pos = this.solarSystem.getPosition(bodyName);
        anim.addStep({'position.x': -pos[0]+offset[0],
                      'position.y': -pos[1]+offset[1],
                      'position.z': -pos[2]+offset[2]}, dur, ease);
    }

    goPast(body, t)
    {
        var far = [-800,0,-200];
        var closer = [-800,0,-200];
        var near = [-200,0,-200];
        this.addPosition(body, t-10, far);
        this.addPosition(body, t,    closer);
        this.addPosition(body, t+10, near);
    }

    initTour() {
        this.target = game.models.solarSystem;
        this.anim = new Anim("planetaryTour", this.target);
        //anim.addStep({'position.x': 0, 'position.y': 0, 'position.z': 0}, 0);
        //this.addPosition(anim, "sun");
        var far = [-800,0,-200];
        var closer = [-800,0,-200];
        var near = [-200,0,-200];
        // This will initialize to start far away at time 0.
        this.addPosition("neptune",  0, far);
        // Fron now on we want times relative to when the video
        // starts.  That is now 20 seconds.  We will change This
        // to use relative time.
        this.t0 = 20;
        this.goPast("neptune", 150);
        this.goPast("jupiter", 175);
        this.goPast("mars", 210);
        this.addPosition("earth",   230, far);
        this.addPosition("earth",   240, closer);
        this.addPosition("earth",   250, near);
        /*
        this.addPosition("neptune", 140, closer);
        this.addPosition("neptune", 150, near);
        this.addPosition("jupiter", 170, far);
        this.addPosition("jupiter", 175, closer);
        this.addPosition("jupiter", 180, near);
        this.addPosition("mars",    200, far);
        this.addPosition("mars",    210, closer);
        this.addPosition("mars",    220, near);
        this.addPosition("earth",   230, far);
        this.addPosition("earth",   240, closer);
        this.addPosition("earth",   250, near);
        */
        /*
        var pos = this.getPosition("neptune");
        var pos = this.getPosition("eath");
        anim.addStep({'position.x': -pos[0], 'position.y': -pos[1], 'position.z': -pos[2]}, 1000*1000);
        anim.pause();
        */
        game.registerPlayer(this.anim);
        return this.anim;
    }

}

function addSolarSystem(game, options)
{
    var ss = new SolarSystem(game, options);
    window.SOLAR_SYSTEM = ss;
    return ss;
}

Game.registerNodeType("SolarSystem", addSolarSystem);

class StarsController {
    constructor(game, options) {
        addBody(game, {name: 'Stars', parent: 'solarSystem',
                //radius: 10000,  position: [-1000, 0, -1000],
                radius: 100000,  position: [-1000, 0, -1000],
                texture: './textures/Sky_8k.jpg',
                material: 'MeshBasicMaterial',
                side: THREE.DoubleSide});
    }

    update() {
        //this.stars.group.rotation.y += 0.0001;
    }
}

Game.registerNodeType("Stars", (game, options) => {
    return game.registerController(options.name, new StarsController(game, options));
});

export {CelestialBody,Planet,SolarSystem};
