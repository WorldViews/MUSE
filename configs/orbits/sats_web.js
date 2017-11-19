

CONFIG = {
    //onStart: onStart,
    cameraControls: 'MultiControls',
    webUI: {type: 'JQControls',
           screens: ["mainScreen"],
          },
    //program: SATS_PROGRAM,
    program: 'configs/programs/sats.js',
    //venue: 'configs/venues/imaginarium.js',
    //specs: [VEARTH]
};

MUSE.returnValue(CONFIG);
