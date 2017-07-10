
import * as THREE from 'three';

let sphere = null;
function addLight(game, spec)
{
    if (!sphere) {
	console.log("Setting up sphere for lights");
	sphere = new THREE.SphereGeometry( 0.5, 16, 8 );
    }
    var color = spec.color || 0xffffff;
    let light = new THREE.PointLight(color, 2, 50);
    game.addToGame(light, spec);
}

function setupLights(game)
{
    let scene = game.scene;
    let sphere = new THREE.SphereGeometry( 0.5, 16, 8 );

    let color1 = 0xffaaaa;
    let light1 = new THREE.PointLight(color1, 2, 50);
    light1.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: color1 } ) ) );
    light1.position.y = 30;
    light1.position.x = -10;
    light1.position.z = -10;
    light1.name = "light1";
    scene.add(light1);

    let color2 = 0xaaffaa;
    let light2 = new THREE.PointLight(color2, 2, 50);
    light2.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: color2 } ) ) );
    light2.position.y = 30;
    light2.position.x = -10;
    light2.position.z = 5;
    light2.name = "light2";
    scene.add(light2);

    let color3 = 0xaaaaff;
    let light3 = new THREE.PointLight(color3, 2, 50);
    light3.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: color3 } ) ) );
    light3.position.y = 30;
    light3.position.x = -10;
    light3.position.z = -5;
    light3.name = "light3";
    scene.add(light3);
}

export {addLight, setupLights};

