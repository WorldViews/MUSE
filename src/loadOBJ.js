import OBJLoader from './lib/loaders/OBJLoader';

let objLoader = new OBJLoader();

export default (path, materials) => {
    return new Promise((resolve, reject) => {
        if (materials) {
            objLoader.setMaterials(materials);
        }

        objLoader.load(
            path,
            (object3d) => {
                objLoader.setMaterials(null);
                resolve(object3d);
            },
            () => {},
            (error) => {
                objLoader.setMaterials(null);
                reject(error);
            }
        );
    });
};
