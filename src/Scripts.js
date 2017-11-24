/*
  This module handles scripts.
  It should be able to let a user select a script to run
  from a menu in the UI.  It could later have in world methods
  too.

  It handles that multiple scripts doing a similar thing may
  not make sense to run together.

  For example the contents of a stage should mostly be
  mutually exclusive.   Similarly scripts that move the
  camera or station would not make sense to run at the same
  time.

*/
import {animTest, Anim} from './animTest';
import {PanoPortal} from './lib/PanoPortal';
import {Game} from './Game';

class Scripts {

    //constructor(game, uiControl) {
    constructor(game, options) {
        this.game = game;
        game.portal2 = 0;
        //this.uiControl = uiControl;
        this.uiControl = game.controllers.ui;
        var inst = this;
        var ui = this.uiControl;
        if (!ui) {
            console.log("******** No UI available");
            return;
        }
        ui.registerScript("Toyokawa Panoramic Portal", () => inst.addPortal());
        ui.registerScript("Hide Portal", () => inst.hidePortal());
        ui.registerScript("Go to Mars", () => inst.goToMars());
        ui.registerScript("Dancing with the Stars", () => inst.danceWithStars());
        ui.registerScript("stop", () => inst.stop());
    }

    dots() {
        console.log("...........................................................");
    }

    goToMars() {
        animTest();
    }

    addPortal() {
        if (game.portal2) {
            console.log("*********** reusing portal2");
            game.portal2.visible = true;
            return;
        }
        console.log("******************** creating portal2");
        var pspec = {
            name: "portal2",
            radius: 0.5,
            path: 'assets/video/YukiyoCompilation.mp4',
            position: [5,.8,0]
        }
        game.portal2 = new PanoPortal(game,pspec);
    }

    hidePortal() {
        game.portal2.visible = false;
    }

    danceWithStars() {
        var d = game.controllers.dancer;
        d.visible = true;
        d.setScale(.3);
    }

    stop() {
        console.log("stop any running scripts....");
    }

    update() {
        // may not need this, but may... depending on how this module is written.
    }
}

Game.registerNodeType("Scripts", (game, options) => {
    if (!options.name)
        options.name = "scripts";
    return game.registerController(options.name, new Scripts(game, options));
});

export {Scripts};
