import _ from 'lodash';
import {Game} from '../Game';

import {UIControls} from './UIControls';
import datGUIVR from 'datguivr';
import * as THREE from 'three';
import * as Util from '../Util';


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

        this.controls.time = this.ui.add(game.state.state, 'time').listen().onChange(this.onSliderChange.bind(this));
        this.ui.add(game.state.state, 'year').min(1850).max(2300).listen();
        this.controls.status = this.ui.add(this, 'status').listen();
        this.controls.narrative = this.ui.add(game.state.state, 'narrative').listen();
        this.controls.playPause = this.ui.add(this, 'togglePlayPause').name('Pause');
        this.ui.add(this, 'next');
        this.ui.add(this, 'prev');

        // this.controls.models = this.ui.addDropdown(this.models).name('Main Stage').onChange(this.selectModel.bind(this));

        this.folders.scripts = datGUIVR.create('Scripts');
        this.ui.addFolder(this.folders.scripts);

        this.folders.views = datGUIVR.create('Views');
        this.ui.addFolder(this.folders.views);
        datGUIVR.enableMouse(game.camera, game.renderer);

        game.scene.add(this.ui);

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
        this.controls.time.max(game.program.duration);
    }

    toggleUI(obj, offset) {
        if (this.ui.visible) {
            this.ui.visible = false;
        } else {
            this.ui.visible = true;

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
}

Game.registerNodeType("DATGUIControls", (game, options) => {
    if (!options.name)
        options.name = "ui";
    return game.registerController("ui", new DATGUIControls(game, options));
});
