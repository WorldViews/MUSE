import * as THREE from 'three';
import Stars from '../lib/Stars';
import {Game} from '../Game';

class StarsController {
    constructor(game, options) {
        this.game = game;
        this.stars = new Stars(game, options);
        //game.setFromProps(this.stars, options);
        //game.addToGame(this.stars, options.name, options.parent);
    }

    update() {
        this.stars.group.rotation.y += 0.0001;
    }
}

Game.registerNodeType("Stars", (game, options) => {
    if (!options.name)
        options.name = "stars";
    return game.registerController(options.name, new StarsController(game, options));
});

export default StarsController;
