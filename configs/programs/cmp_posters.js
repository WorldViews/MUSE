
(function() {
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


POSTERS = [
    // In front
    {  type: 'Screen',    name: 'Poster_EarthClock',
       path: 'assets/images/CMPPosters/TimeToChange.jpg',
       radius: 7.8,
       phiStart: 80, phiLength: 8,
       thetaStart: 164, thetaLength: 8,
       onMuseEvent: {'click': () =>
           setProgram("EarthClock", "videos/Climate-Music-V3-Distortion_HD_540.webm")}
   },
   {  type: 'Screen',    name: 'Poster_CoolEffect',
      path: 'assets/images/PartnerLogos/CoolEffect.png',
      radius: 7.8,
      phiStart: 80, phiLength: 8,
      thetaStart: 176, thetaLength: 8,
      onMuseEvent: {'click': () =>
          setProgram("EarthClock", "videos/ExposingCarbonPollutionCoolEffect.mp4")}
  },
  {  type: 'Screen',    name: 'Poster_SustainableSV',
     path: 'assets/images/PartnerLogos/SustainableSV.png',
     radius: 7.8,
     phiStart: 80, phiLength: 8,
     thetaStart: 188, thetaLength: 8,
     onMuseEvent: {'click': () =>
         setProgram("EarthClock", "videos/SustainableSiliconValley_BuildingSustainableRegion.mp4")}
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

MUSE.returnValue(POSTERS);

})();
