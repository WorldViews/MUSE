import * as THREE from 'three';
import {Math} from 'three';
import {Game} from './Game';
import ImageSource from './lib/ImageSource';
import html2canvas from 'html2canvas';

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

class Screen extends THREE.Object3D
{
    constructor(game, spec, path) {
        super();
        console.log("---------------- Screen", spec);
        this.game = game;
        this.spec = spec;
        this.imageSource = null;
        var name = spec.name || "movieScreen";
        this.channel = spec.channel || name;
        var path = path || spec.path;
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
        this.material = new THREE.MeshBasicMaterial({
            map: videoTexture,
            transparent: true,
            side: THREE.DoubleSide
        });
        let screenObject = new THREE.Mesh(this.geometry, this.material);
        screenObject.name = spec.name+"_mesh";
        var s = spec.screenScale || 1.0;
        screenObject.scale.set(-s, s, s);
        //let screenParent = new THREE.Object3D();
        //screenParent.add(screenObject);
        this.add(screenObject);
        game.setFromProps(this, spec);
        game.addToGame(this, spec.name, spec.parent);
        this.userData = {doubleClick: "FOO"};
        if (spec.name)
            game.screens[spec.name] = this;
        var inst = this;
        console.log("******************** registerWatcher: "+spec.name);
        game.state.on(this.channel, (newProps) => inst.onChange(newProps));

        // setup html renderer
        this._prevText = null;
        this._width = window.innerWidth;
        this._height = window.innerHeight;
        this.handleRender = this.handleRender.bind(this);

        this._element = document.createElement('div');
        this._element.setAttribute('style', STYLE);
        this._element.style.width = this._width + 'px';
        this._element.style.height = this._height + 'px';

        this._iframe = document.createElement('iframe');
        document.body.appendChild(this._iframe);
        this._iframe.contentDocument.body.appendChild(this._element);

    }

    //watchProperties(evt) {
    //    var props = evt.message;
    onChange(props) {
        console.log("Screen.onChange"+JSON.stringify(props));
        if (typeof props === 'object') {
            if (props.url)
                this.updateSource(props.url, props);
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

    updateSource(url, options) {
        console.log("Getting ImageSource "+url);
        if (this.imageSource) {
            this.imageSource.dispose();
        }
        this.imageSource = ImageSource.getImageSource(url, options);
        let texture = this.imageSource.createTexture();
        this.material.map = texture;
        this.texture = texture;
        this.play();
    }
}

function loadScreen(game, opts)
{
    return new Screen(game, opts);
}

Game.registerNodeType("Screen", loadScreen);

export {loadScreen};
