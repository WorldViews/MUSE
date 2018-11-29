
var LIGHTS = [
    {  type: 'PointLight', name: 'light1', color: 0xffaaaa, position: [0, -25,-2]},
    {  type: 'PointLight', name: 'light2', color: 0xaaffaa, position: [0, -25, 0]},
    {  type: 'PointLight', name: 'light3', color: 0xaaaaff, position: [0, -25, 2]},
    {  type: 'PointLight', name: 'sun',    color: 0xffffff, position: [0, 1000, 0], distance: 5000},
];

var SPECS = [
    {  type: 'Stats', right: '-0px' },
    {  type: 'ViewManager', bookmarksUrl: 'data/imaginarium_bookmarks.json' },
    //{  type: 'Scripts' },
    {   type: 'Group', name: 'station'  },
    {   type: 'Model', name: 'platform',
        parent: 'station',
        path: 'assets/models/NOHSpace.dae',
        position: [0, 0, 0],
        rot: [0, 0, 0],
        scale: 0.025
    },
    {  type: 'Screen',    name: 'marquee2',
       width: 5.2, height: 3.1,
       path: 'assets/video/BackgroundV1DanceHack.mp4',
       position: [3.1, 2.3, -.2]
    },
    {  type: 'Cloth',
       name: 'silkScreen1',
       path: 'assets/video/BackgroundV1DanceHack.mp4'
    },
    LIGHTS
];

CONFIG = {
    webUI: { type: 'JQControls' },
    specs: SPECS
}

MUSE.returnValue(CONFIG);
