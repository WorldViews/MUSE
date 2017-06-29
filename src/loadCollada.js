import {Animation, SkinnedMesh} from 'three';

import ColladaLoader from './lib/loaders/ColladaLoader';

function scaleVec(s)
{
    if (typeof s == "number")
	return [s,s,s];
    return s;
}

export default (path, opts) => {
  return new Promise((resolve, reject) => {
    let loader = new ColladaLoader();
    loader.options.convertUpAxis = true;
    loader.load(
      path,
      (collada) => {
        let {scene} = collada;
        
        scene.traverse(child => {
          if (child instanceof SkinnedMesh) {
            let animation = new Animation(child, child.geometry.animation);
            animation.play();
            console.log('animating...');
          }
        });

        if (Array.isArray(opts.position)) {
          scene.position.fromArray(opts.position);
        }

        // Rotation array must be in radians!
        if (Array.isArray(opts.rotation)) {
          scene.rotation.fromArray(opts.rotation);
        }

        //if (Array.isArray(opts.scale)) {
        //  scene.scale.fromArray(opts.scale)
        //}
	if (opts.scale)
	  scene.scale.fromArray(scaleVec(opts.scale));

        scene.updateMatrix();

        resolve(collada);
      },
      () => {},
      reject
    );  
  });
};
