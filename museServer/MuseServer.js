
function report(str) { console.log(str); }
function getClockTime() { return new Date()/1000.0; }

var verbosity = 1;

//var CHANNELS = ["position", "command", "people"];
var CHANNELS = ["pano", "pano.heartbeat", "kinect", "kinect.skel"];
var CHANNEL_STATS = {};

var activeSockets = [];

var sprintf = require("./js/sprintf").sprintf;
var http = require('http');
var fs = require('fs');
    // NEVER use a Sync function except at start-up!
var cors = require('cors');
var express = require('express');
var bodyParser = require('body-parser');

var KOW = require("./js/KinOSCWatcher");
var kow = null;

function getConfig()
{
    if (process.argv.length <= 2) {
	console.log("No config file requested");
	return;
    }
    var confPath = __dirname + "/"+ process.argv[2];
    console.log("Config: "+confPath);
/*
    if (!fs.existsSync(confPath)) {
	console.log("No config file");
	return null;
    }
*/
    var buf = fs.readFileSync(confPath);
    var conf = JSON.parse(buf);
    console.log("conf:\n"+JSON.stringify(conf, null, 3));
    return conf;
}

getConfig();

/////////////////////////////////////////////////////////////////////
//   Setup basic http server using express.  Also handle uploaded
//   JSON via /update/ urls.
//
var app = express();
app.use(cors())
var server = http.createServer(app);

app.get('/', function (req, res) {
    res.sendFile('index.html', {root: __dirname});
});

app.use(express.static(".."));
app.use(bodyParser.json());

app.get('/version', function (req, res) {
  res.send('Version 0.0.0')
});

app.get('/stats', function(req, resp){
    resp.writeHead(200, {'Content-Type': 'text/html'});
    var t = getClockTime();
    var str = "Active Clients:\n";
    str += "<pre>\n";
    activeSockets.forEach(sock => {
	var info = sock._info;
	str += "client: "+sock.client.conn.remoteAddress+"\n";
	str += "Num from: "+info.numFrom;
	str += " num to: "+info.numTo +"\n";
	if (info.lastMsgTo) {
	    var msg = info.lastMsgTo;
	    var dt = t - msg._sys.time;
	    str += sprintf("Last msg to (%.2f sec ago)\n", dt);
	    str += JSON.stringify(msg, null ,3);
	}
        str += "\n";
    });
    str += "</pre>";
    str += "<hr>";
    str += "Channels:<br>\n";
    str += "<pre>\n";
    for (var channel in CHANNEL_STATS) {
	var stats = CHANNEL_STATS[channel];
	str += channel +"\n";
	str += "Num from: "+stats.numFrom+" num to: "+stats.numTo+"\n";
	if (stats.lastMsgTo) {
	    var msg = stats.lastMsgTo;
	    var dt = t - stats.lastTime;
	    str += sprintf("Last msg to %.2f sec ago from %s:\n", dt, msg._sys.addr)
	    str += JSON.stringify(msg, null,3)+"\n";
	}
	str += "\n";
    }
    str += "</pre>";
    str += "<hr>";
    str += "KinOSCWatcher:<br>\n";
    if (kow) {
	str += kow.getStatusHTML();
    }
    else {
	str += "No KinOSCWatcher running<br>";
    }
    resp.end(str);
});

app.post('/update/*', function(request, response){
   var obj = request.body;
   console.log("/update path: "+request.path);
   console.log("/update got: "+JSON.stringify(obj));
   var fileName = request.path.slice("/update/".length);
   console.log("fileName: "+fileName);
   fs.writeFileSync(fileName, JSON.stringify(obj, null, 4));
   obj.size = 'big';
   console.log("returning obj: "+JSON.stringify(obj));      // your JSON
   response.send(obj);    // echo the result back
});

/////////////////////////////////////////////////////////////////////
// Setup Socket.io server listening to our app
//var io = require('socket.io').listen(app);
var io = require('socket.io').listen(server);

function handleDisconnect(socket)
{
    report("disconnected "+socket);
    var index = activeSockets.indexOf(socket);
    if (index >= 0) {
        activeSockets.splice(index, 1);
    }
}

function getChannelStats(channel)
{
    var stats = CHANNEL_STATS[channel];
    if (!stats) {
	stats = {numTo: 0, numFrom: 0};
	CHANNEL_STATS[channel] = stats;
    }
    return stats;
}

function handleChannel(channel, msg, sock) {
    //report("got msg on channel "+channel+": "+JSON.stringify(msg));
    var t = getClockTime();
    var stats = getChannelStats(channel);
    stats.numTo += 1;
    stats.lastMsgTo = msg;
    stats.lastTime = t;
    activeSockets.forEach(s => {
	if (s == sock) {
	    return;
	}
	try {
	    s.emit(channel, msg);
	    s._info.lastMsgTo = msg;
	    s._info.numTo++;
	}
	catch (e) {
	    report("failed to send to socket "+s);
	}
    });
    var _sys = {time: getClockTime(), addr: 'self'};
    if (sock) {
	sock._info.numFrom++;
	sock._info.lastMsgFrom = msg;
	_sys.addr = sock.client.conn.remoteAddress;
    }
    msg._sys = _sys;
}


// Emit welcome message on connection
io.on('connection', function(socket) {
    // Use socket to communicate with this particular client only, sending it it's own id
    report("got connection "+socket);
    socket._info = {numFrom: 0, numTo: 0, lastMsg: null};
    activeSockets.push(socket);
    CHANNELS.forEach(channel => {
	var stats = getChannelStats(channel);
	report("setting up events on channel "+channel);
	//socket.on(channel, msg => handleChannel(channel, msg));
	socket.on(channel, msg => {
	    stats.numFrom += 1;
	    if (typeof msg == 'string') {
		//report("warning ... converting string to obj");
		msg = JSON.parse(msg);
	    }
	    handleChannel(channel, msg, socket)});
    });
    socket.on('disconnect', obj => handleDisconnect(socket, obj));
});

var port = 4000;
var addr = "0.0.0.0";
report("listening on address: "+addr+" port:"+port);
//app.listen(port, addr);
server.listen(port, addr);

// This is to send messages via a socket.io client.
//var ioClient = require("socket.io-client");
//sioURL = "http://platonia:4000";
//var kow = new KOW.KinOSCWatcher({clientSock: ioClient(sioURL)});

// This sends them from us to listening clients:

var localAddress = null;
require('dns').lookup(require('os').hostname(), function (err, add, fam) {
    localAddress = add;
    console.log("Got local address "+localAddress);
    kow = new KOW.KinOSCWatcher({msgWatcher: handleChannel, localAddress: localAddress});
})

