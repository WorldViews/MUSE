import {Math} from 'three';

/*
export let R = 1.0;
export let TH_LEN = Math.degToRad(140);
export let TH_MIN = Math.degToRad(180) - TH_LEN / 2;
export let PH_MIN = Math.degToRad(31);
export let PH_LEN = Math.degToRad(49);
*/

// moved the degToRad into the function reading this
// to improve readability of the spec.
export let screen1 = {
    name: "mainScreen",
    radius: 8.6,
    phiStart: 32,
    phiLength: 49,
    thetaStart: 110,
    thetaLength: 140
};

