import ReactDOM from 'react-dom';
import React from 'react';
import _ from 'lodash';

import TweakUI from '../lib/components/TweakUI';
import TimelineSlider from '../lib/components/TimelineSlider';
import MenuButton from '../lib/components/MenuButton';
import CallbackList from '../lib/components/CallbackList';

import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

const duration = 32*60;

export default class UIController {

    constructor(options) {
        this.options = options || {};
        this.game = this.options.game;
        this.playerControl = this.options.playerControl;
        this.root = document.createElement('div');
        this.callbacks = {};
        this.models = ['vEarth', 'dancer', 'cmp', 'bmw', 'portal'];

        this.registerCallback('Earth', () => { this.selectModel('vEarth') });
        this.registerCallback('Dancer', () => { this.selectModel('dancer') });
        this.registerCallback('CMP', () => { this.selectModel('cmp') });
        this.registerCallback('BMW', () => { this.selectModel('bmw') });
        //this.registerCallback('Portal', () => { this.selectModel('portal') });
        this.selectModel('vEarth');

        document.body.appendChild(this.root);
        ReactDOM.render(
            <TweakUI>
                <TimelineSlider
                    ref={(slider) => this.slider = slider}
                    onSliderChange={this.onSliderChange.bind(this)}
                    onPlayerButtonClick={this.onPlayerButtonClick.bind(this)}
                />
                <CallbackList
                    callbacks={this.callbacks}
                    onChange={this.onCallback.bind(this)}
                />
            </TweakUI>,
            this.root
        );
    }

    registerCallback(name, callback) {
        this.callbacks[name] = {
            name: name,
            callback: callback
        };
    }

    removeCallback(name) {
        delete this.callbacks[name];
    }

    selectModel(name) {
        _.map(this.models, (n) => {
            if (game.models[n]) {
                game.models[n].visible = false;
            }
            if (game.controllers[n]) {
                game.controllers[n].visible = false;
            }
        });

        this.selectedModel = name;
        if (game.models[name]) {
            game.models[name].visible = true;
        }
        if (game.controllers[name]) {
            game.controllers[name].visible = true;
        }
    }

    onCallback(name) {
        let cb = this.callbacks[name];
        if (cb && cb.callback)
            cb.callback();
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
