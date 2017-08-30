
var LIGHTS = [
    {  type: 'PointLight', name: 'light1', color: 0xffaaaa, position: [0, -25,-2]},
    {  type: 'PointLight', name: 'light2', color: 0xaaffaa, position: [0, -25, 0]},
    {  type: 'PointLight', name: 'light3', color: 0xaaaaff, position: [0, -25, 2]},
    {  type: 'PointLight', name: 'sun',    color: 0xffffff, position: [0, 1000, 0], distance: 5000},
];


CONFIG = {
    //'cameraControls': 'Orbit',
    'specs': [
        {   type: 'Model', name: 'Juno',
            parent: 'station',
            path: 'models/satellites/Juno/Juno.obj',
            //path: 'models/ISS/NASA/Interior/Tex/ISS_Interior_USOnly_Tex.dae',
            //scale: 0.1
        },
        LIGHTS
    ]
};
