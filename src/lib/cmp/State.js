import _ from 'lodash';

var stateDefault = {
    labelSize: 60,
    gridLineWidth: 3,
    chartGridLineWidth: 3,
    envelopeLineWidth: 3,
    refLineWidth: 3,
    co2LineWidth: 20,
    tempLineWidth: 60,
    balanceLineWidth: 30,
    hideLegend: false,
    showPanel: true,
    showGraphics: true,
    showVideo: false,

    numData: 451,
    Year: 0,
    SandYear: 0,
    yearPerMinute: 25,

    colors: {
        x: '#FF4136',
        y: '#2ECC40',
        z: '#0074D9',
        bg: '#303025',
        // bg: '#FFFFFF'
    },

    capturer: {
        name: 'climate-trend',
        width: 3840,
        height: 2160,
        framerate: 30,
        format: 'png',
        timeLimit: 1200,
        startTime: 0,
        autoSaveTime: 60,
        display: true,
        reset: true
    }
}

var state = _.clone(stateDefault, true);
export default state;

export const setState = (newState) => {
    _.merge(state, newState)
}

export const resetState = (newState) => {
    _.merge(state, stateDefault)
}
