
import * as THREE from 'three'
import {Game} from 'core/Game'
import {MUSENode} from 'core/Node';
import {Node3D} from 'core/Node3D';
import {Chakra} from './Chakra';
import {ISPIRAL} from './ISPIRAL';

var imageList = [];
ISPIRAL.imageList = imageList;

for (var i=1; i<=178; i++) {
    imageList[i] = "assets/images/Spirals/imagesRoundedPow2/image"+i+".png";
}


class SpiralNode extends Node3D {
    constructor(game, opts) {
        super(game, opts);
        console.log("SpiralNode: ", opts);
        this.group = new THREE.Group();
        this.setObject3D(this.group);
        this.addImageSpiral();
        game.addToGame(this.group, this.name, opts.parent);
        this.t0 = null;
    }

    addImageSpiral() {
        console.log("imageList: ", imageList);
        this.imageSpiral = new ISPIRAL.ImageSpiral(imageList);
        this.group.add(this.imageSpiral.images);
        this.ballSpiral = new ISPIRAL.BallSpiral(30);
        this.group.add(this.ballSpiral.group);

    }

    update(arg) {
        var t = MUSE.Util.getClockTime();
        if (this.t0 == null)
            this.t0 = t;
        var dt = t - this.t0;
        if (this.imageSpiral)
            this.imageSpiral.update(dt);
        if (this.ballSpiral)
            this.ballSpiral.update(-0.5*dt);
        //ISPIRAL.update(dt);
        //console.log("SpiralNode: "+arg);
    }
}

function addSpiral(game, opts)
{
    var spiral = new SpiralNode(game, opts);
    //game.setFromProps(ve.group, opts);
    //game.addToGame(ve.group, opts.name, opts.parent);
    game.registerController(opts.name, spiral);
    return spiral;
}

Game.registerNodeType("Spiral", addSpiral);
