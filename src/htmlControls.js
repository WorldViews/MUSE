
var duration = 32*60;

function tourSliderChanged(e, ui)
{
    console.log("**** tourSliderChanged ****");
    var v = ui.value;
    var t = v*duration;
    console.log("v: "+v+"   t: "+t);
    //imageSrc.setPlayTime(t);
    //e.preventDefault();// doesn't help...
}


function setupHtmlControls() {
    console.log("************************* htmlControls setup *********************");

    $(document).ready(function() {
	console.log("**** setting up slider ****");
	$("#timeLine").slider({
	    slide: tourSliderChanged,
	    min: 0, max: 1, step: 0.001
	});
	$("#playStop").click(function() {
            console.log("click");
	});
    });
}

export {setupHtmlControls};
