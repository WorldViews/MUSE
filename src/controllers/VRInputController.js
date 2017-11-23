import OBJLoader from '../lib/loaders/OBJLoader';
import * as THREE from 'three';
import VRController from '../lib/vr/VRController';
import datGUIVR from 'datguivr';
import 'yuki-createjs/lib/tweenjs-0.6.2.combined';
import LaserBeam from '../objects/LaserBeam';
import Util from '../Util';

const {degToRad} = THREE.Math;

const Y_AXIS = new THREE.Vector3(0, 1, 0);
const NINETY = Math.PI / 2;

const VIVE_PATH = 'models/vive-controller/';
const OBJ_NAME = 'vr_controller_vive_1_5.obj';
const TEXTURE_NAME = 'onepointfive_texture.png';
const SPEC_MAP_NAME = 'onepointfive_spec.png';
const SPEED = 1 / 500; // one unit per sec

const OCULUS_PATH = 'models/oculus-controller/';
const OCULUS_LEFT_OBJ = 'oculus_cv1_controller_left.obj';
const OCULUS_RIGHT_OBJ = 'oculus_cv1_controller_right.obj';
const OCULUS_TEXTURE_NAME = 'external_controller01_col.png';
const OCULUS_SPEC_MAP_NAME = 'external_controller01_spec.png';


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

export default class VRInputController {

    constructor(scene, body, camera, vrType) {
        this.scene = scene;
        this.body = body;
        this.camera = camera;
        this.type = vrType;
        this.direction = new THREE.Vector3();

        this.controller0 = new VRController(0);
        this.controller1 = new VRController(1);

        this.body.add(this.controller0);
        this.body.add(this.controller1);

        this.raycaster = new THREE.Raycaster();
        this.tempMatrix = new THREE.Matrix4();

        // let lineGeometry = new THREE.Geometry();
        // lineGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
        // lineGeometry.vertices.push(new THREE.Vector3(0, 0, -1));
        // let lineMaterial = new THREE.LineBasicMaterial({color: 0x000000});

        // this.line = new THREE.Line(lineGeometry, lineMaterial);
        // this.line.scale.z = 12;

        this.line = new LaserBeam();
        this.line.name = 'line';
        this.line.rotation.y = Math.PI/2;

        // let circleGeometry = new THREE.CircleGeometry(0.1, 32);
        // let circleMaterial = new THREE.MeshBasicMaterial({color: 0xffff00});
        // this.selector = new THREE.Mesh(circleGeometry, circleMaterial);
        // this.selector.visible = false;
        // this.selector.rotation.x = degToRad(-90);
        // this.scene.add(this.selector);

        this.controller1.add(this.line);
        this.controller0.addEventListener('triggerup', this.triggerRaycast.bind(this));
        this.controller1.addEventListener('triggerup', this.triggerRaycast.bind(this));

        this.loadControllerModel();
    }

    triggerRaycast() {
        if (this.selectedObject) {
            Util.dispatchMuseEvent('click', this.selectedObject.object);
        }
    }

    loadControllerModel() {
        var gamepadModel = 'vive';
        if (this.type === 'Oculus VR HMD') {
            gamepadModel = 'oculus';
        }

        switch (gamepadModel) {
            case 'vive':
                this.loadViveControllerModel();
                break;

            case 'oculus':
                this.loadOculusControllerModel();
                break;
        }

        let controllers = navigator.getGamepads()
        const guiInputRight = datGUIVR.addInputObject(this.controller1);
        game.scene.add(guiInputRight);

        this.controller1.addEventListener( 'triggerdown', ()=>guiInputRight.pressed( true ) );
        this.controller1.addEventListener( 'triggerup', ()=>guiInputRight.pressed( false ) );
        this.controller1.addEventListener( 'menudown', ()=> game.controllers.ui.toggleUI() );
    }

