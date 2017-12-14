

MEDIA_SPECS = "configs/cmp/cmp_showcase_media.js";

SCRIPTS = {  type: 'Scripts' };

VEARTH = [
    {  type: 'VirtualEarth', name: 'vEarth',
       radius: 1.25, position: [0,1.9,0],
       satellites: 0, satTracks: 0,
       dataViz: 1,
       atmosphere: {'name': 'CO2Viz', opacity: .1}
    }
];

GEODESIC_DOME =  {
       type: 'Model', name: 'geodesicDome',
        parent: 'station',
        path: 'assets/models/GeodesicDome/model.dae',
        position: [0.0, 0, 0],
        rot: [0, 90, 0],
        scale: 0.0045,
        visible: false
};

var NET_LINK = {type: 'NetLink'};
var KINECT_WATCHER = {type: 'KinectWatcher'}

var SPECS = [
    //{  type: 'JQControls' },
    {  type: 'Group', name: 'station'  },
//    {  type: 'CMPData' },
    {  type: 'CMPDataViz', name: 'cmp',
        position: [0, 1.2, 0],
        //position: [-10, 0, 0],
        rot: [0, 45, 0],
        //scale: [1.5, 1, 1.5],
        scale: [1.1, 0.8, 1.1],
        visible: true,
        rotationSpeed: 1,
        startTime: 11*60 + 18, // 11:18 minutes before starting
        duration: 1075   // 17:56 minutes duration time
    },
    //{  type: 'Stars' },
    {  type: 'VirtualEarth', name: 'co2Earth', radius: 1.25, position: [0,1.9,0],
       satellites: 0, satTracks: 0, dataViz: 0
    },

    VEARTH,
    GEODESIC_DOME,
    KINECT_WATCHER,
];

POSTERS = "configs/cmp/cmp_posters.js";
BUBBLES = "configs/cmp/cmp_vidBubbles.js";
TOKENS = "configs/cmp/cmp_tokens.js";

SOLAR_SYSTEM = [ {  type: 'SolarSystem' }, {  type: 'Stars' } ];

function showDataValues(year, T, co2, balance)
{
    var screenName = "leftScreen";
    var html = "<div style='background-color:blue;font-size:200'>\n";
    html += "<p>&nbsp;<br>\n";
    html += "<p>&nbsp;<br>\n";
    html += "<p>&nbsp;<br>\n";
    html += sprintf("Year: %d<br>\n", year);
    html += sprintf("T: %.1f<br>\n", T);
    html += "<img src='textures/icons/play.png'>\n"
    html += sprintf("CO2: %f<br>\n", co2);
    html += "<p>&nbsp;<br>\n";
    html += "<p>&nbsp;<br>\n";
    html += "</div>";
//    game.state.set(screenName+".html", html);
    n = game.getNode(screenName);
    n.updateHTML(html);
    window.HTML_LEFT = html;
}

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
    if (T == undefined) {
        return;
    }
    //showDataValues(year, T, co2, balance);
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
        //vm.gotoView("Nearby Outside Looking In", 0);
        vm.gotoView("V1", 8);
    }, 1000);
}


function setEarthVideo(game, url, name)
{
    name = name || "vEarth";
    var vEarth = game.controllers[name];
    vEarth.setSurfaceVideo(url)
}

function planetaryTour() {
    var solarSystem = game.getNode("solarSystem");
    window.planetTour = solarSystem.getTour();
}

/*
function imaginariumTour() {
    //var target = game.models.station;
    var vm = game.viewManager;
    var program = game.program;
    var anim = new MUSE.Anim("anim1", game.models.station);
    anim.addCall(() => vm.gotoView("Above", 8));
    anim.addWait(1)
    anim.addCall(() => {
        console.log("******* select Dancer!! *****");
        program.selectStageModel("dancer");
    });
    anim.addWait(8);
    anim.addCall(() => vm.gotoView("Home", 3));
    anim.addWait(4)
    anim.addCall(() => vm.gotoView("Left Rear", 2));
    anim.addCall(() => program.selectStageModel("cmp"));
    anim.addWait(3)
    anim.addCall(() => vm.gotoView("Nearby Outside Looking In", 6));
    //game.registerPlayer(anim);
    window.lastAnim = anim;
    return anim;
}
*/
/*
function imaginariumTour() {
    //var target = game.models.station;
    var vm = game.viewManager;
    var program = game.program;
    var anim = new MUSE.Anim("anim1", game.models.station);
    //anim.addCall(() => vm.gotoView("V1", 4));
    anim.addCall(() => vm.gotoView("V1", 0));
    anim.addCall(() => {
        console.log("******* clear stage!! *****");
        program.selectStageModel(null);
    });
    anim.addWait(1)
    anim.addCall(() => vm.gotoView("V4", 8));
    anim.addWait(8)
    window.lastAnim = anim;
    return anim;
}
*/

