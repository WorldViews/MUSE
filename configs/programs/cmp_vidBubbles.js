

(function() {

var vidNames = [
    "StephanAndBill_4Kx2K.mp4",
    "ErikAndBill_4Kx2K.mp4",
    //"GreenlandMelting360_720p.mp4",
    "GreenlandMelting360_3840p.mp4",
    "ClimateChangeFiji360_1440.mp4"
]

function getBubbles(vidNames) {
    var angle = 60;
    var radius = 0.5;
    var parent = 'videoBubbles';
    var numBubbles = 0;
    return vidNames.map(name => {
        numBubbles++;
        var path = "assets/video/"+name;
        var bubbleName = "videoBubble" + numBubbles;
        var bubble = {  type: "VideoBubble", parent, radius, path, name: bubbleName,
            position: Util.radialPosition(angle),
            rotation: [0,-1.6,0],
        };
        angle += 15;
        return bubble;
    });
}

var BUBBLES = getBubbles(vidNames);
//console.log("BUBBLES", BUBBLES);

MUSE.returnValue(BUBBLES);

})();
