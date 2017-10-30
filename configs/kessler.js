
var TEST = [
    {  type: 'Group',  name: 'station' },
    {  type: 'Group',  name: 'g2',
       position: [200,0,0], rot: [45,0,0],
       children: {type: 'Axes'}
    },
    {  type: 'Group',  name: 'g3',
       position: [200,-500,0],
       rot: [0,30,0],
       children: [
           {  type: 'Axes', name: 'axis3',
              visible: false
           }
       ]
    },
    {  type: 'Axes',   name: 'xyz' }
]

var LIGHTS = [
    {  type: 'PointLight', name: 'light1', color: 0xffaaaa, position: [0, -25,-2]},
    {  type: 'PointLight', name: 'light2', color: 0xaaffaa, position: [0, -25, 0]},
    {  type: 'PointLight', name: 'light3', color: 0xaaaaff, position: [0, -25, 2]},
    {  type: 'PointLight', name: 'sun',    color: 0xffffff, position: [0, 1000, 0], distance: 5000},
];

var OBJ_MODEL = {
    type: 'Model', name: 'derrick', parent: 'station',
    path: 'models/obj/derrick.obj',
    position: [20, 0, 1.6], rot: [0, 0, 0], scale: 2.0
};

var VID_BUBBLES = [
    {   type: 'Screen', name: 'vidBubble1', parent: 'station', radius: 0.4, position: [0,3.6,0],
        path: 'videos/YukiyoCompilation.mp4',
        //path: 'webrtc+http://yulius:8080/'
    }
];

VEARTH = [
    {  type: 'VirtualEarth', name: 'vEarth',
       radius: 1.25, position: [0,1.9,0],
       satellites: 0,
       dataViz: 1
    }
];

SATELLITE_MODEL = [
    {   type: 'Model', name: 'satellite1',
        parent: 'station',
        //path: 'models/AcrimSat_FINAL.fbx',
        //path: 'models/ISS.fbx',
        path: 'models/satellites/Juno/Juno.obj',
        scale: 1.0
    }
];

VENUE = [
    {   type: 'Model', name: 'platform',
        parent: 'station',
        path: 'models/PlayDomeSkp_v1.dae',
        position: [0, 0, 0],
        rot: [0, 0, 0],
        scale: 0.025
    },
    {   type: 'Model', name: 'bmw',
        parent: 'station',
        path: 'models/bmw/model.dae',
        position: [0.2, 0, 1.6],
        rot: [0, 0, 0],
        scale: 0.020,
        visible: false
    },
    {   type: 'Screen', name: 'mainScreen',
        parent: 'station', radius: 8.8,
        path: 'videos/Climate-Music-V3-Distortion_HD_540.webm',
        phiStart: 34, phiLength: 47,
        thetaStart: 110, thetaLength: 140
    },
    {   type: 'Screen', name: 'rightScreen',
        parent: 'station', radius: 8.8,
        path: 'videos/Climate-Music-V3-Distortion_HD_540.webm',
        phiStart: 34, phiLength: 47,
        thetaStart: 300, thetaLength: 60
    },
    {  type: 'Screen',    name: 'marquee1',
       radius: 7,
       phiStart: 65, phiLength: 20,
       thetaStart: -50, thetaLength: 100
    }
]

var SPECS = [
    {   type: 'Group', name: 'station'  },
    //VENUE,
    //SATELLITE_MODEL,
    //OBJ_MODEL,
    //VID_BUBBLES,
    LIGHTS,
    //{  type: 'Inline',     name: 'debugStuff', children: TEST },
    {  type: 'Dancer', name: 'dancer', visible: false },
    {  type: 'CMPDataViz', name: 'cmp',
       position: [0, 2, 0], rotation: [0, 0, 0], scale: [1.5, 1, 1.5],
       visible: false
    },
    //{  type: 'SolarSystem' },
    //{  type: 'Stars' },
    //{  type: 'Stats' },
    //{  type: 'SlidePlayer', name: 'slidePlayer', screenName: 'rightScreen' },
    //{  type: 'ViewManager', bookmarksUrl: 'data/imaginarium_bookmarks.json' },
    //{  type: 'Hurricane', scale: 0.01, parent: 'station' }
    //VEARTH
    { type: 'Kessler', name: 'kessler' ,
      scale: 1.0, parent: 'station', width: 8,
      gravityConstant: 3.0, height: 0, radius: 15,
      centralMass: 10, satMass: 0.0001,
      v0: 0.1
    }
];
//window.CONFIG = CONFIG;
CMP_IMAGINARIUM = SPECS;
CONFIG = {
    'cameraControls': 'Orbit',
    'specs': SPECS
};

MUSE.returnValue(CONFIG);
