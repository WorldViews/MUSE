
import * as THREE from 'three';
import {Mathx} from 'three';

// This will be a singleton
var viewManager = null;

var SAMPLE_VIEWS =
{
   "View1": {
      "position": {
         "y": 299.3219268854358, 
         "x": -6.13501510231044, 
         "z": 7.605536282624485
      }, 
      "rotation": {
         "_order": "XYZ", 
         "_z": 0.011873869626116694, 
         "_y": 0.13649429834707483, 
         "_x": -0.08704598014289926
      }, 
      "name": "View1"
   }, 
   "View2": {
      "position": {
         "y": 331.20146986279644, 
         "x": 0.9179406230910985, 
         "z": 3.8511270363093217
      }, 
      "rotation": {
         "_order": "XYZ", 
         "_z": 0.011873869626116694, 
         "_y": 0.13649429834707483, 
         "_x": -0.08704598014289926
      }, 
      "name": "View2"
   }, 
}


class ViewInterpolator {
    constructor(p0, r0, p1, r1, camera)
    {
        console.log("ViewInterpolator p0:"+JSON.stringify(p0)+" p1: "+JSON.stringify(p1));
        console.log("ViewInterpolator r0:"+JSON.stringify(r0)+" r1: "+JSON.stringify(r1));
        this.r0 = r0;
        this.r1 = r1;
        this.p0 = p0;
/*
        this.q0 = new THREE.Quaternion().setFromEuler(new THREE.Euler().setFromVector3(r0));
        this.q1 = new THREE.Quaternion().setFromEuler(new THREE.Euler().setFromVector3(r1));
*/
        this.q0 = new THREE.Quaternion().setFromEuler(new THREE.Euler(r0._x, r0._y, r0._z));
        this.q1 = new THREE.Quaternion().setFromEuler(new THREE.Euler(r1._x, r1._y, r1._z));
        this.p1 = p1;
        this.p = new THREE.Vector3(0,0,0);
        this.q = new THREE.Quaternion();
        console.log("ViewInterpolator q0:"+JSON.stringify(this.q0));
        console.log("                 q1: "+JSON.stringify(this.q1));
        this.camera = camera;
        this.range = 1.0;
        this.targetP;
        this.targetR;
    }
    
    // This seems to have a problem that some quaternions are bad
    setValSlerp(s) {
	//console.log("setValSlerp "+s);
        //console.log("ViewInterpolator q0:"+JSON.stringify(this.q0)+" q1: "+JSON.stringify(this.q1));
	var f = s/this.range;
        this.p.lerpVectors(this.p0, this.p1, f);
	//console.log("p: "+JSON.stringify(this.p));
        var camera = this.camera;
	camera.position.x = this.p.x;
	camera.position.y = this.p.y;
	camera.position.z = this.p.z;
	THREE.Quaternion.slerp(this.q0, this.q1, this.q, f);
	//console.log("q: "+JSON.stringify(this.q));
	camera.rotation.setFromQuaternion(this.q)
    }

    setValLerp(s) {
	//console.log("setValLerp "+s);
        //console.log("this.r1:"+JSON.stringify(this.r1));
	var f = s/this.range;
        this.p.lerpVectors(this.p0, this.p1, f);
	//console.log("p: "+JSON.stringify(this.p));
        var camera = this.camera;
	camera.position.x = this.p.x;
	camera.position.y = this.p.y;
	camera.position.z = this.p.z;
	var rx = (1-f)*this.r0._x + f*this.r1._x;
	var ry = (1-f)*this.r0._y + f*this.r1._y;
	var rz = (1-f)*this.r0._z + f*this.r1._z;
	//console.log("rx,ry,rz: "+rx+" "+ry+" "+rz);
	camera.rotation.x = rx;
	camera.rotation.y = ry;
	camera.rotation.z = rz;
        //camera.updateProjectionMatrix();
    }

    setVal(s) {
        if (viewManager.slerp)
            return this.setValSlerp(s);
        return this.setValLerp(s);
    }

}

