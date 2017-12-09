
MEDIA_SPEC = [
    {  type: 'MediaSequence',
       records: [
            {   type: 'mediaState',
                duration: 25,
                values: {
                    narrative: "Born",
                    //leftScreen: {url: 'assets/images/SpaceDebrisTalk/Slide2.PNG'},
                    leftScreen: {url: 'assets/video/tas_1850_2300.mp4'},
                    population: 10,
                    year: {text: 1969}
                }
            },
            {
                leftScreen: {url: 'assets/video/YukiyoCompilation.mp4'},
                population: 20,
                narrative: "Youth",
                year: {text: 1969}
            },
            {  duration: 20,
               leftScreen: {url: 'assets/images/SpaceDebrisTalk/Slide3.PNG'},
               population: 30,
               narrative: "Hungry boy"
            },
            {  t: 70,
               leftScreen: {url: 'assets/video/GlobalWeather2013.mp4'},
               population: 40,
               narrative: "Old age",
               f1: 50
            },
            {  duration: 20,
               leftScreen: {url: 'assets/images/SpaceDebrisTalk/Slide3.PNG'},
               population: 30,
               narrative: "decrepid"
            },
            {  leftScreen: {url: 'assets/video/Climate-Music-V3-Distortion_HD_540.webm'},
               duration: 600,
               population: 40,
               narrative: "deceased",
               f1: 50
            },
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
       duration: 200,
       channels: ['time', 'timeStr', 'year', 'narrative', 'population',
            'f1', 'f2'],
       media: MEDIA_SPEC,
    },
};

MUSE.returnValue(CONFIG);
