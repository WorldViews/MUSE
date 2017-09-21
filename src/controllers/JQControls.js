
import _ from 'lodash';
import {Game} from '../Game';

import {UIControls} from './UIControls';

function append(parent, child) {
    if (typeof child == "string")
        child = $(child);
    parent.append(child);
    return child;
}

class JQControls extends UIControls {
    constructor(game, options) {
        super(game, options);
        this._visible = false;
        this.options = options || {};
        this.program = this.game.getProgram();
        this.root = document.createElement('div');
        this.viewControl = null;
        this.playControl = null;
        this.scriptControl = new ScriptControl(this, this.program.scripts);
        this.stageControl = null;
        if (this.program.stages.length > 0) {
            var stage = this.program.stages[0];
            this.stageControl = new StageControl(this, stage.name, stage.models);
        }
        var inst = this;
        $(document).ready( e => inst.setupElements());
        game.events.addEventListener('valueChange', e => inst.onValueChange(e));
    }

    setupElements() {
        console.log("*********** JQControls.setupElements");
        this.textFields = ["time", "year", "narrative"];
        this.program.channels.forEach(channel => {
            this.textFields.push(channel);
        });
        console.log("**********  textFields:", this.textFields);
        var inst = this;
        var $uiDiv = $("#uiDiv");
        this.$uiToggle = append($uiDiv, "<button id='uiToggle'>&nbsp;</button>");
        this.$playControls = append($uiDiv, "<div id='uiPlayControls' />");
        this.pc = new PlayControls(this, this.$playControls);
        var $ui = append($uiDiv, "<div id='uiPanel'></div>");
        this.$ui = $ui;
        this.$status = append($ui, "<span id='status' /><br>");
        this.textFields.forEach(name => {
            append($ui, sprintf("<span id='%sText' /><br>", name));
        });
        append($ui, "<p/>");
        if (this.stageControl)
            this.stageControl.setup(this.$ui);
        this.scriptControl.setup(this.$ui);
        this.viewControl = new ViewControl(this, this.$ui);
        this.$uiToggle.click(e => inst.toggleUI());
        this._visible = true;
    }

    toggleUI() {
        var time=100;
        if (this.visible) {
            this.$ui.hide(time);
            this.$playControls.hide(time);
            this.visible = false;
        }
        else {
            this.$ui.show(time);
            this.$playControls.show(time);
            this.visible = true;
        }
    }

    onValueChange(event) {
        var msg = event.message;
        //console.log("onValueChange "+msg.name+" "+msg.value);
        $("#"+event.message.name+"Text").html(event.message.value);
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

    registerModel(name, callback) { this.stageControl.registerModel(name, callback); }
    removeModel(name) { this.stageControl.removeModel(name); }
    selectModel(name) { this.stageControl.selectModel(name); }


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
        this.scriptControl.registerScript(name, callback);
    }

    removeScript(name) { this.scriptControl.removeScript(name); }

    /**************************************************************/
    // Views
    registerView(name, callback) {
        console.log("JQControls.registerView "+name);
        this.viewControl.registerView(name, callback);
    }

}

class JQWidget {
    constructor(ui, $parent) {
        this.ui = ui;
        this.$parent = $parent;
    }
}

class PlayControls extends JQWidget {
    constructor(ui, $parent) {
        super(ui, $parent);
        var inst = this;
        this.$play = append($parent, "<input type='button' value='Play' style='width:60px;'>");
        this.$timeSlider = append($parent, "<input id='uiTimeSlider' type='range' min='0' max='1.0' step='any'>");
        this.$timeSlider.on('change', e => inst.onSliderChange(e, false));
        this.$timeSlider.on('input',  e => inst.onSliderChange(e, true));
        this.$play.on('click', e => inst.togglePlayPause(e));
    }

    togglePlayPause() {
        var $play = this.$play;
        console.log("$play: "+$play.val());
        if ($play.val() == "Play") {
            $play.val("Pause");
            this.ui.program.play();
        }
        else {
            $play.val("Play");
            this.ui.program.pause();
        }
    }

