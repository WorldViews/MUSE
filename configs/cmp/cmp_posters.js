
(function() {
// For now this just sets the video.  It should set the program
// in a way that corresponds to that video.
//function setProgram(specname, vidURL, channel) {
function setProgram(name, spec) {
    var channel = "mainScreen";
    var vidURL = spec.video;
    console.log("setProgram: "+name+" "+vidURL+" "+channel);
    var program = game.program;
    channel = channel || "mainScreen";
    var urlStateName = channel+".url";
    // get current program state
    var gs = game.getGameState();
    if (vidURL) {
        console.log("setting state "+urlStateName+": "+vidURL);
        game.state.set(urlStateName, vidURL);
        program.setPlayTime(0);
        program.setDuration(spec.duration || 3*60);

    }
    if (spec.stageModel)
        program.selectStageModel(spec.stageModel);
    else {
        program.selectStageModel("none");
    }
    game.pushGameState(gs);
}

// Layout posters radially, centered at a given angle theta.
// note that poster sizes and poster spaces are in angles (degrees)
//
function getPosters(specs, theta, posterSize)
{
    posterSize = posterSize || 8;
    var posterSpacing = 4;
    var phiStart = 88 - posterSize;
    var thetaStart = theta - specs.length*(posterSize+posterSpacing)/2;
    var posters = specs.map(spec => {
        var poster = { type: 'Screen', name: spec.name,
            path: spec.logo, radius: 7.8,
            phiStart, thetaStart,
            phiLength: posterSize, thetaLength: posterSize,
            //onMuseEvent: {'click': () => setProgram(spec.name, spec)}
            onMuseEvent: spec.onMuseEvent
        };
        if (!poster.onMuseEvent) {
            poster.onMuseEvent = {'click': () => setProgram(spec.name, spec)};
        }
        poster.path = spec.logo;
        poster.text = spec.text;
        poster.html = spec.html;
        thetaStart += (posterSize+posterSpacing);
        return poster;
    });
    console.log("POSTERS:", posters);
    return posters;
}

var PARTNER_SPECS = [
    {name: "CoolEffect",
     logo: "assets/images/PartnerLogos/CoolEffect.png",
     video: "assets/video/ExposingCarbonPollutionCoolEffect.webm"
    },
    {name: "KinetechArts",
     logo: "assets/images/PartnerLogos/KinetechArtsLogo.jpg",
     video: "assets/video/KinetechArts_ABriefHistory.webm",
     duration: 30,
     stageModel: 'dancer'
    },
    {name: "ClimateMusicProject",
     logo: "assets/images/PartnerLogos/ClimateMusicProject.jpg",
     video: "assets/video/ClimateMusicProjectpromo.webm"
    },
    {name: "GlobalFootprintNetwork",
     logo: "assets/images/PartnerLogos/GlobalFootprintNetwork.jpg",
     video: "assets/video/NationalFootprintAccounts.webm"
     //video: "assets/video/EcologicalFootprintOfCountries.webm"
    },
    {name: "FxPal",
     logo: "assets/images/LinkLogos/FxPal.png",
     //video: "assets/video/FxPal_20Years.webm"
     video: "assets/video/FxPal_Creativity.webm"
     //video: "assets/video/FxPal_Future_of_Work.webm"
    },
];

var RELATED_SPECS = [
    {name: "EarthClock",
     logo: "assets/images/CMPPosters/TimeToChange.jpg",
     video: "assets/video/Climate-Music-V3-Distortion_HD_540.webm"
    },
    {name: "SustainableSV",
     logo: "assets/images/PartnerLogos/SustainableSV.png",
     video: "assets/video/SustainableSiliconValley_BuildingSustainableRegion.webm"
    },
    {name: "OneDome",
     logo: "assets/images/LinkLogos/OneDome.png",
     video: "assets/video/OneDomeTrailer.webm",
     stageModel: 'geodesicDome',
    },
];

var CONTROL_SPECS = [
    {name: "stopButton",
     html:'<div style="width:100%;height:100%;background-color:red" />',
     onMuseEvent: {'click': () => {
         game.program.pause();
     }}
    },
    {name: "playButton",
     html:'<div style="width:100%;height:100%;background-color:green" />',
     onMuseEvent: {'click': () => {
         game.program.play();
     }}
    },
]

PARTNER_POSTERS = getPosters(PARTNER_SPECS, 180, 10);
RELATED_POSTERS = getPosters(RELATED_SPECS, 80);
CONTROLS = getPosters(CONTROL_SPECS, 110);
//REAR_POSTERS = getPosters(POSTER_SPECS, 0, 12);

POSTERS = [PARTNER_POSTERS, RELATED_POSTERS, CONTROLS];

MUSE.returnValue(POSTERS);

})();
