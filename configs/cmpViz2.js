
VEARTH = [
    {  type: 'VirtualEarth', name: 'vEarth',
       radius: 1.25, position: [0,0,0],
       satellites: 0, satTracks: 0,
       dataViz: 1,
       atmosphere: {'name': 'CO2Viz', opacity: .1}
    }
];

var SPECS = [
    {  type: 'JQControls' },
    {  type: 'Group', name: 'station'  },
    {  type: 'PointLight', name: 'sun',    color: 0xffffff, position: [-1000, 0, 0], distance: 5000},
    {  type: 'PointLight', name: 'sun',    color: 0xffffff, position: [3000, 0, 0], distance: 5000},
    {  type: 'CMPDataViz', name: 'cmp',
       position: [0, 0, 0], rotation: [0, 0, 0], scale: [1.5, 1, 1.5],
       visible: false
    },
    {  type: 'Stars' },
    VEARTH
];

function onStart(game)
{
    //game.program.formatTime = t =>game.Util.toDate(t);
    var earth = game.controllers.vEarth;
    var atm = earth.atmosphere;
    game.program.formatTime = t => {
        f = (t - game.program.startTime)/game.program.duration;
        atm.setOpacity(0.9*f);
        var h = 0.6 + .4*f;
        atm.setHue(h);
        return f;
    }
}

CONFIG = {
    'onStart': onStart,
    'program': {
       duration: 400*365*24*60*60,
       startTime: '1/1/1800',
       playTime: 'now'
       //startTime: '6/1/2005 10:30'
    },
    'cameraControls': 'Orbit',
    'specs': SPECS
};
