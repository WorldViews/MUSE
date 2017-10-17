/*

This class specializes ProgramControl for a Climate Music Project performance.

It reads from the spreadsheet that was used for the NOH performance.

Note that there is one meaning of time that maps from 0 to dur*60
where dur is duration of video in seconds.

Time in that video gets mapped to years.  Most entries in spreadsheet
are in years.   That is more convenient for humans, but makes the logic
here a little tricky.

TODO:
Set up a schedule JSON that maps global program time to the specific
periods in which each thing is happening, and for those subactivities
gives the mapping from global time to local time for the them.  Some
of them may be animations expecting time in [0,1], others may be videos
with various durations.

*/

import { ProgramControl } from './ProgramControl';
import { sprintf } from "sprintf-js";

class CMPProgram extends ProgramControl {

    constructor(game, options) {
        options = options || {};
        options.duration = options.duration || 32*60;
        super(game, options);
        var inst = this;
        //this.duration = options.duration || 32*60;
        console.log("****** CMPProgram.duration: "+this.duration)
    }

    setPlayTime(t, isAdjust) {
        super.setPlayTime(t, isAdjust);
        var cmp = game.CMP || game.controllers['cmp'];
        if (cmp) {
            var nt = 0;
            if (t > 10 * 60) {
                nt = t / (32 * 60.0);
            }
            if (nt > 1)
                nt = 1;
            cmp.seekNormalize(nt);
        }
    }

    // This should just update UI elements with playtime information.
    // this may get called with every tick, so the things it causes
    // should be lightweight. (E.g. not seeking videos or redrawing
    // animations.)
    displayTime(t) {
        //console.log("CMPProgram.displayTime "+t);
        super.displayTime(t);
        if (this.gss) {
            var year = GSS.timeToYear(t);
            //console.log("year: " + year);
            var yearStr = "";
            if (year) {
                var va = this.gss.getFieldByYear(year, "videofade");
                var nar = this.gss.getFieldByYear(year, "narrative") || "";
                //console.log("va: " + va + "  narrative: " + nar);
                yearStr = Math.floor(year);
                this.game.state.set('narrative', nar);
                //this.game.setValue('narrative', nar);
            }
            //this.game.setValue('year', yearStr);
            this.game.state.set('year', yearStr);
        }
    }
}

export { CMPProgram };
