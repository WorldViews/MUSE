
MEDIA_SPECS = [
    { type : 'MediaSequence',
      records: [
          //{ t: 0,    mainScreen:  {url: 'assets/images/SpaceDebrisTalk/Slide1.PNG'}},
         // { t: 0,   mainScreen:  {url: 'videos/Climate-Music-V3-Distortion_HD_540.webm'}},
          { t: 0,   mainScreen:  {url: 'videos/ClimateMusicProj-v7-HD.mp4'}},
          { t: 50,   leftScreen:  {url: 'assets/images/SpaceDebrisTalk/Slide6.PNG'}},
          { t: 100,  rightScreen: {url: 'assets/images/SpaceDebrisTalk/Slide1.PNG'}},
          { t: 200,  leftScreen:  {url: 'assets/images/SpaceDebrisTalk/Slide7.PNG'},
                     rightScreen: {url: 'assets/images/SpaceDebrisTalk/Slide2.PNG'}},
          { t: 400,  leftScreen:  {url: 'assets/images/SpaceDebrisTalk/Slide8.PNG'}},
          { t: 500,  rightScreen: {url: 'videos/YukiyoCompilation.mp4'}},
          { t: 600,  rightScreen: {url: 'assets/images/SpaceDebrisTalk/Slide5.PNG'}},
          { t: 700,  rightScreen: {url: 'assets/images/SpaceDebrisTalk/Slide6.PNG'}}
      ]
    },
    {  type: 'StageStream', stage: 'Main Stage',
       records: [
           { t: 100,   name: 'none'},
           { t: 200,   name: 'dancer'},
           { t: 300,   name: 'cmp'},
           { t: 1000,   name: 'dancer'}
       ]
    }
];

VID_BUBBLES = [
    {   type: 'Screen', name: 'vidBubble1', parent: 'station', radius: 0.4, position: [0,3.6,0],
        path: 'http://192.168.16.206:8080',
        imageType: 1
    },
]

SCRIPTS = {  type: 'Scripts' };

POSTERS = "configs/programs/cmp_posters.js";
BUBBLES = "configs/programs/cmp_vidBubbles.js";

CONFIG = {
    //onStart: setupPosterActions,
    //'cameraControls': 'Orbit',
    'cameraControls': {type: 'MultiControls', movementSpeed: .15, keyPanSpeed: .01},
    //'cameraControls': 'JoelControls',
    'webUI': {type: 'DATGUIControls',
    // 'webUI': {type: 'JQControls',
           //screens: ["mainScreen"],
          },
    'program': {
       duration: 32*60,
       gss: "https://spreadsheets.google.com/feeds/list/1Vj4wbW0-VlVV4sG4MzqvDvhc-V7rTNI7ZbfNZKEFU1c/default/public/values?alt=json",
       stages: [
           {
               name: 'Main Stage',
               models: {
                   'vEarth': 'Virtual Earth',
                   'dancer': 'Dancer',
                   'cmp': 'Data Visualization',
                   'portal': 'Panoramic Portal',
                   'bmw': 'Eriks Car',
                   'none': 'Nothing'
               }
           }
       ],
       channels: [
           { name: 'time', default: 0 },
           { name: 'year', min: 1850, max: 2300, default: 1850 },
           'narrative',
           'spaceStatus'
        ],
       media: MEDIA_SPECS
    },
    'venue': '/configs/venues/imaginarium.js',
    'specs': [SCRIPTS, POSTERS, BUBBLES]
};

MUSE.returnValue(CONFIG);
//
