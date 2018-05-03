



function setVisibility(game, rsoType, val)
{
    //game.program.formatTime = t =>game.Util.toDate(t);
    satTracks.rsoTypes[rsoType].particles.visible = val;
}

function onUpdate(game)
{
    var t = game.program.getPlayTime();
    //var earth = game.controllers.vEarth;
    var earth = game.nodes.vEarth;
    var atm = earth.atmosphere;
    //console.log("onUpdate t:" + t);
    f = (t - game.program.startTime)/game.program.duration;
    f = f*f*f*f;
    atm.setOpacity(0.9*f);
    var h = 0.6 + .4*f;
    atm.setHue(h);
    var date = new Date(t*1000);
    game.state.set("date", "Date: "+Util.formatDateMDY(t));
    return date;
}

function dumpSats(game)
{
    console.log("Hello World");
    satDB.dump();
}

function useWebWorker(game)
{
    if (satTracks.webWorkerRate)
        satTracks.setWorkerRate(0);
    else
        satTracks.setWorkerRate(10);
}

function addCollisions(game)
{
    console.log("addCollsions");
    var ids = Object.keys(satDB.sats);
    var t0 = game.program.getPlayTime();
    var numIds = ids.length;
    var numCols = Math.min(100, numIds);
    var stormDur = 100*60;
    for (var j=0; j<numCols; j++) {
        var i = Math.floor(numIds*Math.random());
        var id = ids[i];
        var t = t0 + stormDur*Math.random();
        var sat = satTracks.getSatState(id, t);
        var p = sat.pos;
        console.log(sprintf("id: %s  t: %.1f", id, t), p);
        satTracks.addEvent(t, p.x,p.y,p.z, 15, 1);
    };
}

function showHistoricalDebris(game)
{
    satTracks.clear();
    opts = { dataSet: 'stdb/all_stdb.json', parent: 'vEarth' };
    satTracks.setOpts(opts);
    game.program.setTimeRange('1/1/1954', '2/10/2009');
    game.program.setPlayTime('1/1/2014');
}

function showIridiumCollision(game)
{
    satTracks.clear();
    opts = {dataSet: 'iridiumCosmos.3le',
            parent: 'vEarth',
            models: {
                22675: {path:'assets/models/satellites/ComSat/model.dae',
                        scale: .001},
                24946: {path:'assets/models/satellites/Iridium/model.dae',
                        scale: .00005}
            }};
    satTracks.setOpts(opts);
    game.program.setTimeRange('2/10/2009 8:40:00', '2/10/2009 12:40:00');
    game.program.setPlayTime('2/10/2009 8:50:00');
}

function showFengyunShootdown(game)
{
//    game.program.setTimeRange('1/10/2007 8:40:00', '2/10/2009 12:40:00');
    opts = {dataSet: 'fengyun1c.3le',
            parent: 'vEarth',
            models: {
                25730: {path:'assets/models/satellites/Fengyun/fengyun.dae',
                        scale: 0.04,
                        recenter: true},
            }};
    satTracks.clear();
    satTracks.setOpts(opts);
    game.program.setTimeRange('1/10/2007', '1/13/2007');
    game.program.setPlayTime('1/10/2007');
    game.program.setPlaySpeed(100);
}

CONFIG = {
    //'cameraControls': {type: 'Orbit', distance: 4},
    cameraControls: {type: 'MultiControls', distance: 4},
    onUpdate: onUpdate,
    program: {
       //duration: 100000,
       duration: 65*365*24*60*60,
       //duration: 10*24*60*60,
       //duration: 100*3600,
       //startTime: 'now',
       startTime: '10/4/1957',
       playTime: 'now',
       playSpeed: 100,
       //startTime: '6/1/2005 10:30'
       channels: ['date', 'spaceStatus'],
       scripts: {
           'Dump Satellites': dumpSats,
           'Show Debris': (game) => setVisibility(game, 'DEBRIS', true),
           'Hide Debris': (game) => setVisibility(game, 'DEBRIS', false),
           'Historical Debris': (game) => showHistoricalDebris(game),
           'Iridium Collision': (game) => showIridiumCollision(game),
           'Fengyun Shootdown': (game) => showFengyunShootdown(game),
           'Fake Collisons': addCollisions,
           'Web Worker': useWebWorker,
       }
    },
    nodes: [
        {  type: 'Stats', right: '-0px' },
        {  type: 'JQControls' },
        {  type: 'ViewManager' },
        {  type: 'Stars' },
        {  type: 'PointLight', name: 'sun', position: [-1000, 0, 0], distance: 5000},
        {  type: 'PointLight', name: 'sun', position: [3000, 1000, 0], distance: 5000},
        {  type: 'VirtualEarth', name: 'vEarth',
           radius: 1.25, rot: [0,0,0], position: [0,2,0],
           satTracks: {
               //dataSet: 'allSats.json',
               //dataSet: 'tle-9-1-2017.json',
               dataSet: 'stdb/all_stdb.json',
           },
           dataViz: 0,
           atmosphere: {'name': 'CO2Viz', opacity: .8}
       }
    ]
};

MUSE.returnValue(CONFIG);
