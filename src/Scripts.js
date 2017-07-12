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

class Scripts {

    constructor(game, uiControl) {
	this.game;
	this.uiControl = uiControl;
	var inst = this;
	var ui = this.uiControl;
	ui.registerCallback("--------------------", () => inst.dots());
	ui.registerCallback("Add Panoramic Portal", () => inst.addPortal());
	ui.registerCallback("Hide Portal", () => inst.hidePortal());
	ui.registerCallback("Go to Mars", () => inst.goToMars());
	ui.registerCallback("Dancing with the Stars", () => inst.danceWithStars());
	ui.registerCallback("stop", () => inst.stop());
    }

    dots() {
	console.log("...........................................................");
    }

    goToMars() {
	animTest();
    }

    addPortal() {
	var pspec = {
	    name: "portal2",
	    radius: 0.5,
	    path: 'videos/YukiyoCompilation.mp4',
	    position: [5,2,1]
	}
	game.portal2 = new PanoPortal(game,pspec);
    }

    hidePortal() {
	game.portal2.visible = false;
    }

    danceWithStars() {
	var d = game.controllers.dancer;
	d.setScale(.3);
    }
    
    stop() {
	console.log("stop any running scripts....");
    }

    update() {
	// may not need this, but may... depending on how this module is written.
    }
}

export {Scripts};
