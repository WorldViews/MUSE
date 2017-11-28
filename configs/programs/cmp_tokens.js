
(function() {

/*
function setProgram(name, vidURL, channel) {
    console.log("setProgram: "+name+" "+vidURL+" "+channel);
    channel = channel || "mainScreen";
    if (vidURL) {
        console.log("setting state "+channel+".url: "+vidURL);
        game.state.set(channel+".url", vidURL)
    }
}
*/
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
         children: [
         {   type: 'Model', name: name,
             path: modelPath,
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
    ]};
    return token;
}

TOKENS = [
    getToken("dancerTok", "assets/models/tokens/dancer/model.dae", [0.2, -.1, 2.6] ),
    getToken("dancerTok2", "assets/models/tokens/dancer/model.dae", [2.2, -.1, 1.6])
]
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
