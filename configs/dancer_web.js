
var SPECS = [
    {  type: 'PointLight', name: 'sun',    color: 0xffffff, position: [-1000, 0, 0], distance: 5000},
    {  type: 'PointLight',                 color: 0xffffff, position: [3000, 0, 0], distance: 5000},
    {  type: 'Dancer', name: "dancer1", motionUrl: '/assets/motionCapture/lauren_duality_edit.bvh' }
];

function setBVH(game, name, URL)
{
    game.state.set("dancerName", name);
    game.state.set("dancer1", {motionUrl: URL});
}

CONFIG = {
    'webUI': {type: 'JQControls' },
    'program': {
       duration: 300,
       channels: ["dancerName"],
       scripts: {
           'Master Liu': (game) => setBVH(game, "Master Liu", BVH1),
           'Lauren': (game) => setBVH(game, "Lauren", BVH2)
       }
       //media: MEDIA_SPECS
    },
    'cameraControls': 'Orbit',
    'specs': SPECS
};

MUSE.returnValue(CONFIG);
