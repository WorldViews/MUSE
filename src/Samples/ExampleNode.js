
import * as THREE from 'three';
import {Game} from '../Game';
import {MUSENode} from '../Node';
import {Node3D} from '../Node3D';

class ExampleNode extends Node3D
{
    constructor(game, opts)
    {
        super(game, opts);
        var opts = this.options; // super may have filled in some things
        this.game = game;
        this.checkOptions(opts);
        this.group = new THREE.Group();
        this.group.name = opts.name;
        this.setObject3D(this.group);
        this.addStuff();
        this.time = 0;
        this.playSpeed = 1;
        // this sets some common properties such as postion, scale, etc.
        game.setFromProps(this.group, opts);
        game.addToGame(this.group, opts.name, opts.parent);

        var inst = this;
        game.state.on("performer", h => inst.watchState(h));

        // This ensures we get update calls each frame
        game.registerController(this.options.name, this);

        // This is if we want to be a player
        game.registerPlayer(this);
    }

    addStuff() {
        var radius = this.options.size || 1;
        this.material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
        this.geometry = new THREE.SphereGeometry( radius, 32, 32 );
        this.ball = new THREE.Mesh(this.geometry, this.material);
        this.group.add(this.ball);
    }

    // These can be overridden
    //setVisible(v) { this.group.visible = v; }
    //getVisible() {  return this.group.visible; }

    watchState(state) {
        console.log("Noticed new state", state);
    }

    // This is if we want to be controller.  Called each frame
    update() {
        if (!this.visible)
	       return;
    }


    // Player Interface methods - only if we want to be seekable player
    getPlayTime() {
        return this.time;
    }

    setPlayTime(t) {
        //this.mixer.time = t;
        this.time = t;
    }

    getPlaySpeed() {
        return this.playSpeed;
    }

    setPlaySpeed(s) {
        return this.playSpeed = s;
    }

    play() {}

    pause() {}

}

// could add fields there.  If checkOptions is used, it
// complains about unexpected fields in options.
MUSENode.defineFields(ExampleNode, [
    "size"
]);

// note that this could return a promise instead.
// (See DanceController)
function addExampleNode(game, options) {
    var op = new ExampleNode(game, options);
    return op;
}

Game.registerNodeType("ExampleNode", addExampleNode);

export {ExampleNode};