class Animation
{
    constructor(manager, name, dur, interpolator)
    {
        name = name || "anon";
        if (dur == null)
	    dur = 1;
        this.name = name;
        this.running = false;
        this.t0 = 0;
        this.t1 = dur;
        this.interpolators = []
        if (interpolator)
	    this.interpolators.push(interpolator);
        this.playTime = 0;
        this.manager = manager;
    }

    update() {
	if (!this.running) {
	    console.log("*** anim "+this.name+" updated but not running");
	    this.deactivate();
	    return;
	}
	var ct = Date.now()/1000;
	var dt = ct - this.lastClockTime;
	var pt = this.playTime + dt;
	this.lastClockTime = ct;
	this.playTime = pt;
	//console.log("ANIM run "+pt+" update");
	var dur = this.t1-this.t0;
	var f = pt/dur;
	for (var i=0; i<this.interpolators.length; i++) {
	    try {
		this.interpolators[i].setVal(f);
	    }
	    catch (e) {
		console.log("error: "+e);
	    }
	}
	if (this.playTime >= this.t1) {
	    console.log("anim "+this.name+" finished!!");
	    this.deactivate();
	}
    }

    activate() {
	this.playTime = 0;
	this.lastClockTime = Date.now()/1000.0;
	this.running = true;
	this.manager.activeAnimations.push(this);
    };

    deactivate = function() {
	this.running = false;
	var i = this.manager.activeAnimations.indexOf(this);
	if (i >= 0) {
	    this.manager.activeAnimations.splice(i,1);
	}
    }
}

class ViewManager
{
    constructor(game, uiController) {
        if (viewManager) {
            alert("ViewManager should be singleton");
        }
        viewManager = this; // singleton;
        this.slerp = true;
        this.game = game;
        this.defaultDuration = 1.5;
        this.viewNum = 0;
        this.views = {};
        this.viewNames = [];
        this.idx = 0;
        //this.bookmarksURL_ = "/Kinetics/bookmarks.json";
        this.bookmarksURL_ = "xxx";
        this.activeAnimations = [];
        this.ui = uiController;
        this.setBookmarksURL("/data/cmp_bookmarks.json");
        this.downloadBookmarks();
        //this.handleBookmarks(SAMPLE_VIEWS)
    }
    
    gotoView(name, dur)
    {
        if (dur == null)
	    dur = this.defaultDuration;
        console.log("gotoView "+name);
        if (!name) {
            this.idx++;
            name = this.viewNames[this.idx % this.viewNames.length];
        }
        console.log("gotoView "+name);
        var view = this.views[name];
        if (!view) {
	    console.log("No view named "+name);
	    return;
        }
        console.log("pos: "+view.position);
        console.log("rot: "+view.rotation);
        this.setViewNameInUI(name)
        var camera = this.game.camera;
        if (dur > 0) {
	    var pos0 = camera.position.clone();
	    var pos1 = view.position;
            var interp = new ViewInterpolator(pos0, camera.rotation.clone(),
					           view.position, view.rotation, camera);
	    var anim = new Animation(this, "goto"+name, dur, interp);
	    anim.activate();
	    return;
        }
        if (view.position) {
            //P.camera.position = view.position;
            camera.position.x = view.position.x;
            camera.position.y = view.position.y;
            camera.position.z = view.position.z;
        }
        if (view.rotation) {
            camera.rotation.x = view.rotation.x;
            camera.rotation.y = view.rotation.y;
            camera.rotation.z = view.rotation.z;
        }
        camera.updateProjectionMatrix();
    }
    
    update = function()
    {
        for (var i = this.activeAnimations.length-1; i >= 0; i--) {
	    var anim = this.activeAnimations[i];
	    anim.update();
        }
    }

