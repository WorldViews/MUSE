/*
  This is base class for object that controls various media and animations
  associated with a program or performance.

  Long term plan is that this, or a subclass, can read from spreadsheets or
  JSON specs that fully define a performance.

  It displays things like which displays are visible, what is presented on
  the displays, which objects are on stage, etc.
*/
import {sprintf} from "sprintf-js";
import * as Util from 'core/Util';
import {Game} from 'core/Game';
import {MUSE} from 'core/MUSE';
import {MUSENode} from 'core/Node';

function getClockTime() { return new Date().getTime()/1000.0; }

// This should be called ProgramControl, which is
// distinct from Program.
class Program extends MUSENode
{
    constructor(game, options) {
        options = options || {};
        super(game, options);
        this.checkOptions(options);
        this.game = game;
        game.setProgram(this);
        this.setProgramName(this.name);
        this.gss = null;
        this.mediaSequence = null;
        if (options.gss)
            this.gss = new GSS.SpreadSheet(options.gss);
        this.startTime = 0;
        if (options.startTime) {
            //var date = Util.toDate(options.startTime);
            //this.startTime = date.getTime()/1000.0;
            this.startTime = Util.toTime(options.startTime);
        }
        this.duration = options.duration || 60;
        this._playTime = 0;
        var playSpeed = options.playSpeed || 1.0;
        this.setPlaySpeed(playSpeed);
        var t = 0;
        if (options.playTime) {
            t = Util.toTime(options.playTime);
        }
        this.setPlayTime(t);
        this.onStartProgram = options.onStartProgram;
        this.channels = options.channels || [];
        this.scripts = options.scripts || {};
        this.stages = options.stages || [];
        this.selectedStageModel = null;
        //this.screenNames = ["mainScreen", "leftScreen", "innerCover"];
        this.screenNames = ["mainScreen", "innerCover"];
        console.log("channels:", this.channels);
        var inst = this;
        var promises = [];
        if (options.media) {
            promises.push(this.game.loadSpecs(options.media, "media"));
        }
        if (options.nodes) {
            promises.push(this.game.loadSpecs(options.nodes, "Program nodes"));
        }
        this.readyPromise = new Promise((resolve, reject) => {
            console.log("Program waiting for its promises");
            Promise.all(promises).then(() => {
                    console.log("All of Program's promises completed");
                    resolve(inst);
                }
            );
        });
    }

    setProgramName(name) {
        console.log("programName: "+name);
        this.programName = name;
    }

    getProgramName() {
        return this.programName;
    }
/*
    getProgramState() {
        var ps = {};
        var urlStateName = "mainScreen.url"; // hack!!!!
        ps.playTime = this.getPlayTime();
        ps.url = this.game.state.get(urlStateName);
        ps.stageModel = this.getStageModel();
        ps.duration = this.getDuration();
        ps.playState = this.game.state.get("playState");
        return ps;
    }

    setProgramState(ps) {
        var program = this;
        var game = this.game;
        var urlStateName = "mainScreen.url"; // hack!!!!
        program.selectStageModel(ps.stageModel);
        //game.state.set(urlStateName, gs.url);
        game.state.dispatch(urlStateName, ps.url);
        program.setPlayTime(ps.playTime);
        program.setDuration(ps.duration);
        if (ps.playState == "paused") {
            program.pause();
        }
        else {
            program.play();
        }
    }
*/
    getProgramState() {
        var ps = {};
        //var urlStateName = "mainScreen.url"; // hack!!!!
        ps.playTime = this.getPlayTime();
        ps.screenUrls = {};
        this.screenNames.forEach(screenName => {
            var urlStateName = screenName+".url";
            var url = this.game.state.get(urlStateName);
            if (url == undefined)
                url = "_CLEAR_"; // this helps it show up in JSON dump
            ps.screenUrls[screenName] = url;
            console.log("saved "+screenName+" "+urlStateName+" "+url);
        });
        ps.programName = this.programName;
        ps.stageModel = this.getStageModel();
        ps.duration = this.getDuration();
        ps.playState = this.game.state.get("playState");
        return ps;
    }

