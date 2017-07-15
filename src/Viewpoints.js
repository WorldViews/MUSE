
import * as THREE from 'three';
import {Mathx} from 'three';

var SAMPLE_VIEWS =
{
   "Blue": {
      "position": {
         "y": 451.27387359321705, 
         "x": 1.0463783336096089, 
         "z": 0.058918704294533546
      }, 
      "rotation": {
         "_order": "XYZ", 
         "_z": -0.5341352928827048, 
         "_y": -5.110230176797126e-07, 
         "_x": -1.5707954474923493
      }, 
      "name": "Blue"
   }, 
   "Above": {
      "position": {
         "y": 1963.0600416757122, 
         "x": 1.6127622214875328, 
         "z": 1.1341526937232163
      }, 
      "rotation": {
         "_order": "XYZ", 
         "_z": -0.5130559587275135, 
         "_y": -5.07481217937333e-07, 
         "_x": -1.5707954368346062
      }, 
      "name": "Above"
   }, 
   "Above SF": {
      "position": {
         "y": 91900.85359569384, 
         "x": -72222.76654703495, 
         "z": 113266.74454112611
      }, 
      "rotation": {
         "_order": "XYZ", 
         "_z": -0.5002767770211151, 
         "_y": -0.5802368114628638, 
         "_x": -0.783973249225534
      }, 
      "name": "Above SF"
   }, 
   "Purple": {
      "position": {
         "y": 489.58371532762976, 
         "x": 1.046358756387494, 
         "z": 0.058951802690731546
      }, 
      "rotation": {
         "_order": "XYZ", 
         "_z": -0.5341352928827048, 
         "_y": -5.110230176797126e-07, 
         "_x": -1.5707954474923493
      }, 
      "name": "Purple"
   }, 
   "Hurricane": {
      "position": {
         "y": 22517.804250706602, 
         "x": 0.0014613344294209104, 
         "z": 0.022474149397589665
      }, 
      "rotation": {
         "_order": "XYZ", 
         "_z": 0.06494248513944514, 
         "_y": 6.489680970389604e-08, 
         "_x": -1.570795321216286
      }, 
      "name": "Hurricane"
   }, 
   "View10": {
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
      "name": "View10"
   }, 
   "View11": {
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
      "name": "View11"
   }, 
   "rainbow": {
      "position": {
         "y": 626.666405511323, 
         "x": -29.360717499734648, 
         "z": 254.03514266059977
      }, 
      "rotation": {
         "_order": "XYZ", 
         "_z": -0.10766276533488806, 
         "_y": -0.09898417583941707, 
         "_x": -0.8301142057155413
      }, 
      "name": "rainbow"
   }, 
   "Chakra 6": {
      "position": {
         "y": 421.63580872285513, 
         "x": 53.551836785627316, 
         "z": 139.69347997178124
      }, 
      "rotation": {
         "_order": "XYZ", 
         "_z": 0.051220457719366314, 
         "_y": 0.303302387476376, 
         "_x": -0.16998684286099064
      }, 
      "name": "Chakra 6"
   }, 
   "Chakra 7": {
      "position": {
         "y": 478.9085679722015, 
         "x": 51.56718616572651, 
         "z": 130.49319193219944
      }, 
      "rotation": {
         "_order": "XYZ", 
         "_z": 0.051220457719366314, 
         "_y": 0.303302387476376, 
         "_x": -0.16998684286099064
      }, 
      "name": "Chakra 7"
   }, 
   "Chakra 4": {
      "position": {
         "y": 311.3700110643736, 
         "x": 56.70141640376591, 
         "z": 157.61976103677327
      }, 
      "rotation": {
         "_order": "XYZ", 
         "_z": 0.051220457719366314, 
         "_y": 0.303302387476376, 
         "_x": -0.16998684286099064
      }, 
      "name": "Chakra 4"
   }, 
   "Chakra 5": {
      "position": {
         "y": 360.08332609359115, 
         "x": 53.31706016442298, 
         "z": 150.3330995498241
      }, 
      "rotation": {
         "_order": "XYZ", 
         "_z": 0.051220457719366314, 
         "_y": 0.303302387476376, 
         "_x": -0.16998684286099064
      }, 
      "name": "Chakra 5"
   }, 
   "Chakra 1": {
      "position": {
         "y": 321.1178965662636, 
         "x": 101.09391917040881, 
         "z": 437.4085660845747
      }, 
      "rotation": {
         "_order": "XYZ", 
         "_z": 0.08369755921068968, 
         "_y": 0.19288211803149222, 
         "_x": -0.4125413288961756
      }, 
      "name": "Chakra 1"
   }, 
   "PhotoHead": {
      "position": {
         "y": 1027.729923027237, 
         "x": 1857.0910636807603, 
         "z": 1074.2477136110886
      }, 
      "rotation": {
         "_order": "XYZ", 
         "_z": 0.35858030855579814, 
         "_y": 1.0090044249297367, 
         "_x": -0.41639407169308434
      }, 
      "name": "PhotoHead"
   }, 
   "lemons": {
      "position": {
         "y": 252.6589821698655, 
         "x": 2.9009491366726934, 
         "z": 8.296362267155587
      }, 
      "rotation": {
         "_order": "XYZ", 
         "_z": 0.010914960910369503, 
         "_y": 0.1351269278911315, 
         "_x": -0.08421680778398387
      }, 
      "name": "lemons"
   }, 
   "View4": {
      "position": {
         "y": 2896.813986869436, 
         "x": 48.31256987417105, 
         "z": -11.116977555348598
      }, 
      "rotation": {
         "_order": "XYZ", 
         "_z": 1.1113239670543025, 
         "_y": 8.962861670626188e-07, 
         "_x": -1.5707958657486127
      }, 
      "name": "View4"
   }, 
   "View7": {
      "position": {
         "y": 435.38994630932547, 
         "x": 154.3903286592831, 
         "z": 326.0875324072328
      }, 
      "rotation": {
         "_order": "XYZ", 
         "_z": 0.19731208768591255, 
         "_y": 0.3511800037037321, 
         "_x": -0.5264310303053024
      }, 
      "name": "View7"
   }, 
   "View1": {
      "position": {
         "y": 50.00000000000012, 
         "x": 0, 
         "z": 1500
      }, 
      "rotation": {
         "_order": "XYZ", 
         "_z": 0, 
         "_y": 0, 
         "_x": -0.03332099736753617
      }, 
      "name": "View1"
   }, 
   "View3": {
      "position": {
         "y": 1027.8104153206352, 
         "x": 1855.623669339618, 
         "z": 1074.199679428479
      }, 
      "rotation": {
         "_order": "XYZ", 
         "_z": 0.3582457702538636, 
         "_y": 1.0080140664111592, 
         "_x": -0.4167442382799762
      }, 
      "name": "View3"
   }, 
   "View9": {
      "position": {
         "y": 277.9028588000844, 
         "x": -5.634474264857772, 
         "z": 9.405693592524699
      }, 
      "rotation": {
         "_order": "XYZ", 
         "_z": 0.011873869626116694, 
         "_y": 0.13649429834707483, 
         "_x": -0.08704598014289926
      }, 
      "name": "View9"
   }, 
   "InnerVortex": {
      "position": {
         "y": 512.4421053520523, 
         "x": 1.7266969411611681, 
         "z": 0.32620929691099976
      }, 
      "rotation": {
         "_order": "XYZ", 
         "_z": 2.753429693582428, 
         "_y": -0.9674175666768314, 
         "_x": 2.6974855520673158
      }, 
      "name": "InnerVortex"
   }, 
   "Home": {
      "position": {
         "y": 50.00000000000012, 
         "x": 0, 
         "z": 1500
      }, 
      "rotation": {
         "_order": "XYZ", 
         "_z": 0, 
         "_y": 0, 
         "_x": -0.03332099736753617
      }, 
      "name": "Home"
   }
}

