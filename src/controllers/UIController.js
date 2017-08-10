import ReactDOM from 'react-dom';
import React from 'react';
import _ from 'lodash';

import TweakUI from '../lib/components/TweakUI';
import TimelineSlider from '../lib/components/TimelineSlider';
import MenuButton from '../lib/components/MenuButton';
import CallbackList from '../lib/components/CallbackList';
import ScriptsList from '../lib/components/ScriptsList';
import ViewTool from '../lib/components/ViewTool';
import JSONEditor from '../lib/components/JSONEditor';
import State from '../lib/cmp/State';
import { setState, resetState } from '../lib/cmp/State';

import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

const duration = 32*60;

export default class UIController {

    constructor(options) {
        this.options = options || {};
        this.game = this.options.game;
        this.playerControl = this.options.playerControl;
        this.root = document.createElement('div');
        this.models = ['vEarth', 'dancer', 'cmp', 'bmw', 'portal'];
        this.modelCallbacks = {};
        this.scriptCallbacks = {};
        this.viewCallbacks = {};

        this.registerModel('Earth', () => { this.selectModel('vEarth') });
        this.registerModel('Dancer', () => { this.selectModel('dancer') });
        this.registerModel('Data Viz', () => { this.selectModel('cmp') });
        this.registerModel('BMW', () => { this.selectModel('bmw') });
        this.registerModel('None', () => { this.selectModel(null) });
        //this.registerCallback('Portal', () => { this.selectModel('portal') });
        this.selectModel('vEarth');

        document.body.appendChild(this.root);
        ReactDOM.render(
            <div>
                <div ref={(el)=>this.status = el}
                    style={{color:'white',position:'absolute','top':0, 'left':0, zIndex:1000}}>...
                </div>
                <TweakUI>
                    <TimelineSlider
                        ref={(slider) => this.slider = slider}
                        onSliderChange={this.onSliderChange.bind(this)}
                        onPlayerButtonClick={this.onPlayerButtonClick.bind(this)}
                    />
                    <div className="" style={{width:'100px'}}>
                        <CallbackList
                            callbacks={this.modelCallbacks}
                            onChange={this.onModelCallback.bind(this)}
                        />
                        <p/>
                        <ScriptsList
                            callbacks={this.scriptCallbacks}
                            onChange={this.onScriptCallback.bind(this)}
                        />
                        <p/>
                        <ViewTool
                            callbacks={this.viewCallbacks}
                            onChange={this.onViewCallback.bind(this)}
                        />
                    </div>
                </TweakUI>
            </div>,
            this.root
        );
    }

    setStatus(statStr) {
        this.status.innerHTML = statStr;
    }

    // took this out for now.  it should be something that comes
    // up when invoked, not normally visible.
    //      <JSONEditor
    //           onChange={this.onStateChange.bind(this)}
    //           onReset={this.onStateReset.bind(this)}
    //           state={State}/>

    registerModel(name, callback) {
        this.modelCallbacks[name] = {
            name: name,
            callback: callback
        };
    }

    removeModel(name) {
        delete this.modelCallbacks[name];
    }

    onModelCallback(name) {
        let cb = this.modelCallbacks[name];
        if (cb && cb.callback)
            cb.callback();
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


    onStateChange(state) {
        setState(state);
        this.resetCMP();
    }

    onStateReset() {
        resetState();
        this.resetCMP();
    }

    resetCMP() {
        // reset cmp
        let self = this;
        clearTimeout(self.changeTimeout);
        self.changeTimeout = setTimeout(() => {
            game.controllers.cmp.reset();
            self.changeTimeout = null;
        }, 2000);
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

    /******************************************************/
    // Scripts

    registerScript(name, callback) {
        this.scriptCallbacks[name] = {
            name: name,
            callback: callback
        };
    }

    removeScript(name) {
        delete this.scriptCallbacks[name];
    }

    onScriptCallback(name) {
        let cb = this.scriptCallbacks[name];
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

    /**************************************************************/
    // Views
    registerView(name, callback) {
        this.viewCallbacks[name] = {
            name: name,
            callback: callback
        };
    }

    onViewCallback(name) {
        let cb = this.viewCallbacks[name];
        if (cb && cb.callback)
            cb.callback();
    }

    onMarkView(viewName) {
        console.log('viewName: ' + viewName);
    }

}
