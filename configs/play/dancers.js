
var KINECT_SKEL_WATCHER = { type: 'KinSkelWatcher', name: "kinskel1",
                            scale: 1.0, position: [0,1.5,0]};
var DANCER1 = {  type: 'Dancer', name: "dancer1",
                    motionUrl: 'assets/motionCapture/lauren_duality_edit.bvh' }

var CONFIG = {
    cameraControls: 'Orbit',
    //cameraControls: {type: 'MultiControls', movementSpeed: .15, keyPanSpeed: .02},
    gameOptions: {ambientLightIntensity: 2, headlightIntensity: 3},
    webUI: {type: 'JQControls',
            timeSlider: false,
             //screens: ["mainScreen"],
          },
    'program': {
       duration: 32*60,
       channels: ['time', 'year', 'narrative'],
    },
    //'venue': '/configs/venues/imaginarium.js',
    nodes: [
        KINECT_SKEL_WATCHER,
        DANCER1
    ]
};

MUSE.returnValue(CONFIG);
