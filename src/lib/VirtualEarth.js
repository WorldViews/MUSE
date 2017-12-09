
import * as THREE from 'three'
import {Game} from '../Game'
import {MUSE} from '../MUSE'
import {MUSENode} from '../Node'
import {Node3D} from '../Node3D'
import {Planet} from '../lib/CelestialBodies';

class VirtualEarth extends Planet
{
    constructor(game, opts) {
        if (!opts.texture) {
            opts.texture = 'textures/land_ocean_ice_cloud_2048.jpg';
        }
        super(game, opts);
    }
}

function addVirtualEarth(game, opts)
{
    if (!opts.name)
    opts.name = "vEarth";
    var ve = new VirtualEarth(game, opts);
    game.setFromProps(ve.group, opts);
    game.addToGame(ve.group, opts.name, opts.parent);
    game.registerController(opts.name, ve);
    game.registerPlayer(ve);
    return ve;
}

Game.registerNodeType("VirtualEarth", addVirtualEarth);
