
MEDIA_SPECS = [
    { type : 'MediaSequence',
      records: [
          { t: 0,    mainScreen:  {url: 'assets/images/SpaceDebrisTalk/Slide1.PNG'}},
          { t: 10,   mainScreen:  {url: 'videos/Climate-Music-V3-Distortion_HD_540.webm'}},
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

SCRIPTS = {  type: 'Scripts' };

CONFIG = {
    //'cameraControls': 'Orbit',
    'cameraControls': {type: 'MultiControls', movementSpeed: .15, keyPanSpeed: .02},
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
       channels: ['time', 'year', 'narrative', 'spaceStatus'],
       media: MEDIA_SPECS
    },
    'venue': '/configs/venues/imaginarium.js',
    'specs': [SCRIPTS]
};

MUSE.returnValue(CONFIG);
// 