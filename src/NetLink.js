
import io from 'socket.io-client';
import {Avatar} from "./Avatar";

function getClockTime() { return new Date().getTime()/1000.0; }

class NetLink {
    constructor(game) {
        console.log("****************** NetLink *********************");
        var inst = this;
        this.game = game;
        this.user = game.user || "anon";
        this.users = {};
        this.numUsers = 0;
        console.log("****** User: "+this.user);
        this.startTime = getClockTime();
        this.lastSendTime = 0;
        this.sioURL = "localhost:4000";
        this.channel = 'pano';
        this.sock = io(this.sioURL);
        this.sock.on(this.channel, msg => { inst.handleMessage(msg);});
        this.getUser("Tony");
        this.getUser("Don");
        this.updateInterval = 0.1;
    }

    getUser(name, props) {
        //console.log("****** NetLink.getUser "+JSON.stringify(props));
        props = props || {};
        var user = this.users[name];
        if (user) {
            //console.log("user "+name+" already exists");
            user.setProps({position: props.position});
            return user;
        }
        else {
            console.log("Creating user");
            this.numUsers++;
            var y = 20*this.numUsers;
            user = new Avatar(this.game,
                              name, {position: [20,y,20]});
            this.users[name] = user;
            return user;
        }
    }
    
    update() {
        var t = getClockTime();
        if (t - this.lastSendTime > this.updateInterval)
            this.sendStatus();
    }

    sendStatus() {
        this.lastSendTime = getClockTime();
        var c = this.game.camera;
        var msg = {'type': 'muse.status',
                   'user': 'user',
                   'platform': 'threejs',
                   'position': c.position.toArray(),
                   'rotation': c.rotation.toArray()}
        //console.log("NetLink.sendStatus "+JSON.stringify(msg));
        this.sendMessage(msg);
    }

    sendMessage(msg) {
        this.lastMsgSent = msg;
        var str = JSON.stringify(msg);
        console.log("NetLink.sendStatus "+this.channel+" msg: " + str);
        //report("sending "+str);
        //this.sock.emit('viewInfo', str);
        this.sock.emit(this.channel, str);
    }

    handleMessage(msg) {
        //console.log("NetLink.handleMessage "+JSON.stringify(msg));
        if (msg.type == 'muse.status') {
            var userName = msg.user;
            this.getUser(userName, msg);
            return;
        }
        console.log("Unrecognized message: "+JSON.stringify(msg));
    }
}

export {NetLink};


