
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
    {  type: 'PointLight', name: 'light1', color: 0xffaaaa, position: [0, -25,-2], intensity: 0.2},
    {  type: 'PointLight', name: 'light2', color: 0xaaffaa, position: [0, -25, 0], intensity: 0.2},
    {  type: 'PointLight', name: 'light3', color: 0xaaaaff, position: [0, -25, 2], intensity: 0.2},
    {  type: 'AmbientLight', name: 'ambientLight', color: 0xffffff, intensity: 0.1 },
    {  type: 'DirectionalLight', name: 'directionalLight', color: 0x333333, intensity: 0.7, position: [10, 10, 1], castShadow: true},
    //{  type: 'PointLight', name: 'sun',    color: 0xffffff, position: [1000, 1000, 0], distance: 5000, intensity: 0.6},
    //{  type: 'PointLight', name: 'sunLight',    color: 0xffffff, position: [-3000, 0, -2000], distance: 8000, intensity: 10.6},
];

SATELLITE_MODEL = [
    {   type: 'Model', name: 'satellite1',
        parent: 'station',
        //path: 'assets/models/AcrimSat_FINAL.fbx',
        //path: 'assets/models/ISS.fbx',
        path: 'assets/models/satellites/Juno/Juno.obj',
        scale: 1.0
    }
];

SHIP_OLD_MODEL = {
    type: 'Model', name: 'Floor',
    parent: 'station',
    path: 'assets/models/PlayDomeSkp_v1.dae',
    position: [0, 0, 0],
    rot: [0, 0, 0],
    scale: 0.025
};

SHIP_MODEL_DAE = {
    type: 'Model', name: 'ShipDAE',
    parent: 'station',
    path: 'assets/models/dae_ship/refined-ship.dae',
    position: [9.4, 0, 200],
    rot: [0, 0, 0],
    scale: 0.027,
    ignoreCollision: true
}

SHIP_MODEL = {
    type: 'Model', name: 'Ship',
    parent: 'station',
    path: 'assets/models/imaginarium-ship/imaginarium-ship.obj',
    position: [9.4, 0, 0],
    rot: [0, 0, 0],
    scale: 0.027,
    ignoreCollision: true,
    receiveShadow: true
}

SHIP_MODEL_COLLISION = {
    type: 'Model', name: 'Floor',
    parent: 'station',
    path: 'assets/models/imaginarium-ship/imaginarium-ship-collision.obj',
    position: [0, 0, 0],
    rot: [0, 0, 0],
    scale: 1,
    hide: true
}
var SPECS = [
    {  type: 'Stats', right: '-0px' },
    //{  type: 'JQControls' },
    {  type: 'ViewManager', bookmarksUrl: 'data/imaginarium_bookmarks.json' },
    //{  type: 'Scripts' },
    {   type: 'Group', name: 'station'  },
    // 'Floor' is a special name used for VR Controller raycast
    SHIP_MODEL,
    SHIP_MODEL_COLLISION,
    {   type: 'Model', name: 'bmw',
        parent: 'station',
        path: 'assets/models/bmw/model.dae',
        position: [0.2, 0, 1.6],
        rot: [0, 0, 0],
        scale: 0.020,
        visible: false
    },
    //SATELLITE_MODEL,
    {   type: 'Screen', name: 'mainScreen',
        parent: 'station', radius: 8.8,
        //path: 'assets/video/Climate-Music-V3-Distortion_HD_540.webm',
        path: 'textures/DisplayNames/display1.PNG',
        phiStart: 34, phiLength: 47,
        thetaStart: 110, thetaLength: 140
    },
/*
    {   type: 'Screen', name: 'rightScreen',
        parent: 'station', radius: 8.8,
        //path: 'assets/video/Climate-Music-V3-Distortion_HD_540.webm',
        path: 'textures/DisplayNames/display2.PNG',
        phiStart: 40, phiLength: 30,
        thetaStart: 270, thetaLength: 60
    },
    {   type: 'Screen', name: 'leftScreen',
        parent: 'station', radius: 8.8,
        //path: 'assets/video/Climate-Music-V3-Distortion_HD_540.webm',
        path: 'textures/DisplayNames/display3.PNG',
        phiStart: 40, phiLength: 30,
        thetaStart: 40, thetaLength: 50
    },
*/
    {  type: 'Screen',    name: 'marquee1', channel: 'narrative',
       radius: 7.8,
       phiStart: 58, phiLength: 20,
       thetaStart: 130, thetaLength: 100,
    },
    {  type: 'Screen',    name: 'innerCover',
       radius: 8.7,
       //phiStart: 0, phiLength: 90,
       phiStart: 0, phiLength: 120,
       thetaStart: 0, thetaLength: 360,
       visible: false,
       path: 'textures/wholeFog.jpg',
    },
    {  type: 'Screen',    name: 'outerCover',
       radius: 9.4,
       scale: [1,1.1,1],
       phiStart: 0, phiLength: 90,
       thetaStart: 0, thetaLength: 360,
       visible: false,
       path: 'textures/wholeFog.jpg',
    },
    LIGHTS,
    //{  type: 'Inline',     name: 'debugStuff', children: TEST },
    {  type: 'Dancer',
        motionUrl: '/assets/motionCapture/lauren_duality_edit.bvh',
        name: 'dancer', visible: false },

// Note that the SolarSystem and Stars are now part of the environment
// so have been removed from here.
//    {  type: 'SolarSystem' },
//    {  type: 'Stars' },
    //{  type: 'Hurricane', scale: 0.01 }

// Now these visualizations which are CMP specific have been moved
// out of here into the program or config files.
    /*
    {  type: 'CMPDataViz', name: 'cmp',
       position: [0, 2, 0], rotation: [0, 0, 0], scale: [1.5, 1, 1.5],
       visible: false
    },
    {  type: 'VirtualEarth', name: 'vEarth', satTracks: 0,
       radius: 1.25, position: [0,1.9,0],
       dataViz: 1,
        //videoTexture: 'assets/video/GlobalWeather2013.mp4',
       atmosphere: {'name': 'CO2Viz', opacity: .1}
    }
    */
];

MUSE.returnValue(SPECS);
