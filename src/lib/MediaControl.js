/*
  This is a code for a dynamic objects.  A dynamic object has state that changes
  with time.   The state at a given time is characterized by a 'record' which is
  just a JSON dictionary, which must have one field called 't', which is the time.
*/
import {DynamicObject} from './DynamicObject';
import {DynamicObjectDB} from './DynamicObjectDB';
import {Game} from '../Game';
import * as Util from '../Util';

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

class SlidePlayer extends DynamicObjectDB
{
    constructor(game, options) {
        var name = options.name;
        var screenName = options.group;
        super(name);
        this.game = game;
        this.screenName = screenName;
        this.playSpeed = 1;
        this.playTime = 0;
        console.log("Screen "+screenName);
        var recs = options.records;
        recs = fixRecs(recs);
        var recsObj = {records: recs};
        this.addRecords(recsObj);
        this.dump();
    }

    update(dt) {
    }

    play() {
    }

    pause() {
    }

    getPlayTime() {
        return this.playTime;
    }

    setPlaySpeed(s) {
        this.playSpeed = s;
    }

    getPlaySpeed() {
        return this.playSpeed;
    }

    postMessage(msg)
    {
        msg['name'] = msg['id'];
        if (msg['msgType'] != "v3d.delete") {
            //msg['imageUrl'] = "http://"+serverHost+"/"+msg['imageUrl'];
            var url = msg.url;
            var screen = this.game.screens[this.screenName];
            console.log("handle "+msg.msgType+" "+url, screen);
            if (screen)
                screen.updateImage(url)
            else
                console.log("ScreenPlayer "+this.screenName+" no screen found");
        }
        console.log("*** SlidePlayer "+this.name+" postMessage: "+JSON.stringify(msg));
    }
}


function runSlideShow(game)
{
    var recs = getRecs();
    var db = new SlidePlayer(game,
        {name: "slideShow1",
            screenName: "mainScreen",
            records: recs});
    /*
    var recs = {"records": [
      { "id": "slide", "t": 1,    "label": "one" },
      { "id": "slide", "t": 1.3,  "label": "one.three" }
      ]
    }
*/
    db.addRecords(recs);
    db.dump();
    var low = 0;
    var high = t;
    for (var t=low; t<high; t+= 0.1) {
        //report("t: "+t);
        db.setPlayTime(t);
    }
    for (var t=high; t>=low; t-= 0.1) {
        //report("t: "+t);
        db.setPlayTime(t);
    }
}

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
        options.name = "slidePlayer_"+group;
    var slideShow = new SlidePlayer(game, options);
    game.registerController(options.name, slideShow);
    game.registerPlayer(slideShow);
    return slideShow;
});

window.runSlideShow = runSlideShow;

export {SlidePlayer, runSlideShow};
