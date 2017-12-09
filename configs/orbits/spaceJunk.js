

var VIDEO_BUBBLES = [
    {  type: 'Group', name: 'videoBubbles', visible: false },
    {   type: 'VideoBubble', name: 'vidBubble1', parent: 'videoBubbles', radius: 0.6, position: [0,3.6,0],
        path: 'assets/video/SpaceWalk.mp4', autoPlay: false
    },
    {   type: 'VideoBubble', name: 'vidBubble2', parent: 'videoBubbles', radius: 0.6, position: [2,3,0],
        path: 'assets/video/MoonWalk.mp4', autoPlay: false
    },
    {   type: 'VideoBubble', name: 'vidBubble3', parent: 'videoBubbles', radius: 0.6, position: [-2,3,0],
        //path: 'assets/video/ISS_tour.mp4', autoPlay: false
        //side: "FrontSide",
        path: 'assets/video/YukiyoCompilation.mp4', autoPlay: false
    },
];


function onStart(game)
{
    //game.program.formatTime = t =>game.Util.toDate(t);
    var earth = game.controllers.vEarth;
    var atm = earth.atmosphere;
    var tStart = game.Util.toTime("10/4/1957");
    var tEnd = game.Util.toTime("1/1/2020");
    var dur = tEnd - tStart;
    game.program.formatTime = t => {
        f = (t - game.program.startTime)/game.program.duration;
        var ft = tStart + f*dur;
        return game.Util.formatDatetime(ft);
    }
    game.camera.position.z = 10;
}

function setVisibility(game, rsoType, val)
{
    //game.program.formatTime = t =>game.Util.toDate(t);
    satTracks.rsoTypes[rsoType].particles.visible = val;
}

function onUpdate(game)
{
    var t = game.program.getPlayTime();
    var earth = game.controllers.vEarth;
    var atm = earth.atmosphere;
    //console.log("onUpdate t:" + t);
    f = (t - game.program.startTime)/game.program.duration;
    f = f*f*f*f;
    atm.setOpacity(0.9*f);
    var h = 0.6 + .4*f;
    atm.setHue(h);
    return new Date(t*1000);
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

function setVideoBubblesVisibility(game, visibility) {
    game.models.videoBubbles.visible = visibility;
}

CONFIG = {
    //'cameraControls': {type: 'Orbit', distance: 4},
    'cameraControls': {type: 'MultiControls', distance: 4},
    //onStart: onStart,
    onUpdate: onUpdate,
    'program': {
       //duration: 100000,
       duration: 65*365*24*60*60,
       //duration: 10*24*60*60,
       //duration: 100*3600,
       //startTime: 'now',
       startTime: '10/4/1957',
       playTime: 'now',
       playSpeed: 100,
       //startTime: '6/1/2005 10:30'
       channels: ['spaceStatus'],
       scripts: {
           'Dump Satellites': dumpSats,
           'Show Debris': (game) => setVisibility(game, 'DEBRIS', true),
           'Hide Debris': (game) => setVisibility(game, 'DEBRIS', false),
           'Show Video Bubbles': (game) => setVideoBubblesVisibility(game, true),
           'Hide Video Bubbles': (game) => setVideoBubblesVisibility(game, false),
           'Fake Collisons': addCollisions,
           'Web Worker': useWebWorker,
       }
    },
    'specs': [
        {  type: 'Stats', right: '-0px' },
        {  type: 'JQControls' },
        //{  type: 'ViewManager', bookmarksUrl: 'data/imaginarium_bookmarks.json' },
        {  type: 'ViewManager' },
        {  type: 'Stars' },
        {  type: 'PointLight', name: 'sun', position: [-1000, 0, 0], distance: 5000},
        {  type: 'PointLight', name: 'sun', position: [3000, 1000, 0], distance: 5000},
        {  type: 'PointLight', name: 'sun', position: [3000, -1000, 0], distance: 5000},
        {  type: 'VirtualEarth', name: 'vEarth',
           radius: 1.25, rot: [0,0,0],
           //satTracks: {dataSet: 'historicalSats.json'},
           satTracks: {
               //dataSet: 'allSats.json',
               //dataSet: 'tle-9-1-2017.json',
               dataSet: 'stdb/all_stdb.json',
               //dataSet: '2017-01-01.muse.json',
               //models: [
                //   'assets/models/satellites/ComSat/model.dae',
                //   'assets/models/satellites/ComSat2/model.dae'],
           },
           //satTracks: 1,
           dataViz: 0,
           atmosphere: {'name': 'CO2Viz', opacity: .8}
       },
        VIDEO_BUBBLES
    ]
};

MUSE.returnValue(CONFIG);
