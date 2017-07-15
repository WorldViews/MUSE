import OBJLoader from '../lib/loaders/OBJLoader';
import ViveController from '../lib/vr/ViveController';

const VIVE_PATH = 'models/vive-controller/';
const OBJ_NAME = 'vr_controller_vive_1_5.obj';
const TEXTURE_NAME = 'onepointfive_texture.png';
const SPEC_MAP_NAME = 'onepointfive_spec.png';

function loadAll(loaderFilePairs) {
    return Promise.all(
        loaderFilePairs.map(
            ({loader, file}) => (
                new Promise((resolve) => {
                    loader.load(file, resolve);
                })
            )
        )
    );
}

export default class ViveControllerController {

	constructor(scene, vrControls) {
		this.scene = scene;
		this.vrControls = vrControls;

        this.controller0 = new ViveController(0);
        this.controller1 = new ViveController(1);

        // this.controller0.standingMatrix = this.vrControls.getStandingMatrix();
        // this.controller1.standingMatrix = this.vrControls.getStandingMatrix();

        this.scene.add(this.controller0);
        this.scene.add(this.controller1);

        let objLoader = new OBJLoader();
        objLoader.setPath(VIVE_PATH);
   
        let textureLoader = new THREE.TextureLoader();
        textureLoader.setPath(VIVE_PATH);

        loadAll([
            {loader: objLoader, file: OBJ_NAME},
            {loader: textureLoader, file: TEXTURE_NAME},
            {loader: textureLoader, file: SPEC_MAP_NAME}
        ]).then(([object, texture, specMap]) => {
            let controller = object.children[0];
            controller.material.map = texture;
            controller.material.specularMap = specMap;

            this.controller0.add(controller.clone());
            this.controller1.add(controller.clone());
        });
	}

	update() {
		this.controller0.update();
		this.controller1.update();
	}
};