    bookmarkView = function(name)
    {
        console.log("bookmarkView");
        var camera = this.game.camera;
        if (!camera) {
            console.log("Cannot get camera");
            return;
        }
        if (!name) {
            name = this.getViewNameFromUI();
	    if (!name) {
	        name = this.getNewViewName();
                this.setViewNameInUI();
            }
        }
        if (!name) {
	    console.log("*** no name");
	    return;
        }
        var pos = camera.position.clone();
        var eulerAngles = camera.rotation.clone();
        var view = {'name': name, 'position': pos, 'rotation': eulerAngles};
        this.viewNames.push(name)
        this.views[name] = view;
        console.log("bookmarkView name "+name);
        console.log("bookmarkView pos "+JSON.stringify(pos));
        console.log("bookmarkView rot "+JSON.stringify(eulerAngles));
        console.log("bookmarkView test.... "+JSON.stringify({'a': 3, 'b': {'c': 8}}));
        this.uploadBookmarks();
        //$("#viewNameSelection").append($('<option>', { value: name, text: name}));
        //    console.log("bookmarkView "+JSON.stringify(view));
    }
    
    deleteView = function(viewName)
    {
        console.log("deleteView");
        //var viewName = $("#currentViewName").val();
        console.log("viewName: "+viewName);
        if (this.views[viewName]) {
	    delete this.views[viewName];
            //$("#currentViewName").val("");
            this.uploadBookmarks();
            this.handleBookmarks(this.views);
        }
        console.log("No such view as "+viewName);
    }

    setViewNameInUI(name)
    {
        console.log("****** setViewNameInUI not implemented ... using jQuery");
        $("#currentViewName").val(name);
    }
    
    getViewNameFromUI() {
	name = $("#currentViewName").val();
        console.log("****** getViewNameFromUI not implemented correctly ... using jQuery");
        return name;
    }
    
    getNewViewName()
    {
        var name;
        do {
	    this.viewNum += 1;
	    name = "View"+this.viewNum;
        }
        while (this.views[name]);
        return name;
    }

    // untested
    uploadBookmarks()
    {
        var jstr = JSON.stringify(this.views);
        var url = this.getBookmarksURL();
        console.log("uploadBookmarks url: "+url+"  data: "+jstr);
        //url = url.replace("/", "/update/");
        url = "http://localhost:4000/update/bookmarks.json";
        console.log("uploadBookmarks to "+url);
//        jQuery.post(url, jstr, function () {
//	    console.log("Succeeded at upload")}, "json");
        $.ajax(url, {
            data: jstr,
            //data: this.views,
            //success: success,
            contentType: 'application/json',
            type: "POST",
        });
    }

    getBookmarksURL()
    {
        //TODO: maybe make smarter...
        return this.bookmarksURL_ ;
    }

    setBookmarksURL(url)
    {
        console.log("setBookmarksURL "+url);
        this.bookmarksURL_ = url;
    }

    setBookmarksName(name)
    {
        console.log("setBookmarksName "+name);
        var url = "/Kinetics/"+name+"Bookmarks.json";
        this.setBookmarksURL(url);
    }
    
    downloadBookmarks = function()
    {
        var url = this.getBookmarksURL();
        console.log("downloadBookmarks "+url);
        var inst = this;
        $.getJSON(url, obj => inst.handleBookmarks(obj))
    }

    handleBookmarks(obj)
    {
        console.log("handleBookmarks");
        console.log("views: "+JSON.stringify(obj));
        this.views = obj;
        this.viewNames = Object.keys(this.views);
        this.viewNames.sort();
        /*
        $("#viewNameSelection").html("");
        //for (var name in ANIM.views) {
        for (var i=0; i<ANIM.viewNames.length; i++) {
	    var name = ANIM.viewNames[i];
            console.log("name: "+name+" view: "+JSON.stringify(ANIM.views[name]));
            //ANIM.viewNames.push(name);
            $("#viewNameSelection").append($('<option>', { value: name, text: name}));
        }
        */
        var inst = this;
        this.viewNames.forEach(viewName => {
            console.log("view: "+viewName+" ui: "+inst.ui);
            inst.ui.registerView(viewName, () => inst.gotoView(viewName));
        });
        if (this.views["Home"]) {
	    console.log("Going to Home after loading bookmarks");
	    this.gotoView("Home", 1);
        }
    }
    
}

export {ViewManager};
