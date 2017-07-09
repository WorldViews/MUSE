import * as THREE from 'three';

import {marquee as marqueeSpec} from './const/screen';

import html2canvas from 'html2canvas';

let {degToRad} = THREE.Math;

class Marquee extends THREE.Mesh {

    constructor() {
        super();
        this.type = 'Marquee';

        this._width = window.innerWidth;
        this._height = window.innerHeight;

        // Because this mesh has a transparent background,
        // it must render after other objects for blending to happen properly.
        this.renderOrder = 1;

        var html = [
            '<div style="width: 100%; height: 100%; text-align: center; background-image: url(/textures/dot-bal.png); background-color: #ccc">',
            '<h1>Testing... from HTML</h1>',
            '<img src="/textures/dot-temp.png">',
            '</div>'].join('');
        this.updateHTML(html);
    }

    updateHTML(html) {
        var div = document.createElement('div');
        div.setAttribute('style', 'absolute; width: 512px; height: 512px;');
        div.innerHTML = html;
        document.body.appendChild(div);

        var self = this;
        html2canvas(div, {
            width: this._width,
            height: this._height,
            background: '#fff',
            useCORS: true,
            onrendered: (canvas) => {
                document.body.removeChild(div);
                self._canvas = canvas;
                self._context = canvas.getContext('2d');

                self._texture = new THREE.Texture(self._canvas);
                self._texture.needsUpdate = true;
                self.material = new THREE.MeshBasicMaterial({map: self._texture, side: THREE.BackSide});
                self.geometry = new THREE.SphereGeometry(
                    marqueeSpec.radius,
                    40,
                    40,
                    degToRad(marqueeSpec.thetaStart),
                    degToRad(marqueeSpec.thetaLength),
                    degToRad(marqueeSpec.phiStart),
                    degToRad(marqueeSpec.phiLength)
                );
            }
        });
    }
}

export default Marquee;
