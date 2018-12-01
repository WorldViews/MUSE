
var MEDIA_SPECS = [
    {  type: 'MediaSequence', defaultDuration: 1,
       records: [
           { t: 0,
             mainScreen:  {url: 'assets/video/BackgroundV1DanceHack.mp4'},
             silkScreen1: {url: 'textures/lace1.png'},
           },
           { t: 45, silkScreen1: {url: 'assets/video/MG_Artwork.mp4'}}
       ]
   },
];

var NOH_SPACE = [
    {
    type: 'Model', name: 'platform',
    parent: 'station',
    path: 'assets/models/NOHSpace.dae',
    position: [0, 0, 0],
    rot: [0, 0, 0],
    scale: 0.025
    },
    {  type: 'Dancer',
       motionUrl: 'assets/motionCapture/lauren_duality_edit.bvh',
       name: 'dancer', visible: true,
       position: [3, 0.1, -1.5],
//       scale: [1.2, 1.2, 1.2]
    }
];

VEARTH = [
    {  type: 'VirtualEarth', name: 'vEarth',
       radius: 1.25, position: [0,1.9,0],
       satellites: 0, satTracks: 0,
       dataViz: 1,
       atmosphere: {'name': 'CO2Viz', opacity: .1}
    }
];
    
var SPECS = [
    {  type: 'Stats', right: '-0px' },
    {  type: 'ViewManager',
       bookmarksUrl: 'data/healinggarden_bookmarks.json'
    },
    //{  type: 'Scripts' },
    {   type: 'Group', name: 'station'  },
    {  type: 'Screen',    name: 'mainScreen',
       width: 5.2, height: 3.1,
       path: 'assets/video/BackgroundV1DanceHack.mp4',
       position: [3.1, 2.3, -.2]
    },
    //VEARTH,
    {  type: 'Cloth',
       name: 'silkScreen1',
       //path: 'assets/video/BackgroundV1DanceHack.mp4',
       //path: 'assets/video/BackgroundV1DanceHack.mp4',
       //path: 'assets/video/MG_Artwork.mp4',
       path: 'textures/lace1.png',       
       opacity: .5,
       position: [3.0, 0, -4.2],
       rotation: [0, -1.5708, 0],
       scale: [.45,.8,.45]
    },
/*
    {  type: 'Cloth',
       name: 'silkScreen2',
       path: 'textures/lace1.png',
       position: [3.0, 0, -4],
       rotation: [0, 1.5708, 0],
       scale: [.8,.8,.8]
    },
*/
];

function startProgram()
{
    console.log("startProgram", game);
    game.progam.setPlayTime(0);
}

CONFIG = {
    webUI: { type: 'JQControls' },
    gameOptions: { headlightIntensity: 1, ambientLightIntensity: 1},
    venue: NOH_SPACE,
    program: {
       name: "Dance Hack Healing Garden",
       //onStartProgram: onStartProgram,
       duration: 6*60,
       //gss: "https://spreadsheets.google.com/feeds/list/1Vj4wbW0-VlVV4sG4MzqvDvhc-V7rTNI7ZbfNZKEFU1c/default/public/values?alt=json",
       stages: [
           {
               name: 'Main Stage',
               models: {
                   'dancer': 'Dancer',
                   //'cmp': 'Data Visualization',
                   //'geodesicDome': 'Geodesic Dome',
                   //'vEarth': 'Virtual Earth',
                   'none': 'Nothing'
               },
               initialModel: 'none'
           }
       ],
       channels: [
           {name: 'time',        label: "Time",    format: Util.toHHMMSS , default: 0},
           'spacer',
           {name: 'narrative', style: "height:110px", fieldElement: "div"}
       ],
       scripts: {
            //'Show 3D Graph': (game) => show3DGraph(game),
            //'Show Virtual Earth': (game) => showVirtualEarth(game),
            'Start': (game) => startProgram(),
            //'Planetary Tour': (game) => planetaryTour(),
        },
       media: MEDIA_SPECS,
       //nodes: [NET_LINK, SCRIPTS, POSTERS, BUBBLES, TOKENS, SPECS]
    },
    specs: SPECS
}

MUSE.returnValue(CONFIG);
