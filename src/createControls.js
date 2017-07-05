import VRControls from './lib/controls/VRControls';
import PointerLockControls from './lib/controls/PointerLockControls';
import VREffect from './lib/effects/VREffect';

export default (renderer, scene, camera) => {
	let vrControls = new VRControls(camera);
	vrControls.shouldUpdatePosition = false;
	// vrControls.standing = true;

	let vrEffect = new VREffect(renderer);
	vrEffect.autoSubmitFrame = false;

	// Allow the PointerLockControls to create the body,
	// even if we do not use the controls for movement.
	let plControls = new PointerLockControls(camera);

	return {plControls, vrControls, vrEffect};
};
