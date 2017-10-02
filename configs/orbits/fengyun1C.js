
CONFIG = {
    'cameraControls': 'Orbit',
    'program': {
       duration: 3*24*60*60,
       //duration: 100*3600,
       //startTime: 1504131722.726 - 100*24*3600
       //startTime: 1504131722.726
        startTime: '1/10/2007',
        playSpeed: 100,
        playTime: '1/11/2007 14:15:03'
    },
    'specs': [
        {  type: 'JQControls' },
        {  type: 'Stars' },
        {  type: 'PointLight', name: 'sun', position: [-1000, 0, 0], distance: 5000},
        {  type: 'PointLight', name: 'sun', position: [3000, 1000, 0], distance: 5000},
        {  type: 'PointLight', name: 'sun', position: [3000, -1000, 0], distance: 5000},
        {  type: 'VirtualEarth', name: 'vEarth',
           radius: 1.25, rot: [0,0,0],
           satTracks: {dataSet: 'fengyun1c.3le',
                        models: {
                            25730: {path:'models/satellites/Fengyun/fengyun.dae',
                                           scale: 0.04,
                                           recenter: true},
                        }},
           //satTracks: {dataSet: 'iridCosmosColl.json'},
           //satTracks: {models: [
           //    'models/satellites/ComSat/model.dae',
           //    'models/satellites/ComSat2/model.dae']},
           //satTracks: 1,
           dataViz: 0,
           atmosphere: {'name': 'CO2Viz', opacity: .1}
        }
    ]
};
