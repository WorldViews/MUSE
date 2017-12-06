import * as THREE from 'three';
import {Math} from 'three';
import {Game} from './Game';
import ImageSource from './lib/ImageSource';
import html2canvas from 'html2canvas';
import {MUSENode} from './Node';
import {Node3D} from './Node3D';
import Util from './Util';

/*
val should be name of property of THREE.
options are permissible values.
default value is returned if no val is given
*/
function getTHREEParam(val, options, defaultVal) {
    if (!val)
        return defaultVal;
    if (options.indexOf(val) < 0) {
        Util.reportError("Bad Value for THREE " + val )
    }
    return THREE[val];
}

function toRad(v)
{
    return v ? Math.degToRad(v) : v;
}

let STYLE = `
    color: white;
    font-family: arial;
    font-size: 72px;
    text-align: center;
`;

//class Screen2 extends THREE.Object3D
class Screen extends Node3D
{
    constructor(game, spec) {
        super(game, spec);
        this.checkOptions(spec);
        console.log("---------------- Screen", spec);
        this.game = game;
        this.spec = spec;
        this.imageSource = null;
        var name = spec.name || "movieScreen";
        this.name = name;
        this.channel = spec.channel || name;
        var path = spec.path;
        console.log('****** Loading screen... video: '+path);
        console.log("spec: "+JSON.stringify(spec));
        this.geometry = new THREE.SphereGeometry(
            spec.radius, 40, 40,
            toRad(spec.thetaStart),  toRad(spec.thetaLength),
            toRad(spec.phiStart),    toRad(spec.phiLength)
        );
        //let sourceSpec = getTypeFromURL(url);
        if (path) {
            this.imageSource = ImageSource.getImageSource(path, this.spec);
            var videoTexture = this.imageSource.createTexture();
        } else {
            var videoTexture = new THREE.Texture();
        }
        var side = getTHREEParam(spec.side, ["FrontSide", "BackSide", "DoubleSide"], THREE.DoubleSide);
        this.material = new THREE.MeshBasicMaterial({
            map: videoTexture,
            //depthWrite: false,
            alphaTest: 0.4,
            transparent: false,
            side: side
        });
        //this.screenObject = new THREE.Object3D();
        this.screenMesh = new THREE.Mesh(this.geometry, this.material);
        this.screenObject = this.screenMesh;
        this.screenMesh.name = spec.name+"_mesh";
        var s = spec.screenScale || 1.0;
        this.screenMesh.scale.set(-s, s, s);
        //this.screenObject.add(this.screenMesh);
        game.setFromProps(this.screenObject, spec);
        game.addToGame(this.screenObject, spec.name, spec.parent);
        this.setObject3D(this.screenObject)
        /*
        if (!this.screenMesh.userData)
            this.screenMesh.userData = {};
        this.screenMesh.userData.doubleClick = "FOO";
        */
        if (spec.name) {
            game.screens[spec.name] = this;
            game.registerPlayer(this);
        }
        // setup html renderer
        this._prevText = null;
        this._width = 4096;
        this._height = parseInt(4096*(spec.phiLength/spec.thetaLength));
        //this._height = parseInt(2048*(spec.phiLength/spec.thetaLength));
        this.handleRender = this.handleRender.bind(this);

        this._element = document.createElement('div');
        this._element.setAttribute('style', STYLE);
        this._element.style.width = this._width + 'px';
        this._element.style.height = this._height + 'px';

        this._iframe = document.createElement('iframe');
        this._iframe.style.display = 'none';
        document.body.appendChild(this._iframe);
        this._iframe.contentDocument.body.appendChild(this._element);

        if (spec.path) {
            game.state.set(this.name+".url", spec.path);
        }

        if (spec.text) {
            this.updateText(spec.text);
            game.state.set(this.name+".text", spec.text);
        }
        if (spec.html) {
            this.updateHTML(spec.html);
            game.state.set(this.name+".html", spec.html);
        }
        // note that we do this last so we don't get callbacks from above
        var inst = this;
        console.log("******************** registerWatcher: "+spec.name);
        game.state.on(this.channel, (newProps) => inst.onChange(newProps));

    }

