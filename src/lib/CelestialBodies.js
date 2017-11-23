
import * as THREE from 'three'
import {Game} from '../Game'
import {MUSE} from '../MUSE'
import {MUSENode} from '../Node'
import {Node3D} from '../Node3D'
import {SatTracks} from '../SpaceObjects/SatTracks'
import {Atmosphere} from './Atmosphere'
import {CMPDataViz2} from './CMPDataViz2'
import ImageSource from './ImageSource';


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
        this.material = null;
        var loader = new THREE.TextureLoader();
        //var texPath = opts.texture || 'textures/land_ocean_ice_cloud_2048.jpg';
        var texPath = opts.texture;
        this.imageSource = null;
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
            this.dataViz = new CMPDataViz2(this, opts);
        }
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
        if (game.program) {
            this.setPlayTime(game.program.getPlayTime());
        }
        else {
            console.log("CelestialBody "+this.name+" ... no program yet");
            this.setPlayTime(0);
        }
    }

    setVisible(v) {
        this.group.visible = v;
        if (this.atmosphere)
            this.atmosphere.visible = v;
        if (this.dataViz)
            this.dataViz.visible = v;
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
        var url = "videos/GlobalWeather2013.mp4";
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

class SolarSystem {

    constructor(game, options) {
        var parent = "solarSystem";
        addBody(game, {name: 'Sun', parent,
                radius:  300, position: [-5000, 0, -3000],
                texture: './textures/sun_surface1.jpg', color: [4,4,4]});
        addBody(game, {name: 'Earth', parent,
                radius: 1000, position: [-2000, 0, 0],
                texture: './textures/land_ocean_ice_cloud_2048.jpg'});
        addBody(game, {name: 'Mars', parent,
                radius:  200, position: [ 2000, 0, 2000],
                texture: './textures/Mars_4k.jpg'});
        addBody(game, {name: 'Jupiter', parent,
                radius: 300,  position: [ 1500, 0, -1500],
                texture: './textures/Jupiter_Map.jpg'});
        addBody(game, {name: 'Neptune', parent,
                radius: 100,  position: [-1000, 0, -1000],
                texture: './textures/Neptune.jpg'});

        //this.solarSystem = game.getGroup('solarSystem');
    }

    update() {
        //this.solarSystem.rotation.y += 0.0001;
    }
};

function addSolarSystem(game, options)
{
    return new SolarSystem(game, options);
    //var name = options.name || 'solarSystem';
    //game.registerController(name, cmp);
    //return cmp;
}

Game.registerNodeType("SolarSystem", addSolarSystem);

class StarsController {
    constructor(game, options) {
        addBody(game, {name: 'Stars', parent: 'solarSystem',
                radius: 10000,  position: [-1000, 0, -1000],
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
