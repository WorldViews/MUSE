
(function () {
var d = 1000;
var positions = [
    [-d, 0, 0],
    [0, -d, 0],
    [0,  0, -d],
    [d,  0,  0],
    [0,  d,  0],
    [0,  0,  d]];


var LIGHTS = positions.map( pos =>
       ({  type: 'PointLight', color: 0xffffff, position: pos,  distance: 1500})
   );

window. hide = function()
{
    var m = game.models.CHM;
    var g = m.getChildByName("RoofGroup");
    g.visible = false;
}

function controlScript(val)
{
    var m = game.models.CHM;
    if (val.hide) {
        var g = m.getChildByName(val.hide);
        g.visible = false;
    }
    if (val.show) {
        var g = m.getChildByName(val.show);
        g.visible = true;
    }
}

function onStart(game)
{
    console.log("onStart");
    game.state.on('controlScript', controlScript);
    hide();
}

MEDIA = [
    {  type: 'MediaSequence', name: 'mainScreen',
       media: [
           [{ name: 'controlScript', note: "This is a note", hide: 'RoofGroup'},
            { name: 'day', text: "Monday"}
           ],
           [{ name: 'controlScript', note: "This is a note", show: 'RoofGroup'},
            { name: 'day', text: "Tuesday"}
           ],
           [{ name: 'controlScript', note: "This is a note", n: 5},
            { name: 'day', text: "Wednesday"}
           ],
       ]
   }
];

CONFIG = {
    'onStart': onStart,
    'ui': {'type': 'JQControls'},
    'program': {
        media: MEDIA,
        channels: ["day"]
    },
    'venue': [
        {   type: 'Group', name: 'station'  },
        {   type: 'Model', name: 'CHM',
            parent: 'station',
            path: 'models/CHM/CHM_ACM_latest.dae',
            position: [0, 0, 0],
            rot: [0, 0, 0],
            scale: 0.001
        },
        LIGHTS,
        {  type: 'ViewManager', bookmarksUrl: 'data/imaginarium_bookmarks.json' },
    ]
};

MUSE.returnValue(CONFIG);
})
();
