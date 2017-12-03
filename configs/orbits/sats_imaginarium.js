

function watchCollision(game)
{
    game.program.setTimeRange('2/10/2009 8:40:00', '2/10/2009 12:40:00');
    game.program.setPlayTime('2/10/2009 8:50:00');
}

function controlScript(props)
{
    console.log("****************************************************************");
    console.log("******** controlScript got :"+JSON.stringify(props));
    console.log("****************************************************************");
}
window.controlScript = controlScript;

function onStart(game)
{
    game.state.on("controlScript", controlScript)
    return;
    var t = game.program.getPlayTime();
    var t = 1234284990.0;
    var p = new THREE.Vector3(-1698.7030173737744, 1503.0165902867889, 6777.4862190372805);
    p.multiplyScalar(satTracks.radiusVEarth/satTracks.radiusEarthKm);
    satTracks.addEvent(t, p.x,p.z,-p.y, 3);
}

function useWebWorker(game)
{
    if (satTracks.webWorkerRate)
        satTracks.setWorkerRate(0);
    else
        satTracks.setWorkerRate(10);
}

VEARTH = {
    type: 'VirtualEarth', name: 'vEarth', satTracks: 0,
    radius: 1.25, position: [0,1.9,0],
    satTracks: {dataSet: 'stdb/all_stdb.json',
                models: {
                    22675: {path:'assets/models/satellites/ComSat/model.dae',
                           scale: .001},
                    24946: {path:'assets/models/satellites/Iridium/model.dae',
                          scale: .00005}
                }},
}

SATS_PROGRAM = {
   //duration: 32*60,
   duration: 65*365*24*60*60,
   //startTime: 'now',
   startTime: '10/4/1957',
   playTime: 'now',
   playSpeed: 100,
   //gss: "https://spreadsheets.google.com/feeds/list/1Vj4wbW0-VlVV4sG4MzqvDvhc-V7rTNI7ZbfNZKEFU1c/default/public/values?alt=json",
   stages: [
       {
           name: 'Main Stage',
           models: {
               'vEarth': 'Virtual Earth',
               'cmp': 'Data Visualization',
               'iridium': 'Iridium',
               'none': 'Nothing'
           }
       }
   ],
   channels: ['time', 'year', 'narrative', 'spaceStatus'],
   scripts: {
       'Watch Collision': watchCollision,
       'Web Worker': useWebWorker,
       //'Add Collision': addCollisions
   },
   //media: MEDIA_SPEC
   //media: "configs/mediaSpecs/spaceJunk.js"
   nodes: [VEARTH],
   media: "configs/orbits/spaceJunk_media.js"
};

CONFIG = {
    onStart: onStart,
    cameraControls: 'MultiControls',
    webUI: {type: 'JQControls',
           //screens: ["mainScreen"],
          },
    //program: SATS_PROGRAM,
    program: SATS_PROGRAM,
    venue: 'configs/venues/imaginarium.js',
};

MUSE.returnValue(CONFIG);
