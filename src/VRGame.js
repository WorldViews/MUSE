import {Game} from './Game';
import * as THREE from 'three';
import PointerLockControls from './lib/controls/PointerLockControls';
import ViveControllerController from './controllers/ViveControllerController';
import VRControls from './lib/controls/VRControls';
import VREffect from './lib/effects/VREffect';
import WebVR from './lib/vr/WebVR';

import attachPointerLock from './attachPointerLock';

class VRGame extends Game {

    constructor(domElementId, options) {
        super(domElementId, options);
        this.vrDisplay = null;
        this.vrControls = null;
        this.plControls = null;

        this.addControls();

        if (WebVR.isAvailable())  {
            WebVR.getVRDisplay((display) => {
                let {domElement} = this.renderer.getUnderlyingRenderer();
                let button = WebVR.getButton(display, domElement);
                document.body.appendChild(button);
                this.vrDisplay = display;
            });
        }
    }

    /**
	 * Override requestAnimationFrame implemenation.
	 */
    setupRAF() {
        this.requestAnimate = this.renderer.requestAnimationFrame.bind(
            this.renderer,
            this.animate.bind(this)
        );
    }

    addControls() {
        if (WebVR.isAvailable()) {
            this.addVRControls();
        } else {
            this.addPointlockControls();
        }
    }

    addVRControls() {
        this.vrControls = new VRControls(this.camera);
        this.registerController('vr', this.vrControls);

        this.body = new THREE.Object3D();
        this.scene.add(this.body);
        this.body.add(this.camera);

        this.viveControllerController = new ViveControllerController(this.scene, this.body);
        this.registerController('viveControls', this.viveControllerController);
    }

    addPointlockControls() {
        this.plControls = new PointerLockControls(this.camera);

        // Allow the PointerLockControls to create the body,
        // even if we do not use the controls for movement.
        this.body = this.plControls.getObject();
        this.scene.add(this.body);

        attachPointerLock(this.plControls);
    }

    /**
	 * Overrides `this.renderer`.
	 */
    createRenderer(domElementId) {
        let renderer = super.createRenderer(domElementId);
        let vrEffect = new VREffect(renderer);
        vrEffect.autoSubmitFrame = false;

        return vrEffect;
    }

    render() {
        super.render();

        if (this.vrDisplay && this.vrDisplay.isPresenting) {
            this.vrDisplay.submitFrame();
        }
    }
}

export default VRGame;
