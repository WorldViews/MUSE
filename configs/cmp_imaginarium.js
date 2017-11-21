
MEDIA_SPECS = [
    { type : 'MediaSequence',
      records: [
          //{ t: 0,    mainScreen:  {url: 'assets/images/SpaceDebrisTalk/Slide1.PNG'}},
          { t: 0,   mainScreen:  {url: 'videos/Climate-Music-V3-Distortion_HD_540.webm'}},
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

POSTERS = [
    // In front
    {  type: 'Screen',    name: 'Poster_EarthClock',
       path: 'assets/images/CMPPosters/TimeToChange.jpg',
       radius: 7.8,
       phiStart: 80, phiLength: 8,
       thetaStart: 164, thetaLength: 8,
   },
   {  type: 'Screen',    name: 'Poster_CoolEffect',
      path: 'assets/images/PartnerLogos/CoolEffect.png',
      radius: 7.8,
      phiStart: 80, phiLength: 8,
      thetaStart: 176, thetaLength: 8,
  },
  {  type: 'Screen',    name: 'Poster_SustainableSV',
     path: 'assets/images/PartnerLogos/SustainableSV.png',
     radius: 7.8,
     phiStart: 80, phiLength: 8,
     thetaStart: 188, thetaLength: 8,
 },
  // IN back
  {  type: 'Screen',    name: 'Poster_EarthClock_back',
     path: 'assets/images/CMPPosters/TimeToChange.jpg',
     radius: 7.8,
     phiStart: 70, phiLength: 12,
     thetaStart: -8, thetaLength: 12,
 },
 {  type: 'Screen',    name: 'Poster_CoolEffect_back',
    path: 'assets/images/PartnerLogos/CoolEffect.png',
    radius: 7.8,
    phiStart: 70, phiLength: 12,
    thetaStart: 12, thetaLength: 12,
},
{  type: 'Screen',    name: 'Poster_SustainableSV_back',
   path: 'assets/images/PartnerLogos/SustainableSV.png',
   radius: 7.8,
   phiStart: 70, phiLength: 12,
   thetaStart: -28, thetaLength: 12,
}
];

// For now this just sets the video.  It should set the program
// in a way that corresponds to that video.
function setProgram(name, vidURL, channel) {
    console.log("setProgram: "+name+" "+vidURL+" "+channel);
    channel = channel || "mainScreen";
    if (vidURL) {
        console.log("setting state "+channel+".url: "+vidURL);
        game.state.set(channel+".url", vidURL)
    }
}

function setupPosterActions() {
    //alert("Setting up poster actions");
    var screens = game.screens;
    screens.Poster_EarthClock.onMuseEvent('click', () =>
        setProgram("EarthClock", "videos/Climate-Music-V3-Distortion_HD_540.webm"));
    screens.Poster_CoolEffect.onMuseEvent('click', () =>
        setProgram("CoolEffect", "videos/ExposingCarbonPollutionCoolEffect.mp4"));
    screens.Poster_SustainableSV.onMuseEvent('click', () =>
       setProgram("SustainableSV", "videos/CloudTruth.mp4"));
}

CONFIG = {
    onStart: setupPosterActions,
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
    'specs': [SCRIPTS, POSTERS]
};

MUSE.returnValue(CONFIG);
//
