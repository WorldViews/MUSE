
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

function onUpdate(game)
{
    var t = game.program.playTime;
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

CONFIG = {
    'cameraControls': {type: 'Orbit', distance: 4},
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
       channels: ['spaceStatus', 'numSats', 'dbEpoch'],
       scripts: {
           'Dump Satellites': dumpSats
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
           //satTracks: {dataSet: 'historicalSats.json'},
           satTracks: {
               //dataSet: 'allSats.json',
               //dataSet: 'tle-9-1-2017.json',
               dataSet: 'stdb/all_stdb.json',
               //dataSet: '2017-01-01.muse.json',
               //models: [
                //   'models/satellites/ComSat/model.dae',
                //   'models/satellites/ComSat2/model.dae'],
           },
           //satTracks: 1,
           dataViz: 0,
           atmosphere: {'name': 'CO2Viz', opacity: .8}
        }
    ]
};
