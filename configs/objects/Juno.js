

CONFIG = {
    //'cameraControls': 'Orbit',
    gameOptions: {headlightIntensity: 2, ambientLightIntensity: 1},
    'specs': [
        {   type: 'Model', name: 'Juno',
            parent: 'station',
            path: 'models/satellites/Juno/Juno.obj',
            //path: 'models/ISS/NASA/Interior/Tex/ISS_Interior_USOnly_Tex.dae',
            //scale: 0.1
        }
    ]
};

MUSE.returnValue(CONFIG);
