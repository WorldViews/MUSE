/*
  This is a code for a dynamic objects.  A dynamic object has state that changes
  with time.   The state at a given time is characterized by a 'record' which is
  just a JSON dictionary, which must have one field called 't', which is the time.
*/

import {DynamicObject} from './DynamicObject';
import {DynamicObjectDB} from './DynamicObjectDB';
import {Game} from 'core/Game';
import * as Util from 'core/Util';
import sorted from 'sorted-array-functions';
window.sorted = sorted;

var CLAMP = true;

function compareFrames(a,b) {
    if (a.t === b.t)
        return 0;
    return (a.t > b.t ? 1 : -1)
}

class KeyFrames {
    constructor(items) {
        this.frames = [];
        this.addFrames(items || []);
    }

    add(item) {
        sorted.add(this.frames, item, compareFrames);
        this._updateRange();
    }

    _updateRange() {
        var n = this.frames.length;
        this.low =  n > 0 ? this.frames[0].t   :  1.0E100;
        this.high = n > 0 ? this.frames[n-1].t : -1.0E100;
    }

    numFrames() { return this.frames.length; }

    addFrames(items) {
        items.forEach(item => sorted.add(this.frames, item, compareFrames));
        this._updateRange();
    }

    getIdx(t, clamp) {
        // Return an appropriate frame index for the time.  It is the lowest
        // index i with frames[i].t >= t.  If out of range, then if clamped
        // is true, the index of first or last frame is given, otherwise -1.
        if (clamp == null)
            clamp = CLAMP;
        if (t < this.low) {
            return CLAMP ? 0 : -1;
        }
        if (t > this.high) {
            return CLAMP ? this.frames.length-1 : -1;
        }
        if (t == this.high)
            return this.frames.length -1;
        var i = sorted.gt(this.frames, {t}, compareFrames);
        return i-1;
    }

    getInterp(t) {
        if (t < this.low) {
            return [-1, 0, 1, t - this.low];
        }
        if (t >= this.high) {
            return [this.frames.length-1, -1, 0, t - this.high];
        }
        var i = this.getIdx(t);
        var dt = this.frames[i+1].t - this.frames[i].t;
        var s = (t-this.frames[i].t) / dt;
        return [i, i+1, s, dt];
    }

    getFrameByTime(t) {
        var i = this.getIdx(t);
        if (i < 0 || i >= this.frames.length)
            return null;
        return this.frames[i];
    }

    getFrameByIndex(i) {
        return this.frames[i];
    }

    has(t) { return sorted.has(this.frames, {t}, compareFrames); };

    remove(t) { return sorted.remove(this.frames, {t}, compareFrames); }

    gt(t) { return sorted.gt(this.frames, {t}, compareFrames); }
    gte(t) { return sorted.gte(this.frames, {t}, compareFrames); }
    lt(t) { return sorted.lt(this.frames, {t}, compareFrames); }
    lte(t) { return sorted.lte(this.frames, {t}, compareFrames); }

    dump() {
        var i=0;
        this.frames.forEach(item => console.log(" "+(i++) +" "+JSON.stringify(item)));
    }
}

function kfRun(kf, low, high, delta) {
    delta = delta || 1.0;
    for (var t=low; t<=high; t+= delta) {
        var i = kf.getIdx(t);
        console.log(sprintf("%6.1f  %d", t, i));
    }
}

function kfRunInterp(kf, low, high, delta) {
    delta = delta || 1.0;
    for (var t=low; t<=high; t+= delta) {
        var interp = kf.getInterp(t);
        console.log(sprintf("%6.1f  %s", t, interp));
    }
}

function kfTest() {
    window.kf = new KeyFrames([{t:1, v: 30}]);
    kf.add({t:10, v:15});
    kf.add({t:5, v:3});
    kf.add({t:12, v:3});
    kf.dump();
    console.log("------");
    kf.addFrames([{t:7,v:9}, {t:16, v:30}])
    kf.dump();
    console.log("run:");
    kfRun(kf, -2, 20, 1);
    console.log("interp");
    kfRunInterp(kf, -2, 20, 1);
    console.log("remove 7");
    kf.remove(7);
    kf.dump();
}
window.kfTest = kfTest;
window.KeyFrames = KeyFrames;
//TODO: write unit tests...

export {KeyFrames,kfTest};
