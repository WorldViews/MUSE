
import {IMAGINARIUM_VENUE} from "./venues/imaginarium";
import {SATS_PROGRAM} from "./programs/sats";

//window.CFG = {
var CFG = {
    IMAGINARIUM_VENUE,
    SATS_PROGRAM,
}

function onStart(game)
{
    return;
    var t = game.program.getPlayTime();
    var t = 1234284990.0;
    var p = new THREE.Vector3(-1698.7030173737744, 1503.0165902867889, 6777.4862190372805);
    p.multiplyScalar(satTracks.radiusVEarth/satTracks.radiusEarthKm);
    satTracks.addEvent(t, p.x,p.z,-p.y, 3);
}

var CONFIG = {
    onStart: onStart,
    cameraControls: 'MultiControls',
    webUI: 'JQControls',
    program: CFG.SATS_PROGRAM,
    venue: CFG.IMAGINARIUM_VENUE,
    //specs: [VEARTH]
};

MUSE.returnValue(CONFIG);

export default CFG;
