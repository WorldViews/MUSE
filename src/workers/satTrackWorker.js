
importScripts('satellite.min.js');
console.log("satTrackWorker started");

sats = [];

function sendMessage(msg) {
    console.log("sent message: "+msg);
    postMessage(msg);
    console.log("it was sent");
}

sendMessage("Now we are started");

var i=0;

function tick()
{
    console.log("tick");
    var time = new Date();
    //console.satTracks("window: "+window.satTracks);
    var num = 0;
    var errs = 0;
    for (var id in sats) {
        var satrec = sats[id];
        var stateVec = satellite.propagate(satrec, time);
        if (num < 10) {
            console.log(" id: "+id+" satrec:", satrec, "state:", stateVec);
        }
        if (!stateVec.position)
            errs++;
        num++;
    }
    console.log("num: "+num+ " errs: "+errs);
    postMessage("tick "+i++);
}

onmessage = function(e) {
    var msg = e.data;
    console.log("webWorker got msg: ",msg);
    if (msg.type == 'satInfo') {
        //var satDat = JSON.parse(msg.satDat);
        console.log("satDat: "+msg.satDat);
        msg.satDat.forEach(dat => {
            //var id = dat.id;
            var id = dat[0];
            var tle = dat[1];
            //console.log("id: "+id+" tle: "+tle);
            sats[id] = satellite.twoline2satrec(tle[0], tle[1]);
        });
    }
}

setInterval(tick, 2000);
