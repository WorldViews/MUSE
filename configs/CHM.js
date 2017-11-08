
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

function sceneControl(props)
{
    var m = game.models.CHM;
    if (props.hide) {
        var g = m.getChildByName(props.hide);
        g.visible = false;
    }
    if (props.show) {
        var g = m.getChildByName(props.show);
        g.visible = true;
    }
    if (props.view) {
        game.viewManager.gotoView(props.view);
    }
}

function onStart(game)
{
    console.log("onStart");
    game.state.on('sceneControl', sceneControl);
    hide();
}

MEDIA = [
    {  type: 'MediaSeq', name: 'mainScreen',
       records: [
           { 'sceneControl': {hide: 'RoofGroup', view: "Home"},
              'day': {text: "Monday"}
           },
           { 'sceneControl': {show: 'RoofGroup', view: "Left Rear"},
             'day': {text: "Tuesday"}
           },
           { 'sceneControl': {},
             'day': {text: "Wednesday"}
           },
           { 'sceneControl': {note: "This is a note", view: "Left Rear"},
             'day': {text: "Wednesday Banquet"}
           },
           { 'sceneControl': {note: "This is a note", view: "Home"},
             'day': {text: "Thursday"}
           },
           { 'sceneControl': {note: "This is a note", view: "Home"},
             'day': {text: "Friday"}
           },
       ]
   }
];

CONFIG = {
    'onStart': onStart,
    'ui': {'type': 'JQControls'},
    'program': {
        media: MEDIA,
        channels: ["day", "view"]
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
