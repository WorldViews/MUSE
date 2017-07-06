
import * as THREE from 'three';
import {Math} from 'three';
import OrbitControls from './lib/controls/OrbitControls';
import CMP_Controls from './lib/controls/CMP_Controls';

let scene = null;
let camera = null;
let renderer = null;
let game = null;

function initGame(domElementId)
{
    console.log("init: "+domElementId);
    if (domElementId) {
	console.log("Getting canvas from "+domElementId)
	let canvas3d = document.getElementById('canvas3d');
	canvas3d.height = window.innerHeight;
	canvas3d.width = window.innerWidth;
	renderer = new THREE.WebGLRenderer({ canvas: canvas3d,
						 antialias: true });
	renderer.setSize(canvas3d.width, canvas3d.height);
	camera = new THREE.PerspectiveCamera(75,
					     canvas3d.width/canvas3d.height,
					     1, 30000);
    }
    else {
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize( window.innerWidth, window.innerHeight );
	var container = document.createElement( 'div' );
	container.appendChild( renderer.domElement );
	document.body.appendChild( container );
	camera = new THREE.PerspectiveCamera(75,
					     window.innerWidth/window.innerHeight,
					     1, 30000);
    }
    //renderer.setClearColor( 0x000020 ); //NOFOG
    scene = new THREE.Scene();
    scene.add(camera);

    //let controls = new TrackballControls(camera);
    let controls = new OrbitControls(camera, renderer.domElement);
    //let controls = new CMP_Controls(camera);
    camera.position.z = 1;
    controls.addEventListener('change', render);
    controls.keys = [65, 83, 68];

    camera.lookAt(new THREE.Vector3());

    window.addEventListener('resize', handleResize);
/*
    window.addEventListener('resize', () => {
	console.log("*** resizing");
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
    });
*/
    window.camera = camera;
    window.scene = scene;
    window.controls = controls;
    //var game = {
    game = {
	camera, scene, controls, renderer, animate, models: {}
    }
    return game;
}

function handleResize(e)
{
    console.log("*** resizing");
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    if (game && game.CMP) {
	console.log("*** resizing CMP");
	game.CMP.resize(window.innerWidth, window.innerHeight);
    }
}

function getClockTime()
{
    return new Date().getTime()/1000.0;
}

let prevTime = 0;

function animate() {
  // Do not allow gamepad controls when pointerlock controls are enabled.
    var t = getClockTime();
    var deltaTime = (t - prevTime);
    prevTime = t;
    //console.log("dt: "+deltaTime);
    controls.update(deltaTime);
    render();

    window.requestAnimationFrame(animate);
}

function render(vrDisplay) {
  renderer.render(scene, camera);
    if (game && game.mathboxContext) {
	//console.log("calling game.mathboxContext.frame()");
	game.CMP.update();
    }
}

export default initGame;
