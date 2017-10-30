
import * as THREE from 'three'
import {Game} from '../../src/Game'

class SpiralNode {
    constructor(opts) {
        console.log("SpiralNode: ", opts);
    }

    update(arg) {
        console.log("SpiralNode: "+arg);
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
