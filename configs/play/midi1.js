

CONFIG = {
    cameraControls: 'Orbit',
    gameOptions: {ambientLightIntensity: 2, headlightIntensity: 3},
    nodes: [
        { type: 'MidiPlayer',
          //melody: "shimauta1",
          //melody: "wtc0",
          melody: "Classical/minute_waltz",
          //melody: "jukebox",
          scale: 0.1,
          autoStart: true},
        //{ type: 'PointLight', position: [50,50,0], intensity: 3},
    ]
};

MUSE.returnValue(CONFIG);
