
import _ from 'lodash';
import {Game} from '../Game';

import {UIControls} from './UIControls';

function append(parent, child) {
    if (typeof child == "string")
        child = $(child);
    parent.append(child);
    return child;
}

class Field
{
    constructor(opts) {
        if (typeof opts == "string")
            opts = {name: opts};
        this.name = opts.name;
        this.format = opts.format;
        this.label = opts.label;
    }
}

class JQControls extends UIControls {
    constructor(game, options) {
        super(game, options);
        this._visible = false;
        this.options = options || {};
        this.screens = this.options.screens || [];
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
        //$(document).ready( e => inst.setupElements());
        this.setupElements();
        //game.events.addEventListener('valueChange', e => inst.onValueChange(e));
        //var fieldNames = ["spaceStatus"]
        this.textFields.forEach(field => {
            var name = field.name;
            game.state.on(name, (newVal, oldVal, name) => inst.showValue(name, newVal));
        });
    }

    setupElements() {
        console.log("*********** JQControls.setupElements");
        //this.textFields = ["time", "year", "narrative"];
        this.textFields = [];
        this.program.channels.forEach(channel => {
            this.textFields.push(new Field(channel));
        });
        console.log("**********  textFields:", this.textFields);
        var inst = this;
        var $uiDiv = $("#uiDiv");
        this.$uiToggle = append($uiDiv, "<button id='uiToggle'>&nbsp;</button>");
        this.$playControls = append($uiDiv, "<div id='uiPlayControls' />");
        this.playControls = new PlayControls(this, this.$playControls);
        var $ui = append($uiDiv, "<div id='uiPanel'></div>");
        this.$ui = $ui;
        this.$status = append($ui, "<span id='status' /><br>");
        this.fieldsView = new FieldsView(this, $ui, this.textFields);

        if (this.stageControl)
            this.stageControl.setup(this.$ui);
        this.scriptControl.setup(this.$ui);
        this.viewControl = new ViewControl(this, this.$ui);
        this.$uiToggle.click(e => inst.toggleUI());
        this._visible = true;
        this.playControls.showState(this.program.isPlaying());

        //this.screens = ["mainScreen", "rightScreen"];
        this.screens.forEach(screen => {
            //this.videoView = new VideoView(this, $uiDiv, screen);
            //this.videoView.setup($uiDiv);
            this.videoView = new VideoView(this, $ui, screen);
            this.videoView.setup($ui);
        });
    }

    setTimeSlider(val) {
        this.playControls.setSlider(val);
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

    showValue(name, value) {
        if (typeof value == "object")
            value = value.text;
        if (this.fieldsView)
            this.fieldsView.setValue(name, value);
    }

    setStatus(statStr) {
        $("#status").html(statStr);
    }

    setValue(name, value) {
        if (this.fieldsView)
            this.fieldsView.setValue(name, value);
    }

    registerModel(name, callback) { this.stageControl.registerModel(name, callback); }
    removeModel(name) { this.stageControl.removeModel(name); }
    selectModel(name) { this.stageControl.selectModel(name); }

/*
    resetCMP() {
        // reset cmp
        let self = this;
        clearTimeout(self.changeTimeout);
        self.changeTimeout = setTimeout(() => {
            game.controllers.cmp.reset();
            self.changeTimeout = null;
        }, 2000);
    }
*/
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

class FieldsView extends JQWidget {
    constructor(ui, $parent, fieldList) {
        super(ui, $parent);
        this.fields = {};
        this.$fields = {};
        var inst = this;
        fieldList.forEach(field => inst.addField(field, ""));
        append($parent, "<p/>");
    }

    setValue(name, value) {
        //$("#"+name+"Text").html(value);
        if (!this.$fields[name]) {
            this.addField(new Field(name), name)
        }
        if (this.fields[name].format)
            value = this.fields[name].format(value);
        this.$fields[name].html(value);
    }

    addField(field, label) {
        var name = field.name;
        label = label || field.label;
        if (label) {
            append(this.$parent, sprintf("<span>%s: </span>", label));
        }
        this.fields[name] = field;
        this.$fields[name] = append(this.$parent, sprintf("<span id='%sText' /><br>", label, name));
    }
}

class PlayControls extends JQWidget {
    constructor(ui, $parent) {
        super(ui, $parent);
        var inst = this;
        this.$play = append($parent, "<input type='button' value='Play' style='width:60px;'>");
        this.$timeSlider = append($parent, "<input id='uiTimeSlider' type='range' min='0' max='1.0' step='any'>");
        this.$prev = append($parent, "<br><input type='button' value='<' style='width:20px;'>");
        this.$next = append($parent, "<input type='button' value='>' style='width:20px;'>");
        this.$timeSlider.on('change', e => inst.onSliderChange(e, false));
        this.$timeSlider.on('input',  e => inst.onSliderChange(e, true));
        this.$play.on('click', e => inst.togglePlayPause(e));
        this.$prev.on('click', e => inst.onPrev(e));
        this.$next.on('click', e => inst.onNext(e));
    }

    togglePlayPause(e) {
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

    onPrev() {
        this.ui.program.prevState();
    }

    onNext() {
        this.ui.program.nextState();
    }

    showState(playing) {
        this.$play.val(playing ? "Pause" : "Play");
    }

    setSlider(val) {
        //console.log("JQControl.playControls setSlider "+val);
        $("#uiTimeSlider").val(val);
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

/*
This deals with changes in camera position, defining
and selecting viewpoints.
*/
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
        var sb = append(this.$scripts, sprintf("<input type='button' value='%s' class='uiButton jqui'><br>", name));
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

class VideoView extends JQWidget {
    constructor(ui, $parent, name) {
        super(ui, $parent);
        var inst = this;
        this.name = name;
        this.game = window.game;
        game.state.on(this.name, (newProps) => inst.onChange(newProps));
        this.game.program.registerPlayer(this);
    }

    setup($parent) {
        this.$parent = $parent;
        var inst = this;
        //append(this.$parent, sprintf("<b>This is video view2 for :</b><br>", this.name));
        //this.$video = append(this.$parent, sprintf("<video width="320" height="240" controls/>", this.name));
        var id = this.name+"Video";
        var elem = $("#"+id);
        if (elem.length > 0) {
            this.$video = elem;
        }
        else {
            console.log("*** couldn't find existing video - creating one")
            append(this.$parent, sprintf("<b>This is video view for: %s</b><br>", this.name));
            this.$video = append(this.$parent, '<video width="320" height="240" controls/>');
        }
    }

    onChange(props) {
        console.log("******* VideoView: "+this.name+" props:", props)
        if (this.$video.length == 0) {
            console.log("********* JQ.VideoView No video ");
            return;
        }
        var v = this.$video[0];
        if (props.url) {
            this.setUrl(props.url);
        }
        if (props.requestedPlayTime) {
            var t = props.requestedPlayTime;
            console.log("VideoView.requestedPlayTime: "+t);
            //this.$video.attr('currentTime', t);
            this.setPlayTime(t);
        }
        if (props.playState) {
            if (props.playState == "play") {
                this.play();
            }
            else if (props.playState == "pause") {
                this.pause();
            }
        }
    }

    setUrl(url) {
        console.log("JQ.videoView.setUrl "+this.name+" "+url);
        this.$video.attr('src', url);
    }

    play() {
        var v = this.$video[0];
        v.play();
    }

    pause() {
        var v = this.$video[0];
        v.pause();
    }

    setPlayTime(t) {
        //console.log("JQ setPlayTime "+this.name+" t: "+t+" playTime: "+game.program.getPlayTime());
        var v = this.$video[0];
        v.currentTime = t;
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
