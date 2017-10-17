import * as THREE from 'three';
import OrbitControls from './lib/controls/OrbitControls';
import LookControls from './lib/controls/LookControls';
import {MultiControls} from './lib/controls/MultiControls';
import {MultiControlsDeprecated} from './lib/controls/MultiControlsDeprecated';
import {Loader} from './Loader';
import { NetLink } from './NetLink';
import Util from './Util';
import AppState from './AppState';

let {degToRad} = THREE.Math;

function reportError(str)
{
    alert(str);
}

var ntypes = {};

class Game {
    constructor(domElementId) {
        this.updateHandlers = [];
        this.init(domElementId);
        this.ntypes = ntypes;
        this.user = Util.getParameterByName("user");
        this.viewManager = null;
        this.program = null;
        this.state = new AppState(this.events);
        if (this.user) {
            let netLink = new NetLink(this);
            this.registerController("netLink", netLink);
        }
        this.Util = Util;
    }

    init(domElementId) {
        console.log("init: " + domElementId);

        this.types = {};
        this.domElementId = domElementId;
        this.renderer = this.createRenderer(domElementId);

        let size = this.renderer.getSize();
        this.camera = new THREE.PerspectiveCamera(
    	    45, // this is vFov.  had been 75 but too large
            size.width / size.height,
            0.1,
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
        this.program = null; // for now this is a singleton
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
            //renderer.shadowMapEnabled	= true
            renderer.setSize(canvas3d.width, canvas3d.height);

        } else {
            renderer = new THREE.WebGLRenderer({
                antialias: true
            });
            //renderer.shadowMapEnabled	= true
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(window.innerWidth, window.innerHeight);

            let container = document.createElement('div');
            container.appendChild(renderer.domElement);
            document.body.appendChild(container);
        }

        return renderer;
    }

    //addControls(cameraControlsType, options) {
    addControls(options) {
        var cameraControlsType = options.type;
        if (cameraControlsType == null)
            cameraControlsType = "Orbit";
        if (cameraControlsType == 'Orbit') {
            console.log("**** Using OrbitControls ****");
            this.addOrbitControls(options);
        }
        else if (cameraControlsType == "JoelControls") {
            console.log("**** Using JoelControls ****");
            this.addJoelControls(options);
        }
        else if (cameraControlsType == "MultiControls") {
            console.log("**** Using MultiControls ****");
            this.addMultiControls(options);
        }
        else {
            alert("Unrecognized Control Type: "+cameraControlsType);
        }
    }

    addOrbitControls(opts) {
        opts = opts || {};
        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
        this.orbitControls.addEventListener('change', this.render.bind(this));
        this.orbitControls.keys = [65, 83, 68];
        this.camera.lookAt(new THREE.Vector3());
        this.camera.position.z = opts.distance || 1;
        this.controls = this.orbitControls;
    }

    addLookControls(opts) {
        this.lookControls = new LookControls(this.camera, this.renderer.domElement);
        //this.cmpControls.addEventListener('change', this.render.bind(this));
        this.lookControls.keys = [65, 83, 68];
        this.camera.lookAt(new THREE.Vector3());
        this.controls = this.lookControls;
    }

    addMultiControls(opts) {
        var mc = new MultiControls(this, this.renderer.domElement, opts);
        this.controls = mc;
    }

    addJoelControls(opts) {
        alert("JoelControls deprecated - use MultiControls");
        var mc = new MultiControls(this, this.renderer.domElement, opts);
        this.controls = mc;
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
        return controller;
    }

    registerUpdateHandler(handlerOrObject) {
        if (typeof handlerOrObject === 'function') {
            this.updateHandlers.push(handlerOrObject);
        } else {
            throw 'Unsupported handler provided to `registerUpdateHandler`';
        }
    }

    getProgram() {
        return this.program;
    }

    setProgram(program) {
        this.program = program;
        return program;
    }

    // These methods could be moved to a state object.
    setValue(name, value) {
        //console.log("game.setValue "+name+" "+value);
        this.events.dispatchEvent({
            type: 'valueChange',
            message: value
        });
    }

