

MEDIA_SPECS = "configs/mediaSpecs/cmp_showcase.js";

SCRIPTS = {  type: 'Scripts' };

VEARTH = [
    {  type: 'VirtualEarth', name: 'vEarth',
       radius: 1.25, position: [0,1.9,0],
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
        position: [0, 1, 0],
        //position: [-10, 0, 0],
        rotation: [0, 0, 0],
        //scale: [1.5, 1, 1.5],
        scale: [1.2, 0.8, 1.2],
        visible: true,
        startTime: 10*60, // 10 minutes before starting
        duration: 20*60   // 20 minutes duration time
    },
    //{  type: 'Stars' },
    VEARTH
];

POSTERS = "configs/programs/cmp_posters.js";
BUBBLES = "configs/programs/cmp_vidBubbles.js";

SOLAR_SYSTEM = [ {  type: 'SolarSystem' }, {  type: 'Stars' } ];

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

function onStartProgram() {
    game.state.on("year", updateCMPViz2);
}

CONFIG = {
    //onStart: setupPosterActions,
    //'cameraControls': 'Orbit',
    'cameraControls': {type: 'MultiControls', movementSpeed: .15, keyPanSpeed: .01},
    //'cameraControls': 'JoelControls',
    //'webUI': {type: 'DATGUIControls',
    'webUI': {type: 'JQControls',
           //screens: ["mainScreen"],
          },
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
                   'portal': 'Panoramic Portal',
                   'bmw': 'Eriks Car',
                   'none': 'Nothing'
               }
           }
       ],
       channels: [
           {name: 'time',        label: "Time",    format: toHHMMSS , default: 0},
           {name: 'year',        label: "Year"                      , default: 1850, min: 1850, max: 2300 },
           {name: 'temperature', label: "T",       format: "%6.2f"  },
           {name: 'co2',         label: "CO2",     format: "%6.2f"  },
           {name: 'balance',     label: "Balance", format: "%8.1f"  },
           //'dyear',
           'spacer',
           {name: 'narrative', style: "height:110px", fieldElement: "div"}
        ],

       media: MEDIA_SPECS,
       nodes: [SCRIPTS, POSTERS, BUBBLES, SPECS]
    },
    venue: '/configs/venues/imaginarium.js',
    environment: SOLAR_SYSTEM
    //'specs': [SCRIPTS, POSTERS, BUBBLES]
};

MUSE.returnValue(CONFIG);
//
