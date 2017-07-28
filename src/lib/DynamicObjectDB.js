/*
  This is a code for a dynamic objects.  A dynamic object has state that changes
  with time.   The state at a given time is characterized by a 'record' which is
  just a JSON dictionary, which must have one field called 't', which is the time.
*/

import {SortedList} from './SortedList';
import {DynamicObject} from './DynamicObject';

function objectSize(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};


/*
  A DynamicObjectDB is just a collection of DynamicObjects, indexed by id.
 */

class DynamicObjectDB {

    constructor(name) {
        this.name = name;
        this.loadStartTime = null;
        this.numRecords = 0;  // only used for diagnostics
        this.currentPlayTime = null;
        this.minTime = 1.0E30;
        this.maxTime = -1;
        this.dynamicObjects = [];
    }

    getNumObjects()
    {
        return objectSize(this.dynamicObjects);
    }

    addRecords(recsObj)
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

    loadRecords(url)
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

    dump()
    {
        report("------------------------------------");
        report("Dynamic DB "+this.name);
        report("Num Objects: "+objectSize(this.dynamicObjects));
        report("MinTime: "+this.minTime);
        report("MaxTime: "+this.maxTime);
        for (var id in this.dynamicObjects) {
	    var dynObj = this.dynamicObjects[id];
	    dynObj.dump();
        }
        report("------------------------------------");
    }

    postMessage(msg)
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
    setPlayTime(t)
    {
        //report("dynObjDB setPlayTime "+t);
        for (var id in this.dynamicObjects) {
	    var dynObj = this.dynamicObjects[id];
	    dynObj.setPlayTime(t, this);
        }
        this.currentPlayTime = t;
    }
}

/*
  An image DB is a specialized DynamicObjectDB where
  imageUrl is the thing that changes.
*/
var serverHost = "localhost";

class ImageDB extends DynamicObjectDB
{
    constructor(name) {
        super(name);
    }

    postMessage(msg)
    {
        msg['name'] = msg['id'];
        //msg['imageUrl'] = "/"+msg['imageUrl'];
        if (msg['msgType'] != "v3d.delete") {
            msg['imageUrl'] = "http://"+serverHost+"/"+msg['imageUrl'];
        }
        report("*** ImageDB "+this.name+" postMessage: "+JSON.stringify(msg));
        //handleMessageV3D(msg);
    }
}


function DynamicObjectDB_test()
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

window.DynamicObjectDB_test = DynamicObjectDB_test;

export {DynamicObjectDB, DynamicObjectDB_test};

