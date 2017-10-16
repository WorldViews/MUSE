/*
  This is a code for a dynamic objects.  A dynamic object has state that changes
  with time.   The state at a given time is characterized by a 'record' which is
  just a JSON dictionary, which must have one field called 't', which is the time.
*/

//import {DynamicObject} from './DynamicObject';
//import {DynamicObjectDB} from './DynamicObjectDB';
import {Game} from '../Game';
import * as Util from '../Util';
import {KeyFrames} from './KeyFrames';

function clone(obj) { return Object.assign({},obj); }
/*
function expandField(obj, field, ctx, recs)
{
    //console.log("ctx: "+JSON.stringify(ctx));
    if (!obj[field]) {
        recs.push(Object.assign(clone(ctx), obj));
        return;
    }
    ctx = clone(ctx);
    for (var key in obj) {
        if (key != field)
            ctx[key] = obj[key];
    }
    obj.records.forEach(rec => {
        expandField(rec, field, ctx, recs)
    });
}

function expandRecords(obj) { var recs =[]; expandField(obj, 'records', {}, recs); return recs}
*/

//window.expandRecords = expandRecords;

function getRecs()
{
    var recs = {records: []};
    var t = 0;
    for (var i=1; i<= 13; i++) {
        var rec = {id: 'slide',
            t: t,
            url: "assets/images/ColabTalk/Slide"+i+".PNG"};
        recs.records.push(rec);
        t += 30;
    }
    console.log("slides:\n"+JSON.stringify(recs, null, 3));
    return recs;
}

function fixRecs(recs)
{
    recs.forEach(rec => {
        var t = Util.toTime(rec.t);
        console.log("----->fixRecs "+rec.t+" "+t);
        rec.t = t;
    });
    return recs;
}

//
// This is a set of states, which may have associated
// media elements.
//
class MediaSet {
    constructor(game, options) {
        this.game = game;
        this.name = options.name;
        this.options = options;
    }
}

// THis is a set of states with a natural order.
class MediaSequence extends MediaSet
{
    constructor(game, options) {
        super(game, options);
        var media = options.media;
        this.media = media;
        this.idx = null;
        this.setIdx(0);
        game.program.addMediaSequence(this);
    }

    setIdx(idx) {
        if (idx < 0 || idx >= this.media.length) {
            console.log("MediaSequence.setIdx out of range");
            return;
        }
        if (idx == this.idx)
            return;
        this.idx = idx;
        this.onChangeMedia(this.media[idx]);
    }

    next() {
        this.setIdx(this.idx + 1);
    }

    prev() {
        this.setIdx(this.idx - 1);
    }

    onChangeMedia(media) {
        console.log("MediaSequence: idx:" +this.idx+" media: "+media);
    }
}

class SlideSequence extends MediaSequence {
    constructor(game, options) {
        super(game, options);
    }

    onChangeMedia(frames) {
        if (!Array.isArray(frames)) {
            frames = [frames]
        }
        frames.forEach( frame => {
            var url = frame.url;
            var name = frame.name || this.name;
            console.log("SlideSequence.onChangeFrame "+this.name+" frame: "+frame);
            console.log("   url: "+url);
            this.game.state.set(name, {url});
        });
    }
}

/*
A media stream is a timed sequence of media elements, indexed by continuous
time variable.
*/
class MediaStream {
    constructor(game, options) {
        this.name = options.name;
        this.game = game;
        this.playSpeed = 1;
        this.playTime = 0;
        console.log("MediaStream "+this.name);
        var recs = options.records;
        recs = fixRecs(recs);
        this.keyFrames = new KeyFrames(recs);
        this.prevFrame = null;
        this.dump();
    }

    dump() {
        console.log("MediaStream: "+this.name);
        this.keyFrames.dump();
    }

    update()
    {
        var t = this.game.program.getPlayTime();
        this.prevPlayTime = t;
        var frame = this.keyFrames.getFrameByTime(t);
        //console.log("MediaStream "+this.name+" frame: "+frame);
        if (frame != this.prevFrame) {
            this.onChangeFrame(frame);
            this.prevFrame = frame;
        }
    }

    onChangeFrame(frame) {
        console.log("MediaStream.onChangeFrame "+this.name+" frame: "+frame);
    }

}


class Slides extends MediaStream
{
    constructor(game, options) {
        var screenName = options.group;
        options.name = options.name || screenName;
        super(game, options);
        this.screenName = screenName;
    }

    onChangeFrame(frame) {
        var url = frame.url;
        console.log("Slides.onChangeFrame "+this.screenName+" frame: "+frame);
        console.log("   url: "+url);
        this.game.state.set(this.screenName, {url});
    }
}

class StageStream extends MediaStream
{
    constructor(game, options) {
        var stageName = options.group;
        options.name = options.name || stageName;
        super(game, options);
        this.stageName = stageName;
    }

    onChangeFrame(frame) {
        var modelName = frame.name;
        console.log("StagePlayer.onChangeFrame "+this.stageName+" frame: "+frame);
        console.log("   choice: "+modelName);
        var ui = game.controllers.ui;
        if (ui)
            ui.stageControl.selectModel(modelName);
    }
}

Game.registerNodeType("SlideSequence", (game, options) => {
    console.log("===========================")
    console.log("slides ", options);
    console.log("slides "+JSON.stringify(options));
    if (!options.name) {
        Util.reportError("SlideSequence No name specified");
        return null;
    }
    var slideSequence = new SlideSequence(game, options);
    //game.registerController(options.name, slideShow);
    //game.registerPlayer(slideShow);
    window.slides = slideSequence;
    return slideSequence;
});


Game.registerNodeType("Slides", (game, options) => {
    console.log("===========================")
    console.log("slides ", options);
    console.log("slides "+JSON.stringify(options));
    var group = options.group;
    if (!group) {
        Util.reportError("No group specified");
        return null;
    }
    if (!options.name)
        options.name = "slides_"+group;
    var slideShow = new Slides(game, options);
    game.registerController(options.name, slideShow);
    game.registerPlayer(slideShow);
    return slideShow;
});

Game.registerNodeType("StageStream", (game, options) => {
    console.log("===========================")
    console.log("slides ", options);
    console.log("slides "+JSON.stringify(options));
    var stage = options.stage;
    if (!stage) {
        Util.reportError("No stage specified");
        return null;
    }
    if (!options.name)
        options.name = ("stagePlayer_"+stage).replace(" ","_");
    var slideShow = new StageStream(game, options);
    game.registerController(options.name, slideShow);
    game.registerPlayer(slideShow);
    return slideShow;
});


export {Slides, StageStream};
