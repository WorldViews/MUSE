/*
  This is base class for object that controls various media and animations
  associated with a program or performance.

  Long term plan is that this, or a subclass, can read from spreadsheets or
  JSON specs that fully define a performance.

  It displays things like which displays are visible, what is presented on
  the displays, which objects are on stage, etc.
*/
import {sprintf} from "sprintf-js";
import * as Util from './Util';

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
        this.startTime = 0;
        if (options.startTime) {
            //var date = Util.toDate(options.startTime);
            //this.startTime = date.getTime()/1000.0;
            this.startTime = Util.toTime(options.startTime);
        }
        this.duration = options.duration || 60;
        this.players = {};
        this._playTime = 0;
        var playSpeed = options.playSpeed || 1.0;
        this.setPlaySpeed(playSpeed);
        var t = 0;
        if (options.playTime) {
            t = Util.toTime(options.playTime);
        }
        this.setPlayTime(t);
        this.channels = options.channels || [];
        this.scripts = options.scripts || {};
        this.stages = options.stages || [];
        console.log("channels:", this.channels);
        var inst = this;
        setInterval(()=>inst.tick(), 200);
    }

    setTimeRange(startTime, endTime)
    {
        var startTime = Util.toTime(startTime);
        var endTime = Util.toTime(endTime);
        this.startTime = startTime;
        var dur = endTime - startTime;
        this.duration = dur;
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

    formatTime(t) {
        return sprintf("%8.1f", t);
    }

    displayTime(t) {
        //console.log("displayTime "+t);
        var tStr = this.formatTime(t);
        this.game.setValue("time", tStr);
        var dur = this.duration;
    	let value = ((t-this.startTime)/(0.0+dur));
        if (game.controllers.ui && game.controllers.ui.slider) {
            try {
	               game.controllers.ui.slider.value = value;
            }
            catch (e) {
	               console.log("exception setting slider");
            }
        }
        //console.log("slider t: "+t+"  dur: "+dur+"  value: "+value);
        try {
              // console.log(">>>>>>>>>>>> setting uiTimeLine.val "+value);
               $("#uiTimeSlider").val(value);
	           //let timeline = $('#uiTimeLine');
    	       //timeline.val(value);
        }
        catch (e) {
        }
    }

    play() {
        console.log("**** play *****");
        this.setPlaySpeed(this._savedPlaySpeed);
    }

    pause() {
        console.log("**** pause *****");
        this._savedPlaySpeed = this._playSpeed;
        this._playSpeed = 0;
        //this.setPlaySpeed(0);
    }

    getPlaySpeed() {
        return this._playSpeed;
    }

    setPlaySpeed(s) {
        this._playSpeed = s;
        this._savedPlaySpeed = s;
        return s;
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

    getPlayTime() { return this.playTime };

    setPlayTime(t) {
        t = Util.toTime(t);
        this._prevClockTime = getClockTime();
        this._playTime = t;
        //console.log(">>>> noticeTime "+t);
        for (name in this.players) {
            var player = this.players[name];
            //console.log("set playTime "+name, player);
            //******* Get rid of this.  Change our code to not user set and get
            if (player.setPlayTime) {
                //console.log("calling setPlayTime");
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
        this.displayTime(t);
    }
}

export {ProgramControl};
