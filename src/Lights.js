
import * as THREE from 'three';
import {Game} from "./Game";

let sphere = null;

function addLight(game, spec)
{
    console.log("adding light "+JSON.stringify(spec));
    var bulbRad = spec.bulbRadius || 0.2;
    if (!sphere) {
        console.log("Setting up sphere for lights");
        sphere = new THREE.SphereGeometry( 1, 16, 8 );
    }
    var color = spec.color || 0xffffff;
    let distance = spec.distance || 50;
    let light = new THREE.PointLight(color, 2, distance);
    var g = new THREE.Group();
    if (spec.name)
        g.name = spec.name;
    g.name = spec.name;
    g.add(light);
    var bulb = new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: color }));
    bulb.scale.x = bulbRad;
    bulb.scale.y = bulbRad;
    bulb.scale.z = bulbRad;
    g.add( bulb );
    game.addToGame(g, spec);
    game.setFromProps(g, spec);
    return g;
}


function setupLights(game)
{
    addLight(game, {name: 'light1', color: 0xffaaaa, position: [30, 15,-10]});
    addLight(game, {name: 'light2', color: 0xaaffaa, position: [30, 15,  5]});
    addLight(game, {name: 'light3', color: 0xaaaaff, position: [30, 15, -5]});
    addLight(game, {name: 'sun', color: 0xffffff, position: [0, 1000, 0], distance: 5000});
}

Game.registerNodeType("PointLight", addLight);

export {addLight, setupLights};

