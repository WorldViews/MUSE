
MEDIA_SPEC = [
   {  type: 'MediaSequence',
      records: [
          { t: '1950-1-1',
            mainScreen: {url: 'assets/images/SpaceDebrisTalk/Slide1.PNG'},
            leftScreen: {url: 'assets/images/SpaceDebrisTalk/Slide1.PNG'},
            controlScript: {note: "This is a note", n: 5},
            year: {text: 1969}
          },
          { t: '1980-1-1',
            'mainScreen': { url: 'assets/images/SpaceDebrisTalk/Slide2.PNG'},
            'leftScreen': { url: 'assets/images/SpaceDebrisTalk/Slide3.PNG'},
            'controlScript': {note: "This is a second note", n: 25},
            'year': { text: 1973}
          },
          { mainScreen: {url: 'assets/images/SpaceDebrisTalk/Slide3.PNG'}},
        //{ t: '2000-1-1',   url: 'assets/images/SpaceDebrisTalk/Slide4.PNG'},
          { mainScreen: { url: 'videos/YukiyoCompilation.mp4'}},
          { mainScreen: { url: 'assets/images/SpaceDebrisTalk/Slide5.PNG'}},
          { mainScreen: { url: 'assets/images/SpaceDebrisTalk/Slide6.PNG'}}
    ]
   },
];

MUSE.returnValue(MEDIA_SPEC);
