

MEDIA_SPECS = "configs/DanceHack/danceHackMedia.js";

SCRIPTS = {  type: 'Scripts' };

VEARTH = [
    {  type: 'VirtualEarth', name: 'vEarth',
       radius: 1.25, position: [0,1.9,0],
       satellites: 0, satTracks: 0,
       dataViz: 1,
       atmosphere: {'name': 'CO2Viz', opacity: .1}
    }
];

var NET_LINK = {type: 'NetLink'};
var KINECT_WATCHER = {type: 'KinectWatcher'}
var OPEN_PERFORMER = {type: 'OpenPerformer', name: "Isadora", size: 0.5, position: [0,2,0]};

GEODESIC_DOME =  {
       type: 'Model', name: 'geodesicDome',
        parent: 'station',
        path: 'assets/models/GeodesicDome/model.dae',
        position: [0.0, 0, 0],
        rot: [0, 90, 0],
        scale: 0.0045,
        visible: true
};


var SPECS = [
    //{  type: 'JQControls' },
    {  type: 'Group', name: 'station'  },
//    {  type: 'CMPData' },
    {  type: 'CMPDataViz', name: 'cmp',
        position: [0, 1, 0],
        //position: [-10, 0, 0],
        rotation: [0, 0, 0],
        //scale: [1.5, 1, 1.5],
        scale: [1.2, 0.8, 1.2],
        visible: true,
        startTime: 11*60 + 18, // 11:18 minutes before starting
        duration: 1075   // 17:56 minutes duration time
    },
    //{  type: 'Stars' },
    VEARTH,
    KINECT_WATCHER,
    GEODESIC_DOME
    //{type: 'OpenPerformer', name: "Isadora", size: 0.5, position: [0,2,0]},
    //{type: 'ExampleNode', name: "example1", size: 0.25, position: [2,3,0]},
];

POSTERS = "configs/DanceHack/posters.js";
BUBBLES = "configs/DanceHack/vidBubbles.js";
TOKENS = "configs/DanceHack/tokens.js";

SOLAR_SYSTEM = [ {  type: 'SolarSystem' }, {  type: 'Stars' } ];

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
    var opacity = 0.9*co2f;
    try {
        console.log(sprintf("year: %s co2: %6.2f T: %6.2f balance: %6.2f  Tf: %4.2f h: %4.2f  co2f: %4.2f",
                year, co2, T, balance, Tf, h, co2f));
    } catch(e) {
        console.log(e);
    }
    atm.setOpacity(opacity);
    atm.setHue(h);
    game.state.set("cmpOpacity", opacity);
    game.state.set("cmpColorHue", h);
}

function onStartProgram() {
    game.state.on("year", updateCMPViz2);
}

// This forces images to load by quickly going to viewpoint far Away
// from which every image is in view frustrum.
function forceImages() {
    var vm = game.viewManager;
    console.log(vm);
    console.log("Going to edge of universe");
    vm.gotoView("Very Far Away", 0);
    //alert("Going very far away to load all images");
    //vm.gotoView("Left Rear", 0);
    setTimeout( () => {
        console.log("going home now");
        vm.gotoView("Nearby Outside Looking In", 0);
        vm.gotoView("Left Rear", 3);
    }, 1000);
}

function onStart() {
    var solarSystem = game.controllers.solarSystem;
    //var solarSystem = SOLAR_SYSTEM;
    return;
    window.planetTour = solarSystem.getTour();
    if (Util.getParameterByName("quickstart"))
        return;
    //forceImages();
}

var jqGUI = {type: 'JQControls'
//screens: ["mainScreen"],
};
var datGUI = {type: 'DATGUIControls' };

CONFIG = {
    //onStart: setupPosterActions,
    gameOptions: {headlightIntensity: 1, ambientLightIntensity: 1},
    onStart: onStart,
    //'cameraControls': 'Orbit',
    'cameraControls': {type: 'MultiControls', movementSpeed: .03, keyPanSpeed: .01},
    //'cameraControls': 'JoelControls',
    //'webUI': {type: 'DATGUIControls',
    //'webUI': {type: 'JQControls' },
    webUI: Util.getParameterByName("datgui") ? datGUI : jqGUI,
    'program': {
        onStartProgram: onStartProgram,
        duration: 32*60,
       gss: "https://spreadsheets.google.com/feeds/list/1Vj4wbW0-VlVV4sG4MzqvDvhc-V7rTNI7ZbfNZKEFU1c/default/public/values?alt=json",
       stages: [
           {
               name: 'Main Stage',
               models: {
                   'vEarth': 'Virtual Earth',
                   'dancer': 'Dancer',
                   'cmp': 'Data Visualization',
                   'geodesicDome': 'Geodesic Dome',
                   'none': 'Nothing'
               }
           }
       ],
       channels: [
           {name: 'time',        label: "Time",    format: Util.toHHMMSS , default: 0},
           {name: 'year',        label: "Year",                            default: 1850, min: 1850, max: 2300 },
           {name: 'temperature', label: "T",       format: "%6.2f"  },
           {name: 'co2',         label: "CO2",     format: "%6.2f"  },
           {name: 'balance',     label: "Balance", format: "%8.1f"  },
           //'dyear',
           'spacer',
           {name: 'narrative', style: "height:110px", fieldElement: "div"}
        ],

       media: MEDIA_SPECS,
       nodes: [NET_LINK, SCRIPTS, POSTERS, BUBBLES, TOKENS, SPECS]
    },
    venue: '/configs/venues/imaginariumSimple.js',
    environment: SOLAR_SYSTEM,
};

MUSE.returnValue(CONFIG);
//
