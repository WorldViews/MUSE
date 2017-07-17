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

    constructor(spec) {
        super();
        spec = spec || marqueeSpec;
        this.type = 'Marquee';
        this._prevText = null;
        this._width = window.innerWidth;
        this._height = window.innerHeight;

        // Because this mesh has a transparent background,
        // it must render after other objects for blending to happen properly.
        this.renderOrder = 1;
        this.handleRender = this.handleRender.bind(this);

        this._element = document.createElement('div');
        this._element.setAttribute('style', STYLE);
        this._element.style.width = this._width + 'px';
        this._element.style.height = this._height + 'px';

        this._iframe = document.createElement('iframe');
        document.body.appendChild(this._iframe);
        this._iframe.contentDocument.body.appendChild(this._element);

        let texture = new THREE.Texture();
        this.material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide,
            transparent: true,
        });
        this.geometry = new THREE.SphereGeometry(
            spec.radius,
            40,
            40,
            degToRad(spec.phiStart),
            degToRad(spec.phiLength),
            degToRad(spec.thetaStart),
            degToRad(spec.thetaLength)
        );
    }

    handleRender(canvas) {
        let texture = new THREE.Texture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.repeat.x = -1;
        texture.needsUpdate = true;

        this.material.map = texture;
    }

    updateHTML(html) {
        this._element.innerHTML = html;

        html2canvas(
            this._element,
            {
                width: this._width,
                height: this._height,
                background: undefined,
                useCORS: true,
                onrendered: this.handleRender,
            }
        );
    }

    updateText(text) {
        if (text == this._prevText)
            return;
        this._prevText = text;
        this.updateHTML(`<h1>${text}</h1>`);
    }
}

export default Marquee;
