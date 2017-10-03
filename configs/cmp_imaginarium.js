

SLIDE_PLAYERS = [
    {  type: 'SlidePlayer', name: 'slidePlayerCenter', screenName: 'mainScreen',
       records: { records: [
           { t: 10,   url: 'videos/Climate-Music-V3-Distortion_HD_540.webm'},
       ]}
   },
   {  type: 'SlidePlayer', name: 'slidePlayerLeft', screenName: 'leftScreen',
       records: { records: [
           { t: '2016-1-1',   url: 'assets/images/SpaceDebrisTalk/Slide6.PNG'},
           { t: '2017-1-1',   url: 'assets/images/SpaceDebrisTalk/Slide7.PNG'},
           { t: '2018-1-1',   url: 'assets/images/SpaceDebrisTalk/Slide8.PNG'}
       ]}
   },
   {  type: 'SlidePlayer', name: 'slidePlayerRight', screenName: 'rightScreen',
       records: { records: [
           { t: '1959-1-1',   url: 'assets/images/SpaceDebrisTalk/Slide1.PNG'},
           { t: '1980-1-1',   url: 'assets/images/SpaceDebrisTalk/Slide2.PNG'},
           { t: '1990-1-1',   url: 'assets/images/SpaceDebrisTalk/Slide3.PNG'},
           //{ t: '2000-1-1',   url: 'assets/images/SpaceDebrisTalk/Slide4.PNG'},
           { t: '2000-1-1',   url: 'videos/YukiyoCompilation.mp4'},
           { t: '2010-1-1',   url: 'assets/images/SpaceDebrisTalk/Slide5.PNG'},
           { t: '2017-1-1',   url: 'assets/images/SpaceDebrisTalk/Slide6.PNG'}
       ]}
    },
];

SCRIPTS = {  type: 'Scripts' };

CONFIG = {
    //'cameraControls': 'Orbit',
    'cameraControls': {type: 'JoelControls', movementSpeed: .15, keyPanSpeed: .02},
    //'cameraControls': 'JoelControls',
    'ui': 'JQControls',
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
       channels: ['time', 'year', 'narrative', 'spaceStatus']
    },
    'venue': '/configs/venues/imaginarium.js',
    'specs': [SCRIPTS, SLIDE_PLAYERS]
};
