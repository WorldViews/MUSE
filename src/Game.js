import * as THREE from 'three';
import OrbitControls from './lib/controls/OrbitControls';
import CMP_Controls from './lib/controls/CMP_Controls';

class Game {

  constructor(domElementId) {
    this.updateHandlers = [];
    this.init(domElementId);
  }

  init(domElementId) {
    console.log("init: " + domElementId);

    this.domElementId = domElementId;
    this.renderer = this.createRenderer(domElementId);

    let size = this.renderer.getSize();
    this.camera = new THREE.PerspectiveCamera(
    	75,
        size.width / size.height,
        1,
        30000
    );

    //renderer.setClearColor( 0x000020 ); //NOFOG
    this.scene = new THREE.Scene();
    this.scene.add(this.camera);

    window.addEventListener('resize', this.handleResize.bind(this));

    this.screens = {};
    this.models = {};
    this.events = new THREE.EventDispatcher();
    this.controllers = {};
      this.setupRAF();
      this.programControl = null; // for now this is a singleton
  }

  setupRAF() {
    this.requestAnimate = window.requestAnimationFrame.bind(
      window,
      this.animate.bind(this)
    );
  }

  createRenderer(domElementId) {
    var renderer;

    if (domElementId) {
      let canvas3d = document.getElementById(domElementId);
      canvas3d.height = window.innerHeight;
      canvas3d.width = window.innerWidth;

      renderer = new THREE.WebGLRenderer({
        canvas: canvas3d,
        antialias: true
      });
      renderer.setSize(canvas3d.width, canvas3d.height);

    } else {
      renderer = new THREE.WebGLRenderer({
        antialias: true
      });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);

      let container = document.createElement('div');
      container.appendChild(renderer.domElement);
      document.body.appendChild(container);
    }

    return renderer;
  }

  addControls() {
    this.addOrbitControls();
  }

  addOrbitControls() {
    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
    this.orbitControls.addEventListener('change', this.render.bind(this));
    this.orbitControls.keys = [65, 83, 68];
    this.camera.lookAt(new THREE.Vector3());
      this.camera.position.z = 1;
      this.controls = this.orbitControls;
  }

  addCMPControls() {
    this.cmpControls = new CMP_Controls(this.camera);
    //this.cmpControls.addEventListener('change', this.render.bind(this));
    this.cmpControls.keys = [65, 83, 68];
    this.camera.lookAt(new THREE.Vector3());
      this.controls = this.cmpControls;
  }

    // Isn't this more complicated than it needs to be?
    // we have a list and map, and functions or objects.
    registerController(name, controller) {
  	if (typeof controller === 'object' && controller.update) {
  		this.updateHandlers.push(controller.update.bind(controller));
  	} else {
  		throw 'Unsupported controller provided to `registerController`';
  	}

	this.controllers[name] = controller;
    }

  registerUpdateHandler(handlerOrObject) {
  	if (typeof handlerOrObject === 'function') {
	    this.updateHandlers.push(handlerOrObject);
  	} else {
  		throw 'Unsupported handler provided to `registerUpdateHandler`';
  	}
  }

    
  handleResize(e) {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    if (this.CMP) {
      CMP.resize(window.innerWidth, window.innerHeight);
    }
  }

  animate(msTime) {
    if (game.controls) {
      this.controls.update(msTime);
    }

    this.updateHandlers.forEach(h => h(msTime));
    this.render();

    // Do NOT provide params.
    this.requestAnimate();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}

export {Game};
