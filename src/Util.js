
import * as THREE from 'three';
import { sprintf } from "sprintf-js";
var toDeg = THREE.Math.radToDeg;

function getClockTime() {
    return new Date().getTime()/1000.0;
}

// http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function getJSON(url, handler)
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
	}
    });
}

function toJSON(obj)
{
    return JSON.stringify(obj, null, 3);
}

function getCameraParams(cam)
{
    console.log("LookControls.getCameraParams");
    cam = cam || window.game.camera;
    var wv = cam.getWorldDirection();
    //console.log("wv: "+JSON.stringify(wv));
    var s = new THREE.Spherical();
    s.setFromVector3(wv);
    console.log(sprintf("cam phi: %6.2f theta: %6.2f", toDeg(s.phi), toDeg(s.theta)));
    return {phi: s.phi, theta: s.theta};
}

export {getJSON, getCameraParams};