    setProgramState(ps) {
        console.log("Program.setProgramState ", ps);
        var program = this;
        var game = this.game;
        this.setProgramName(ps.programName);
        //var urlStateName = "mainScreen.url"; // hack!!!!
        program.selectStageModel(ps.stageModel);
        //game.state.set(urlStateName, gs.url);
        console.log("setting screenUrls", ps.screenUrls);
        for (var screenName in ps.screenUrls) {
            var url = ps.screenUrls[screenName];
            var urlStateName = screenName+".url";
            console.log("restoring "+screenName+" "+urlStateName+" "+url);
            game.state.dispatch(urlStateName, url);
        }
        //game.state.dispatch(urlStateName, ps.url);
        program.setPlayTime(ps.playTime);
        program.setDuration(ps.duration);
        if (ps.playState == "paused") {
            program.pause();
        }
        else {
            program.play();
        }
    }

    // This clears the program - meaning clearing screens.
    // it is used when pushing into a new program.   For Now
    // it only clears the main screen, but shoudl do all of them.
    clear() {
        // this is hack to get the main screen to clear.  Instead
        //var vidURL = "textures/blank.png"; // this makes the screen white
        /*
        var vidURL = "missing.jpg"; // this will blank the screen
        game.state.set("mainScreen.url", vidURL);
        game.state.set("innerCover.url", vidURL);
        */
        /*
        var vidURL = "missing.jpg"; // this will blank the screen
        */
        var vidURL = "_CLEAR_"; // this will blank the screen
        this.screenNames.forEach(screenName => {
            console.log("clearing "+screenName+" with dummy URL"+vidURL);
            game.state.set(screenName+".url", vidURL);
        });
        this.selectStageModel("none");
        /*
        this.screenNames.forEach(screenName => {
            console.log("clearing "+screenName);
            var sn = game.getNode(screenName);
            sn.clear();
        });
        */
    }

    /*
    clear() {
        // this is hack to get the main screen to clear.  Instead
        var urlStateName = "mainScreen.text";
        // set mainScreen to dummy, to stop playing.
        game.state.set(urlStateName, "");
    }
    */

    startProgram() {
        var t = this.getPlayTime();
        this.setPlayTime(t);
        setInterval(()=>this.tick(), 200);
        if (this.onStartProgram)
            this.onStartProgram(this.game, this);
    }

    setTimeRange(startTime, endTime)
    {
        var startTime = Util.toTime(startTime);
        var endTime = Util.toTime(endTime);
        this.startTime = startTime;
        var dur = endTime - startTime;
        this.duration = dur;
    }

    tick() {
        var t = this.getPlayTime();
        //console.log("tick "+t);
        this.displayTime(t);
    }

    formatTime(t) {
        if (t == undefined) {
            console.log("yikes formatTime got bad t");
            return "*** null ***";
        }
        return sprintf("%8.1f", t);
    }

    // This should just update UI elements with playtime information.
    // this may get called with every tick, so the things it causes
    // should be lightweight. (E.g. not seeking videos or redrawing
    // animations.)
    displayTime(t, isAdjust) {
        //console.log("displayTime "+t);
        var tStr = "";
        try {
            tStr = this.formatTime(t);
        }
        catch (e) {
            console.log("err: ", e);
            console.log("*** displayTime err  t: "+t);
        }
        this.game.state.set("time", t);
        this.game.state.set('seek', isAdjust ? true : false);
        var dur = this.duration;
    	let value = ((t-this.startTime)/(0.0+dur));
        if (game.controllers.ui) {
            game.controllers.ui.setTimeSlider(value);
        }
        // This bit is a hack because it is CMP specific.
        // it was moved here from CMPProgram.  This functionality
        // can all be moved to scripts in the config.
        /*
        if (this.gss) {
            var year = GSS.timeToYear(t);
            //console.log("year: " + year);
            var yearStr = "";
            if (year) {
                var va = this.gss.getFieldByYear(year, "videofade");
                var nar = this.gss.getFieldByYear(year, "narrative") || "";
                //console.log("va: " + va + "  narrative: " + nar);
                yearStr = Math.floor(year);
                if (nar) {
                    this.game.state.set('narrative', yearStr + ':' + nar);
                }
            }
            //console.log("yearStr:"+yearStr);
            this.game.state.set('year', yearStr);
        }
        */
    }

    getDuration() { return this.duration; }
    setDuration(dur) { this.duration = dur;}

