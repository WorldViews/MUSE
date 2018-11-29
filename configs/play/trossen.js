

ARM =  {
    type: 'Model', name: 'RobotArm',
 //    path: 'assets/models/RobotArm/PhantomXPincherRobotArmKitMarkII.dae',
     path: 'assets/models/RobotArm/PhantomXPincherRobotArmKitMarkII.3ds',
     position: [0.0, 0, 0],
     rot: [0, 90, 0],
     //scale: 0.0045,
     //scale: 0.02,
     fitTo: {scale: 1},
};

CONFIGX = {
    'cameraControls': 'Orbit',
    gameOptions: {ambientLightIntensity: 2, headlightIntensity: 3},
    'specs': [
        ARM,
        { type: 'PointLight', position: [50,50,0], intensity: 3},
    ]
};

CONFIG = {
    'cameraControls': 'Orbit',
    gameOptions: {headlightIntensity: 2, ambientLightIntensity: 1},
    'specs': [
        {   type: 'Model', name: 'TrossenArm',
            parent: 'station',
            //path: 'assets/models/satellites/Iridium/model.dae',
            //path: 'assets/models/RobotArm/PhantomXPincherRobotArmKitMarkII.3ds',
            path: 'assets/models/RobotArm/PhantomXPincherRobotArmKitMarkII.dae',
            fitTo: {scale: 1},
            //path: 'assets/models/ISS/NASA/Interior/Tex/ISS_Interior_USOnly_Tex.dae',
            //scale: 0.01
        },
    ]
};

MUSE.returnValue(CONFIG);
