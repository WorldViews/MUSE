/*
  This is a code for a dynamic objects.  A dynamic object has state that changes
  with time.   The state at a given time is characterized by a 'record' which is
  just a JSON dictionary, which must have one field called 't', which is the time.
 */

import {SortedList} from './SortedList';

function cloneObject(obj) { return Object.assign({}, obj); }

function objectSize(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

class DynamicObject {

    constructor(objectId) {
        this.objectId = objectId;
        this.times = new SortedList([]);
        this.prevRec = null;
        this.records = {};
        this.minTime = 1.0E20;
        this.maxTime = -1;
        this.startTime = -1;
        this.endTime = -1;
        this.slack = 10; // The amount of time beyond the highest event seen
        // that we consider ourself to have a value.
        return this;
    }

    addRecord(record)
    {
        var t = record.t;
        this.minTime = Math.min(t, this.minTime);
        this.maxTime = Math.max(t, this.maxTime);
        this.startTime = this.minTime;
        this.endTime = this.maxTime;
        if (this.records[t] == undefined) {
	    this.times.insertOne(t);
        }
        this.records[t] = record;
    }

    findLastRec(t)
    {
        var i = this.times.bsearch(t);
        if (i < 0)
	    return null;
        if (i >= this.times.length-1)
	    return this.records[this.times[this.times.length-1]];
        var t0 = this.times[i];
        return this.records[t0];
    }

    findRecForTime(t)
    {
        return this.findLastRec(t);
    }

    setPlayTime(t, dynObjDB)
    {
        if (t < this.startTime || t > this.endTime+this.slack) {
	    //report("dynObj "+this.objectId+" t: "+t+" outside range "+this.startTime+" "+this.endTime);
	    if (this.prevRec == null)
	        return;
	    dynObjDB.postMessage({'msgType': 'v3d.delete',
		                  'id': this.objectId,
		                  't': t});
	    this.prevRec = null;
	    return;
        }
        //var rec = this.findLastRec(t);
        var rec = this.findRecForTime(t);
        if (rec == this.prevRec) {
	    //report("not sending duplicate messages");
	    return;
        }
        //report("rec: "+JSON.stringify(rec));
        var msg = cloneObject(rec);
        msg['id'] = this.objectId;
        msg['msgType'] = "v3d.setProps";
        //msg['msgType'] = (this.prevRec == null) ? 'v3d.create' : 'v3d.setProps';
        dynObjDB.postMessage(msg);
        this.prevRec = rec;
    }

    dump()
    {
        report("id: "+this.objectId);
        report("startTime: "+this.startTime+"  endTime: "+this.endTime);
        report("minTime: "+this.minTime+"  maxTime: "+this.maxTime);
        //report(JSON.stringify(this.records));
        for (var t in this.records) {
	    report(" t: "+t+" "+JSON.stringify(this.records[t]));
        }
        //report("times: "+JSON.stringify(this.times));
        report("times: "+this.times);
    }
}

export {DynamicObject};
