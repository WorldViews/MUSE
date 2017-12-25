
import * as THREE from 'three'
import {Game} from 'core/Game'
import {MUSENode} from 'core/Node';
import {Node3D} from 'core/Node3D';
import {Chakra} from './Chakra';
import {ImageSpiral,BallSpiral} from './ISPIRAL';


class SpiralNode extends Node3D {
    constructor(game, opts) {
        super(game, opts);
        console.log("SpiralNode: ", opts);
        this.group = new THREE.Group();
        this.setObject3D(this.group);
        this.addImageSpiral();
        this.addBallSpiral(60);
        game.addToGame(this.group, this.name, opts.parent);
        this.t0 = null;
    }

    addImageSpiral() {
        this.imageList = [];
        for (var i=1; i<=178; i++) {
            this.imageList[i] = "assets/images/Spirals/imagesRoundedPow2/image"+i+".png";
        }
        console.log("imageList: ", this.imageList);
        this.imageSpiral = new ImageSpiral(this.imageList);
        this.group.add(this.imageSpiral.images);
    }

    addBallSpiral(numBalls) {
        this.ballSpiral = new BallSpiral(numBalls);
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
