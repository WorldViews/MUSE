
MEDIA_SPECS = [
    {  type: 'MediaSequence', defaultDuration: 1,
       records: [
           { t: 0,   mainScreen: {url: 'videos/Climate-Music-V3-Distortion_HD_540.webm'}},
           { t: 1,   mainScreen: {url: 'videos/Climate-Music-V3-Distortion_HD_540.webm'}},
       ]
   }
];

VEARTH = [
    {  type: 'VirtualEarth', name: 'vEarth',
       radius: 1.25, position: [0,0,0],
       satellites: 0, satTracks: 0,
       dataViz: 1,
       //videoTexture: 'videos/GlobalWeather2013.mp4',
       atmosphere: {'name': 'CO2Viz', opacity: .1}
    }
];

var SPECS = [
    //{  type: 'JQControls' },
    {  type: 'Group', name: 'station'  },
    {  type: 'PointLight', name: 'sun',    color: 0xffffff, position: [-1000, 0, 0], distance: 5000},
    {  type: 'PointLight', name: 'sun',    color: 0xffffff, position: [3000, 0, 0], distance: 5000},
    {  type: 'CMPData' },
    {  type: 'CMPDataViz', name: 'cmp',
        //position: [0, 0, 0],
        position: [-10, 0, 0],
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
    if (!year)
        return;
    var earth = game.controllers.vEarth;
    var atm = earth.atmosphere;
    var startYear = 1800;
    var endYear = 2300;
    var co2Min = 280;
    var co2Max = 1970;
    var TMin = 13.0;
    var TMax = 33.0;
    var co2 = game.state.get("co2");
    var T = game.state.get("temp");
    var balance = game.state.get("balance");
    var co2f = (co2 - co2Min)/(co2Max - co2Min);
    var Tf = (T - TMin)/(TMax - TMin);
    try {
        console.log(sprintf("year: %s co2: %6.2f T: %6.2f balance: %6.2f  Tf: %4.2f   co2f: %4.2f",
                year, co2, T, balance, Tf, co2f));
    } catch(e) {
        console.log(e);
    }
    atm.setOpacity(0.9*co2f);
    var h = 0.6 + .6*Tf;
    atm.setHue(h);
}

function onStart(game)
{
    game.state.on("year", updateCMPViz2);
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


CONFIG = {
    'onStart': onStart,
    //'gameOptions': {transparent: true},
    'webUI': {type: 'JQControls',
           screens: ["mainScreen"],
          },
    'program': {
       //startTime: '1/1/1800',
       //playTime: 'now'
       //startTime: '6/1/2005 10:30'
       duration: 32*60,
       gss: "https://spreadsheets.google.com/feeds/list/1Vj4wbW0-VlVV4sG4MzqvDvhc-V7rTNI7ZbfNZKEFU1c/default/public/values?alt=json",
       channels: [
          {name: 'time', label: "Time", format: toHHMMSS },
          {name: 'year', label: "Year" },
          {name: 'temp', label: "T", format: v => sprintf("%6.2f", v)},
          {name: 'co2', label: "CO2"},
          {name: 'balance', label: "Balance", format: v => sprintf("%8.1f", v)},
          'dyear',
          'spacer',
          'narrative'
      ],
       scripts: {
           'Show Earthquakes': (game) => setEarthVideo(game, "videos/earthquakes.mp4"),
           'Show 2013 Weather': (game) => setEarthVideo(game, "videos/GlobalWeather2013.mp4"),
           //'Show surface temp 1850-2300': (game) => setEarthVideo(game, "videos/tas_Amon_CCSM4_1850_2300.mp4"),
           'Show surface temp 1850-2300': (game) => setEarthVideo(game, "videos/tas_1850_2300.mp4"),
           'Climate Model Clouds': (game) => setEarthVideo(game, "videos/CloudTruth.mp4"),
       },
       media: MEDIA_SPECS
    },
    'cameraControls': 'Orbit',
    'specs': SPECS
};

MUSE.returnValue(CONFIG);
