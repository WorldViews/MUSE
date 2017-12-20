import {Game} from 'core/Game';
import * as THREE from 'three';
import PointerLockControls from 'gui/controls/PointerLockControls';
import VRInputController from 'gui/vr/VRInputController';
import VRHMD from 'lib/controls/VRHMD';
import VREffect from 'lib/effects/VREffect';
import WebVR from 'lib/vr/WebVR';

import attachPointerLock from 'core/attachPointerLock';

class VRGame extends Game {

    constructor(domElementId, options) {
        super(domElementId, options);
        this.vr = {};
        this.vr.display = null;
        this.vr.hmd = null;
        this.vr.controllers = null;

        if (WebVR.isAvailable())  {
            WebVR.getVRDisplay((display) => {
                let {domElement} = this.renderer.getUnderlyingRenderer();
                let button = WebVR.getButton(display, domElement);
                document.body.appendChild(button);
                this.vr.display = display;
                this.displayName = display.displayName;
                this.addControls();
            });
        }

        // create the VR body
        this.body = new THREE.Object3D();
        this.head = new THREE.Object3D();
        this.head.rotation.set(0, Math.PI*0.75, 0);
        this.head.add(this.camera);
        this.body.add(this.head);
        this.scene.add(this.body);
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
        this.vr.hmd = new VRHMD(this.camera);
        this.registerController('vrHMD', this.vr.hmd);

        this.vr.controllers = new VRInputController(this.scene, this.body, this.camera, this.displayName);
        this.registerController('vrController', this.vr.controllers);
    }

    addPointlockControls() {
        this.vr.controls = new PointerLockControls(this.camera);

        // Allow the PointerLockControls to create the body,
        // even if we do not use the controls for movement.
        this.body = this.plControls.getObject();
        this.scene.add(this.body);

        attachPointerLock(this.vr.controls);
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

        if (this.vr.display && this.vr.display.isPresenting) {
            this.renderer.submitFrame(this.scene, this.camera);
        }
    }
}

export default VRGame;
