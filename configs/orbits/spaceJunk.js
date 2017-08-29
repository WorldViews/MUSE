
CONFIG = {
    'cameraControls': 'Orbit',
    'program': {
       duration: 100000
    },
    'specs': [
        {  type: 'JQControls' },
        {  type: 'Stars' },
        {  type: 'PointLight', name: 'sun', position: [-1000, 0, 0], distance: 5000},
        {  type: 'PointLight', name: 'sun', position: [3000, 1000, 0], distance: 5000},
        {  type: 'PointLight', name: 'sun', position: [3000, -1000, 0], distance: 5000},
        {  type: 'VirtualEarth', name: 'vEarth',
           radius: 1.25, rot: [0,0,0],
           //satTracks: {dataSet: 'historicalSats.json'},
           satTracks: {models: [
               'models/satellites/ComSat/model.dae',
               'models/satellites/ComSat2/model.dae']},
           //satTracks: 1,
           dataViz: 0,
           atmosphere: {'name': 'CO2Viz', opacity: .1}
        }
    ]
};
