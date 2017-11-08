
MEDIA_SPEC = [
    {  type: 'MediaSeq',
       records: [
            {   type: 'mediaState',
                values: {
                    leftScreen: {url: 'assets/images/SpaceDebrisTalk/Slide2.PNG'},
                    population: 10,
                    year: {text: 1969}
                }
            },
            {
                leftScreen: {url: 'assets/images/SpaceDebrisTalk/Slide3.PNG'},
                population: 20,
                year: {text: 1969}
            },
           {  leftScreen: {url: 'videos/YukiyoCompilation.mp4'},
              population: 30,
              narrative: "Hungry boy"},
           {  leftScreen: {url: 'assets/images/SpaceDebrisTalk/Slide5.PNG'},
              population: 40,
              narrative: "Old age",
              f1: 50 },
       ]
   }
]

function onStart(game) {
    console.log("============================");
    new Route("time", "timeStr", v => sprintf("t: %.2f", v));
    new Route("time", "f1", t => t-1);
    new Route("f1", "f2");
}

var CONFIG = {
    onStart: onStart,
    'webUI': {type: 'JQControls', screens: ["leftScreen"]},
    'program': {
       duration: 32*60,
       channels: ['time', 'timeStr', 'year', 'narrative', 'population',
            'f1', 'f2'],
       media: MEDIA_SPEC,
    },
};

MUSE.returnValue(CONFIG);
