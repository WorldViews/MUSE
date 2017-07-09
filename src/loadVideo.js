import * as THREE from 'three';
import ImageSource from './lib/ImageSource';

let DEAULT_SCREEN_SPEC = {
    x: 5.5,
    y: 2.5,
    z: -0.1,
    width: 6.5,
    height: 4.0,
    spherical: true
};

export default (path, spec) => {
    let textureSpec = {
        ...DEAULT_SCREEN_SPEC,
        ...spec
    };

    return new Promise((resolve, reject) => {
        let imageSource = new ImageSource({
            type: ImageSource.TYPE.VIDEO,
            url: path
        });

        let videoTexture = imageSource.createTexture();
        let videoMaterial = new THREE.MeshBasicMaterial({
            map: videoTexture,
            transparent: true,
            side: THREE.DoubleSide
        });

        resolve({imageSource, videoMaterial});
    });
};
