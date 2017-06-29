
import loadCollada from './loadCollada'

function loadModels(specs, scene)
{
    specs.forEach(spec => {
	loadCollada(spec.path, spec).then((collada) => {
	    scene.add(collada.scene);
	});
    });
}

export default loadModels;
