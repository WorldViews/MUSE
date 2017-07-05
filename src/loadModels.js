
import loadCollada from './loadCollada'

//function loadModels(specs, scene)
function loadModels(specs, scene, game)
{
    specs.forEach(spec => {
	loadCollada(spec.path, spec).then((collada) => {
	    scene.add(collada.scene);
	    if (game && spec.name) {
		game.models[spec.name] = collada;
	    }
	});
    });
}

export default loadModels;
