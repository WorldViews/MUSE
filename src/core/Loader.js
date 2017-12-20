
import loadCollada from 'core/loadCollada'
import OBJLoader from 'lib/loaders/OBJLoader';
import MTLLoader from 'lib/loaders/MTLLoader';
import DDSLoader from 'lib/loaders/DDSLoader';
import {FBXLoader} from 'lib/loaders/FBXLoader';
import Util from 'core/Util';
import {MUSE} from 'core/MUSE';
import {Node3D} from 'core/Node3D';
import {reportError} from 'core/Util';


/*
  Loader class.  This loads models or creates nodes corresponding to
  things in the scene, or functionality.

  This is traversed recursively, with each item being:

    an object - handled directly (as below)
    a list - each element of the list is loaded
    a string - used to load a JSON or JS file returning an object to load

  The objects may be a primitive type of: Model, Group, Inline, Axes
  or an extended type registered by the registerType system.
  The objects may have the fields:

  type   -   Which type of node to be loaded or created
  path   -   The URL of the model to be loaded
  name   -   A named to be assigned to the loaded
             model that can be used to access it
             from game.models
  position   Optional position to place it at
  rotation   Optional rotation (array in radians)
  scale      Optional scale, if scalar, uniform scalling
*/

/*
function reportWarning(str)
{
    console.log("Warning: "+str);
    alert(str);
}

function reportError(str)
{
    console.log("Error: "+str);
    alert(str);
}
*/

var numLoaders = 0; // just for debugging purposes
var numGroups = 0;

var PENDING_LOADERS = {};

class ModelNode extends Node3D
{
    constructor(game, options) {
        super(game, options);
    }
}

class Loader
{
    constructor(game, specs, onCompleted, name)
    {
        console.log("======================== Loader ==================== " + name);
        numLoaders++;
        this.name = name || "Loader"+numLoaders; // just for debugging
        this.game = game;
        this.numPending = 0;
        this.onCompleted = onCompleted;
        if (specs)
            this.load(specs);
    }

    newGroupName() {
        numGroups++;
        return "_group_"+numGroups;
    }

    load(specs, parent, expectedType) {
	    try {
		    this.load_(specs, parent, expectedType);
	    }
    	catch (e) {
            reportError("error in load: "+e);
            throw(e);
    	}
    }

    load_(specs, parent, expectedType) {
        console.log("<<< load parent: "+parent+" expectedType: "+expectedType+"  specs: ",specs);
        var game = this.game;
    	var inst = this;
        if (!Array.isArray(specs))
            specs = [specs];
        var i = specs.length;
        specs.forEach(spec => {
            if (typeof spec === "string") {
                this.loadFile(spec);
                return;
            }
            if (Array.isArray(spec)) {
                this.load(spec, parent);
                return;
            }
            if (parent && !spec.parent) {
                console.log("Assigning parent to spec");
                spec.parent = parent;
            }
            //TODO: check for type and call appropriate loader
            // for now we just do collada
            if (spec.type == "Group") {
                this.loadGroup(spec);
                return;
            }
            if (spec.type == "Inline") {
                // for now just use Group.  This may have its own
                // code later, such as for loading from a path.
                this.loadGroup(spec);
                return;
            }
            if (spec.type == "Axes") {
                this.addAxes(spec);
                return;
            }
            if (spec.type == "Model") {
                this.loadModel(spec);
                return;
            }
            if (!spec.type && expectedType) {
                spec.type = expectedType;
            }
            if (expectedType && spec.type != expectedType) {
                Util.reportError("Loader expected type "+expectedType+" found "+spec.type);
            }
            console.log("expectedType: "+expectedType);
            if (!spec.type) {
                reportError("Groups should have type: Group");
                this.loadGroup(spec);
                return;
            }
            var obj = game.createNode(spec.type, spec);
            if (obj) {
                this.incrementNumPending();
                obj.then(() => { inst.handleCompletion(); });
            }
            else {
                reportError("Failed to create oject type: "+spec.type);
            }
        });
        console.log("**** Loader finished specs  numPending: "+this.numPending);
        if (this.numPending == 0)
            this.complete();
    }

    loadFile(path) {
        console.log("Loader.loadFile "+path);
        if (path.endsWith(".js")) {
            return this.loadJS(path);
        }
        if (path.endsWith(".json")) {
            return this.loadJSON(path);
        }
        reportError("Loader: Don't know how to load: "+path);
    }

    loadJS(path) {
        console.log("Loading JS file "+path);
        //alert("loadJS path: "+path);
        var inst = this;
        this.incrementNumPending();
        Util.getJSONFromScript(path,
                function(obj) {
                    var specs = obj;
                    console.log("Loaded specs: ", specs);
                    inst.load(specs);
                    inst.handleCompletion();
                },
                function(jqxhr, settings, ex) {
                    console.log("error: ", ex);
                    alert("Cannot load "+path);
                    inst.handleCompletion();
                }
        );
    }

    loadJSON(path) {
        console.log("Loading JSON specs "+path);
        var inst = this;
        this.incrementNumPending();
        Util.getJSON(path, specs => {
            inst.load(specs);
            inst.handleCompletion();
        });
    }

