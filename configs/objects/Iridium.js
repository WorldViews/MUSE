

CONFIG = {
    'cameraControls': 'Orbit',
    gameOptions: {headlightIntensity: 2, ambientLightIntensity: 1},
    'specs': [
        {   type: 'Model', name: 'Juno',
            parent: 'station',
            path: 'assets/models/satellites/Iridium/model.dae',
            fitTo: {scale: 1},
            //path: 'assets/models/ISS/NASA/Interior/Tex/ISS_Interior_USOnly_Tex.dae',
            //scale: 0.01
        },
    ]
};

MUSE.returnValue(CONFIG);
