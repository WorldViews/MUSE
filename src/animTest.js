
import 'yuki-createjs/lib/tweenjs-0.6.2.combined';
import _ from 'lodash';

console.log("********************************************");

class Anim
{
    constructor(name, target, steps) {
        var inst = this;
        this.target = target;
        //this.OBJ = {'x': 0}
        console.log("Anim "+name);
        this.name = name;
        if (steps instanceof createjs.Tween)
            this.tween = steps;
        else {
            this.tween = createjs.Tween.get({});
        }
        this.tween.addEventListener('change', () => inst.handleChange())
    }

    // dur is in seconds
    addStep(vals, dur) {
        this.tween.to(vals, dur*1000);
    }

    getTween() {
        return this.tween;
    }

    handleChange()
    {
        var vals = this.tween.target;
        //console.log("vals: "+JSON.stringify(vals));
        for (var name in vals) {
            //console.log("set "+name+" to "+vals[name]);
            if (this.target)
                _.set(this.target, name, vals[name]);
        }
        //this.target.x = obj.x;
    }

    getPlayTime() {
        return 0;
    }

    setPlayTime(t) {
        console.log("Anim "+this.name+" setPlayTime "+t);
        this.tween.setPosition(t*1000);
    }

    setPaused(v) {
        console.log("Anim "+this.name+" setPaused "+v);
        this.tween.setPaused(v);
    }

    play() {
        this.setPaused(false);
    }

    pause() {
        this.setPaused(true);
    }
}



function animTest(game)
{
    game = game || window.game;
    console.log("!!!! >>>>>>>>>>>>>>>>>>>>>>>>>> animTest...........");
    var target = game.models.station;
    window.anim = new Anim("anim1", game.models.station);
    anim.addStep({'position.x': 0}, 0);
    anim.addStep({'position.x': 10}, 100);
    anim.addStep({'position.x': 30,  'rotation.x':0}, 200);
    anim.addStep({'position.x': 100, 'rotation.x': 1}, 400);
    game.registerPlayer(anim);
    return anim;
}

window.animTest = animTest;
export {animTest, Anim};