    loadModel(spec) {
        if (spec.type != 'Model') {
            Util.reportWarning("Model specs should have type: Model");
        }
        var modelNode = new ModelNode(game, spec);

        var path = spec.path;
        if (path.endsWith(".dae")) {
            this.incrementNumPending();
            loadCollada(spec.path, spec).then((collada) => {
                console.log("****** resolved collada load "+spec.path);
                game.setFromProps(collada.scene, spec);
                game.addToGame(collada.scene, spec.name, spec.parent);
                modelNode.setObject3D(collada.scene);
                this.handleCompletion(collada.scene, spec);
            });
            return;
        }
        if (path.endsWith(".fbx")) {
            this.incrementNumPending();
            loadFBXModel(path, spec, (obj) => {
                console.log("***** Loaded fbx "+path);
                game.setFromProps(obj, spec);
                game.addToGame(obj, spec.name, spec.parent);
                modelNode.setObject3D(obj);
                this.handleCompletion(obj, spec);
            });
        }
        if (path.endsWith(".obj")) {
            this.incrementNumPending();
            loadOBJModel(path, spec, (obj) => {
                //loadOBJModel0(path, spec, (obj) => {
                game.setFromProps(obj, spec);
                game.addToGame(obj, spec.name, spec.parent);
                modelNode.setObject3D(obj);
                this.handleCompletion(obj, spec);
            });
        }
    }

    incrementNumPending() {
        if (this.numPending == 0)
            PENDING_LOADERS[this.name] = this;
        this.numPending++;
    }

    handleCompletion(obj, spec) {
        if (spec && spec.castShadow) {
            obj.traverse(o => o.castShadow = spec.castShadow);
        }
        if (spec && spec.receiveShadow) {
            obj.traverse(o => o.receiveShadow = spec.receiveShadow);
        }

        this.numPending--;
        //console.log("handleCompletion "+this.name+" "+this.numPending);
        if (this.numPending > 0)
            return;
        delete PENDING_LOADERS[this.name];
        this.complete();
        //alert("All Models Loaded");
    }

    complete() {
        console.log("****************** Loader Completed: "+this.name);
        if (this.onCompleted)
            this.onCompleted();
    }

    loadGroup(groupSpec) {
        if (!groupSpec.name) {
            console.log("**** new groups must have name ****");
            reportError("**** new groups must have name ****");
            groupSpec.name = newGroupName();
        }
        var group = this.game.getGroup(groupSpec.name, groupSpec);
        this.game.setFromProps(group, groupSpec);
        if (groupSpec.children) {
            console.log("**** loading group children ****");
            this.load(groupSpec.children, groupSpec.name);
        }
    }

    addAxes(spec) {
        var size = 100;
        var axisHelper = new THREE.AxisHelper(size);
        game.setFromProps(axisHelper, spec);
        game.addToGame(axisHelper, spec.name, spec.parent);
    }
}

function loadFBXModel(path, opts, afterFun)
{
    report("loadFBXModel "+path);
    //var path = './DomeSpace.fbx';
    var manager = new THREE.LoadingManager();
    manager.onProgress = function( item, loaded, total ) {
        console.log( item, loaded, total );
    };
    //var loader = new THREE.FBXLoader( manager );
    var loader = new FBXLoader( manager );
    loader.load( path,
        function( object ) {
            /*
                       object.mixer = new THREE.AnimationMixer( object );
                       mixers.push( object.mixer );
                       var action = object.mixer.clipAction( object.animations[ 0 ] );
                       action.play();
                     */
            if (afterFun) {
                afterFun(object, opts);
            }
        },
        function() {
            console.log("-----> load FBXModel <-----");
        },
        function (e) {
            report("************* Error loading FBX file "+path+"\n"+e);
        }
    );
}

function loadOBJModel0(path, opts, afterFun)
{
    var manager = new THREE.LoadingManager();
    var loader = new OBJLoader( manager );

    var onProgress = function ( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round(percentComplete, 2) + '% downloaded '+path );
        }
    };
    var onError = function ( xhr ) {
    };

    loader.load( path, function ( object ) {
        object.traverse( function ( child ) {
            if ( child instanceof THREE.Mesh ) {
                //child.material.map = texture;
            }
        } );
        if (afterFun) {
            afterFun(object);
            //object.position.y = 0;
            //console.log("adding loaded model to scene");
            //OBJM = object;
            //scene.add( object );
        }
    }, onProgress, onError );
}

function loadOBJModel(path, opts, afterFun)
{
    THREE.Loader.Handlers.add( /\.dds$/i, new DDSLoader() );

    var mtlLoader = new MTLLoader();
    var mtlPath = path.replace(".obj", ".mtl")

    var onProgress = function ( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round(percentComplete, 2) + '% downloaded '+path );
        }
    };
    var onError = function ( xhr ) {
    };

    var i = path.lastIndexOf("/");
    var dir = "/";
    if (i >= 0) {
        dir = path.slice(0,i+1);
        mtlPath = mtlPath.slice(i);
    }
    mtlLoader.setPath( dir );
    mtlLoader.load( mtlPath, function( materials ) {
        console.log(">>> Got materials");
        materials.preload();
        var objLoader = new OBJLoader();
        objLoader.setMaterials( materials );
        //objLoader.setPath( dir );
        objLoader.load( path, function ( object ) {
            object.position.y = 0;
            console.log(">>> adding loaded model to scene");
            if (afterFun) {
                afterFun(object, opts);
            }
        }, onProgress, onError );
    });
}

MUSE.PENDING_LOADERS = PENDING_LOADERS;

export {Loader};
