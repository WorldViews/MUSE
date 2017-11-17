
function watchCollision(game)
{
    game.program.setTimeRange('2/10/2009 8:40:00', '2/10/2009 12:40:00');
    game.program.setPlayTime('2/10/2009 8:50:00');
}

function addCollisions(game)
{
    console.log("addCollsions");
    var ids = Object.keys(satDB.sats);
    var id = ids[0];
    var t = game.program.getPlayTime();
    {
        var sat = satTracks.getSatState(id);
        var p = sat.pos;
        console.log(sprintf("id: %s  t: %.1f", id, t), p);
        satTracks.addEvent(t, p.x,p.y,p.z, 3);
    }
}

function onStart(game)
{
    var t = game.program.getPlayTime();
    var t = 1234284990.0;
    var p = new THREE.Vector3(-1698.7030173737744, 1503.0165902867889, 6777.4862190372805);
    p.multiplyScalar(satTracks.radiusVEarth/satTracks.radiusEarthKm);
    satTracks.addEvent(t, p.x,p.z,-p.y, 3);
}

CONFIG = {
    onStart: onStart,
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
            'Watch Collision': watchCollision,
            'Add Collision': addCollisions
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

MUSE.returnValue(CONFIG);
