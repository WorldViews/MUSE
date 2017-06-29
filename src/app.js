import * as THREE from 'three';
import VRControls from './lib/controls/VRControls';
import PointerLockControls from './lib/controls/PointerLockControls';
import TrackballControls from './lib/controls/TrackballControls';
import VREffect from './lib/effects/VREffect';
import Earth from './lib/EARTH';
import Stars from './lib/Stars';

import attachPointerLock from './attachPointerLock';
import loadCollada from './loadCollada';
import loadVideo from './loadVideo';
import loadVR from './loadVR';

import {R, TH_LEN, TH_MIN, PH_LEN, PH_MIN} from './const/screen';

let Y_AXIS = new THREE.Vector3(0, 1, 0);
let NINETY = Math.PI / 2;
let DAE_PATH = 'models/PlayDomeSkp.dae';
let VIDEO_PATH = 'videos/Climate-Music-V3-Distortion_HD_540.webm';

let {degToRad} = THREE.Math;

var canvas3d = document.getElementById('canvas3d');
canvas3d.height = window.innerHeight;
canvas3d.width = window.innerWidth;

var renderer = new THREE.WebGLRenderer({ canvas: canvas3d, antialias: true });
renderer.setSize(canvas3d.width, canvas3d.height);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.autoClear = false;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, canvas3d.width / canvas3d.height, 1, 4000);

var sphere = new THREE.SphereGeometry( 0.5, 16, 8 );

var color1 = 0xffaaaa;
var light1 = new THREE.PointLight(color1, 2, 50);
light1.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: color1 } ) ) );
light1.position.y = 30;
light1.position.x = -10;
light1.position.z = -10;
scene.add(light1);

var color2 = 0xaaffaa;
var light2 = new THREE.PointLight(color2, 2, 50);
light2.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: color2 } ) ) );
light2.position.y = 30;
light2.position.x = -10;
light2.position.z = 5;
scene.add(light2);

var color3 = 0xaaaaff;
var light3 = new THREE.PointLight(color3, 2, 50);
light3.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: color3 } ) ) );
light3.position.y = 30;
light3.position.x = -10;
light3.position.z = -5;
scene.add(light3);

var earthGroup = new THREE.Group();
var earth = new Earth(earthGroup, 1, {name: 'Full'});
scene.add(earthGroup);
earthGroup.position.set(0, 2, 0);

var starsGroup = new THREE.Group();
scene.add(starsGroup);
var stars = new Stars(starsGroup, 2500, {name: 'Stars'});
starsGroup.position.set(0, 0, 0);

var vrControls = new VRControls(camera);
vrControls.shouldUpdatePosition = false;
// vrControls.standing = true;

// Allow the PointerLockControls to create the body, 
// even if we do not use the controls for movement.
var plControls = new PointerLockControls(camera);
var body = plControls.getObject();
body.position.set(2, 2, 2);
scene.add(body);

var effect = new VREffect(renderer);
effect.autoSubmitFrame = false;

var keys = new Set();

window.addEventListener('keydown', (e) => {
  keys.add(e.keyCode);
});

window.addEventListener('keyup', (e) => {
  keys.delete(e.keyCode);
});

// Chrome and Firefox implemented gamepads different.
// Chrome prefers polling for the gamepads.
// Firefox will update the gamepad object.
window.addEventListener('gamepadconnected', (e) => {
  console.log('gamepad connected: ' + e.gamepad.id);
});

window.addEventListener('gampaddisconnected', (e) => {
  console.log('gamepad disconnected');
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  effect.setSize( window.innerWidth, window.innerHeight );
});

// TESTING HUD

let width = window.innerWidth;
let height = window.innerWidth;

var hudCanvas = document.createElement('canvas');
hudCanvas.width = width;
hudCanvas.height = height;
var hudBitmap = hudCanvas.getContext('2d');

hudBitmap.font = "Normal 40px Arial";
hudBitmap.textAlign = 'center';
hudBitmap.fillStyle = "rgba(245,245,245,0.75)";
hudBitmap.fillText('Waiting for gamepad...', width / 2, height / 2);

var cameraHUD = new THREE.OrthographicCamera(
  -width/2, width/2,
  height/2, -height/2,
  0, 30
);

var sceneHUD = new THREE.Scene();

var hudTexture = new THREE.Texture(hudCanvas)
hudTexture.needsUpdate = true;
var material = new THREE.MeshBasicMaterial( {map: hudTexture, transparent: true} );

var planeGeometry = new THREE.PlaneGeometry( width, height );
var plane = new THREE.Mesh( planeGeometry, material );
// sceneHUD.add( plane );
plane.position.set(-250, -250, -1000);

var direction = new THREE.Vector3();

