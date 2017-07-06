import * as THREE from 'three';

const Y_AXIS = new THREE.Vector3(0, 1, 0);
const NINETY = Math.PI / 2;

// Chrome and Firefox implemented gamepads different.
// Chrome prefers polling for the gamepads.
// Firefox will update the gamepad object.
window.addEventListener('gamepadconnected', (e) => {
  console.log('gamepad connected: ' + e.gamepad.id);
});

window.addEventListener('gampaddisconnected', (e) => {
  console.log('gamepad disconnected');
});

class NavigationController {

  constructor(body, camera, plControls) {
    this.body = body;
    this.camera = camera;
    this.direction = new THREE.Vector3();
    this.plControls = plControls;
    this.keys = new Set();

    window.addEventListener('keydown', (e) => {
      this.keys.add(e.keyCode);
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.keyCode);
    });
  }

  update() {
    if (this.plControls && this.plControls.enabled) {
      this.plControls.getDirection(this.direction);
    } else {
      camera.getWorldDirection(this.direction);
    }

    // Do not allow gamepad controls when pointerlock controls are enabled.
    if (navigator.getGamepads && this.plControls && !this.plControls.enabled) {
      let gamepadList = navigator.getGamepads();
      let gamepad = gamepadList[0];

      if (gamepad) {
        let {axes} = gamepad;
        let axisX = axes[0];
        let axisY = axes[1];

        if (axisY < -0.5) {
          this.body.translateX(0.01 * this.direction.x);
          this.body.translateZ(0.01 * this.direction.z);
        } else if (axisY > 0.5) {
          this.body.translateX(-0.01 * this.direction.x);
          this.body.translateZ(-0.01 * this.direction.z);
        }

        if (axisX > 0.5) {
          // TODO: refactor into function
          let right = this.direction.clone().applyAxisAngle(Y_AXIS, -NINETY);
          this.body.translateX(0.01 * right.x);
          this.body.translateZ(0.01 * right.z);
        } else if (axisX < -0.5) {
          // TODO: refactor into function
          let left = this.direction.clone().applyAxisAngle(Y_AXIS, NINETY);
          this.body.translateX(0.01 * left.x);
          this.body.translateZ(0.01 * left.z);
        }
      }
    }

    this.keys.forEach((keyCode) => {
      if (keyCode == 87) { // Move forward incrementally with W
        // PointerLockControls do not move the camera.
        if (!this.plControls.enabled) {
          this.body.translateX(0.1 * this.direction.x);
          this.body.translateZ(0.1 * this.direction.z);
        } else {
          this.body.translateZ(-0.1);
        }
      }

      if (keyCode == 65) { // Move left incrementally with A
        // PointerLockControls do not move the camera.
        if (!this.plControls.enabled) {
          let left = this.direction.clone().applyAxisAngle(Y_AXIS, NINETY);
          this.body.translateX(0.1 * left.x);
          this.body.translateZ(0.1 * left.z);
        } else {
          this.body.translateX(-0.1);
        }
      }

      if (keyCode == 68) { // Move right incrementally with D
        if (!this.plControls.enabled) {
          // PointerLockControls do not move the camera.
          let right = this.direction.clone().applyAxisAngle(Y_AXIS, -NINETY);
          this.body.translateX(0.1 * right.x);
          this.body.translateZ(0.1 * right.z);
        } else {
          this.body.translateX(0.1);
        }
      }

      if (keyCode == 83) { // Move left incrementally with S
        // PointerLockControls do not move the camera.
        if (!this.plControls.enabled) {
          this.body.translateX(-0.1 * this.direction.x);
          this.body.translateZ(-0.1 * this.direction.z);
        } else {
          this.body.translateZ(0.1);
        }
      }
    });
  }
}

export default NavigationController;