    // setProperties(name, value) {
    //     //console.log("game.setValue "+name+" "+value);
    //     var evType = "setProperties."+name;
    //     this.events.dispatchEvent({
    //         type: evType,
    //         message: value
    //     });
    // }

    // watchProperties(name, handler) {
    //     var evType = "setProperties."+name;
    //     this.events.addEventListener(evType, evt => handler(evt.message, evt));
    // }

    registerPlayer(player) {
        if (this.program) {
            this.program.registerPlayer(player);
        }
        else {
            reportError("Attempt to register player with no program");
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

    pre(msTime) {
        // call pre
        Object.keys(this.controllers).forEach((k) => {
            let controller = this.controllers[k];
            if (controller && controller.pre) {
                controller.pre(msTime);
            }
        });
    }

    post(msTime) {
        // call post
        Object.keys(this.controllers).forEach((k) => {
            let controller = this.controllers[k];
            if (controller && controller.post) {
                controller.post(msTime);
            }
        });
    }

    animate(msTime) {
        if (this.config && this.config.onUpdate) {
            this.config.onUpdate(game);
        }

        if (this.controls) {
            this.controls.update(msTime);
        }

        this.pre(msTime);

        this.updateHandlers.forEach(h => h(msTime));
        this.render();

        this.post(msTime);

        // Do NOT provide params.
        this.requestAnimate();
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    getUnderlyingRenderer() {
        if (this.renderer.getUnderlyingRenderer)
            return this.renderer.getUnderlyingRenderer();
        return this.renderer;
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
	    //game.scene.add(obj);
	    this.scene.add(obj);
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
            obj.name = name;
	    //game.models[name] = obj;
	    this.models[name] = obj;
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
            if (props.rot) {
                if (Array.isArray(props.rot)) {
                    obj3d.rotation.fromArray(props.rot.map(degToRad));
                }
    	        else {
                    reportError("rotations should be array");
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
            if (props.visible != null) {
    	           obj3d.visible = props.visible;
            }
            if (props.recenter) {
                //TODO: fix this
                //obj3d.updateMatrix();
                var box = new THREE.Box3().setFromObject(obj3d);
                var center = box.getCenter();
                obj3d.position.sub(center);
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
        THREE.SceneUtils.attach(obj, this.scene, parent);
    }

    attachCameraTo(parent) {
        //TODO: Make this smarter about where camera is already
        // parented.
        this.reparent(this.camera, this.models[parent]);
    }

    attachCameraToStation() {
        this.attachCameraTo('station');
    }

    setStatus(str) {
        if (this.controllers.ui) {
            this.controllers.ui.setStatus(str);
        }
        else {
            console.log("status: "+str);
        }
    }

    /*********************************************************************/
    // Node system.  Muse is oriented around nodes that correspond to objects
    // that may be in the scene graph, or may add functionality to the game.
    // It is an extensible system, where modules may register their node type
    // with the game.   Then the Loader can create those nodes from JSON objects
    // specifying the node type.
    //
    // A factory should be a function that takes arguments (game, opts)
    // where opts is an Object containing properties for the object to
    // be created.
    static registerNodeType(typeName, factory) {
        if (ntypes[typeName]) {
            alert("Node Type "+typeName+" already registered.");
        }
        ntypes[typeName] = factory;
    }

    createNode(typeName, props) {
        if (ntypes[typeName]) {
            console.log("*********************** calling factory for "+typeName);
            return ntypes[typeName](this, props);
        }
        else {
            reportError("Unknown Node type "+typeName);
        }
        return null;
    }

    //loadSpecs0(specs) {
    //    game.loader = new Loader(this);
    //    return game.loader.load(specs);
    //}

    loadSpecs(specs) {
        var inst = this;
        console.log("***** game.loadSpecs creating promise");
        return new Promise((resolve, reject) => {
            new Loader(inst, specs, () => {
                console.log("*****  game.loadSpecs resolving promise...");
                resolve();
            });
        });
    }
}

export {Game};
