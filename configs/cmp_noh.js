
var LIGHTS = [
    {  type: 'PointLight', name: 'light1', color: 0xffaaaa, position: [0, -25,-2]},
    {  type: 'PointLight', name: 'light2', color: 0xaaffaa, position: [0, -25, 0]},
    {  type: 'PointLight', name: 'light3', color: 0xaaaaff, position: [0, -25, 2]},
    {  type: 'PointLight', name: 'sun',    color: 0xffffff, position: [0, 1000, 0], distance: 5000},
];

var SPECS = [
    {  type: 'ReactControls' },
    {  type: 'Stats' },
    {  type: 'ViewManager', bookmarksUrl: 'data/imaginarium_bookmarks.json' },
    //{  type: 'Scripts' },
    {   type: 'Group', name: 'station'  },
    {   type: 'Model', name: 'platform',
        parent: 'station',
        path: 'models/NOHSpace.dae',
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
    {  type: 'Marquee',    name: 'marquee1',
       radius: 7,
       phiStart: -50, phiLength: 100,
       thetaStart: 65, thetaLength: 20
    },
    LIGHTS,
    {  type: 'CMPDataViz', name: 'cmp',
       position: [0, 2, 0], rotation: [0, 0, 0], scale: [1.5, 1, 1.5],
       visible: false
    },
    {  type: 'SlidePlayer', name: 'slidePlayer', screenName: 'rightScreen' }
];

CMP_NOH = SPECS;
