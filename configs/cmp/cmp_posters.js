
(function() {

var game = MUSE.game;

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
    program.clear();
    program.setProgramName(name);
    if (vidURL) {
        console.log("setting state "+urlStateName+": "+vidURL);
        game.state.set(urlStateName, vidURL);
        program.setPlayTime(0);
        program.setDuration(spec.duration || 3*60);
    }
    if (spec.stageModel)
        program.selectStageModel(spec.stageModel);
    program.play();
    game.pushGameState(gs);
}

function getPoster(spec, thetaStart, phiStart, posterSize) {
    var poster = { type: 'Screen', name: spec.name,
        path: spec.logo, text: spec.text, html: spec.html, radius: 7.8,
        phiStart, thetaStart,
        phiLength: posterSize, thetaLength: posterSize,
        //onMuseEvent: {'click': () => setProgram(spec.name, spec)}
        onMuseEvent: spec.onMuseEvent
    };
    if (!poster.onMuseEvent) {
        poster.onMuseEvent = {'click': () => setProgram(spec.name, spec)};
    }
    //poster.path = spec.logo;
    //poster.text = spec.text;
    //poster.html = spec.html;
    return poster;
}

function getPlayPauseButton(buttonName, theta, posterSize)
{
    posterSize = posterSize || 8;
    var phiStart = 88 - posterSize;
    var thetaStart = theta - posterSize/2;
    var play_url = "textures/icons/lightPlay.png";
    var pause_url = "textures/icons/lightPause.png";
    //var html_paused =  '<div style="width:100%;height:100%;background-color:green" />';
    //var html_playing = '<div style="width:100%;height:100%;background-color:red" />';
    var url = ( game.state.get("playState") == "paused" ? play_url : pause_url );
    var updateAppearance = () => {
        var node = game.getNode(buttonName);
        if (!node) return;
        //        html = ( game.state.get("playState") == "paused" ? html_paused : html_playing );
        //        node.updateHTML(html);
        if (game.state.get("playState") == "paused") {
            node.updateSource(play_url);
        }
        else {
            node.updateSource(pause_url);
            //node.updateHTML(html_playing);
        }
        //        node.updateHTML(html);
    };
    var handleClick = () => {
        var s = game.state.get("playState");
        (s == "paused") ? game.program.play() : game.program.pause();
    }
    var spec = {
        name: buttonName,
        logo: url,
        //html: html,
        onMuseEvent: {'click': handleClick},
    };
    var poster = getPoster(spec, thetaStart, phiStart, posterSize);
    game.state.on("playState", updateAppearance);
    return poster;
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
        var poster = getPoster(spec, thetaStart, phiStart, posterSize);
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
     video: "assets/video/ClimateMusicProj-v7-HD.webm"
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



BACK_SPEC = {
    name: "backButton",
    logo: "textures/icons/lightBack.png",
    onMuseEvent: {'click': () => {
     game.popGameState();
    }}
 };

PREV_SPEC = {
    name: "prevButton",
    logo: "textures/icons/prev.png",
    onMuseEvent: {'click': () => {
        game.program.prevState();
    }}
};

NEXT_SPEC = {
    name: "nextButton",
    logo: "textures/icons/next.png",
    onMuseEvent: {'click': () => {
       game.program.nextState();
    }}
};

PARTNER_POSTERS = getPosters(PARTNER_SPECS, 180, 10);
RELATED_POSTERS = getPosters(RELATED_SPECS, 70);

//BACK_BUTTON = getPoster(
//    {name: "backButton", logo: "textures/icons/back.jpg",
//     onMuseEvent: {'click': () => game.popGameState();}}, 110);

BACK_BUTTON = getPoster(BACK_SPEC, 100, 88-8, 8);
PLAY_PAUSE_BUTTON = getPlayPauseButton("playPauseButton", 115);
PREV_BUTTON = getPoster(PREV_SPEC, 120, 88-8, 8);
NEXT_BUTTON = getPoster(NEXT_SPEC, 130, 88-8, 8);
CONTROLS = [BACK_BUTTON, PLAY_PAUSE_BUTTON, PREV_BUTTON, NEXT_BUTTON];
//CONTROLS = getPosters(CONTROL_SPECS, 125);
//CONTROLS.push(PLAY_PAUSE_BUTTON);
//REAR_POSTERS = getPosters(POSTER_SPECS, 0, 12);

POSTERS = [PARTNER_POSTERS, RELATED_POSTERS, CONTROLS];

MUSE.returnValue(POSTERS);

})();
