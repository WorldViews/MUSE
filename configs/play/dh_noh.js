
var NOH_SPACE = {
    type: 'Model', name: 'platform',
    parent: 'station',
    path: 'assets/models/NOHSpace.dae',
    position: [0, 0, 0],
    rot: [0, 0, 0],
    scale: 0.025
};
    
var SPECS = [
    {  type: 'Stats', right: '-0px' },
    {  type: 'ViewManager', bookmarksUrl: 'data/imaginarium_bookmarks.json' },
    //{  type: 'Scripts' },
    {   type: 'Group', name: 'station'  },
    {  type: 'Screen',    name: 'marquee2',
       width: 5.2, height: 3.1,
       path: 'assets/video/BackgroundV1DanceHack.mp4',
       position: [3.1, 2.3, -.2]
    },
    {  type: 'Dancer',
       motionUrl: 'assets/motionCapture/lauren_duality_edit.bvh',
       name: 'dancer', visible: true,
       position: [3, 0.1, -1.5],
//       scale: [1.2, 1.2, 1.2]
    },
    {  type: 'Cloth',
       name: 'silkScreen1',
       //path: 'assets/video/BackgroundV1DanceHack.mp4',
       //path: 'assets/video/BackgroundV1DanceHack.mp4',
       path: 'assets/video/MG_Artwork.mp4',
       opacity: .5,
       position: [3.0, 0, -1.8],
       rotation: [0, 1.5708, 0],
       scale: [.45,.8,.45]
    },
    {  type: 'Cloth',
       name: 'silkScreen2',
       path: 'textures/lace1.png',
       position: [3.0, 0, -4],
       rotation: [0, 1.5708, 0],
       scale: [.8,.8,.8]
    },
];

CONFIG = {
    webUI: { type: 'JQControls' },
    gameOptions: { headlightIntensity: 1, ambientLightIntensity: 1},
    venue: NOH_SPACE,
    specs: SPECS
}

MUSE.returnValue(CONFIG);