function animate() {
  if (plControls.enabled) {
    plControls.getDirection(direction);
  }
  else {
    camera.getWorldDirection(direction);    
  }

  // Do not allow gamepad controls when pointerlock controls are enabled.
  if (navigator.getGamepads && !plControls.enabled) {
    let gamepadList = navigator.getGamepads();
    let gamepad = gamepadList[0];

    if (gamepad) {
      let {axes} = gamepad;
      let axisX = axes[0];
      let axisY = axes[1];

      if (axisY < -0.5) {
        body.translateX(0.01 * direction.x);
        body.translateZ(0.01 * direction.z);
      }
      else if (axisY > 0.5) {
        body.translateX(-0.01 * direction.x);
        body.translateZ(-0.01 * direction.z);
      }
      
      if (axisX > 0.5) {
        // TODO: refactor into function
        let right = direction.clone().applyAxisAngle(Y_AXIS, -NINETY);
        body.translateX(0.01 * right.x);
        body.translateZ(0.01 * right.z);
      }
      else if (axisX < -0.5) {
        // TODO: refactor into function
        let left = direction.clone().applyAxisAngle(Y_AXIS, NINETY);
        body.translateX(0.01 * left.x);
        body.translateZ(0.01 * left.z);
      }
    }
  }

  keys.forEach((keyCode) => {
    if (keyCode == 87) { // Move forward incrementally with W
      // PointerLockControls do not move the camera.
      if (!plControls.enabled) {
        body.translateX(0.1 * direction.x);
        body.translateZ(0.1 * direction.z);
      }
      else {
        body.translateZ(-0.1);        
      }
    }
    if (keyCode == 65) { // Move left incrementally with A
      // PointerLockControls do not move the camera.
      if (!plControls.enabled) {
        let left = direction.clone().applyAxisAngle(Y_AXIS, NINETY);
        body.translateX(0.1 * left.x);
        body.translateZ(0.1 * left.z);  
      }
      else {
        body.translateX(-0.1);
      }
    }
    if (keyCode == 68) { // Move right incrementally with D
      if (!plControls.enabled) {
        // PointerLockControls do not move the camera.
        let right = direction.clone().applyAxisAngle(Y_AXIS, -NINETY);
        body.translateX(0.1 * right.x);
        body.translateZ(0.1 * right.z);  
      }
      else {
        body.translateX(0.1);
      }
    }
    if (keyCode == 83) { // Move left incrementally with S
      // PointerLockControls do not move the camera.
      if (!plControls.enabled) {
        body.translateX(-0.1 * direction.x);
        body.translateZ(-0.1 * direction.z);        
      }
      else {
        body.translateZ(0.1);
      }
    }
  });


  vrControls.update();

  render();

  effect.requestAnimationFrame(animate);
}

function render(vrDisplay) {
  // renderer.clear(); // help

  effect.render(scene, camera);

  // Is this right?
  effect.render(sceneHUD, cameraHUD);

  // Do this manually
  if (vrDisplay && vrDisplay.isPresenting) {
    effect.submitFrame();    
  }

  earthGroup.rotation.y += 0.01;
  starsGroup.rotation.y += 0.0001;
}

loadCollada(
  DAE_PATH,
  {
    position: [0, 0, 0],
    rotation: [0, degToRad(90), 0],
    scale: [0.025, 0.025, 0.025]
  }
).then((collada) => {
  scene.add(collada.scene);
  
  console.log('Loading video...');

  loadVideo(VIDEO_PATH).then(({imageSource, videoMaterial}) => {
    console.log('Creating video geometry...');

    let geometry = new THREE.SphereGeometry(
      R,
      40,
      40,
      TH_LEN, 
      TH_MIN,
      PH_LEN,
      PH_MIN
    );
    let screenObject = new THREE.Mesh(geometry, videoMaterial);

    screenObject.scale.x = -1;
    screenObject.scale.x *= 8.6;
    screenObject.scale.y *= 8.6;
    screenObject.scale.z *= 8.6;
    screenObject.position.y = 0;
    screenObject.name = "movieScreen";

    let screenParent = new THREE.Object3D();
    screenParent.add(screenObject);
    screenParent.rotation.z = 0;

    scene.add(screenParent);

    loadVR(renderer.domElement).then(({button, display}) => {
      document.body.appendChild(button);
      let autoplayPromise = imageSource.play();

      // Finally start animation loop
      render = render.bind(null, display);
      animate();
    }).catch(error => {
      // If VR is not available, do not worry about binding the VRDisplay.
      // Only use PointerLock if VR is not available, do not use both.
      if (!error.isVRAvailable) {
        attachPointerLock(plControls);
        animate();
      }
      else {
        console.log(error);
      }
    })
  });
}).catch(handleError);

function handleError(error) {
  console.log(error);
}

