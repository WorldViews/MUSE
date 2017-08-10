
import io from 'socket.io-client';
import {Avatar} from "./Avatar";
import JanusClient from './lib/janus';
import Util from './Util';

function getClockTime() { return new Date().getTime()/1000.0; }

class NetLink {
    constructor(game) {
        console.log("****************** NetLink *********************");
        var self = this;
        this.game = game;
        this.user = game.user || "anon";
        this.users = {};
        this.numUsers = 0;
        console.log("****** User: "+this.user);
        this.startTime = getClockTime();
        this.lastSendTime = 0;
        this.sioURL = window.location.origin;
        this.channel = 'pano';
        this.sock = io(this.sioURL);
        this.sock.on(this.channel, msg => { self.handleMessage(msg);});
        // this.getUser("Tony");
        // this.getUser("Don");
        this.updateInterval = 0.1;
        this.verbosity = 0;
        this.state = {
            position: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Euler(0, 0, 0),
        }

        if (Util.getParameterByName('janus')) {
            this._initJanus();
        }
    }

    _initJanus() {
        var self = this;

        this.client = new JanusClient({
            url: 'wss://sd6.dcpfs.net:8989/janus',
            username: this.user
        });
        this.client.connect().then(() => {
            return self.client.join(9000);
        }).then(() => {
            let constraints = {
                video: true,
                audio: true
            }
            return navigator.mediaDevices.getUserMedia(constraints);
        }).then((stream) => {
            return self.client.publish(stream).then(() => {
                console.log(' ::::  published local stream');
            });
        });

        this.client.on('publishers', (users) => {
            users.forEach((user) => {
                self.client.subscribe(user.id, {
                    audio: true,
                    video: true,
                    data: true
                });
            });
        });

        this.client.on('remotestream', (user) => {
            let name = user.display;
            if (!self.users[name]) {
                let avatar = new Avatar(self.game,
                    name, {position: [20,0,20]});
                self.users[name] = avatar;
            }
            self.users[name].setStream(user.stream);
        });

    }

    getUser(name, props) {
        //console.log("****** NetLink.getUser "+JSON.stringify(props));
        props = props || {};
        var user = this.users[name];
        if (user) {
            //console.log("user "+name+" already exists");
            user.setProps({
                position: props.position,
                rotation: props.rotation
            });
            return user;
        }
        else {
            console.log("NetLink.Creating user");
            this.numUsers++;
            var y = 20*this.numUsers;
            user = new Avatar(this.game,
                name, {position: [0,5,0]});
            this.users[name] = user;
            return user;
        }
    }

    update() {
        this.sendStatus();
    }

    sendStatus() {
        var t = getClockTime();
        if (t - this.lastSendTime < this.updateInterval)
            return;

        this.lastSendTime = t;
        var c = this.game.camera;
        if (!c.position.equals(this.state.position) ||
            !c.rotation.equals(this.state.rotation)) {
            this.state.position.set(c.position.x, c.position.y, c.position.z);
            this.state.rotation.set(c.rotation.x, c.rotation.y, c.rotation.z);
            var msg = {'type': 'muse.status',
                'user': this.user,
                'platform': 'threejs',
                'position': c.position.toArray(),
                'rotation': c.rotation.toArray()}
            //console.log("NetLink.sendStatus "+JSON.stringify(msg));
            this.sendMessage(msg);
        }
    }

    sendMessage(msg) {
        this.lastMsgSent = msg;
        var str = JSON.stringify(msg);
        if (this.verbosity)
            console.log("NetLink.sendMessage "+this.channel+" msg: " + str);
        this.sock.emit(this.channel, str);
    }

    handleMessage(msg) {
        if (this.verbosity)
            console.log("NetLink.handleMessage "+JSON.stringify(msg));
        if (msg.type == 'muse.status') {
            var userName = msg.user;
            this.getUser(userName, msg);
            return;
        }
        console.log("Unrecognized message: "+JSON.stringify(msg));
    }
}

export {NetLink};
