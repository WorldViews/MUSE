
importScripts('satellite.min.js');
console.log("satTrackWorker started");

sats = [];

function sendMessage(msg) {
    //console.log("sent message: "+msg);
    postMessage(msg);
}

var msg = {type: 'status', text: "Now we are starting"}
sendMessage(msg);
var currentTime = 0;

var i=0;

function tick()
{
    console.log("tick");
    if (currentTime)
        var time = new Date(currentTime*1000);
    else
        var time = new Date();
    console.log("time: "+time);
    var msg = {type: 'status', text: 'tick...'};
    postMessage(msg);
}

function updatePositions()
{
    if (currentTime)
        var datetime = new Date(currentTime * 1000);
    else
        var datetime = new Date();
     var tJ = jday(datetime.getUTCFullYear(),
                     datetime.getUTCMonth() + 1,
                     datetime.getUTCDate(),
                     datetime.getUTCHours(),
                     datetime.getUTCMinutes(),
                     datetime.getUTCSeconds());
     tJ += datetime.getUTCMilliseconds() * 1.15741e-8; //days per millisecond

    //console.satTracks("window: "+window.satTracks);
    var num = 0;
    var errs = 0;
    newPositions = [];
    var newPos;
    for (var id in sats) {
        var sat = sats[id];
        var satrec = sat.satrec;
        var tle = sat.tle;
        var tm = (tJ - satrec.jdsatepoch) * 1440.0; //in minutes
        //var stateVec = satellite.propagate(satrec, time);
        //var stateVec = satellite.propagate(satrec, time);
        var stateVec = satellite.sgp4(satrec, tm);
        if (num < 0) {
            console.log(" id: "+id+" tle: "+tle+" satrec:", satrec, "state:", stateVec);
        }
        if (stateVec.position) {
            var p = stateVec.position;
            newPos = [id,p.x, p.y, p.z];
        }
        if (!stateVec.position) {
            errs++;
            newPos = [id, 0, 0, 0];
        }
        newPositions.push(newPos);
        num++;
    }
    //console.log("num: "+num+ " errs: "+errs);
    var msg = {type: 'newPositions', newPositions};
    postMessage(msg);
}

onmessage = function(e) {
    var msg = e.data;
    //console.log("webWorker got msg: ",msg);
    if (msg.type == 'satInfo') {
        console.log("****** update sat info for worker ******");
        //var satDat = JSON.parse(msg.satDat);
        //console.log("satDat: "+msg.satDat);
        msg.satDat.forEach(dat => {
            //var id = dat.id;
            var id = dat[0];
            var tle = dat[1];
            //console.log("id: "+id+" tle: "+tle);
            var satrec = satellite.twoline2satrec(tle[0], tle[1]);
            sats[id] = {id, tle, satrec};
        });
    }
    if (msg.type == 'setTime') {
        var t = msg.t;
        currentTime = t;
        //console.log("**** worker setTime: t");
        //updatePositions();
    }
}


function jday(year, mon, day, hr, minute, sec){ //from satellite.js
  'use strict';
  return (367.0 * year -
        Math.floor((7 * (year + Math.floor((mon + 9) / 12.0))) * 0.25) +
        Math.floor( 275 * mon / 9.0 ) +
        day + 1721013.5 +
        ((sec / 60.0 + minute) / 60.0 + hr) / 24.0  //  ut in days
        //#  - 0.5*sgn(100.0*year + mon - 190002.5) + 0.5;
        );
}

setInterval(tick, 10000);
setInterval(updatePositions, 50);
