
/*
MEDIA_SPECS = [
    {  type: 'MediaSequence', defaultDuration: 1,
       records: [
           { duration: 4,      mainScreen: {url: 'assets/images/SpaceDebrisTalk/Slide2.PNG'}},
           { duration: 10,      mainScreen: {url: 'assets/video/GlobalWeather2013.mp4'}},
           //{ duration: 32*60,   mainScreen: {url: 'assets/video/Climate-Music-V3-Distortion_HD_540.webm'}},
           { duration: 32*60,   mainScreen: {url: 'assets/video/ClimateMusicProj-v7-HD.mp4'}},
       ]
   }
];
*/

MEDIA_SPECS = "configs/mediaSpecs/cmp_showcase.js";

VEARTH = [
    {  type: 'VirtualEarth', name: 'vEarth',
       radius: 1.25, position: [0,0,0],
       satellites: 0, satTracks: 0,
       dataViz: 1,
       atmosphere: {'name': 'CO2Viz', opacity: .1}
    }
];

var SPECS = [
    //{  type: 'JQControls' },
    {  type: 'Group', name: 'station'  },
//    {  type: 'CMPData' },
    {  type: 'CMPDataViz', name: 'cmp',
        position: [0, 0, 0],
        //position: [-10, 0, 0],
        rotation: [0, 0, 0], scale: [1.5, 1, 1.5],
        visible: true,
        startTime: 10*60, // 10 minutes before starting
        duration: 20*60   // 20 minutes duration time
    },
    //{  type: 'Stars' },
    VEARTH
];


function updateCMPViz2(year)
{
    if (!year) {
        return;
    }
    var gss = game.program.gss;
    if (gss) {
        var nar = gss.getFieldByYear(year, "narrative") || "";
        if (nar) {
            nar = Math.floor(year) + ':' + nar;
        }
        this.game.state.set('narrative', nar);
    }
    var earth = game.controllers.vEarth;
    var atm = earth.atmosphere;
    var startYear = 1800;
    var endYear = 2300;
    var co2Min = 280;
    var co2Max = 1970;
    var TMin = 13.0;
    var TMax = 33.0;
    var co2 = game.state.get("co2");
    var T = game.state.get("temperature");
    var balance = game.state.get("balance");
    var co2f = (co2 - co2Min)/(co2Max - co2Min);
    var Tf = (T - TMin)/(TMax - TMin);
    var h = 0.6 + .6*Tf;
    try {
        console.log(sprintf("year: %s co2: %6.2f T: %6.2f balance: %6.2f  Tf: %4.2f h: %4.2f  co2f: %4.2f",
                year, co2, T, balance, Tf, h, co2f));
    } catch(e) {
        console.log(e);
    }
    atm.setOpacity(0.9*co2f);
    atm.setHue(h);
}

function onStart(game)
{
    //alert("program onStart");
    game.state.on("year", updateCMPViz2);
}

function show3DGraph(game)
{
    game.controllers.vEarth.visible = false;
    game.controllers.cmp.visible = true;
}

function showVirtualEarth(game)
{
    game.controllers.vEarth.visible = true;
    game.controllers.cmp.visible = false;

}
function setEarthVideo(game, url)
{
    var vEarth = game.controllers.vEarth;
    vEarth.setSurfaceVideo(url)
}

function toHHMMSS(t) {
    var sec_num = parseInt(t, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours > 0) {
        return sprintf("%02d:%02d:%02d", hours, minutes, seconds);
    } else {
        return sprintf("%02d:%02d", minutes, seconds);
    }
}

PROGRAM =
{
    type: 'Program',
    onStartProgram: onStart,
    //startTime: '1/1/1800',
    //playTime: 'now'
    //startTime: '6/1/2005 10:30'
    duration: 32*60,
    gss: "https://spreadsheets.google.com/feeds/list/1Vj4wbW0-VlVV4sG4MzqvDvhc-V7rTNI7ZbfNZKEFU1c/default/public/values?alt=json",
    channels: [
        {name: 'time',        label: "Time",    format: toHHMMSS },
        {name: 'year',        label: "Year"                      },
        {name: 'temperature', label: "T",       format: "%6.2f"  },
        {name: 'co2',         label: "CO2",     format: "%6.2f"  },
        {name: 'balance',     label: "Balance", format: "%8.1f"  },
        //'dyear',
        'spacer',
        {name: 'narrative', style: "height:110px", fieldElement: "div"}
    ],
    scripts: {
        'Show 3D Graph': (game) => show3DGraph(game),
        'Show Virtual Earth': (game) => showVirtualEarth(game),
        'Show Earthquakes': (game) => setEarthVideo(game, "assets/video/earthquakes.mp4"),
        'Show 2013 Weather': (game) => setEarthVideo(game, "assets/video/GlobalWeather2013.mp4"),
        //'Show surface temp 1850-2300': (game) => setEarthVideo(game, "assets/video/tas_Amon_CCSM4_1850_2300.mp4"),
        'Show surface temp 1850-2300': (game) => setEarthVideo(game, "assets/video/tas_1850_2300.mp4"),
        'Climate Model Clouds': (game) => setEarthVideo(game, "assets/video/CloudTruth.mp4"),
    },
    media: MEDIA_SPECS,
    nodes: SPECS
}

MUSE.returnValue(PROGRAM);
