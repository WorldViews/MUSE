
var duration = 32*60;

function tourSliderChanged(e, ui, playerControl)
{
    console.log("**** tourSliderChanged ****");
    var v = ui.value;
    var t = v*duration;
    console.log("v: "+v+"   t: "+t);
    if (playerControl)
	playerControl.setPlayTime(t);
    //imageSrc.setPlayTime(t);
    //e.preventDefault();// doesn't help...
}


function setupHtmlControls(game, playerControl) {
    console.log("************************* htmlControls setup *********************");

    game.events.addEventListener('valueChange', msg => {
	console.log("valueChange: "+JSON.stringify(msg));
	var name = msg.message.name;
	//$("#narrativeText").html(msg.message.value);
	$("#"+name).html(msg.message.value);
    });

    $(document).ready(function() {
	console.log("**** setting up slider ****");
	$("#timeLine").slider({
	    slide: (e,ui) => tourSliderChanged(e,ui,playerControl),
	    min: 0, max: 1, step: 0.001
	});
	$("#playStop").click(function() {
            console.log("click");
	});
    });
}

export {setupHtmlControls};
