import {Animation, SkinnedMesh} from 'three';

import ColladaLoader from 'lib/loaders/ColladaLoader';

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
                resolve(collada);
            },
            () => {},
            reject
        );
    });
};
