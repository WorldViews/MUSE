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

export var labelsScreen = {
    name: "labelsScreen",
    radius: 8.6,
    phiStart: 32,
    phiLength: 49,
    thetaStart: -90,
    thetaLength: 60
}

export let screen2 = {
    radius: 1.0,
    phiStart: 10,
    phiLength: 80,
    thetaStart: 40,
    thetaLength: 160,
    position: [0,3,0]
};

export let screen3 = {
    name: "bubbleScreen1",
    radius: 0.5,
    //    phiStart: 0,
    //    phiLength: 90,
    position: [3,3,0]
};

export let marquee = {
    name: "marquee",
    radius: 7,
    phiStart: -25,
    phiLength: 50,
    thetaStart: 65,
    thetaLength: 20,
};
