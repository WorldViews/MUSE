
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
function loadModels(specs, game) {
    var i = specs.length;

    return new Promise((resolve, reject) => {
	specs.forEach(spec => {
	    //TODO: check for type and call appropriate loader
	    // for now we just do collada
	    if (spec.path) {
		loadCollada(spec.path, spec).then((collada) => {
		    game.setFromProps(collada.scene, spec);
		    game.addToGame(collada.scene, spec.name, spec.parent);
		    --i;
		    if (i === 0) {
			resolve();
		    }
		});
	    }
	    else {
		// if no path, assume we are just creating a new group
		// (should we requre a type field?)
		if (!spec.name) {
		    console.log("**** new groups must have name ****");
		    reportError("**** new groups must have name ****");
		    return;
		}
		console.log("**** defining an empty named group: "+spec.name);
		var group = game.getGroup(spec.name, spec);
		--i;
		if (i === 0) {
		    resolve();
		}
	    }
	});
    });
}

export default loadModels;
