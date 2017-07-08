
import {sprintf} from "sprintf-js";

/*
function getVideoOpacity(t)
{
    if (!CMPVR.gss)
	return 0;
    var y = timeToYear(t);
    var va = CMPVR.gss.getFieldByYear(y, "videofade");
    //report("getVideoOpacity "+t+" va: "+va);
    va = getFloat(va, 1.0);
    return va;
}

function getNarrative(t)
{
    if (!CMPVR.gss)
	return "";
    var y = timeToYear(t);
    return CMPVR.gss.getFieldByYear(y, "narrative");
}
*/

class PlayerControl
{
    constructor(game) {
	this.game = game;
	game.playerControl = this;
	this.players = {};
    }

    registerPlayer(player, name)
    {
	name = name || player.name;
	//TODO: flag error if no name or name collision.
	this.players[name] = player;
    }

    // uneasy about this being set or get
    get playTime() {
	// bogus... fix this later
	return this._playTime;
    }
    
    set playTime(t) {
	this.setPlayTime(t)
    }

    setPlayTime(t) {
	this._playTime = t;
	console.log(">>>> noticeTime "+t);
	for (name in this.players) {
	    console.log("set playTime "+name);
	    var player = this.players[name];
	    player.playTime = t;
	}
	//TODO: Move these into registered players
	Object.values(this.game.screens).forEach(scr => {
	    scr.imageSource.setPlayTime(t);
	});

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

export {PlayerControl};
