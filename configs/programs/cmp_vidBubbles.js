

(function() {

var vidSpecs = [
    {  name: 'Stephan and Bill',
       video: 'StephanAndBill_4Kx2K.mp4',
       image: 'assets/images/BubblePreviews/StephanAndBill_4Kx2K.jpg'
    },
    {  name: 'Erik and Bill',
       video: 'ErikAndBill_4Kx2K.mp4',
       image: 'assets/images/BubblePreviews/ErikAndBill_4Kx2K.jpg'
    },
    {  name: "Live 360 Vid Server",
       video: "webrtc://192.168.16.206:8080/",
       image: 'assets/images/FXPALBanner.jpg'
    },
    {  name: 'Greenland Melting',
      video: 'GreenlandMelting360_3840p.mp4',
      image: 'assets/images/BubblePreviews/GreenlandMelting360_3840p.jpg'
    },
    {  name: 'Iceland Glaciers',
      video: 'ErikAndBill_4Kx2K.mp4',
      image: 'assets/images/BubblePreviews/IcelandGlaciers360_1440.jpg'
    },
    {  name: 'Climate Change Fiji',
      video: 'ClimateChangeFiji360_1440.mp4',
      image: 'assets/images/BubblePreviews/ClimateChangeFiji360_1440.jpg'
    },
    //"GreenlandMelting360_720p.mp4",
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
        var path = spec.video;
        if (path.indexOf(":") < 0 && !path.startsWith("/")) {
            path = "assets/video/"+path;
        }
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
