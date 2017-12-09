
import * as THREE from 'three';
import ImageSource from './lib/ImageSource';
import Util from './Util';

var idx = 0;
var colors = [
    0x0000ff,
    0x00ff00,
    0xff0000,
    0x00ffff,
    0xff00ff,
    0xffff00,
    // 0x00000f,
    // 0x000f00,
    // 0x0f0000,
    // 0x000f0f,
    // 0x0f000f,
    // 0x0f0f00,
    // 0x404040,
    // 0x808080,
    0xcccccc,
    0xffffff
];

//class Avatar extends THREE.Mesh {
class Avatar {
    constructor(game, name, props) {
        this.game = game;
        this.name = name;
        var radius = props.radius || .3;
        idx++;
        //var color = colors[idx % colors.length];
        var color = colors[Util.randomIntFromInterval(0, colors.length)];
        let material = new THREE.MeshBasicMaterial({
            transparent: true,
            side: THREE.DoubleSide,
            // color
        });
        let group = new THREE.Object3D();
        let arrowGeometry = new THREE.CylinderGeometry( 0, .1, .5, .12 );
        arrowGeometry.rotateX( - Math.PI / 2 );
        let arrowMaterial = new THREE.MeshLambertMaterial({ color });
        let arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
        //arrow.position.set(0, -.7, 0.5);
        group.add(arrow);

        //let billboardGeometry = new THREE.SphereGeometry(radius);
        let billboardGeometry = new THREE.BoxGeometry(4/3.0, 1, 0.01);
        billboardGeometry.rotateY( Math.PI );
        let billboard = new THREE.Mesh(billboardGeometry, material);
        billboard.position.set(0, .7, 0.3);
        this.billboard = billboard;
        group.add(billboard);
        this.obj = group;
        this.game.addToGame(this.obj)
        this.setProps(props);
        this.material = material;
    }

    setProps(props)
    {
        let position = props.position;
        let rotation = props.rotation;
        console.log("Avatar "+this.name+" "+position);
        this.game.setFromProps(this.obj, {position, rotation});
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
        this.billboard.material = videoMaterial;
    }
}

export {Avatar};
