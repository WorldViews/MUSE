
import * as THREE from 'three';
import ImageSource from './lib/ImageSource';

var idx = 0;
var colors = [
    0x0000ff,
    0x00ff00,
    0xff0000,
    0x00ffff,
    0xff00ff,
    0xffff00
];

//class Avatar extends THREE.Mesh {
class Avatar {
    constructor(game, name, props) {
        this.game = game;
        this.name = name;
        var radius = props.radius || .3;
        idx++;
        var color = colors[idx % colors.length];
        // var material = new THREE.MeshBasicMaterial({color});
        let material = new THREE.MeshBasicMaterial({
            // map: new THREE.Texture(),
            transparent: true,
            side: THREE.DoubleSide,
            color
        });
	    var geometry = new THREE.SphereGeometry(radius);
        this.obj = new THREE.Mesh(geometry, material);
        this.game.addToGame(this.obj)
        this.setProps(props);
        this.material = material;
    }

    setProps(props)
    {
        var position = props.position;
        //console.log("Avatar "+this.name+" "+position);
        this.game.setFromProps(this.obj, {position});
    }

    setStream(stream) {
        console.log("   ::: avatar set stream");

        let imageSource = new ImageSource({
            type: ImageSource.TYPE.MEDIASTREAM,
            stream: stream
        });
        let videoTexture = imageSource.createTexture();
        
        // show video for debugging
        //document.body.appendChild(imageSource.video);
        //$(imageSource.video).css({top:0, left:0, position: 'absolute', zIndex: 10000});

        let videoMaterial = new THREE.MeshBasicMaterial({
            map: videoTexture,
            transparent: true,
            side: THREE.DoubleSide
        });
        this.material = videoMaterial;
        this.obj.material = videoMaterial;
    }
}

export {Avatar};
