/*
  This is base class for object that controls various media and animations
  associated with a program or performance.

  Long term plan is that this, or a subclass, can read from spreadsheets or
  JSON specs that fully define a performance.

  It displays things like which displays are visible, what is presented on
  the displays, which objects are on stage, etc.
*/
import {sprintf} from "sprintf-js";

function getClockTime() { return new Date().getTime()/1000.0; }

class ProgramControl
{
    constructor(game, options) {
        options = options || {};
        this.game = game;
        game.programControl = this;
        this.gss = null;
        if (options.gss)
            this.gss = new GSS.SpreadSheet(options.gss);
        this.duration = options.duration || 60;
        this.players = {};
        this._playTime = 0;
        this._playSpeed = 1.0;
        this.setPlayTime(0);
        var inst = this;
        setInterval(()=>inst.tick(), 200);
    }

    registerPlayer(player, name)
    {
        name = name || player.name;
        //TODO: flag error if no name or name collision.
        this.players[name] = player;
    }

    tick() {
        var t = this.playTime;
        //console.log("tick "+t);
        this.displayTime(t);
    }

    displayTime(t) {
        console.log("displayTime "+t);
    }

    get playTime() {
        var t = getClockTime();
        var dt = t - this._prevClockTime;
        this._prevClockTime = t;
        //console.log("dt: "+dt+"  "+this._playSpeed);
        this._playTime += dt*this._playSpeed;
        return this._playTime;
    }

    set playTime(t) {
        this.setPlayTime(t)
    }

    setPlayTime(t) {
        this._prevClockTime = getClockTime();
        this._playTime = t;
        console.log(">>>> noticeTime "+t);
        for (name in this.players) {
            var player = this.players[name];
            console.log("set playTime "+name, player);
            //******* Get rid of this.  Change our code to not user set and get
            if (player.setPlayTime) {
                console.log("calling setPlayTime");
                player.setPlayTime(t)
            }
            else
                player.playTime = t;
        }

        for (var key in this.game.screens) {
            //this.game.screens[key].imageSource.setPlayTime(t);
            var screen = this.game.screens[key];
            screen.setPlayTime(t);
        }
    }
}

export {ProgramControl};
