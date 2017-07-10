import * as THREE from 'three';

import {marquee as marqueeSpec} from './const/screen';

import html2canvas from 'html2canvas';

let {degToRad} = THREE.Math;

let STYLE = `
	color: white;
	font-family: arial;
	font-size: 72px;
	text-align: center;
`;

class Marquee extends THREE.Mesh {

    constructor() {
        super();
        this.type = 'Marquee';

        this._width = window.innerWidth;
        this._height = window.innerHeight;

        // Because this mesh has a transparent background,
        // it must render after other objects for blending to happen properly.
        this.renderOrder = 1;
        this.handleRender = this.handleRender.bind(this);

        this._element = document.createElement('div');
        this._element.setAttribute('style', STYLE);
        document.body.appendChild(this._element);

	    this.material = new THREE.MeshBasicMaterial({
	    	map: null,
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

        this.updateHTML("<h1>TESTING!!!</h1>");
    }

    handleRender(canvas) {
	  	let texture = new THREE.Texture(canvas);
	    texture.needsUpdate = true;
	    texture.wrapS = THREE.RepeatWrapping;
        texture.repeat.x = -1;

        this.material.map = texture;
    }

    updateHTML(html) {
        this._element.innerHTML = html;

        html2canvas(
        	this._element,
        	{
	            width: this._width,
	            height: this._height,
	            useCORS: true,
	            onrendered: this.handleRender,
	        }
        );
    }
}

export default Marquee;
