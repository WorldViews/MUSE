
(function() {

function selectStageModel(name)
{
    console.log("selectStageModel "+name);
    game.program.selectStageModel(name);
}

function setCO2Model() {
    var url = url || "assets/video/2006_co2_flow_1024x512.webm";
    selectStageModel("co2Earth");
    game.program.pause();
    setEarthVideo(game, url, "co2Earth")
}

var numToks = 0;
function getToken(name, tokenPos, spec) {
    parent = 'tokens';
    var modelOpts = spec.modelOpts || {};
    var modelScale = modelOpts.scale || 1.0;
    var modelPos = modelOpts.position || [0,0,0];
    var tokScale = 1.1;
    var rot = modelOpts.rot;
    numToks++;
    var pedName = "pedistal"+numToks;
    var token = {
        type: 'Group', name: "tokenGroup"+numToks, parent, position: tokenPos,
        scale: tokScale,
        //onMuseClick: {'click': spec.onClick },
        // whoops... this didn't work cuz group isn't a Node yet.
         children: [
         {   type: 'Model', name: name,
             path: spec.modelUrl,
             //position: [.75, 0.55, 1.35],
             position: modelPos,
             rot: rot,
             scale: modelScale,
             onMuseEvent: {'click': spec.onClick },
             castShadow: true,
        },
         {  type: 'Model',
            path: 'assets/models/pedestal/model.dae',
            name: pedName,
            position: [0, 0, 0],
            rot: [0, 0, 0],
            scale: 0.02,
            castShadow: true,
            onMuseEvent: {'click': spec.onClick },
        }
    ]};
    return token;
}

function getTokens(angle, tokSpecs)
{
    game.getGroup('tokens', {parent: 'station' });
    var angle = 180;
    var spacing = 20;
    angle = angle - (tokSpecs.length-1) * (spacing)/2;
    var tokens = [];
    tokSpecs.forEach(spec => {
        var name = spec.name;
        var pos = Util.radialPosition(angle, 2.2, -.1);
        tokens.push(getToken(name, pos, spec ));
        angle += spacing;
    });
    return tokens;
}

var tokSpecs = [
    {name: "dancerTok",
     modelUrl: "assets/models/tokens/dancer/model.dae",
     modelOpts: {position: [.75, 0.55, 1.35], scale: 0.010},
     onClick: () => selectStageModel("dancer")
    },
    {name: "particleTok",
     modelUrl: "assets/models/tokens/ParticleDancer/sparklers.dae",
     modelOpts: {position: [0.16, 0.55, -.16], scale: 0.04},
     onClick: () => toggleSparkler()
    },
    {name: "earthTok",
     modelUrl: "assets/models/tokens/globe/model.dae",
     modelOpts: {position: [0.16, 0.55, -.16], scale: 0.003},
     onClick: () => selectStageModel("vEarth")
    },
//    {name: "tempTok",
//     modelUrl: "assets/models/tokens/SurfaceTempGlobe/model.dae",
//     modelOpts: {position: [0.16, 0.55, -.16], scale: 0.003},
//     onClick: () => selectStageModel("vEarth")
//    },
    {name: "co2Tok",
     modelUrl: "assets/models/tokens/ClimateCloudGlobe/model.dae",
     modelOpts: {position: [0.16, 0.55, -.16], scale: 0.003},
    // onClick: () => selectStageModel("co2Earth")
       onClick: () => setCO2Model()
    },
    {name: "cmpTok",
     modelUrl: "assets/models/tokens/DataCharts/DataChartsToken.dae",
     modelOpts: {position: [0.15, 0.55, -0.15], scale: 0.04, rot:[0,90,0]},
     onClick: () => selectStageModel("cmp")
    },
]

function toggleVisiblity(name) {
    var m = game.models[name];
    m.visible = !m.visible;
}

function playVideoOnSurface(name, url) {
    url = url || "assets/video/ErikAndBill_4Kx2K.mp4";
    var n = game.getNode(name);
    n.updateSource(url);
    var m = game.models[name];
    m.visible = true;
}

DUMMY_TOKEN =
{   type: 'Model', name: "coverControl",
    path: "assets/models/pedestal/model.dae",
    //position: [.75, 0.55, 1.35],
    position: Util.radialPosition(130, 2.2, -.1),
    //rot: [2, 0, 1],
    scale: .022,
    onMuseEvent: {'click': () => selectStageModel(null) }
    //onMuseEvent: {'click': () => toggleVisiblity("innerCover"),
    //              'doubleClick': () => playVideoOnSurface("innerCover") }
},

TOKENS = getTokens(180, tokSpecs);
TOKENS.push(DUMMY_TOKEN);

/*
TOKENS = [
    {type: 'Group', name: "tokenGroup1", position: [0.2, -.1, 2.6],
     children: [
         {   type: 'Model', name: 'dancerToken',
             path: 'assets/models/tokens/dancer/model.dae',
             position: [.75, 0.55, 1.35],
             rot: [0, 0, 0],
             scale: 0.010,
             onMuseEvent: {'click': () => selectStageModel("dancer") }
         },
         {   type: 'Model',
         path: 'assets/models/pedestal/model.dae',
         position: [0, 0, 0],
         rot: [0, 0, 0],
         scale: 0.02,
     }
 ]}
];
*/

MUSE.returnValue(TOKENS);

})();
