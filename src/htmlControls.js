
var duration = 32*60;

var items = ["vEarth", "dancer", "cmp", "portal", "bmw"];

function handleCenterScene(e, game)
{
    var option = $("#centerScene").val();
    console.log("Click: "+option);
    items.forEach(item=> {
        var obj = game.models[item];
        //console.log("item: "+item+"  obj: "+obj);
        if (obj) {
	    obj.visible = (item == option);
	    return;
        }
        var c = game.controllers[item];
        if (c) {
	    c.visible = (item == option);
        }
        else {
	    console.log("No such model or controller as "+item);
        }
    });
}

function sliderChanged(e, ui, playerControl)
{
    console.log("**** sliderChanged ****");
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
        //console.log("valueChange: "+JSON.stringify(msg));
        var name = msg.message.name;
        //$("#narrativeText").html(msg.message.value);
        $("#"+name).html(msg.message.value);
    });

    $(document).ready(function() {
        console.log("**** setting up slider ****");
        $("#timeLine").slider({
	    slide: (e,ui) => sliderChanged(e,ui,playerControl),
	    min: 0, max: 1, step: 0.001
        });
        $("#centerScene").change(e => handleCenterScene(e,game));
    });
}

export {setupHtmlControls};
