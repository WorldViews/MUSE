import * as THREE from 'three';

import {marquee as marqueeSpec} from './const/screen';

let {degToRad} = THREE.Math;

class Marquee extends THREE.Mesh {

	constructor() {
		super();
		this.type = 'Marquee';

		this._width = window.innerWidth;
		this._height = window.innerHeight;

		this._canvas = document.createElement('canvas');
		this._canvas.width = this._width;
		this._canvas.height = this._height;
		this._context = this._canvas.getContext('2d');

		this._context.font = 'Normal 120px Arial';
		this._context.textAlign = 'center';
		this._context.fillStyle = 'white';
		this._context.fillText('MARQUEE TESTING...', this._width / 2, this._height / 2);
		
		this._texture = new THREE.Texture(this._canvas);
		this._texture.needsUpdate = true;
		this._texture.wrapS = THREE.RepeatWrapping;
		this._texture.repeat.x = -1;

		this.material = new THREE.MeshBasicMaterial({
			map: this._texture,
			side: THREE.BackSide,
			transparent: true,
		});
		this.geometry = new THREE.SphereGeometry(
		    marqueeSpec.radius,
		    40,
		    40,
		    degToRad(marqueeSpec.phiStart),
		    degToRad(marqueeSpec.phiLength),
		    degToRad(marqueeSpec.thetaStart),
		    degToRad(marqueeSpec.thetaLength)
		);

		// Because this mesh has a transparent background, 
		// it must render after other objects for blending to happen properly.
		this.renderOrder = 1;
	}

	updateText(text) {
		this._context.clearRect(0, 0, this._width, this._height);
		this._context.fillText(text, this._width / 2, this._height / 2);
		this._texture.needsUpdate = true;
	}
}

export default Marquee;
