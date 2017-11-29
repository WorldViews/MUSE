
import * as THREE from 'three';
import {Game} from "./Game";

let sphere = null;

export function addPointLight(game, spec)
{
    console.log("adding light "+JSON.stringify(spec));
    var bulbRad = spec.bulbRadius || 0.2;
    if (!sphere) {
        console.log("Setting up sphere for lights");
        sphere = new THREE.SphereGeometry( 1, 16, 8 );
    }
    var color = spec.color || 0xffffff;
    var distance = spec.distance || 50.0;
    var intensity = spec.intensity || 2.0;
    var decay = spec.decay || 1.0;
    let light = new THREE.PointLight(color, intensity, distance, decay);
    game.addToGame(light, spec.name, spec.parent);
    game.setFromProps(light, spec);
    return light;
}

export function addAmbientLight(game, spec) {
    var color = spec.color || 0xffffff;
    var intensity = spec.intensity || 2.0;
    let light = new THREE.AmbientLight(color, intensity);
    light.name = spec.name;
    game.addToGame(light, spec.name, spec.parent);
    game.setFromProps(light, spec);
    return light;
}


export function addDirectionalLight(game, spec) {
    var color = spec.color || 0xffffff;
    var intensity = spec.intensity || 2.0;
    var position = spec.position || [0, 0, 0]
    let light = new THREE.DirectionalLight(color, intensity);
    light.name = spec.name;
    game.addToGame(light, spec.name, spec.parent);
    game.setFromProps(light, spec);
    return light;
}

Game.registerNodeType("PointLight", addPointLight);
Game.registerNodeType("AmbientLight", addAmbientLight);
Game.registerNodeType("DirectionalLight", addDirectionalLight);
