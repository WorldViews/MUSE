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

class Scripts {

    constructor(uiControl) {
	this.uiControl = uiControl;
	var inst = this;
	var ui = this.uiControl;
	ui.registerCallback("...", () => inst.dots());
	ui.registerCallback("Go to Mars", () => inst.goToMars());
	ui.registerCallback("stop", () => inst.stop());
    }

    dots() {
	console.log("...........................................................");
    }

    goToMars() {
	animTest();
    }
    
    stop() {
	console.log("stop any running scripts....");
    }

    update() {
	// may not need this, but may... depending on how this module is written.
    }
}

export {Scripts};
