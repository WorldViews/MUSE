
import _ from 'lodash';
import {Game} from '../Game';

import {UIControls} from './UIControls';

const duration = 32*60;

class JQControls extends UIControls {
    constructor(game, options) {
        super(game, options);
        this._visible = false;
        this.options = options || {};
        //this.playerControl = this.options.playerControl;
        this.playerControl = this.game.getProgram();
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
        this.selectModel('vEarth');

        var inst = this;
        $(document).ready( e => inst.setupElements());
        game.events.addEventListener('valueChange', e => inst.onValueChange(e));
    }

    setupElements() {
        this.textFields = ["time", "year", "narrative"];
        var inst = this;
        var uiDiv = $("#uiDiv");
        uiDiv.append("<button id='uiToggle'>&nbsp;</button>");
        uiDiv.append("<div id='uiPanel'></div>");
        var ui = $("#uiPanel");
        this.ui = ui;
        uiDiv.append("<input id='uiTimeSlider' type='range' min='0' max='1.0' step='any'>");
        ui.append("<span id='status'></span><br>");
        this.textFields.forEach(name => {
            ui.append(sprintf("<span id='%sText'></span><br>", name));
        });
        ui.append("<p></p>");
        $("#uiToggle").click(e => inst.toggleUI());
        //$("#uiTimeSlider").on('change', e => inst.onSliderChange(e));
        $("#uiTimeSlider").on('input', e => inst.onSliderChange(e));
        this._visible = true;
    }

    toggleUI() {
        var time=100;
        if (this.visible) {
            $("#uiPanel").hide(time);
            $("#uiTimeSlider").hide(time);
            this.visible = false;
        }
        else {
            $("#uiPanel").show(time);
            $("#uiTimeSlider").show(time);
            this.visible = true;
        }
    }

    onValueChange(event) {
        var msg = event.message;
        //console.log("onValueChange "+msg.name+" "+msg.value);
        switch (event.message.name) {
        case 'timeText':
            $("#timeText").html(event.message.value);
            break;

        case 'yearText':
            $("#yearText").html(event.message.value);
            break;

        case 'narrativeText':
            $("#narrativeText").html(event.message.value);
            break;
        }
    }
    
    setStatus(statStr) {
        $("#status").html(statStr);
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

    onSliderChange(e) {
        var newValue = $("#uiTimeSlider").val();
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
        console.log("ReactControls.registerView "+name);
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

Game.registerNodeType("JQControls", (game, options) => {
    if (!options.name)
        options.name = "ui";
    //return game.registerController(options.name, new UIController(game, options));
    //return game.registerController(options.name, new ReactControls(game, options));
    return game.registerController("ui", new JQControls(game, options));
});

export {JQControls};

