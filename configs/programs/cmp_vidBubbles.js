

(function() {

var vidSpecs = [
    {  name: 'Stephan and Bill',
       video: 'StephanAndBill_4Kx2K.mp4',
       image: 'assets/images/FXPALBanner.jpg'
    },
    "ErikAndBill_4Kx2K.mp4",
    "webrtc://192.168.16.206:8080/"
    //"GreenlandMelting360_720p.mp4",
    //"GreenlandMelting360_3840p.mp4",
    //"ClimateChangeFiji360_1440.mp4"
]

function getBubbles(vidSpecs) {
    var angle = 60;
    var radius = 0.5;
    game.getGroup('videoBubbles', {parent: 'station' });
    var parent = 'videoBubbles';
    var numBubbles = 0;
    return vidSpecs.map(spec => {
        if (typeof spec == "string")
            spec = {name: spec, video: spec};
        numBubbles++;
        var path = "assets/video/"+spec.video;
        var bubbleName = "videoBubble" + numBubbles;
        var bubble = {  type: "VideoBubble", parent, radius, path, name: bubbleName,
            videoPath: path,
            imagePath: spec.image,
            position: Util.radialPosition(angle),
            rotation: [0,-1.6,0],
        };
        angle += 15;
        return bubble;
    });
}

var BUBBLES = getBubbles(vidSpecs);
//console.log("BUBBLES", BUBBLES);

MUSE.returnValue(BUBBLES);

})();
