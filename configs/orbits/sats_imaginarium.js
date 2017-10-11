
VEARTH = {
    type: 'VirtualEarth', name: 'vEarth', satTracks: 0,
    radius: 1.25, position: [0,1.9,0],
    satTracks: {dataSet: 'stdb/all_stdb.json',
                models: {
                    22675: {path:'models/satellites/ComSat/model.dae',
                           scale: .001},
                    24946: {path:'models/satellites/Iridium/model.dae',
                          scale: .00005}
                }},
}

function onStart(game)
{
    return;
    var t = game.program.getPlayTime();
    var t = 1234284990.0;
    var p = new THREE.Vector3(-1698.7030173737744, 1503.0165902867889, 6777.4862190372805);
    p.multiplyScalar(satTracks.radiusVEarth/satTracks.radiusEarthKm);
    satTracks.addEvent(t, p.x,p.z,-p.y, 3);
}

CONFIG = {
    onStart: onStart,
    cameraControls: 'JoelControls',
    ui: 'JQControls',
    program: CFG.SATS_PROGRAM,
    venue: CFG.IMAGINARIUM_VENUE,
    specs: [VEARTH]
};
