import {Animation, SkinnedMesh} from 'three';

import ColladaLoader from './lib/loaders/ColladaLoader';

export default (path, transforms) => {
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

        if (Array.isArray(transforms.position)) {
          scene.position.fromArray(transforms.position);
        }

        // Rotation array must be in radians!
        if (Array.isArray(transforms.rotation)) {
          scene.rotation.fromArray(transforms.rotation);
        }

        if (Array.isArray(transforms.scale)) {
          scene.scale.fromArray(transforms.scale)
        }

        scene.updateMatrix();

        resolve(collada);
      },
      () => {},
      reject
    );  
  });
};
