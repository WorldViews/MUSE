
import * as THREE from 'three';
import { sprintf } from "sprintf-js";
import {Game} from 'core/Game';
import satellite from 'satellite.js';
import {Loader} from 'core/Loader';
import {SatTrackDB} from './SatTrackDB';
import * as Util from 'core/Util';

function getClockTime() { return new Date().getTime()/1000.0; }

class GeoEvent
{
    constructor(group, t, pos, t0, r0)
    {
        this.group = group;
        this.t = t;
        this.t0 = t0 || 10*24*3600;
        this.r0 = r0 || 1.0;
        this.pos = pos;
        this.mesh = new THREE.Mesh( group.geometry, group.material );
        this.mesh.position.copy(pos);
        group.game.addToGame(this.mesh)
    }

    update(t) {
        var dt = Math.abs(t - this.t);
        var s = this.r0 / (1 + dt/this.t0);
        this.mesh.scale.set(s,s,s);
        //console.log(sprintf("geoEvent %.1f %.1f %.3f", t, dt, s));
    }
}

class GeoEvents {
    constructor(game) {
        this.game = game;
        this.events = [];
        var radius = 1.0;
        this.geometry = new THREE.SphereGeometry( radius, 30, 30 );
        this.material = new THREE.MeshBasicMaterial( { overdraw: 0.5, color: 0xFF0000, transparent: true} );
        this.material.opacity = 0.2;
        this.mesh = new THREE.Mesh( this.geometry, this.material );
    }

    addEvent(t, pos, t0, r) {
        this.events.push(new GeoEvent(this, t, pos, t0, r));
    }

    update(t) {
        this.events.forEach( ev => ev.update(t));
    }
}

export {GeoEvent, GeoEvents};
