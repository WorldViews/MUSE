
import _ from 'lodash';
import {Game} from '../Game';
import Util from '../Util';

import {UIControls} from './UIControls';

function append(parent, child) {
    if (typeof parent == "string")
        parent = $(parent);
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
        Object.assign(this, opts);
        //this.name = opts.name;
        //this.format = opts.format;
        //this.label = opts.label;
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
            if (typeof screen != "object") {
                screen = {name: screen};
            }
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

    registerModel(name, callback) {
        if (!this.stageControl) {
            console.log("JQControl registerModel - no stageControl");
            return;
        }
        this.stageControl.registerModel(name, callback);
    }
    removeModel(name) { this.stageControl.removeModel(name); }

    selectModel(name) {
        if (!this.stageControl) {
            console.log("JQControl selectModel - no stageControl");
            return;
        }
        this.stageControl.selectModel(name);
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
        this.game = ui.game;
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
        var format = this.fields[name].format;
        if (format) {
            if (typeof format == "string") {
                value = value != null ? sprintf(format, value) : "null";
            }
            else {
                value = format(value);
            }
        }
        this.$fields[name].html(value);
    }

    addField(field, label) {
        var name = field.name;
        console.log("addField "+name, field);
        label = label || field.label;
        if (label) {
            append(this.$parent, sprintf("<span>%s: </span>", label));
        }
        this.fields[name] = field;
        if (this.ui.options.fieldElement == "div" || field.fieldElement == "div")
            this.$fields[name] = append(this.$parent, sprintf("<div id='%sText' />", label, name));
        else
            this.$fields[name] = append(this.$parent, sprintf("<span id='%sText' /><br>", label, name));
        if (field.style) {
            console.log("FieldsView set style: "+field.style);
            this.$fields[name].attr('style', field.style);
        }
    }
}

class PlayControls extends JQWidget {
    constructor(ui, $parent) {
        super(ui, $parent);
        var inst = this;
        this.$back = append($parent, "<input type='button' value='B' style='width:20px;padding:10'>");
        this.$play = append($parent, "<input type='button' value='Play' style='width:60px;'>");
        //this.$prev = append($parent, "<br><input type='button' value='<' style='width:20px;'>");
        this.$prev = append($parent, "<input type='button' value='<' style='width:20px;'>");
        this.$next = append($parent, "<input type='button' value='>' style='width:20px;'>");
        this.$timeSlider = append($parent, "<input id='uiTimeSlider' type='range' min='0' max='1.0' step='any'>");
        this.$timeSlider.on('change', e => inst.onSliderChange(e, false));
        this.$timeSlider.on('input',  e => inst.onSliderChange(e, true));
        this.$back.on('click', e => inst.goBack(e));
        this.$play.on('click', e => inst.togglePlayPause(e));
        this.$prev.on('click', e => inst.onPrev(e));
        this.$next.on('click', e => inst.onNext(e));
        this.game.state.on('playState', s => inst.showPlayState());
    }

    goBack(e) {
        game.popGameState();
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

    showPlayState() {
        var $play = this.$play;
        var s = this.game.state.get('playState');
        if (s == "playing") {
            $play.val("Pause");
        }
        else {
            $play.val("Play");
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
        this.$timeSlider.blur();
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
        this.$viewName = append(this.$viewTool, "<input type='text'/>");
        this.$mark = append(this.$viewTool, "<input type='button' value='mark'/>");
        this.$del = append(this.$viewTool, "<input type='button' value='del'/>");
        this.$viewTool.hide();
        append(this.$viewTool, "<p/>");
        this.$views.on('input', e => inst.onViewCallback(inst.$views.val()));
        this.$mark.on('click', e => inst.onMarkView(inst.$viewName.val()));
        this.$del.on('click', e => inst.onDeleteView(inst.$viewName.val()));
        this.viewCallbacks = {};
    }

    registerView(name, callback) {
        append(this.$views, sprintf("<option value='%s'>%s</option>", name, name));
        this.viewCallbacks[name] = { name, callback };
        this.$viewTool.show();
    }

    onMarkView(name) {
        alert("New View name: "+name);
        game.viewManager.bookmarkView(name);
    }

    onDeleteView(name) {
        alert("Delete View: "+name);
        game.viewManager.deleteView(name);
    }

    onViewCallback(name) {
        console.log("onViewCallback" + name);
        let cb = this.viewCallbacks[name];
        if (cb && cb.callback) {
            cb.callback();
        }
        this.$viewName.val(name);
        this.$views.blur();
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
        game.program.selectStageModel(name);
        /*
        //var game = this.ui.game;
        var game = window.game;
        for (var modelName in this.models) {
            this._setVisible(modelName, false);
        }
        this.selectedModel = name;
        this._setVisible(name, true);
        */
        if (this.$models)
            this.$models.blur();
    }

    /*
    _setVisible(name, v) {
        if(game.models[name])
            game.models[name].visible = v;
        if (game.controllers[name])
            game.controllers[name].visible = v;
    }
    */
}

class VideoView extends JQWidget {
    constructor(ui, $parent, screenOpts) {
        super(ui, $parent);
        var inst = this;
        this.name = screenOpts.name;
        this.opts = screenOpts;
        this.game = window.game;
        game.state.on(this.name, (newProps) => inst.onChange(newProps));
        this.game.registerPlayer(this);
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
            this.$image = $("#"+this.name+"Image");
            if (this.$image.length <= 0) {
                Util.reportError("Found video tag but no matching image tag for "+this.name);
            }
        }
        else {
            console.log("*** couldn't find existing video - creating one");
            var parent = this.$parent;
            if (this.opts.parent)
                parent = $(this.opts.parent);
            //append(this.$parent, sprintf("<b>This is video view for: %s</b><br>", this.name));
            append(parent, sprintf("<b>%s:</b><br>", this.name));
            var viewerDiv = append(parent, '<div/>');
            viewerDiv.css('position','relative');
            this.$image = append(viewerDiv, '<img width="320px" height="240px"/>');
            this.$video = append(viewerDiv, '<video width="320px" height="240px" />');
            this.$image.attr('style', 'position:absolute;left:0;top:0');
            this.$video.attr('style', 'position:absolute;left:0;top:0');
            if (this.opts.style) {
                console.log("VideoView set style: "+this.opts.style);
                this.$video.attr('style', this.opts.style);
            }
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
        if (Util.isVideoURL(url)) {
            console.log("Setting <video> src = "+url);
            this.$video.css('visibility', 'visible');
            this.$video.attr('src', url);
            this.$image.css('visibility', 'hidden');
        }
        else {
            console.log("Setting <img> src = "+url);
            try { this.pause() }
            catch (e) {};
            //catch (e) {
            //}
            this.$image.css('visibility', 'visible');
            this.$image.attr('src', url);
            this.$video.css('visibility', 'hidden');
        }
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
