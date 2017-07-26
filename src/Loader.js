
import loadCollada from './loadCollada'

//function loadModels(specs, scene)
/*
  Load models.  specs is an array of objects, each
  with the following fields
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

class Loader
{
    constructor(game, specs)
    {
        console.log("======================== Loader ========================");
        this.game = game;
        if (specs)
            this.load(specs);
    }
    
    newGroupName() {
        numGroups++;
        return "_group_"+numGroups;
    }
    
    load(specs, parent) {
        console.log("<<< load parent: "+parent+"   specs: "+JSON.stringify(specs));
        var game = this.game;
        if (!Array.isArray(specs))
            specs = [specs];
        var i = specs.length;
        
        return new Promise((resolve, reject) => {
            specs.forEach(spec => {
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
                if (spec.type == "Axes") {
                    this.addAxes(spec);
                    return;
                }
	        if (spec.type == "Model") {
                    if (!spec.type) {
                        reportWarning("Model specs should have type: Model");
                    }
                    loadCollada(spec.path, spec).then((collada) => {
		        game.setFromProps(collada.scene, spec);
		        game.addToGame(collada.scene, spec.name, spec.parent);
		        --i;
		        if (i === 0) {
                            resolve();
		        }
                    });
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
        });
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