    onSliderChange(e, isAdjust) {
        //console.log("***** onSlider "+ (isAdjust ? "adjust" : "set"));
        var ui = this.ui;
        var newValue = $("#uiTimeSlider").val();
        //console.log('slider: ' + newValue);
        var t = ui.program.startTime + newValue*ui.program.duration;
        if (ui.program)
            ui.program.setPlayTime(t, isAdjust);
    }
}


class ViewControl  extends JQWidget {
    constructor(ui, $parent) {
        super(ui, $parent);
        var inst = this;
        this.$viewTool = append($parent, "<div>");
        append(this.$viewTool, "<b>View Points:</b><br>");
        this.$views = append(this.$viewTool, "<select/>");
        this.$viewTool.hide();
        append(this.$viewTool, "<p/>");
        this.$views.on('input', e => inst.onViewCallback(inst.$views.val()));
        this.viewCallbacks = {};
    }

    registerView(name, callback) {
        append(this.$views, sprintf("<option value='%s'>%s</option>", name, name));
        this.viewCallbacks[name] = { name, callback };
        this.$viewTool.show();
    }

    onViewCallback(name) {
        console.log("onViewCallback" + name);
        let cb = this.viewCallbacks[name];
        if (cb && cb.callback)
            cb.callback();
    }

    onMarkView(viewName) {
        console.log('viewName: ' + viewName);
    }

}

//class ScriptControl  extends JQWidget {
class ScriptControl {
    constructor(ui, scripts) {
        this.ui = ui;
        this.scripts = scripts || {};
    }

    setup($parent) {
        var ui = this.ui;
        this.$parent = $parent;
        this.$scripts = append(this.$parent, "<div/>");
        append(this.$scripts, "<b>Scripts:</b><br>");
        this.$scripts.hide();
        //for (var name in ui.program.scripts) {
        for (var name in this.scripts) {
            this.addScript_(name, this.scripts[name]);
        }
        append($parent, "<p/>");
    }

    registerScript(name, callback) {
        this.scripts[name] = callback;
        /*
        this.scripts[name] = {
            name: name,
            callback: callback
        };
        */
        if (this.$scripts)
            this.addScript_(name, callback);
    }

    addScript_(name, callback) {
        var ui = this.ui;
        var sb = append(this.$scripts, sprintf("<input type='button' value='%s' class='uiButton'><br>", name));
        sb.on('click', e => this.scripts[name](ui.game));
        this.$scripts.show();
    }

    removeScript(name) {
        delete this.scripts[name];
        //TODO: remove from DOM
    }
}

//class StageControl  extends JQWidget {
class StageControl {
    constructor(ui, stageName, models) {
        this.name = stageName;
        this.ui = ui;
        this.selectedModel = null;
        if (!models) {
            models = {
                'cmp': 'Data Visualization',
                'vEarth': 'Virtual Earth',
                'dancer': 'Dancer',
                'bmw': 'BMW'
            }
        }
        this.models = models;
        this.$models = null;
        this.selectModel('vEarth');
    }

    setup($parent) {
        this.$parent = $parent;
        var inst = this;
        if (this.models != {}) {
            for (var name in this.models) {
                this.addModelEntry(name, this.models[name]);
            }
        }
    }

    addModelEntry(name, label) {
        if (!this.$models) {
            append(this.$parent, sprintf("<b>%s:</b><br>", this.name));
            this.$models = append(this.$parent, "<select/>");
            append(this.$parent, "<p/>");
            var inst = this;
            this.$models.on('input', e => inst.selectModel(inst.$models.val()));
        }
        append(this.$models, sprintf("<option value='%s'>%s</option>", name, label));
    }

    registerModel(name, label) {
        if (!label)
            label = name;
        this.models[name] = label;
    }

    removeModel(name) {
        delete this.models[name];
        //TODO: remove from DOM
    }

    selectModel(name) {
        console.log("StageControl.selectModel "+name);
        //var game = this.ui.game;
        var game = window.game;
        for (var modelName in this.models) {
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



Game.registerNodeType("JQControls", (game, options) => {
    if (!options.name)
        options.name = "ui";
    //return game.registerController(options.name, new UIController(game, options));
    //return game.registerController(options.name, new ReactControls(game, options));
    return game.registerController("ui", new JQControls(game, options));
});

export {JQControls};
