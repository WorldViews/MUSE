
MEDIA_SPECS = [
    {  type: 'MediaSequence', defaultDuration: 1,
       records: [
          { duration: 4,
              mainScreen:  {url: 'assets/images/MuseTalk/Slide1.PNG'},
              leftScreen:  {url: 'assets/images/MuseTalk/Slide1.PNG'},
              rightScreen: {url: 'assets/images/MuseTalk/Slide1.PNG'}
          },
          { duration: 4,
            mainScreen:  {url: 'assets/images/MuseTalk/Slide2.PNG'},
            leftScreen:  {url: 'assets/images/MuseTalk/Slide1.PNG'},
            rightScreen: {url: 'assets/images/MuseTalk/Slide1.PNG'}
          },
          { duration: 4,
            mainScreen:  {url: 'assets/images/MuseTalk/Slide3.PNG'},
            leftScreen:  {url: 'assets/images/MuseTalk/Slide2.PNG'},
            rightScreen: {url: 'assets/images/MuseTalk/Slide1.PNG'}
          },
          { duration: 4,
            mainScreen:  {url: 'assets/images/MuseTalk/Slide4.PNG'},
            leftScreen:  {url: 'assets/images/MuseTalk/Slide3.PNG'},
            rightScreen: {url: 'assets/images/MuseTalk/Slide1.PNG'}
          },
           { duration: 29*60,  mainScreen: {url: 'videos/ClimateMusicProj-v7-HD.mp4'}},
           { duration: 10,     mainScreen: {url: 'videos/GlobalWeather2013.mp4'}},
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

MUSE.returnValue(MEDIA_SPECS);
