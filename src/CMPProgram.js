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

import {ProgramControl} from './ProgramControl';

import {sprintf} from "sprintf-js";

function getVideoOpacity(gss, t)
{
    if (!gss)
	return 0;
    var y = timeToYear(t);
    var va = gss.getFieldByYear(y, "videofade");
    //report("getVideoOpacity "+t+" va: "+va);
    va = getFloat(va, 1.0);
    return va;
}

function getNarrative(gss, t)
{
    if (!gss)
	return "";
    var y = timeToYear(t);
    return gss.getFieldByYear(y, "narrative");
}


class CMPProgram extends ProgramControl
{

    constructor(game) {
	super(game);
    }
    
    setPlayTime(t) {
	super.setPlayTime(t);

	//TODO: Move this into registered players
	if (game.gss) {
	    var year = GSS.timeToYear(t);
	    console.log("year: "+year);
	    var tStr = sprintf("%8.1f", t);
	    this.game.events.dispatchEvent({type: 'valueChange',
					    message: {'name': 'timeText', 'value': tStr}});
	    var yearStr = "";
	    if (year) {
		var va = game.gss.getFieldByYear(year, "videofade");
                var nar = game.gss.getFieldByYear(year, "narrative") || "";
		console.log("va: "+va+"  narrative: "+nar);
		yearStr = Math.floor(year);
		this.game.events.dispatchEvent({type: 'valueChange',
						message: {'name': 'narrativeText', 'value': nar}});
	    }
	    this.game.events.dispatchEvent({type: 'valueChange',
					    message: {'name': 'yearText', 'value': yearStr}});
	}
	var cmp = game.CMP || game.controllers['cmp'];
	if (cmp) {
	    var nt = 0;
	    if (t > 10*60) {
		nt = t / (32*60.0);
	    }
	    if (nt > 1) nt = 1;
	    cmp.seek(nt);
	}
    }
}

export {CMPProgram};
