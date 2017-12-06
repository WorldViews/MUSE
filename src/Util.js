
import * as THREE from 'three';
import { sprintf } from "sprintf-js";
import {MUSE} from './MUSE';
var toDeg = THREE.Math.radToDeg;
import _ from 'lodash';

if (!window.MUSE)
    window.MUSE = MUSE;

window.MUSE.returnValue = function(val)
{
    console.log("MUSE.returnValue "+val);
    window.MUSE.RETURN = val;
}

// This can be used to ensure that some other scripts are loaded before
// a function is called and returns a value.
window.MUSE.require = function(deps, done) {
    if (typeof deps == "string") {
        deps = [deps];
    }
    var promises = deps.map(url => $.getScript(url));
    window.PROMISES = promises;
    MUSE.RETURN_PROMISE = Promise.all(promises).then(() => {
        console.log("***************>>>>>>>>>>>>>>>>>>> Loaded all of "+deps);
        done();
        console.log("got value "+MUSE.RETURN);
        //MUSE.RETURN = val;
    });
}

// This is ridiculous to not have a standard language feature for this by now
export function cloneObject(obj) { return Object.assign({}, obj); }
export function values(obj) { return Object.keys(obj).map( k => obj[k]) };

// called with string or obj containing type.
// if string converted to obj with that string as type.
function getTypedObj(obj)
{
    if (typeof obj == "string") {
        return {'type': obj};
    }
    return obj;
}

// given scalar scale or vector scale, return vector scale
export function scaleVec(s)
{
    if (typeof s == "number")
        return THREE.Vector3(s,s,s);
    return s;
}
// take a string, a float (seconds since epoch) or date
// and return date.
export function toDate(datetime) {
//    const [day, month, year] = dateStr.split("-");
//    return new Date(year, month - 1, day);
    if (datetime instanceof Date)
        return datetime;
    if (datetime == 'now')
        return new Date();
    if (typeof datetime == 'string') {
        var d = Date.parse(datetime);
        return new Date(d);
    }
    return new Date(datetime*1000);
}

export function toTime(datetime) {
//    const [day, month, year] = dateStr.split("-");
//    return new Date(year, month - 1, day);
    if (datetime instanceof Date)
        return datetime.getTime()/1000.0;
    if (datetime == 'now')
        return getClockTime();
    if (typeof datetime == 'string') {
        var d = Date.parse(datetime);
        return new Date(d).getTime()/1000.0;
    }
    return datetime;
}

function toHHMMSS(t)
{
    var sec_num = parseInt(t, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);
    if (hours > 0) {
        return sprintf("%02d:%02d:%02d", hours, minutes, seconds);
    } else {
        return sprintf("%02d:%02d", minutes, seconds);
    }
}

export function formatDatetime(dt)
{
    if (!(dt instanceof Date))
        dt = new Date(dt*1000);
    return sprintf("%s/%s/%s %02d:%02d:%02d",
                    dt.getMonth()+1, dt.getDate(), dt.getFullYear(),
                    dt.getHours(), dt.getMinutes(), dt.getSeconds());
}

export function getClockTime() {
    return new Date().getTime()/1000.0;
}

export function reportError(str) {
    console.log("Error: "+str);
    alert(str);
}

export function reportWarning(str) {
    console.log("Error: "+str);
    alert(str);
}

// http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
export function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

/*
This gets a JavaScript Object from a script.  It can be more
convenient for human authoring, since it can support comments
and scripting.  The script should return a JavaScript Object
by calling the function MUSE.returnValue(obj);
*/
//TODO: make this "attomic" by getting the text of the script
// and then adding a script tag.
export function getJSONFromScript(path, handler, err)
{
    window.MUSE.RETURN = null;
    window.MUSE.RETURN_PROMISE = null;
    $.getScript(path)
        .done(function(script, textStatus) {
            if (window.MUSE.RETURN_PROMISE) {
                window.MUSE.RETURN_PROMISE.then(() => {
                    console.log("*************** USING RETURN PROMISE ************");
                    console.log("calling handler with "+window.MUSE.RETURN)
                    handler(window.MUSE.RETURN)
                });
                return;
            }
            if (!window.MUSE.RETURN) {
                reportError("No RETURN specified in script "+path);
            }
            handler(window.MUSE.RETURN);
        })
        .fail(function(jqxhr, settings, ex) {
            console.log("error: ", ex);
            alert("Cannot load "+path);
        });
}

export function getJSON(url, handler)
{
    console.log("Util.getJSON: "+url);
    $.ajax({
        url: url,
        dataType: 'text',
        success: function(str) {
            var data;
            try {
                data = JSON.parse(str);
            }
            catch (err) {
                console.log("err: "+err);
                alert("Error in json for: "+url+"\n"+err);
                return;
            }
            handler(data);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            reportError("Failed to get JSON for "+url);
        }
    });
}

export function toJSON(obj)
{
    return JSON.stringify(obj, null, 3);
}

export function getCameraParams(cam)
{
    console.log("LookControls.getCameraParams");
    cam = cam || window.game.camera;
    var wv = cam.getWorldDirection();
    //console.log("wv: "+JSON.stringify(wv));
    var s = new THREE.Spherical();
    s.setFromVector3(wv);
    console.log(sprintf("cam phi: %6.2f theta: %6.2f", toDeg(s.phi), toDeg(s.theta)));
    //return {phi: s.phi, theta: s.theta};
    return s;
}

export function randomIntFromInterval(min,max)
{
    return Math.floor(randomFromInterval(min,max));
}

export function randomFromInterval(min,max)
{
    return Math.random()*(max-min+1)+min;
}

var VIDEO_EXTENSIONS = [".mp4", ".webm"];

export function isVideoURL(url) {
    var URL = url.toUpperCase();
    var type = false;
    VIDEO_EXTENSIONS.forEach(ext => {
        if (URL.endsWith(ext.toUpperCase()))
            type = true;
    });
    return type;
}

export function isPickable(obj) {
    while (obj) {
        if (obj.userData && obj.userData.museIgnorePicking)
            return false;
        obj = obj.parent;
    }
    return true;
}

// event is the mouse or key event that caused this.  May be null
export function dispatchMuseEvent(evType, obj, event) {
    while (obj) {
        var userData = obj.userData;
        if (userData && userData[evType]) {
            report("******** BINGO Click!!!! *******");
            userData[evType](obj, event);
            break;
        }
        obj = obj.parent;
    }
    return obj;
}

export var toRad = THREE.Math.degToRad;
export var toDeg = THREE.Math.radToDeg;

// Return a position in the x-z plane a given distance
// and from origin and given angle.
function radialPosition(angle, r, h) {
    r = r || 7.4;
    if (h == undefined)
        h = 1.0;
    var x = -r*Math.cos(toRad(angle));
    var z = -r*Math.sin(toRad(angle));
    return [x,h,z];
}

var Util =
{
    cloneObject,
    getJSON,
    getJSONFromScript,
    getClockTime,
    getCameraParams,
    getParameterByName,
    getTypedObj,
    randomIntFromInterval,
    randomFromInterval,
    scaleVec,
    toTime,
    toDate,
    toDeg,
    toRad,
    toHHMMSS,
    radialPosition,
    reportError,
    reportWarning,
    formatDatetime,
    values,
    isVideoURL,
    dispatchMuseEvent,
    isPickable
};

Util._ = _;
window.MUSE.Util = Util;
window.Util = Util;

export default Util;
