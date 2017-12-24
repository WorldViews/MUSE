

CONFIG = {
    //'cameraControls': 'Orbit',
    gameOptions: {ambientLightIntensity: 2, headlightIntensity: 3},
    'specs': [
        { type: 'MidiPlayer' },
        { type: 'PointLight', position: [50,50,0], intensity: 3},
    ]
};

MUSE.returnValue(CONFIG);
