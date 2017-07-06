
import * as THREE from 'three';
import {Math} from 'three';
import OrbitControls from './lib/controls/OrbitControls';
import CMP_Controls from './lib/controls/CMP_Controls';

// for now, keep these available at this level so that some
// functions can remain as functions rather than methods.
let game = null;
let scene = null;
let camera = null;
let renderer = null;
let controls = null;

class Game
{
    constructor(domElementId) {
	this.updateHandlers = [];
	this.init(domElementId);
    }

    init(domElementId)
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

	//this.addControls();

	window.addEventListener('resize', handleResize);
	this.camera = camera;
	this.scene = scene;
	this.renderer = renderer;
	this.models = {};
	this.animate = animate;
	game = this;
    }

    addControls()
    {
	addOrbitControls();
    }
    
    addOrbitControls()
    {
	controls = new OrbitControls(camera, renderer.domElement);
	camera.position.z = 1;
	controls.addEventListener('change', render);
	controls.keys = [65, 83, 68];
	camera.lookAt(new THREE.Vector3());
	this.controls = controls;
    }

    addCMPControls()
    {
	controls = new CMP_Controls(camera);
	controls.addEventListener('change', render);
	controls.keys = [65, 83, 68];
	camera.lookAt(new THREE.Vector3());
	this.controls = controls;
    }

    registerUpdateHandler(handler)
    {
	this.updateHandlers.push(handler);
    }

    /* For now, lets not have these be methods, but traditional functions.
       They can still be overridden.  We can discuss this...
    */
    // handleResize(e) {}
    // animate() {};
    // render() {};
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

function error(str) { alert(str); }

function animate() {
    if (!game) {
	error("No game");
    }
  // Do not allow gamepad controls when pointerlock controls are enabled.
    var t = getClockTime();
    var deltaTime = (t - prevTime);
    prevTime = t;
    //console.log("dt: "+deltaTime);
    if (game.controls)
	game.controls.update(deltaTime);
    game.updateHandlers.forEach(h => h(deltaTime));
    render();
    window.requestAnimationFrame(animate);
}

function render(vrDisplay) {
    if (!game) {
	error("No game");
    }
    renderer.render(scene, camera);
}

//export default initGame;
export {Game};