// THis version uses linear interpolation or rotations, which is not
// really correct
class ViewInterpolator {
    constructor(p0, r0, p1, r1, camera)
    {
        //console.log("ViewInterpolator p0:"+JSON.stringify(p0)+" p1: "+JSON.stringify(p1));
        //console.log("ViewInterpolator r0:"+JSON.stringify(r0)+" r1: "+JSON.stringify(r1));
        this.r0 = r0;
        this.r1 = r1;
        this.p0 = p0;
        this.q0 = new THREE.Quaternion().setFromEuler(new THREE.Euler().setFromVector3(r0));
        this.p1 = p1;
        this.q1 = new THREE.Quaternion().setFromEuler(new THREE.Euler().setFromVector3(r1));
        this.p = new THREE.Vector3(0,0,0);
        this.q = new THREE.Quaternion();
        //console.log("ViewInterpolator q0:"+JSON.stringify(this.q0)+" q1: "+JSON.stringify(this.q1));
        this.camera = camera;
        this.range = 1.0;
        this.targetP;
        this.targetR;
    }
    
    // This seems to have a problem that some quaternions are bad
    setValSLERP(s) {
	console.log("setVal "+s);
	var f = s/this.range;
        this.p.lerpVectors(this.p0, this.p1, f);
	console.log("p: "+JSON.stringify(this.p));
        var camera = this.camera;
	camera.position.x = this.p.x;
	camera.position.y = this.p.y;
	camera.position.z = this.p.z;
	THREE.Quaternion.slerp(this.q0, this.q1, this.q, f);
	console.log("q: "+JSON.stringify(this.q));
	camera.rotation.setFromQuaternion(this.q)
    }

    setVal(s) {
	//console.log("setVal "+s);
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
    

class ViewpointManager
{
    constructor(game, uiController) {
        this.game = game;
        this.viewNum = 0;
        this.views = {};
        this.viewNames = [];
        this.idx = 0;
        this.bookmarksURL_ = "/Kinetics/bookmarks.json";
        this.activeAnimations = [];
        this.ui = uiController;
        this.handleBookmarks(SAMPLE_VIEWS)
    }
    
    gotoView(name, dur)
    {
        if (dur == null)
	    dur = 3;
        console.log("gotoView "+name);
        if (!name) {
            this.idx++;
            name = this.viewNames[this.idx % this.viewNames.length];
        }
        console.log("gotoView "+name);
        var view = this.views[name];
        if (!view) {
	    console.log("No viewpoint named "+name);
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
        if (!P.camera) {
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
        var camera = this.game.camera;
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
        //$("#currentViewName").val(name);
        console.log("****** setViewNameInUI not really implemented");
    }
    
    getViewNameFromUI() {
	//name = $("#currentViewName").val();
        console.log("****** getViewNameFromUI not really implemented");
        return null;
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
        url = url.replace("/", "/update/");
        console.log("uploadBookmarks to "+url);
        jQuery.post(url, jstr, function () {
	    console.log("Succeeded at upload")}, "json");
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
        $.getJSON(url, this.handleBookmarks)
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
            this.ui.registerViewpoint(viewName, () => inst.gotoView(viewName));
        });
        if (this.views["Home"]) {
	    console.log("Going to Home after loading bookmarks");
	    this.gotoView("Home", 1);
        }
    }
    
}

export {ViewpointManager};
