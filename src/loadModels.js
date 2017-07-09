
import loadCollada from './loadCollada'

//function loadModels(specs, scene)
function loadModels(specs, game) {
    var i = specs.length;

    return new Promise((resolve, reject) => {
	    specs.forEach(spec => {
            loadCollada(spec.path, spec).then((collada) => {
			    game.scene.add(collada.scene);

			    if (game && spec.name) {
                    game.models[spec.name] = collada;
			    }

			    --i;

			    if (i === 0) {
			    	resolve();
			    }
            });
	    });
    });
}

export default loadModels;
