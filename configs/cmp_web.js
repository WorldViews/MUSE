
/*
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
*/

CONFIG = {
    //'onStart': onStart,
    //'gameOptions': {transparent: true},
    'webUI': {type: 'JQControls',
           screens: [
               //{name: "mainScreen", style: "position:absolute;left:0;top:0;z-index:-100;width:100%;height:100%;"},
               //{name: "mainScreen", parent: "#uiDiv", style: "position:absolute;left:0;top:0;z-index:-100;width:100%;height:100%;"},
               "mainScreen",
           ],
           fieldElement: "span",
          },
    //'program': PROGRAM,
    'program': 'configs/programs/cmp.js',
    'cameraControls': 'Orbit',
    //'specs': SPECS
};

MUSE.returnValue(CONFIG);