    //watchProperties(evt) {
    //    var props = evt.message;
    onChange(props) {
        console.log("Screen.onChange "+this.name+" propts: "+JSON.stringify(props));
        if (typeof props === 'object') {
            if (props.url)
                this.updateSource(props.url, props);
            if (props.text != null) // in case text == ""
                this.updateText(props.text, props);
            if (props.html)
                this.updateHtml(props.html, props);
            if (props.requestedPlayTime) {
                var t = props.requestedPlayTime;
                console.log("requestedPlayTime: "+t);
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
        } else if (typeof props === 'string') {
            this.updateText(props);
        }
    }

    handleRender(canvas) {
        let texture = new THREE.Texture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        //texture.repeat.x = -1;
        texture.needsUpdate = true;
        this.material.map = texture;
    }


    updateHTML(html) {
        // in case we had a video, we should at least pause it.
        // probably we should free it up.  The problem now
        // is that if we have this html, and the screen gets played
        // the video will start playing and produce audio.

        this._element.innerHTML = html;
        html2canvas(
            this._element,
            {
                width: this._width,
                height: this._height,
                background: undefined,
                useCORS: true,
                onrendered: this.handleRender,
            }
        );
    }

    updateText(text) {
        if (text == this._prevText)
            return;
        this._prevText = text;
        this.updateHTML(`<h1>${text}</h1>`);
    }

    play() {
        if (!this.imageSource) {
            //console.log("No imageSource");
            return;
        }
        this.imageSource.play();
    }

    pause() {
        if (!this.imageSource) {
            //console.log("No imageSource");
            return;
        }
        this.imageSource.pause();
    }

    setPlayTime(t) {
        if (!this.imageSource) {
            //console.log("No imageSource");
            return;
        }
        this.imageSource.setPlayTime(t);
    }

    clear() {
        console.log("Screen.clear "+this.name);
        this.updateSource("_CLEAR_");
    }

    // this sets to white background
    setBlank() {
        //this.updateText("")
        this.updateSource("textures/blank.png")
    }

    updateSource(url, options) {
        options = options || {};
        console.log("Getting ImageSource "+url);
        if (this.imageSource) {
            this.imageSource.dispose();
        }
        this.imageSource = ImageSource.getImageSource(url, options);
        let texture = this.imageSource.createTexture();
        this.material.map = texture;
        //this.texture = texture;
        this.screenMesh.texture = texture;
        this.play();
    }

    updateSourceNEW(url, options) {
        options = options || {};
        console.log("Getting ImageSource "+url);
        var newImageSource = ImageSource.getImageSource(url, options);
        var readyPromise = newImageSource.readyPromise();
        var inst = this;
        readyPromise.then(rs => {
            let texture = newImageSource.createTexture();
            inst.material.map = texture;
            //this.texture = texture;
            inst.screenMesh.texture = texture;
            var oldImageSource = inst.imageSource;
            inst.imageSource = newImageSource;
            inst.play();
            if (oldImageSource) {
                oldImageSource.dispose();
            }
        });
    }
}

MUSENode.defineFields(Screen, [
  "channel",
  "radius",
  "phiStart",
  "phiLength",
  "thetaStart",
  "thetaLength",
  "path",
  "autoPlay",
  "side",
  "imageType",
  "text",
  "html"
]);

function loadScreen(game, opts)
{
    return new Screen(game, opts);
}

Game.registerNodeType("Screen", loadScreen);

/*
Video bubbles are subclasses of screens showing Panoramic
video or images, with action to move in or out of them.
*/
class VideoBubble extends Screen {
}

MUSENode.defineFields(VideoBubble, [
  "imagePath",
  "videoPath"
]);

function moveIntoBubble(obj) {
    var position = obj.getWorldPosition();
    var rotation = new THREE.Euler(0,0,0);
    var view = {position, rotation};
    var prevView = game.viewManager.getCurrentView();
    var screen = game.screens[obj.name];
    var node = game.getNode(obj);
    var gs = game.getGameState();
    var program = game.program;
    program.clear();
    var dur = obj.duration || 120;
    program.setDuration(dur);
    program.setPlayTime(0);
    console.log("moveIntoBubble node:", node)
    if (node.options.imagePath && node.options.videoPath) {
        node.updateSource(node.options.videoPath);
    }
    game.viewManager.goto(view, 2);
    screen.play();
    console.log("*** About to push game state");
    game.pushGameState(() => {
        if (node.options.imagePath && node.options.videoPath) {
            node.updateSource(node.options.imagePath);
        }
        game.viewManager.goto(prevView, 2);
        screen.pause();
        game.setGameState(gs);
    });
    return obj;
}

function playVideoOnSurface(name, url) {
    var n = game.getNode(name);
    var stateName = name+".url";
    game.state.dispatch(stateName, url);
    //n.updateSource(url);
    n.setVisible(true);
    game.program.play();
}

function playBubbleInDome(obj) {
    var domeName = "innerCover";
    var bubbleNode = game.getNode(obj);
    var domeNode = game.getNode(domeName);
    console.log("playBubbleInDome bubbleNode:", bubbleNode, "domeNode ", domeNode);
    var gs = game.getGameState();
    var program = game.program;
    program.clear();
    var dur = bubbleNode.options.duration || 120;
    program.setDuration(dur);
    program.setPlayTime(0);
    //if (node.options.imagePath && node.options.videoPath) {
    //    node.updateSource(node.options.videoPath);
    //}
    playVideoOnSurface(domeName, bubbleNode.options.videoPath);
    console.log("*** About to push game state");
    game.pushGameState(gs);
    /*
    game.pushGameState(() => {
        console.log("restoring game state after bubble in dome");
        //if (node.options.imagePath && node.options.videoPath) {
        //    node.updateSource(node.options.imagePath);
        //}
        //domeNode.setBlank();
        //domeNode.setVisible(false);
        game.setGameState(gs);
    });
    */
    return obj;
}

function clickedOnBubble(obj, evt) {
    console.log("clickedOnBubble: ", evt)
    if (evt && evt.shiftKey) {
        moveIntoBubble(obj);
    }
    else {
        playBubbleInDome(obj);
    }
}

function doubleClickedOnBubble(obj, evt) {
    moveIntoBubble(obj);
}

function getBubble(game, opts) {
    opts.side = opts.side || "FrontSide";
    opts
    if (opts.autoPlay == undefined)
        opts.autoPlay = false;
    opts.onMuseEvent = {
        'click': clickedOnBubble,
        //'doubleClick': doubleClickedOnBubble,
    };
    if (opts.imagePath)
        opts.path = opts.imagePath;
    return new VideoBubble(game, opts);
}

Game.registerNodeType("VideoBubble", getBubble);

export {Screen, VideoBubble};
