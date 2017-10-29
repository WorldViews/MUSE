
MEDIA_SPEC = [
    {  type: 'Slides', group: 'mainScreen',
       records: [
           { t: '1950-1-1',   url: 'assets/images/SpaceDebrisTalk/Slide1.PNG'},
           { t: '1960-1-1',   url: 'videos/SpaceDebris.mp4'},
           { t: '2000-1-1',   url: 'assets/images/SpaceDebrisTalk/Slide2.PNG'},
           { t: '2012-1-1',   url: 'videos/YukiyoCompilation.mp4'},
           //{ t: '2012-1-1',   url: 'http://dvr4.paldeploy.com/video/Sakura/Yukiyo/YukiyoCompilation.mp4'},
       ]
   },
   {  type: 'Slides', group: 'leftScreen',
       records: [
           { t: '2016-1-1',   url: 'assets/images/SpaceDebrisTalk/Slide6.PNG'},
           { t: '2017-1-1',   url: 'assets/images/SpaceDebrisTalk/Slide7.PNG'},
           { t: '2018-1-1',   url: 'assets/images/SpaceDebrisTalk/Slide8.PNG'}
       ]
   },
   {  type: 'Slides', group: 'rightScreen',
      records: [
          { t: '1959-1-1',   url: 'assets/images/SpaceDebrisTalk/Slide1.PNG'},
          { t: '1980-1-1',   url: 'assets/images/SpaceDebrisTalk/Slide2.PNG'},
          { t: '1990-1-1',   url: 'assets/images/SpaceDebrisTalk/Slide3.PNG'},
          //{ t: '2000-1-1',   url: 'assets/images/SpaceDebrisTalk/Slide4.PNG'},
          { t: '2000-1-1',   url: 'videos/YukiyoCompilation.mp4'},
          { t: '2010-1-1',   url: 'assets/images/SpaceDebrisTalk/Slide5.PNG'},
          { t: '2017-1-1',   url: 'assets/images/SpaceDebrisTalk/Slide6.PNG'}
      ]
   },
   {  type: 'MediaSequence', name: 'mainScreen',
      media: [
          [{ url: 'assets/images/SpaceDebrisTalk/Slide1.PNG'},
           { name: 'leftScreen', url: 'assets/images/SpaceDebrisTalk/Slide1.PNG'},
           { name: 'controlScript', note: "This is a note", n: 5},
           { name: 'year', text: 1969}
          ],
          [{ url: 'assets/images/SpaceDebrisTalk/Slide2.PNG'},
           { name: 'leftScreen', url: 'assets/images/SpaceDebrisTalk/Slide3.PNG'},
           { name: 'controlScript', note: "This is a second note", n: 25},
           { name: 'year', text: 1973}
       ],
          { url: 'assets/images/SpaceDebrisTalk/Slide3.PNG'},
          //{ t: '2000-1-1',   url: 'assets/images/SpaceDebrisTalk/Slide4.PNG'},
          { url: 'videos/YukiyoCompilation.mp4'},
          { url: 'assets/images/SpaceDebrisTalk/Slide5.PNG'},
          { url: 'assets/images/SpaceDebrisTalk/Slide6.PNG'},
      ]
   },
];

MUSE.returnValue(MEDIA_SPEC);
