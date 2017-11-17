
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
    gameOptions: {ambientLightIntensity: 2.0},
    cameraControls: {type: 'Orbit', distance: 4},
    webUI: {type: 'JQControls' },
    specs: [VEARTH]
};

MUSE.returnValue(CONFIG);
