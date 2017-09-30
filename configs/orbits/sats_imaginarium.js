

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
    },
    // {   type: 'Screen', name: 'vidBubble2', parent: 'station', radius: 0.4, position: [1,3.6,0],
    //     path: 'webrtc+http://localhost:8081',
    // },
];

var SPECS = [
    {  type: 'Stats', right: '-0px' },
    {  type: 'JQControls' },
    {  type: 'ViewManager', bookmarksUrl: 'data/imaginarium_bookmarks.json' },
    //{  type: 'Scripts' },
    {   type: 'Group', name: 'station'  },
    {   type: 'Model', name: 'platform',
        parent: 'station',
        path: 'models/PlayDomeSkp_v1.dae',
        position: [0, 0, 0],
        rot: [0, 0, 0],
        scale: 0.025
    },
    {   type: 'Model', name: 'iridium',
        parent: 'station',
        path: 'models/satellites/Iridium/model.dae',
        position: [0.2, 0, 1.6],
        rot: [0, 0, 0],
        scale: 0.001,
        visible: false
    },
    //VID_BUBBLES,
    {   type: 'Screen', name: 'mainScreen',
        parent: 'station', radius: 8.8,
        path: 'videos/SpaceDebris.mp4',
        phiStart: 34, phiLength: 47,
        thetaStart: 110, thetaLength: 140
    },
    {   type: 'Screen', name: 'rightScreen',
        parent: 'station', radius: 8.8,
        //path: 'videos/Climate-Music-V3-Distortion_HD_540.webm',
        path: 'assets/images/SpaceDebrisTalk/Slide1.PNG',
        phiStart: 34, phiLength: 47,
        thetaStart: 300, thetaLength: 60
    },
    {   type: 'Screen', name: 'leftScreen',
        parent: 'station', radius: 8.8,
        //path: 'videos/Climate-Music-V3-Distortion_HD_540.webm',
        path: 'assets/images/SpaceDebrisTalk/Slide1.PNG',
        phiStart: 40, phiLength: 30,
        thetaStart: 30, thetaLength: 50
    },
    {  type: 'Marquee',    name: 'marquee1',
       radius: 7,
       phiStart: -50, phiLength: 100,
       thetaStart: 65, thetaLength: 20
    },
    LIGHTS,
    {  type: 'Dancer', name: 'dancer', visible: false },
    {  type: 'CMPDataViz', name: 'cmp',
       position: [0, 2, 0], rotation: [0, 0, 0], scale: [1.5, 1, 1.5],
       visible: false
    },
    {  type: 'SolarSystem' },
    {  type: 'Stars' },
    {  type: 'SlidePlayer', name: 'slidePlayer', screenName: 'rightScreen',
       records: { records: [
           { t: '1959-1-1',   url: 'assets/images/SpaceDebrisTalk/Slide1.PNG'},
           { t: '1980-1-1',   url: 'assets/images/SpaceDebrisTalk/Slide2.PNG'},
           { t: '1990-1-1',   url: 'assets/images/SpaceDebrisTalk/Slide3.PNG'},
           //{ t: '2000-1-1',   url: 'assets/images/SpaceDebrisTalk/Slide4.PNG'},
           { t: '2000-1-1',   url: 'videos/YukiyoCompilation.mp4'},
           { t: '2010-1-1',   url: 'assets/images/SpaceDebrisTalk/Slide5.PNG'},
           { t: '2017-1-1',   url: 'assets/images/SpaceDebrisTalk/Slide6.PNG'}
       ]}
    },
    {  type: 'SlidePlayer', name: 'slidePlayer2', screenName: 'leftScreen',
       records: { records: [
           { t: '2016-1-1',   url: 'assets/images/SpaceDebrisTalk/Slide6.PNG'},
           { t: '2017-1-1',   url: 'assets/images/SpaceDebrisTalk/Slide7.PNG'},
           { t: '2018-1-1',   url: 'assets/images/SpaceDebrisTalk/Slide8.PNG'}
       ]}
    },
    //{  type: 'Hurricane', scale: 0.01 }
    {  type: 'VirtualEarth', name: 'vEarth', satTracks: 0,
       //radius: 1.25,
       radius: 0.5,
       position: [0,1.9,0],
       satTracks: {dataSet: 'stdb/all_stdb.json',
                    models: {
                        22675: {path:'models/satellites/ComSat/model.dae',
                                       scale: .001},
                        24946: {path:'models/satellites/Iridium/model.dae',
                                      scale: .00005}
                    }},
    }
];

function watchCollision(game)
{
    game.program.setTimeRange('2/10/2009 8:40:00', '2/10/2009 12:40:00');
    game.program.setPlayTime('2/10/2009 8:50:00');
}

function onStart(game)
{
    var t = game.program.getPlayTime();
    var t = 1234284990.0;
    var p = new THREE.Vector3(-1698.7030173737744, 1503.0165902867889, 6777.4862190372805);
    p.multiplyScalar(satTracks.radiusVEarth/satTracks.radiusEarthKm);
    satTracks.addEvent(t, p.x,p.z,-p.y, 3);
}

function useWebWorker(game)
{
    if (satTracks.webWorkerRate)
        satTracks.setWorkerRate(0);
    else
        satTracks.setWorkerRate(10);
}

CONFIG = {
    onStart: onStart,
    'cameraControls': 'JoelControls',
    'program': {
       //duration: 32*60,
       duration: 65*365*24*60*60,
       //startTime: 'now',
       startTime: '10/4/1957',
       playTime: 'now',
       playSpeed: 100,
       //gss: "https://spreadsheets.google.com/feeds/list/1Vj4wbW0-VlVV4sG4MzqvDvhc-V7rTNI7ZbfNZKEFU1c/default/public/values?alt=json",
       stages: [
           {
               name: 'Main Stage',
               models: {
                   'vEarth': 'Virtual Earth',
                   'cmp': 'Data Visualization',
                   'iridium': 'Iridium',
                   'none': 'Nothing'
               }
           }
       ],
       channels: ['time', 'year', 'narrative', 'spaceStatus'],
       scripts: {
           'Watch Collision': watchCollision,
           'Web Worker': useWebWorker,
           //'Add Collision': addCollisions
       }
    },
    'specs': SPECS
};
