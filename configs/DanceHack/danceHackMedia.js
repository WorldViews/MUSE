
MEDIA_SPECS = [
    {  type: 'MediaSequence', defaultDuration: 1,
       records: [
          { duration: 4,
              mainScreen:  {url: 'assets/images/MuseTalk/Slide1.PNG'},
          },
          { duration: 4,
            mainScreen:  {url: 'assets/images/MuseTalk/Slide2.PNG'},
          },
          { duration: 29*60,  mainScreen: {url: 'assets/video/ClimateMusicProj-v7-HD.mp4'}},
          { duration: 10,     mainScreen: {url: 'assets/video/GlobalWeather2013.mp4'}},
       ]
   },
   /*
   {  type: 'StageStream', stage: 'Main Stage',
      records: [
          { t: 100,   name: 'none'},
          { t: 200,   name: 'dancer'},
          { t: 300,   name: 'cmp'},
          { t: 1000,   name: 'dancer'}
      ]
   }
   */
];

MUSE.returnValue(MEDIA_SPECS);
