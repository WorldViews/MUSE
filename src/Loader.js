
import loadCollada from './loadCollada'
import OBJLoader from './lib/loaders/OBJLoader';
import MTLLoader from './lib/loaders/MTLLoader';
import DDSLoader from './lib/loaders/DDSLoader';
import {FBXLoader} from './lib/loaders/FBXLoader';
import {getJSON} from './Util';

/*
  Loader class.  This loads models or creates nodes corresponding to
  things in the scene, or functionality.

  specs is an array of objects, each with the following fields
  type   -   Which type of node to be loaded or created
  path   -   The URL of the model to be loaded
  name   -   A named to be assigned to the loaded
  model that can be used to access it
  from game.models
  position   Optional position to place it at
  rotation   Optional rotation (array in radians)
  scale      Optional scale, if scalar, uniform scalling
*/

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

var numGroups = 0;

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
            console.log( Math.round(percentComplete, 2) + '% downloaded' );
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
            console.log( Math.round(percentComplete, 2) + '% downloaded' );
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

class Loader
{
    constructor(game, specs, onCompleted)
    {
        console.log("======================== Loader ========================");
        this.game = game;
        this.numPending = 0;
        this.onCompleted;
        if (specs)
            this.load_(specs);
    }

    newGroupName() {
        numGroups++;
        return "_group_"+numGroups;
    }

    load(specs, parent) {
	var inst = this;
	return new Promise((fulfill, reject) => {
	    try {
		inst.load_(specs, parent);
		fulfill();
	    }
	    catch (e) {
		console.log("error in load: "+e);
		reject(e);
	    }
        });
    }

    load_(specs, parent) {
        console.log("<<< load parent: "+parent+"   specs: "+JSON.stringify(specs));
        var game = this.game;
	var inst = this;
	if (typeof specs == "string") {
	    var path = specs;
	    $.getScript(path)
                .done(function(script, textStatus) {
                    console.log("AFTER SPECS: ", SPECS);
                    inst.load(SPECS);
                 })
                 .fail(function(jqxhr, settings, ex) {
                     console.log("error: ", ex);
		     alert("failed to load "+path);
                 });
	    return;
	}
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
            if (!spec.type) {
                reportError("Groups should have type: Group");
                this.loadGroup(spec);
                return;
            }
            var obj = game.createNode(spec.type, spec);
            if (!obj) {
                reportError("Unknown loader oject type: "+spec.type);
            }
        });
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
        var inst = this;
        $.getScript(path)
            .done(function(script, textStatus) {
                console.log("AFTER SPECS: ", SPECS);
                inst.load(SPECS);
            })
            .fail(function(jqxhr, settings, ex) {
                console.log("error: ", ex);
            });
    }

    loadJSON(path) {
        console.log("Loading JSON specs "+path);
        return this.loadJS(path);
        var inst = this;
        getJSON(path, specs => { inst.load(specs); });
    }

    loadModel(spec) {
        if (spec.type != 'Model') {
            reportWarning("Model specs should have type: Model");
        }
        var path = spec.path;
        if (path.endsWith(".dae")) {
            this.numPending++;
            loadCollada(spec.path, spec).then((collada) => {
                game.setFromProps(collada.scene, spec);
                game.addToGame(collada.scene, spec.name, spec.parent);
                this.numPending--;
                if (this.numPending === 0) {
                    this.handleCompletion();
                }
            });
            return;
        }
        if (path.endsWith(".fbx")) {
            this.numPending++;
            loadFBXModel(path, spec, (obj) => {
                console.log("***** Loaded fbx "+path);
                game.setFromProps(obj, spec);
                game.addToGame(obj, spec.name, spec.parent);
                this.numPending--;
                if (this.numPending === 0) {
                    this.handleCompletion();
                }
            });
        }
        if (path.endsWith(".obj")) {
            this.numPending++;
            loadOBJModel(path, spec, (obj) => {
                //loadOBJModel0(path, spec, (obj) => {
                game.setFromProps(obj, spec);
                game.addToGame(obj, spec.name, spec.parent);
                this.numPending--;
                if (this.numPending === 0) {
                    this.handleCompletion();
                }
            });
        }
    }

    handleCompletion() {
        console.log("****************** MODELS ALL LOADED ******************");
        if (this.onCompleted)
            this.onCompleted();
        //alert("All Models Loaded");
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

export {Loader};