    loadViveControllerModel() {
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

    loadOculusControllerModel() {
        let objLoader = new OBJLoader();
        objLoader.setPath(OCULUS_PATH);

        let textureLoader = new THREE.TextureLoader();
        textureLoader.setPath(OCULUS_PATH);

        loadAll([
            {loader: objLoader, file: OCULUS_LEFT_OBJ},
            {loader: objLoader, file: OCULUS_RIGHT_OBJ},
            {loader: textureLoader, file: OCULUS_TEXTURE_NAME},
            {loader: textureLoader, file: OCULUS_SPEC_MAP_NAME}
        ]).then(([objectLeft, objectRight, texture, specMap]) => {
            let left = objectLeft.children[0];
            left.rotation.x = 45;
            left.position.y = 0.05;
            left.material.map = texture;
            left.material.specularMap = specMap;

            let right = objectRight.children[0];
            right.rotation.x = 45;
            right.position.y = 0.05;
            right.material.map = texture;
            right.material.specularMap = specMap;

            this.controller0.add(left);
            this.controller1.add(right);
        });
    }


    getIntersections(controller) {
        //let floor = this.scene.getObjectByName('Floor');

        //if (floor) {
        let objs = game.collision;
        if (objs) {
            this.tempMatrix.identity().extractRotation(controller.matrixWorld);

            this.raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
            this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(this.tempMatrix);

            return this.raycaster.intersectObjects(objs, true);
        }
    }

    handleRaycast(dt) {
        if (!this.controller0.getButtonState('grips') &&
            !this.controller1.getButtonState('grips')) {
            this.line.visible = false;
            return;
        }

        // right controller wins
        let controller = this.controller1.getButtonState('grips') ? this.controller1 : this.controller0;
        if (this.line.parent != controller) {
            this.line.parent.remove(this.line);
            controller.add(this.line);
        }
        this.line.visible = true;
        let intersections = this.getIntersections(controller);

        if (this.tween) {
            let {position} = this.body;
            let {dx, dz, x, z, duration} = this.tween;
            let proportion = dt / duration;
            let moveXBy = dx * proportion;
            let moveZBy = dz * proportion;

            position.x += moveXBy;
            position.z += moveZBy;

            // Stop the tween when it arrives.
            if (
                ((dx >= 0 && position.x >= x || dx <= 0 && position.x <= x)) ||
                    ((dz >= 0 && position.z >= z || dz <= 0 && position.z <= z))
            ) {
                delete this.tween;
            }
        }

        if (intersections && intersections.length > 0) {
            let isTriggerPressed = this.controller0.getButtonState('trigger');
            let intersection = intersections[0];
            this.selectedObject = intersection;
            if (isTriggerPressed && intersection.object.parent.name === 'Floor') {
                let {distance, point: {x, z}} = intersection;
                let duration = distance / SPEED;
                let dx = x - this.body.position.x;
                let dz = z - this.body.position.z;

                this.tween = {dx, dz, x, z, duration, ellapsed: 0, traveled: 0};
            }
            this.line.scale.x = intersection.distance;
            this.line.sprite.visible = true;
    } else {
            //this.selector.visible = true;
            this.selectedObject = null;
            this.line.scale.x = 5;
            this.line.sprite.visible = false;
        }
    }

    handleJoystickMovement(dt) {
        let axes = this.controller0.getAxes();
        let axisX = axes[0];
        let axisY = axes[1];

        this.camera.getWorldDirection(this.direction);

        if (axisY < -0.5) {
            this.body.translateX(0.02 * this.direction.x);
            this.body.translateZ(0.02 * this.direction.z);
        } else if (axisY > 0.5) {
            this.body.translateX(-0.02 * this.direction.x);
            this.body.translateZ(-0.02 * this.direction.z);
        }

        if (axisX > 0.5) {
            // TODO: refactor into function
            let right = this.direction.clone().applyAxisAngle(Y_AXIS, -NINETY);
            this.body.translateX(0.02 * right.x);
            this.body.translateZ(0.02 * right.z);
        } else if (axisX < -0.5) {
            // TODO: refactor into function
            let left = this.direction.clone().applyAxisAngle(Y_AXIS, NINETY);
            this.body.translateX(0.02 * left.x);
            this.body.translateZ(0.02 * left.z);
        }

        let rotAxes = this.controller1.getAxes();
        let rotAxisX = rotAxes[0];
        let rotAxisY = rotAxes[1];
        let oldRot = this.body.rotation.y;
        let rotMagnitude = (Math.PI/400);
        if (rotAxisX > 0.3) {
            oldRot -= rotMagnitude*Math.abs(rotAxisX);
            this.body.rotation.set(0, oldRot, 0)
        } else if (rotAxisX < -0.3) {
            oldRot += rotMagnitude*Math.abs(rotAxisX);
            this.body.rotation.set(0, oldRot, 0)
        }
    }

    update(timestamp) {
        let dt = timestamp - this._last || timestamp;
        this._last = timestamp;
        this.handleRaycast(dt);
        this.handleJoystickMovement(dt);

        this.controller0.update();
        this.controller1.update();
    }
};
