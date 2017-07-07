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
    }

    setPlayTime(t) {
	console.log(">>>> noticeTime "+t);
	Object.values(this.game.screens).forEach(scr => {
	    scr.imageSource.setPlayTime(t);
	});
	if (game.gss) {
	    var year = GSS.timeToYear(t);
	    console.log("year: "+year);
	    $("#timeText").html(t);
	    if (year) {
		$("#yearText").html(Math.floor(year));
		var va = game.gss.getFieldByYear(year, "videofade");
                var nar = game.gss.getFieldByYear(year, "narrative");
		console.log("va: "+va+"  narrative: "+nar);
		if (nar) {
		    $("#narrativeText").html(nar);
		}
		else {
		    $("#narrativeText").html("");
		}
	    }
	    else {
		$("#yearText").html("");
	    }
	}
    }
}

export {PlayerControl};
