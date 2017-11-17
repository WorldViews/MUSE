

var LIGHTS = [
    {  type: 'PointLight', name: 'light1', color: 0xffaaaa, position: [0, -25,-2]},
    {  type: 'PointLight', name: 'light2', color: 0xaaffaa, position: [0, -25, 0]},
    {  type: 'PointLight', name: 'light3', color: 0xaaaaff, position: [0, -25, 2]},
    {  type: 'PointLight', name: 'sun',    color: 0xffffff, position: [0, 1000, 0], distance: 5000},
];

VEARTH = {
    type: 'VirtualEarth', name: 'vEarth',
    radius: 1.25,
    position: [0,0,0],
    satTracks: {dataSet: 'stdb/all_stdb.json',
                models: {
                    22675: {path:'models/satellites/ComSat/model.dae',
                           scale: .001},
                    24946: {path:'models/satellites/Iridium/model.dae',
                          scale: .00005}
                }},
    dataViz: 0,
};

CONFIG = {
    //cameraControls: {type: 'MultiControls', distance: 4},
    cameraControls: {type: 'Orbit', distance: 4},
    webUI: {type: 'JQControls' },
    specs: [LIGHTS, VEARTH]
};

MUSE.returnValue(CONFIG);
