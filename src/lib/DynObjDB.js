/*
  This is a code for a dynamic objects.  A dynamic object has state that changes
  with time.   The state at a given time is characterized by a 'record' which is
  just a JSON dictionary, which must have one field called 't', which is the time.
 */

import {SortedList} from './SortedList';

Object.clone = function(obj) { return Object.assign({}, obj); }

Object.size = function(obj) {
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
        var msg = Object.clone(rec);
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


/*
  A DynamicObjectDB is just a collection of DynamicObjects, indexed by id.
 */
function DynamicObjectDB(name) {
    this.name = name;
    this.loadStartTime = null;
    this.numRecords = 0;  // only used for diagnostics
    this.currentPlayTime = null;
    this.minTime = 1.0E30;
    this.maxTime = -1;
    this.dynamicObjects = [];
}

DynamicObjectDB.prototype.getNumObjects = function()
{
    return Object.size(this.dynamicObjects);
}

DynamicObjectDB.prototype.addRecords = function(recsObj)
{
    var recs = recsObj["records"];
    for (var i=0; i<recs.length; i++) {
	var rec = recs[i];
	var id = rec.id;
	var dynObj = this.dynamicObjects[id];
	if (dynObj == null) {
	    dynObj = new DynamicObject(id);
	    this.dynamicObjects[id] = dynObj;
	}
	dynObj.addRecord(rec);
	this.minTime = Math.min(dynObj.startTime, this.minTime);
	this.maxTime = Math.max(dynObj.endTime, this.maxTime);
    }
    this.numRecords += recs.length;
    //this.dump();
}

DynamicObjectDB.prototype.loadRecords = function(url)
{
    var dynObjDB = this;
    this.loadStartTime = getClockTime();
    fetchJSON(url, function(records) {
	    //this.addMessages(msgs);
	    var t1 = getClockTime();
	    dynObjDB.addRecords(records);
	    var t2 = getClockTime();
	    numObjs = dynObjDB.getNumObjects();
	    report("Processed in "+(t2-t1)+" secs.");
	    report("Loaded "+url+" with "+dynObjDB.numRecords+" records for "+numObjs+
		       " objects in "+(t2-dynObjDB.loadStartTime)+" sec.");
	});
}

DynamicObjectDB.prototype.dump = function()
{
    report("------------------------------------");
    report("Dynamic DB "+this.name);
    report("Num Objects: "+Object.size(this.dynamicObjects));
    report("MinTime: "+this.minTime);
    report("MaxTime: "+this.maxTime);
    for (var id in this.dynamicObjects) {
	var dynObj = this.dynamicObjects[id];
	dynObj.dump();
    }
    report("------------------------------------");
}

DynamicObjectDB.prototype.postMessage = function(msg)
{
    report("**** DynamicObjectDB "+this.name+" postMessage: "+JSON.stringify(msg));
    handleMessageV3D(msg);
}


/*
  This sets the playTime to a given value.  It does this by
  setting the time for each dynamic object to that time.   For
  each object, the most recent record before that time is found.
  If it is different from the record found at the previous playTime
  messages are sent to create, delete or update the state.
 */
DynamicObjectDB.prototype.setPlayTime = function(t)
{
    //report("dynObjDB setPlayTime "+t);
    for (var id in this.dynamicObjects) {
	var dynObj = this.dynamicObjects[id];
	dynObj.setPlayTime(t, this);
    }
    this.currentPlayTime = t;
}

/*
  An image DB is a specialized DynamicObjectDB where
  imageUrl is the thing that changes.
*/
var serverHost = "localhost";

ImageDB.prototype = new DynamicObjectDB();
ImageDB.prototype.constructor = ImageDB;

function ImageDB(name)
{
    DynamicObjectDB.call(this, name);
}

ImageDB.prototype.constructor = ImageDB;

ImageDB.prototype.postMessage = function(msg)
{
    msg['name'] = msg['id'];
    //msg['imageUrl'] = "/"+msg['imageUrl'];
    if (msg['msgType'] != "v3d.delete") {
        msg['imageUrl'] = "http://"+serverHost+"/"+msg['imageUrl'];
    }
    report("*** ImageDB "+this.name+" postMessage: "+JSON.stringify(msg));
    //handleMessageV3D(msg);
}


function DynObjDB_test()
{
    //var db = new DynamicObjectDB("test1");
    var db = new ImageDB("test1");
    //    db.postMessage = function(msg) {
    //	report("--> msg: "+JSON.stringify(msg));
    //    }
    var recs = {"records": [
      { "id": "obj1", "t": 1,    "label": "one" },
      { "id": "obj2", "t": 1,    "label": "one" },
      { "id": "obj1", "t": 1.3,  "label": "one.three" },
      { "id": "obj2", "t": 1.6,  "label": "one.six" },
      { "id": "obj1", "t": 2.0,  "label": "two.zero"  },
      { "id": "obj1", "t": 2.5,  "label": "two.five" },
      { "id": "obj2", "t": 2.6,  "label": "two.six" },
      ]
    }
    db.addRecords(recs);
    db.dump();
    var low = 0;
    var high = 3.0;
    for (var t=low; t<high; t+= 0.1) {
	report("t: "+t);
	db.setPlayTime(t);
    }
    for (var t=high; t>=low; t-= 0.1) {
	report("t: "+t);
	db.setPlayTime(t);
    }
}

window.DynObjDB_test = DynObjDB_test;

export {DynObjDB_test};

