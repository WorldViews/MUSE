import Stats from 'stats.js';
import {Game} from 'core/Game';

export default class StatsController {
    constructor(game, options) {
        this.stats = new Stats();
        if (options.right) {
            this.stats.dom.style.left = '';
            this.stats.dom.style.right = options.right;
        }
        this.stats.showPanel(1);
        document.body.appendChild(this.stats.dom);
    }

    // 0: fps, 1: ms, 2: mb, 3+: custom
    showPanel(show) {
        this.stats.showPanel(show);
    }

    pre() {
        this.stats.begin();
    }

    update() {

    }

    post() {
        this.stats.end();
    }
}

Game.registerNodeType("Stats", (game, options) => {
    if (!options.name)
        options.name = "stats";
    return game.registerController(options.name, new StatsController(game, options));
});
