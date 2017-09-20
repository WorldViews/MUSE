
function watchCollision(game)
{
    console.log("Hello World");
    game.program.setTimeRange('2/10/2009 8:40:00', '2/10/2009 12:40:00');
    game.program.setPlayTime('2/10/2009 8:50:00');
}

CONFIG = {
    'cameraControls': 'Orbit',
    'program': {
       duration: 3*24*60*60,
       //duration: 100*3600,
       //startTime: 1504131722.726 - 100*24*3600
       //startTime: 1504131722.726
        startTime: '2/9/2009',
        playSpeed: 100,
        playTime: '2/10/2009 8:40:00',
        channels: ['spaceStatus', 'numSats', 'dbEpoch'],
        scripts: {
            'Watch Collision': watchCollision
        }
    },
    'specs': [
        {  type: 'JQControls' },
        {  type: 'Stars' },
        {  type: 'PointLight', name: 'sun', position: [-1000, 0, 0], distance: 5000},
        {  type: 'PointLight', name: 'sun', position: [3000, 1000, 0], distance: 5000},
        {  type: 'PointLight', name: 'sun', position: [3000, -1000, 0], distance: 5000},
        {  type: 'VirtualEarth', name: 'vEarth',
           radius: 1.25, rot: [0,0,0],
           satTracks: {dataSet: 'iridiumCosmos.3le',
                        models: {
                            22675: {path:'models/satellites/ComSat/model.dae',
                                           scale: .001},
                            24946: {path:'models/satellites/Iridium/model.dae',
                                          scale: .00005}
                        }},
           //dataViz: 0,
           atmosphere: {'name': 'CO2Viz', opacity: .1}
        }
    ]
};
