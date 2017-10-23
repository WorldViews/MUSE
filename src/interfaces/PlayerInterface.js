/*
This module is for playing around with using Mixins to generate helpers for
the state and dispatch system to implement interfaces.

I'm not sure if this is a good idea or that we will use this.
*/
function NotImplemented(name)
{
    console.log(name + " NotImplemented");
    //throw "NotImplemented";
}

// Calling this an interface, but its more of a virtual or abstract class
// with some undefined methods.
class PlayerInterface {
    constructor(name) {
        console.log("PlayerInterface.constructor "+name);
        this.name = name;
    }

    adjustPlayTime(t) {
        NotImplemented("adjustPlayTime")
    }

    setPlayTime(t) {
        NotImplemented("setPlayTime")
    }

    getPlayTime() {
        NotImplemented("getPlayTime")
    }

    play() {
        NotImplemented("play")
    }

    pause() {
        NotImplemented("pause")
    }
}

let PlayerEventClientMixin = Base => class extends Base {
    constructor(name, state) {
        super(name, state);
        console.log("PlayerEventClientMixin.constructor "+name+" "+state);
        this.channel = name;
        this.state = state;
    }

    setPlayTime(t) {
        //this.state.set(this.channel, {playTime: t});
        this.state.set(this.channel+".playTime", t);
    }

    adjustPlayTime(t) {
        this.state.dispatch(this.channel, {playTime: t});
    }

    getPlayTime() {
        return this.state.get(this.channel+".playTime");
    }

    play() {
        //this.state.dispatch(this.channel, {playState: "play"});
        this.state.dispatch(this.channel+".playState", "play");
    }

    pause() {
        //this.state.dispatch(this.channel, {playState: "pause"});
        this.state.dispatch(this.channel+".playState", "pause");
    }
}


let PlayerEventHandlerMixin = Base => class extends Base {
    constructor(name, state) {
        super(name);
        this.setup(name, state);
    }

    setup(name,state) {
        var inst = this;
        state.on(name+".playTime", v => {
            console.log("PlayerEventHandlerMixin.on playTime");
            inst.setPlayTime(v);
        });
        state.on(name+".playState", v => {
            console.log("PlayerEventHandlerMixin.on playState");
            if (v == "play") {
                inst.play();
            }
            else if (v == "pause") {
                inst.pause();
            }
            else {
                console.log("Bad Play State");
                throw "BadPlayState";
            }
        });
    }
}

class Dummy {
    constructor(name) {
        console.log("Dummy.constructor "+name);
        this.name = name;
    }
}

class PlayerClient extends PlayerEventClientMixin(Dummy)
{
    constructor(name, state) {
        super(name, state || game.state);
        console.log("DummyPlayer.constuctor "+name);
        //this.setup(game.state, name);
    }
}

class PlayerImp extends PlayerEventHandlerMixin(PlayerInterface)
{
    constructor(name) {
        super(name, game.state);
        console.log("DummyPlayer.constuctor "+name);
        //this.setup(game.state, name);
    }
}

window.playerTest = function() {
    window.pi = new PlayerImp("foo");
    window.p = new PlayerClient("foo");
    p.play();
    p.setPlayTime(50);
    p.pause();
}

window.PlayerClient = PlayerClient;
window.PlayerImp = PlayerImp;
