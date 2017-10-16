
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

function onStart(game)
{
    console.log("onStart");
    hide();
}

CONFIG = {
    'onStart': onStart,
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
