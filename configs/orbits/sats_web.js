
VEARTH = {
    type: 'VirtualEarth', name: 'vEarth',
    radius: 1.25,
    position: [0,1.9,0],
    //position: [0,0,0],
    satTracks: {dataSet: 'stdb/all_stdb.json',
                models: {
                    22675: {path:'models/satellites/ComSat/model.dae',
                           scale: .001},
                    24946: {path:'models/satellites/Iridium/model.dae',
                          scale: .00005}
                }},
    dataViz: 0,
    //videoTexture: 'videos/GlobalWeather2013.mp4',
    atmosphere: {'name': 'CO2Viz', opacity: .1}
};


CONFIG = {
    //onStart: onStart,
    cameraControls: 'MultiControls',
    webUI: {type: 'JQControls',
           screens: ["mainScreen"],
          },
    //program: SATS_PROGRAM,
    program: 'configs/programs/sats.js',
    //venue: 'configs/venues/imaginarium.js',
    specs: [VEARTH]
};

MUSE.returnValue(CONFIG);