FORCED_IMAGES = false;

function imaginariumTour() {
    //var target = game.models.station;
    var vm = game.viewManager;
    var program = game.program;
    program.selectStageModel(null);
    var anim = new MUSE.Anim("anim1", game.models.station);
    //anim.addCall(() => vm.gotoView("V1", 4));
    if (!FORCED_IMAGES) {
        console.log("Force images");
        anim.addCall(() => vm.gotoView("Very Far Away", 0));
        anim.addWait(1);
        anim.addCall(() => vm.gotoView("V1", 6));
        anim.addWait(8);
        anim.addCall(() => vm.gotoView("V1", 2));
        anim.addWait(4);
        FORCED_IMAGES = true;
    }
    else {
        console.log("Skipping force images");
        anim.addCall(() => vm.gotoView("V1", 9));
        anim.addWait(11)
    }
    anim.addWait(1)
    anim.addCall(() => vm.gotoView("V5", 8));
    anim.addWait(8)
    window.lastAnim = anim;
    return anim;
}

var sparkler = null;
function toggleSparkler() {
    if (!sparkler) {
        sparkler = new MUSE.Sparkler("sparkler");
    }
    window.sparkler = sparkler;
    sparkler.toggle();
    //
      var c0 = game.vr.controllers.controller0;
      var c1 = game.vr.controllers.controller1;
      sparkler.trackObject("left", c0);
      sparkler.trackObject("right", c1);
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
       name: "CMP Showcase",
       onStartProgram: onStartProgram,
       duration: 32*60,
       gss: "https://spreadsheets.google.com/feeds/list/1Vj4wbW0-VlVV4sG4MzqvDvhc-V7rTNI7ZbfNZKEFU1c/default/public/values?alt=json",
       stages: [
           {
               name: 'Main Stage',
               models: {
                   'vEarth': 'Virtual Earth',
                   'co2Earth': 'CO2 Earth',
                   'dancer': 'Dancer',
                   'cmp': 'Data Visualization',
                   'geodesicDome': 'Geodesic Dome',
                   'none': 'Nothing'
               }
           }
       ],
       channels: [
           {name: 'time',        label: "Time",    format: Util.toHHMMSS , default: 0},
           {name: 'year',        label: "Year"                      , default: 1850, min: 1850, max: 2300 },
           {name: 'temperature', label: "T",       format: "%6.2f"  },
           {name: 'co2',         label: "CO2",     format: "%6.2f"  },
           {name: 'balance',     label: "Balance", format: "%8.1f"  },
           //'dyear',
           'spacer',
           {name: 'narrative', style: "height:110px", fieldElement: "div"}
        ],
        scripts: {
            //'Show 3D Graph': (game) => show3DGraph(game),
            //'Show Virtual Earth': (game) => showVirtualEarth(game),
            'Start': (game) => imaginariumTour(),
            'Force Images': (game) => forceImages(),
            //'Planetary Tour': (game) => planetaryTour(),
            'Show 2013 Weather': (game) => setEarthVideo(game, "assets/video/GlobalWeather2013.mp4"),
            //'Show surface temp 1850-2300': (game) => setEarthVideo(game, "assets/video/tas_Amon_CCSM4_1850_2300.mp4"),
            //'Show surface temp 1850-2300': (game) => setEarthVideo(game, "assets/video/tas_1850_2300.mp4"),
            'Climate Model Clouds': (game) => setEarthVideo(game, "assets/video/CloudTruth.mp4"),
            'Toggle Sparkler': (game) => toggleSparkler(),
        },

       media: MEDIA_SPECS,
       nodes: [NET_LINK, SCRIPTS, POSTERS, BUBBLES, TOKENS, SPECS]
    },
    //venue: '/configs/venues/imaginarium.js',
    venue: '/configs/venues/imaginariumSimple.js',
    environment: SOLAR_SYSTEM
    //'specs': [SCRIPTS, POSTERS, BUBBLES]
};

MUSE.returnValue(CONFIG);
//
