

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

function onStartProgram(game)
{
    //alert("startProgram");
    game.state.on("controlScript", controlScript);
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
    type: 'VirtualEarth', name: 'vEarth',
    radius: 1.25,
    position: [0,1.9,0],
    //position: [0,0,0],
    satTracks: {dataSet: 'stdb/all_stdb.json',
                models: {
                    22675: {path:'assets/models/satellites/ComSat/model.dae',
                           scale: .001},
                    24946: {path:'assets/models/satellites/Iridium/model.dae',
                          scale: .00005}
                }},
    dataViz: 0,
    //videoTexture: 'assets/video/GlobalWeather2013.mp4',
    atmosphere: {'name': 'CO2Viz', opacity: .1}
};


var SPECS = [
    //{  type: 'JQControls' },
    {  type: 'Group', name: 'station'  },
    {  type: 'PointLight', name: 'sun',    color: 0xffffff, position: [-1000, 0, 0], distance: 5000},
    {  type: 'PointLight', name: 'sun',    color: 0xffffff, position: [3000, 0, 0], distance: 5000},
    {  type: 'CMPData' },
    {  type: 'CMPDataViz', name: 'cmp',
        position: [0, 0, 0],
        //position: [-10, 0, 0],
        rotation: [0, 0, 0], scale: [1.5, 1, 1.5],
        visible: true,
        startTime: 10*60, // 10 minutes before starting
        duration: 20*60   // 20 minutes duration time
    },
    //{  type: 'Stars' },
    VEARTH
];

SATS_PROGRAM = {
   type: 'Program',
   onStartProgram: onStartProgram,
   //duration: 32*60,
   duration: 65*365*24*60*60,
   //startTime: 'now',
   startTime: '10/4/1957',
   playTime: 'now',
   playSpeed: 100,
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
   media: "configs/mediaSpecs/spaceJunk.js",
   nodes: SPECS
};

MUSE.returnValue(SATS_PROGRAM);
