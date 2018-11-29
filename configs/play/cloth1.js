
var CONFIG = {
    //'cameraControls': 'Orbit',
    cameraControls: {type: 'MultiControls',
                     movementSpeed: .15, keyPanSpeed: .02},
    gameOptions: {ambientLightIntensity: 2, headlightIntensity: 3},
    webUI: {type: 'JQControls',
             //screens: ["mainScreen"],
          },
    'program': {
       duration: 32*60,
       channels: ['time', 'year', 'narrative', 'spaceStatus'],
    },
    //'venue': '/configs/venues/imaginarium.js',
    nodes: [
//        {type: 'Spiral'},
//        {type: 'Chakras', onLoaded: node => node.addSpirals()},
        {type: 'Cloth'}
    ]
};

/*
MUSE.require(
    "/dist/spirals.bundle.js",
    () => {
        console.log("testSpirals handler called....")
        console.log("now calling MUSE.returnValue "+CONFIG);
        MUSE.returnValue(CONFIG)
    }
);
*/
MUSE.returnValue(CONFIG);
