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
    	    45, // this is vFov.  had been 75 but too large
            size.width / size.height,
            1,
            30000
        );

        //renderer.setClearColor( 0x000020 ); //NOFOG
        this.scene = new THREE.Scene();
        this.scene.add(this.camera);

        window.addEventListener('resize', this.handleResize.bind(this));

        this._defaultGroupName;
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

    //*************************************************************
    // Utility functions.  These could be moved to another module
    // but it is convenient for them to have access to Game.

    // Create a group with specified name, parent and transform.
    // Return if a group already exists.  TODO: (If the group exists,
    // the properties are not applied.  Should we flag an error.)
    getGroup(name, props) {
        props = props || {};
        if (name && this.models[name])
	    return this.models[name];
        var obj = new THREE.Group();
        if (name) {
	    obj.name = name;
        }
        this.setFromProps(obj, props);
        //this.addToGame(obj, name, props.parent);
        // (this would cause stackoverflow if default
        //  group doesn't exist.)
        if (name) {
	    obj.name = name;
	    this.models[name] = obj;
        }
        if (props.parent) {
	    var parentObj = this.getGroup(props.parent);
	    parentObj.add(obj);
        }
        else {
	    game.scene.add(obj);
        }
        return obj;
    }

    // These specify the default group name used
    // when objects are added to the game.
    get defaultGroupName()
    {
        return this._defaultGroupName;
    }

    set defaultGroupName(groupName)
    {
        this._defaultGroupName = groupName;
    }

    // add this obj to game scene graph.  If a parent is specified
    // or if there is a defaultGroupName, place in that group (creating
    // if necessary.) Otherwise place directly into scene.
    // If name is specified, store in models table.
    // 
    addToGame(obj, name, parentName) {
        parentName = parentName || this.defaultGroupName;
        if (parentName) {
	    var parentObj = this.getGroup(parentName);
	    parentObj.add(obj);
        }
        else
	    this.scene.add(obj);
        if (name) {
	    game.models[name] = obj;
        }
    }

    //
    // Takes an Object3d and sets the position, rotation and scale if they
    // are present in props.
    setFromProps(obj3d, props) {
        if (props.position) {
            if (Array.isArray(props.position)) {
                obj3d.position.fromArray(props.position);
            }
	    else {
                reportError("position should be array");
	    }
        }
        if (props.rotation) {
            if (Array.isArray(props.rotation)) {
                obj3d.rotation.fromArray(props.rotation);
            }
	    else {
                reportError("rotations should be array");
	    }
        }
        if (props.scale) {
	    if (Array.isArray(props.scale)) {
                obj3d.scale.fromArray(scaleVec(props.scale));
	    }
	    else if (typeof(props.scale) === "number") {
                obj3d.scale.fromArray([props.scale,props.scale,props.scale]);
	    }
	    else {
                reportError("rotations should be array");
	    }
        }
        obj3d.updateMatrix();
    }

    // untested... don't use yet.
    reparent(obj, parent) {
        if (typeof parent === "string")
	    parent = this.models[parent];
        if (!parent) {
	    console.log("**** no parent found for "+parent);
	    return;
        }
        parent.updateMatrixWorld();
        THREE.SceneUtils.attach(obj, game.scene, parent);
    }
}

export {Game};