    play() {
        console.log("**** play *****");
        this.setPlaySpeed(this._savedPlaySpeed);
        this.game.state.dispatch("playRequested", true);
        this.game.state.set("playState", "playing");
        this.propagate(player => player.play());
    }

    pause() {
        console.log("**** pause *****");
        this._savedPlaySpeed = this._playSpeed;
        this._playSpeed = 0;
        this.game.state.dispatch("pauseRequested", true)
        this.game.state.set("playState", "paused");
        this.propagate(player => player.pause());
    }

    isPlaying() {
        return this._playSpeed > 0;
    }

    getPlaySpeed() {
        return this._playSpeed;
    }

    setPlaySpeed(s) {
        this._playSpeed = s;
        this._savedPlaySpeed = s;
        return s;
    }

    getPlayTime() {
        var t = getClockTime();
        var dt = t - this._prevClockTime;
        this._prevClockTime = t;
        //console.log("dt: "+dt+"  "+this._playSpeed);
        this._playTime += dt*this._playSpeed;
        return this._playTime;
    };

    getRelativeTime(name) {
        var t = this.getPlayTime();
        var t0 = game.state.get(name+"._t");
        if (t0)
            return t - t0;
        return t;
    }

    // isAdjust is true if this was an adjustment (e.g. scrubbing) event
    // that should not force a heavyweight seek.  This can be ignored,
    // but may provide a nicer user experience if expensive operations
    // are only done when isAdjust=false.
    setPlayTime(t, isAdjust) {
        t = Util.toTime(t);
        this._prevClockTime = getClockTime();
        this._playTime = t;
        this.game.players.forEach(player => {
            var rt = this.getRelativeTime(player.name);
            if (player.setPlayTime)
                player.setPlayTime(rt, isAdjust);
        });
        this.displayTime(t, isAdjust);
    }

    propagate(fun) {
        this.game.players.forEach(player => {
            try { fun(player) }
            catch (e) {
                console.log("err: ", e);
                MUSE.LAST_BAD_PLAYER = player;
            }
        });
    }

    addMediaSequence(mediaSequence) {
        if (this.mediaSequence) {
            alert("MediaControl does not support more than one media sequence.");
        }
        this.mediaSequence = mediaSequence;
    }

    prevState() {
        console.log("MediaControl.prev");
        if (this.mediaSequence)
            this.mediaSequence.prev();
    }

    nextState() {
        console.log("MediaControl.next");
        if (this.mediaSequence)
            this.mediaSequence.next();
    }

    registerStageModel(modelName, stageName)
    {
        var stage = this.stages[0];
        stage.models[modelName] = modelName;
    }

    getStageModel(stageName) {
        return this.selectedStageModel;
    }

    // this is a temperary hack because a few controllers
    // are not models or nodes, so they don't get found.
    // soon we will make them all nodes.
    getNode(name) {
        if (game.nodes[name])
            return game.nodes[name];
        return game.controllers[name];
    }

    selectStageModel(modelName, stageName) {
        var stage = this.stages[0];
        var selectedModel = null;
        if (modelName && modelName != "none") {
             if(!stage.models[modelName]) {
                 Util.reportError("Model "+modelName+" not registered on stage");
                 return;
             }
             //var selectedModel = game.models[modelName];
            // selectedModel = game.controllers[modelName];
            //selectedModel = game.nodes[modelName];
            selectedModel = this.getNode(modelName);
             if (!selectedModel) {
                 Util.reportError("No model named "+modelName);
                 return;
             }
         }
         for (var name in stage.models) {
             //var model = game.models[name];
             //var model = game.controllers[name];
             //var model = game.nodes[name];
             var model = this.getNode(name);
             if (model) {
                 console.log("turning off visiblity for "+name, model);
                model.visible = false;
                if (model.setVisible) {
                    model.setVisible(false);
                }
                else {
                    console.log("*** not setVisible for model", model)
                }
            }
        }
        if (selectedModel)
            selectedModel.visible = true;
        this.selectedStageModel = modelName;
    }
}

function addProgram(game, opts)
{
    let program = new Program(game, opts);
    return program.readyPromise;
}

Game.registerNodeType("Program", addProgram);

MUSENode.defineFields(Program, [
    "media",
    "startTime",
    "playTime",
    "playSpeed",
    "duration",
    "gss",
    "stages",
    "channels",
    "scripts",
    "nodes",
    "onStartProgram"
]);

export {Program};
