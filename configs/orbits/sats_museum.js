

function watchCollision(game)
{
    game.program.setTimeRange('2/10/2009 8:40:00', '2/10/2009 12:40:00');
    game.program.setPlayTime('2/10/2009 8:50:00');
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

function useWebWorker(game)
{
    if (satTracks.webWorkerRate)
        satTracks.setWorkerRate(0);
    else
        satTracks.setWorkerRate(10);
}

CONFIG = {
    onStart: onStart,
    'cameraControls': 'JoelControls',
    'program': {
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
       }
    },
    'specs': '/configs/spaceMuseum.js'
};
