
var SATS_MEDIA = [
    {  type: 'Slides', group: 'mainScreen',
       records: [
           { t: '1950-1-1',   url: 'assets/images/SpaceDebrisTalk/Slide1.PNG'},
           { t: '1960-1-1',   url: 'assets/video/SpaceDebris.mp4'},
           { t: '2000-1-1',   url: 'assets/images/SpaceDebrisTalk/Slide2.PNG'},
           { t: '2012-1-1',   url: 'assets/video/YukiyoCompilation.mp4'},
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
          { t: '2000-1-1',   url: 'assets/video/YukiyoCompilation.mp4'},
          { t: '2010-1-1',   url: 'assets/images/SpaceDebrisTalk/Slide5.PNG'},
          { t: '2017-1-1',   url: 'assets/images/SpaceDebrisTalk/Slide6.PNG'}
      ]
   },
   {  type: 'SlideSequence', name: 'mainScreen',
      media: [
          { url: 'assets/images/SpaceDebrisTalk/Slide1.PNG'},
          { url: 'assets/images/SpaceDebrisTalk/Slide2.PNG'},
          { url: 'assets/images/SpaceDebrisTalk/Slide3.PNG'},
          //{ t: '2000-1-1',   url: 'assets/images/SpaceDebrisTalk/Slide4.PNG'},
          { url: 'assets/video/YukiyoCompilation.mp4'},
          { url: 'assets/images/SpaceDebrisTalk/Slide5.PNG'},
          { url: 'assets/images/SpaceDebrisTalk/Slide6.PNG'}
      ]
   },
];


function watchCollision(game)
{
    game.program.setTimeRange('2/10/2009 8:40:00', '2/10/2009 12:40:00');
    game.program.setPlayTime('2/10/2009 8:50:00');
}

function onStart(game)
{
    return;
    var t = game.program.getPlayTime();
    var t = 1234284990.0;
    var p = new THREE.Vector3(-1698.7030173737744, 1503.0165902867889, 6777.4862190372805);
    p.multiplyScalar(satTracks.radiusVEarth/satTracks.radiusEarthKm);
    satTracks.addEvent(t, p.x,p.z,-p.y, 3);
}

function useWebWorker(game)
{
    if (satTracks.webWorkerRate)
        satTracks.setWorkerRate(0);
    else
        satTracks.setWorkerRate(10);
}

var SATS_PROGRAM = {
   //duration: 32*60,
   duration: 65*365*24*60*60,
   //startTime: 'now',
   startTime: '10/4/1957',
   playTime: 'now',
   playSpeed: 100,
   //gss: "https://spreadsheets.google.com/feeds/list/1Vj4wbW0-VlVV4sG4MzqvDvhc-V7rTNI7ZbfNZKEFU1c/default/public/values?alt=json",
   stages: [
       {
           name: 'Main Stage',
           models: {
               'vEarth': 'Virtual Earth',
               'cmp': 'Data Visualization',
               'iridium': 'Iridium',
               'none': 'Nothing'
           }
       }
   ],
   channels: ['time', 'year', 'narrative', 'spaceStatus'],
   scripts: {
       'Watch Collision': watchCollision,
       'Web Worker': useWebWorker,
       //'Add Collision': addCollisions
   },
   media: SATS_MEDIA
}

export {SATS_PROGRAM, SATS_MEDIA};
