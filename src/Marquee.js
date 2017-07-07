import * as THREE from 'three';

import {marquee as marqueeSpec} from './const/screen';

let {degToRad} = THREE.Math;

class Marquee extends THREE.Mesh {

	constructor() {
		super();
		this.type = 'Marquee';

		this._width = 512//window.innerWidth;
		this._height = 512//window.innerHeight;

		this._canvas = document.createElement('canvas');
		this._canvas.width = this._width;
		this._canvas.height = this._height;
		this._context = this._canvas.getContext('2d');

		this._context.font = 'Normal 40px Arial';
		this._context.textAlign = 'center';
		this._context.fillStyle = 'rgba(245,245,245,0.75)';
		this._context.fillText('TESTING...', this._width / 2, this._height / 2);
		
		this._texture = new THREE.Texture(this._canvas);
		this._texture.needsUpdate = true;
		this.material = new THREE.MeshBasicMaterial({map: this._texture, side: THREE.BackSide});
		this.geometry = new THREE.SphereGeometry(
		    marqueeSpec.radius,
		    40,
		    40,
		    degToRad(marqueeSpec.thetaStart),
		    degToRad(marqueeSpec.thetaLength),
		    degToRad(marqueeSpec.phiStart),
		    degToRad(marqueeSpec.phiLength)
		);
	}

	updateText(text) {
		this._context.clearRect(0, 0, this._width, this._height);
		this._context.fillText(text, this._width / 2, this._height / 2);
		this._texture.needsUpdate = true;
	}
}

export default Marquee;
