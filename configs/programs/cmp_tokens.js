
(function() {

function selectStageModel(name)
{
    console.log("selectStageModel "+name);
    var model = game.models[name];
    model.visible = !model.visible;
}

var numToks = 0;
function getToken(name, modelPath, tokenPos) {
    numToks++;
    var token = {
        type: 'Group', name: "tokenGroup"+numToks, position: tokenPos,
        scale: 0.9,
         children: [
         {   type: 'Model', name: name,
             path: modelPath,
             position: [.75, 0.55, 1.35],
             rot: [0, 0, 0],
             scale: 0.010,
             onMuseEvent: {'click': () => selectStageModel("dancer") }
         },
         {  type: 'Model',
            path: 'assets/models/pedestal/model.dae',
            position: [0, 0, 0],
            rot: [0, 0, 0],
            scale: 0.02,
        }
    ]};
    return token;
}

function getTokens(angle, tokSpecs)
{
    var angle = 180;
    var spacing = 20;
    angle = angle - (tokSpecs.length-1) * (spacing)/2;
    var tokens = [];
    tokSpecs.forEach(spec => {
        var name = spec.name;
        tokens.push(getToken(name, spec.modelUrl,  Util.radialPosition(angle, 2.2, -.1) ));
        angle += spacing;
    });
    return tokens;
}

var tokSpecs = [
    {name: "dancerTok1",
     modelUrl: "assets/models/tokens/dancer/model.dae",
     onClick: () => selectStageModel("dancer")
    },
    {name: "dancerTok1",
     modelUrl: "assets/models/tokens/dancer/model.dae",
     onClick: () => selectStageModel("dancer")
    },
    {name: "dancerTok3",
     modelUrl: "assets/models/tokens/dancer/model.dae",
     onClick: () => selectStageModel("dancer")
    }
]

TOKENS = getTokens(180, tokSpecs);

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
