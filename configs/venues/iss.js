
var LIGHTS = [
    {  type: 'PointLight', name: 'sun',    color: 0xffffff, position: [1000, 1000, 0], distance: 5000},
];

ISS_MODEL = [
    {   type: 'Model', name: 'iss',
        parent: 'station',
        //path: 'assets/models/AcrimSat_FINAL.fbx',
        //path: 'assets/models/ISS.fbx',
        //path: 'assets/models/ISS/NASA/ISS_Interior.dae',
        //path: 'assets/models/ISS/NASA/TexNoUV/ISS_2016_tex_nouv.dae',
        path: 'assets/models/ISS/NASA/Interior/Tex/ISS_Interior_USOnly_Tex.dae',
        //path: 'assets/models/ISS/NASA/NoTex/ISS_2016_notex.dae'
        //scale: 0.1
    }
];

CONFIG = {
    //'cameraControls': 'Orbit',
    //'program': {
    //   duration: 32*60,
    //   gss: "https://spreadsheets.google.com/feeds/list/1Vj4wbW0-VlVV4sG4MzqvDvhc-V7rTNI7ZbfNZKEFU1c/default/public/values?alt=json"
    //},
    gameOptions: {headlightIntensity: 1},
    'specs': [
        ISS_MODEL,
        {  type: 'SolarSystem' },
        {  type: 'Stars' },
        LIGHTS
    ]
};

MUSE.returnValue(CONFIG);
