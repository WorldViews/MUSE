
import * as THREE from 'three';

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
        var radius = props.radius || 2;
        idx++;
        var color = colors[idx % colors.length];
	var material = new THREE.MeshBasicMaterial({color});
	var geometry = new THREE.SphereGeometry(radius);
        this.obj = new THREE.Mesh(geometry, material);
        this.game.addToGame(this.obj)
        this.setProps(props);
    }

    setProps(props)
    {
        var position = props.position;
        //console.log("Avatar "+this.name+" "+position);
        this.game.setFromProps(this.obj, {position});
    }
}

export {Avatar};
