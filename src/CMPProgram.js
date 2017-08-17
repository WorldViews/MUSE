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

function getVideoOpacity(gss, t) {
    if (!gss)
        return 0;
    var y = timeToYear(t);
    var va = gss.getFieldByYear(y, "videofade");
    //report("getVideoOpacity "+t+" va: "+va);
    va = getFloat(va, 1.0);
    return va;
}

function getNarrative(gss, t) {
    if (!gss)
        return "";
    var y = timeToYear(t);
    return gss.getFieldByYear(y, "narrative");
}


class CMPProgram extends ProgramControl {

    constructor(game) {
        super(game);
        game.gss = new GSS.SpreadSheet();
        var inst = this;
        this.duration = 32*60;
    }

    dots() {
        console.log("......................... just a test ..............................");
    }

    setPlayTime(t) {
        super.setPlayTime(t);
        this.displayTime(t);
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
        if (game.gss) {
            var year = GSS.timeToYear(t);
            //console.log("year: " + year);
            var tStr = sprintf("%8.1f", t);
            this.game.events.dispatchEvent({
                type: 'valueChange',
                message: {
                    'name': 'timeText',
                    'value': tStr
                }
            });
            var yearStr = "";
            if (year) {
                var va = game.gss.getFieldByYear(year, "videofade");
                var nar = game.gss.getFieldByYear(year, "narrative") || "";
                //console.log("va: " + va + "  narrative: " + nar);
                yearStr = Math.floor(year);
                this.game.events.dispatchEvent({
                    type: 'valueChange',
                    message: {
                        'name': 'narrativeText',
                        'value': nar
                    }
                });
            }
            this.game.events.dispatchEvent({
                type: 'valueChange',
                message: {
                    'name': 'yearText',
                    'value': yearStr
                }
            });
        }
        var dur = this.duration;
    	let value = (t/(0.0+dur));
        if (game.controllers.ui && game.controllers.ui.slider) {
            try {
	        game.controllers.ui.slider.value = value;
            }
            catch (e) {
	        console.log("exception setting slider");
            }
        }
        //console.log("slider t: "+t+"  dur: "+dur+"  value: "+value);
        try {
	    let timeline = $('#timeLine');
    	    timeline.slider('value', value);
        }
        catch (e) {
        }
    }
}

export { CMPProgram };
