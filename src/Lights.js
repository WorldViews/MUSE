
import * as THREE from 'three';
import {Game} from "./Game";
import ShadowMapViewer from './lib/ShadowMapViewer';

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

    if (spec.castShadow) {
        light.castShadow = true;
        light.shadow.bias = 0.0001;
        light.shadow.mapSize.width = 8196;
        light.shadow.mapSize.height = 8196;
        light.shadow.camera.left = light.shadow.camera.top = 15;
        light.shadow.camera.right = light.shadow.camera.bottom = -15;
    }

    //showLight(light);

    light.name = spec.name;
    game.addToGame(light, spec.name, spec.parent);
    game.setFromProps(light, spec);

    return light;
}

export function addSpotLight(game, spec) {
    var color = spec.color || 0xffffff;
    var intensity = spec.intensity || 2.0;
    var position = spec.position || [0, 0, 0]
    let light = new THREE.SpotLight(color, intensity);

    if (spec.castShadow) {
        light.castShadow = true;
        light.shadow.bias = 0.0001;
        light.shadow.mapSize.width = 8196;
        light.shadow.mapSize.height = 8196;
    }

    //showLight(light);

    light.name = spec.name;
    game.addToGame(light, spec.name, spec.parent);
    game.setFromProps(light, spec)

    return light;
}

function showLight(light) {
    var helper = new THREE.CameraHelper(light.shadow.camera);
    game.scene.add(helper);
    game.addToGame(helper, spec.name + 'Helper', spec.parent);

    let shadowMapViewer = new ShadowMapViewer(light)
    shadowMapViewer.position.x = 10;
    shadowMapViewer.position.y = 500;
    shadowMapViewer.size.width = 256;
    shadowMapViewer.size.height = 256;
    shadowMapViewer.update();

    if (!game.shadowMapViewers) {
        game.shadowMapViewers = [];
    }
    game.shadowMapViewers.push(shadowMapViewer);
}

Game.registerNodeType("PointLight", addPointLight);
Game.registerNodeType("AmbientLight", addAmbientLight);
Game.registerNodeType("DirectionalLight", addDirectionalLight);
Game.registerNodeType("SpotLight", addSpotLight);
