
import * as THREE from 'three'
import {Game} from 'core/Game'
import {MUSE} from 'core/MUSE'
import {MUSENode} from 'core/Node'
import {Node3D} from 'core/Node3D'
import {Planet} from './CelestialBodies';

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
