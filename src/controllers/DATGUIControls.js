import _ from 'lodash';
import {Game} from 'core/Game';

import {UIControls} from './UIControls';
import datGUIVR from 'datguivr';
import * as THREE from 'three';
import * as Util from 'core/Util';


export default class DATGUIControls extends UIControls {
    constructor(game, options) {
        super(game, options);
        this.controls = {};
        this.models = {
            'Data Visualization': 'cmp',
            'Virtual Earth': 'vEarth',
            'Dancer': 'dancer',
            'BMW': 'bmw',
            'none': 'none'
        };
        this.folders = {};
        this.status = '';

        this.ui = datGUIVR.create('Settings');
        this.ui.visible = false;

        // set playtime controls
        this.time = 0;
        game.state.set('time', 0);
        game.state.set('year', 0);
        game.state.set('narrative', '');

        this.controls.playPause = this.ui.add(this, 'togglePlayPause').name('Pause');
        this.ui.add(this, 'next').name('Next');
        this.ui.add(this, 'prev').name('Prev');

        this.program = game.getProgram();
        this.textFields = [];
        this.program.channels.forEach(channel => {
            var defaultValue;
            var labelName;
            var channelName;
            var minValue;
            var maxValue;
            if (typeof channel === 'string') {
                defaultValue = '';
                labelName = channel;
                channelName = channel;
            } else if (typeof channel === 'object') {
                defaultValue = channel.default === undefined ? '' : channel.default;
                labelName = channel.label || channel.name;
                channelName = channel.name;
                minValue = channel.min;
                maxValue = channel.max;
            }

            let param = {channel: defaultValue}
            let ctrl = this.ui.add(param, 'channel').listen();
            ctrl.name(labelName);
            this.controls[channelName] = ctrl;
            game.state.on(channelName, (v) => {
                param.channel = v;
            });
            if (minValue)
                ctrl.min(minValue);
            if (maxValue)
                ctrl.max(maxValue);
        });

        if (this.controls.time) {
            this.controls.time.onChange(this.onSliderChange.bind(this));
        }

        // add stage
        var stage = this.program.stages[0];
        var models = {};
        _.forEach(stage.models, (v, k) => {
            models[v] = k;
        });
        let param = { model: 'none' };
        this.controls.models = this.ui.add(param, 'model', models).name(stage.name).onChange(this.selectModel.bind(this));
        this.models = models;

        // scripts
        this.folders.scripts = datGUIVR.create('Scripts');
        this.ui.addFolder(this.folders.scripts);

        // views
        this.folders.views = datGUIVR.create('Views');
        this.ui.addFolder(this.folders.views);
        datGUIVR.enableMouse(game.camera, game.renderer);

        // add gui to scene
        // game.scene.add(this.ui);

        // create toggle button
        let uiDiv = $("#uiDiv");
        let toggle = uiDiv.append($("<button id='uiToggle'>&nbsp;</button>"));
        toggle.on('click', ()=> this.toggleUI());
    }

    setStatus(status) {
        //this.controls.status.name(status);
        this.status = status;
    }

    registerModel(name, callback) {
        this.models[name] = callback;
        this.controls.models.updateView();
    }

    removeModel(name) {
    }

    selectModel(name) {
        for (var key in this.models) {
            let modelName = this.models[key];
            console.log(" name: "+modelName);
            if (game.models[modelName]) {
                game.models[modelName].visible = false;
            }
            if (game.controllers[modelName]) {
                game.controllers[modelName].visible = false;
            }
        }
        this.selectedModel = name;
        if (game.models[name]) {
            game.models[name].visible = true;
        }
        if (game.controllers[name]) {
            game.controllers[name].visible = true;
        }
    }

    registerScript(name, callback) {
        this.folders.scripts.add({run:callback}, 'run').name(name);
    }

    removeScript(name) {
    }

    registerView(name, callback) {
        this.folders.views.add({view:callback}, 'view').name(name);
    }

    update() {
    }

    setTimeSlider(t) {
        // if (this.controls.time) {
            this.controls.time.max(game.program.duration);
        // }
    }

    toggleUI(obj, offset) {
        if (this.ui.visible) {
            this.ui.visible = false;
            game.scene.remove(this.ui);
        } else {
            this.ui.visible = true;
            game.scene.add(this.ui);

            obj = obj || game.camera;
            offset = offset || new THREE.Vector3(-0.5, 0.5, -2);
            // position the controls in front of the camera
            let pos = obj.localToWorld(offset);
            let rot = obj.rotation;
            this.ui.position.set(pos.x, pos.y, pos.z);
            this.ui.rotation.set(rot.x, rot.y, rot.z);
        }
    }

    togglePlayPause() {
        let program = game.program;
        if (program.isPlaying()) {
            program.pause();
            this.controls.playPause.name('Pause');
        } else {
            program.play();
            this.controls.playPause.name('Play');
        }
    }

    next() {
        let program = game.program;
        program.nextState();
    }

    prev() {
        let program = game.program;
        program.prevState();
    }

    onSliderChange(t) {
        game.program.setPlayTime(t, true);
    }
}

Game.registerNodeType("DATGUIControls", (game, options) => {
    if (!options.name)
        options.name = "ui";
    return game.registerController("ui", new DATGUIControls(game, options));
});
