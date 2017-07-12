import ReactDOM from 'react-dom';
import React from 'react';

import TweakUI from '../lib/components/TweakUI';
import TimelineSlider from '../lib/components/TimelineSlider';
import MenuButton from '../lib/components/MenuButton';

const duration = 32*60;

export default class UIController {

    constructor(options) {
        this.options = options || {};
        this.game = this.options.game;
        this.playerControl = this.options.playerControl;
        this.root = document.createElement('div');
        document.body.appendChild(this.root);
        ReactDOM.render(
            <TweakUI>
                <TimelineSlider
                    ref={(slider) => this.slider = slider}
                    onSliderChange={this.onSliderChange.bind(this)}
                    onPlayerButtonClick={this.onPlayerButtonClick.bind(this)}
                />
            </TweakUI>,
            this.root
        );
    }

    onSliderChange(e, newValue) {
        console.log('slider: ' + newValue);

        var t = newValue*duration;
        if (this.playerControl)
            this.playerControl.setPlayTime(t);
    }

    onPlayerButtonClick(btnName) {
        console.log('btn: ' + btnName);
        switch(btnName) {
        case "stop":
            break;
        case "playpause":
            break;
        }
    }

    dispose() {
        document.body.removeChild(this.root);
    }

    update() {
    }

    resize(w, h) {

    }

    get visible() {
        return this._visible;
    }

    set visible(val) {
        this._visible = val;
        this.root.style.display = val ? 'block' : 'none';
    }
}
