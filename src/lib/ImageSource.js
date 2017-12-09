import * as THREE from 'three';
import WebRTCClient from './webrtc';

/**
 * Wrapper to create three.js texture from multiple different sources.
 *
 * @class
 * @constructor
 */

function getClockTime() { return new Date().getTime()/1000.0; }

var VIDEO_EXTENTIONS = [".mp4", ".webm"];


export default class ImageSource {

    constructor(options) {
        this.options = options;
        var autoPlay = true;
        if (options.autoPlay != undefined)
            autoPlay = options.autoPlay;
        this.url = this.options.url;
        this.type = this.options.type || this.TYPE.NONE;
        this.startTime = this.options.startTime || 0;
        this.video = document.createElement('video');
        this.video.setAttribute('crossorigin', 'anonymous');
        this.video.autoplay = autoPlay;
        this.manager = new THREE.LoadingManager();
        this.textureLoader = new THREE.TextureLoader(this.manager);
        this.prevTexture = null;

        this.imNum = 0;
        this.playTime = null;
        this.lastSeekTime = null;
        this.t0 = null;
        this.playSpeed = 1.0;
        this.lastMark = null;
        this.running = false;
    }

/*
Questions for Yulius:
1) Is this code ok?
2) Where is ImageSource.TYPE.VIDEO define?
3) what happens if this class is disposed, and onloaded data gets
called?  Is there a way to get rid of this Promise.
*/
    readyPromise(minReadyState) {
        minReadyState = minReadyState || 2;
        if (this.type != ImageSource.TYPE.VIDEO) {
            console.log("ImageSource.readyPromise only implemented for VIDEO");
            return Promise.resolve(minReadyState);
        }
        var inst = this;
        this.video.onloadeddata = () => inst.onLoadedData();
        this.promise = new Promise((resolve,reject) => {
            var rs = inst.video.readyState;
            if (rs >= 2) {
                resolve(rs);
                return;
            }
            inst.video.onloadeddata = () => {
                rs = inst.video.readyState;
                if (rs >= 2) {
                    resolve(rs)
                }
            }
        });
        return this.promise;
    }

    onLoadedData() {
        var rs = this.video.readyState;
        alert("video readyState: "+rs);
    }

    static getImageSource(url, options) {
        console.log("getImageSource "+url);
        var type = ImageSource.TYPE.IMAGE;
        if (options.imageType) {
            type = options.imageType;
        }
        var URL = url.toUpperCase();
        VIDEO_EXTENTIONS.forEach(ext => {
            if (URL.endsWith(ext.toUpperCase()))
                type = ImageSource.TYPE.VIDEO;
        });
        if (url.startsWith('webrtc')) {
            url = url.replace('webrtc', 'http');
            url = url.replace(/\/$/, '');
            type = ImageSource.TYPE.WEBRTC;
        }

        var opts = {type,url};
        if (options && options.autoPlay != null)
            opts.autoPlay = options.autoPlay;
        return new ImageSource(opts);
    }

    dispose() {
        console.log("************* destroy ImageSource **************");
        this.running = false;
        this.texture = null;
        this.video.pause();
        this.video = null;
    }

    /**
     * Source types
     * @readonly
     * @enum {number}
     */
    static get TYPE() {
        return {
            /** No source type */
            NONE: 0,
            /** WebRTC server source */
            WEBRTC: 1,
            /** Motion JPEG source from fcProg server */
            VIDEO: 2,
            /** Poll image url. Parameter t is appended to the url starting with startTime in options */
            IMAGE: 3,
            /** MediaStream object given instead of URL */
            MEDIASTREAM: 4,
        }
    }


    setMark(t) {
        if (!t) {
            //t = getClockTime(t);
            t = this.getPlayTime();
        }
        console.log("setMark "+t);
        this.lastMark = t;
    }

    gotoMark() {
        var t = this.lastMark;
        console.log("gotoMark t: "+t);
        this.setPlayTime(t);
    }

    goBack() {
        var t = this.getPlayTime();
        if (t == null) {
            console.log("No play time");
            return;
        }
        this.setPlayTime(t-1);
    }

    goForward() {
        var t = this.getPlayTime();
        if (t == null) {
            console.log("No play time");
            return;
        }
        this.setPlayTime(t+1);
    }

    setPlaySpeed(s) {
        console.log("ImageSource.setPlaySpeed "+s);
        this.playSpeed = s;
        if (this.video)
            this.video.playbackRate = s;
    }

    getPlaySpeed() {
        console.log("ImageSource.getPlaySpeed --> "+this.playSpeed);
        return this.playSpeed;
    }

    pause() {
        if (this.video)
            this.video.pause();
        else
            console.log("*** no video ***");
    }

    play() {
        if (this.video) {
            return this.video.play();
        }
        else {
            console.log("*** no video ***");
        }
    }

    setRealTime() {
        this.setPlayTime(null);
    }

    setPlayTime(t) {
        if (t == null) {
            console.log("*** set real time ***");
            this.playTime = null
            this.lastSeekTime = null;
            return;
        }
        if (t < 0)
            t = getClockTime() - t;
        this.playTime = t;
        this.lastSeekTime = getClockTime();
        if (this.type == ImageSource.TYPE.VIDEO) {
            if (this.video) {
                //this.video.seek(t);
                //console.log("*** setting video.currentTime to "+t);
                this.video.currentTime = t;
            }
            else {
                console.log("*** No video yet ***");
            }
        }
    }

    getPlayTime() {
        var t = getClockTime();
        var dt = t - this.lastSeekTime;
        if (this.type == ImageSource.TYPE.VIDEO) {
            if (this.video) {
                this.playTime = this.video.currentTime;
            }
            else {
                console.log("*** No video yet ***");
            }
        }
        else {
            this.playTime += this.playSpeed*dt;
        }
        this.lastSeekTime = t;
        return this.playTime;
    }

    /**
     * Get URL for fetching next image.
     *
     * @method
     * @return {URL} Returns a URL as string;
     */
    getImageUrl()
    {
        this.imNum += 1;
        if (this.playTime == null) { // real time
            // note 'uniq' is used to avoid caching.
            // The dvr should ignore that and give most recent if no time is given.
            return this.url + "&uniq="+getClockTime();
        }
        //return this.imageUrl + "&t="+this.getPlayTime();
        return this.url + "&t="+this.getPlayTime();
    }

    /**
     * Create a texture based on the source type
     *
     * @method
     * @return {Object} Returns a THREE.Texture object
     */
    createTexture() {
        var texture;
        var scope = this;
        if (this.type == ImageSource.TYPE.NONE) {
            texture = new THREE.Texture();
        } else if (this.type == ImageSource.TYPE.WEBRTC) {
            texture = new THREE.Texture();
            texture.generateMipmaps = false;
            var client = new WebRTCClient(this.url);
            client.on('ready', function(video) {
                scope.video = video;
                scope.running = true;
                texture.image = video;
                function update() {
                    if (!scope.running)
                        return;
                    requestAnimationFrame(update);
                    if (video.readyState >= video.HAVE_CURRENT_DATA) {
                        texture.needsUpdate = true;
                    }
                }
                update();
            });
        } else if (this.type == ImageSource.TYPE.VIDEO) {
            this.video.src = this.url;
            this.video.loop = true;
            this.video.load();
            texture = new THREE.VideoTexture(this.video);

            // Avoid invoking play() here. Use the play() member function.
        } else if (this.type == ImageSource.TYPE.IMAGE) {
            //texture = new THREE.Texture();
            texture = new THREE.TextureLoader().load(this.url);
        } else if (this.type == ImageSource.TYPE.MEDIASTREAM) {
            this.video.srcObject = this.options.stream;
            this.video.play();
            texture = new THREE.VideoTexture(this.video);
        }
        this.texture = texture;
        texture.minFilter = THREE.LinearFilter;
        return texture;
    }

    /**
     * Update the texture.  Note that this function calls itself
     * (as long as pano.running is true) since its not possible to
     * know synchronously when images have been updated.
     */
    updateTexture() {
        if (this.type != ImageSource.TYPE.IMAGE) {
            console.log("updateTexture only used for TYPE.IMAGE");
            return;
        }
        var inst = this;
        var texture = this.texture;
        //this.textureLoader.load(this.url + '&t=' + t, function(tex) {
        var url = inst.getImageUrl();
        if (verbosity > 1)
            console.log("updateTexture url: "+url);
        this.textureLoader.load(url,
            function(tex) {
                texture.format = tex.format;
                texture.image = tex.image;
                texture.needsUpdate = true;
                if (this.prevTexture) {
                //console.log("Disposing of previous texture...");
                    this.prevTexture.dispose();
                }
                this.prevTexture = tex;
                if (inst.running)
                    inst.updateTexture();
            },
            null,
            function(xhr) {
                if (inst.running) {
                    console.log("failed on texture load... retrying...");
                    setTimeout(function() { inst.updateTexture(); }, 500);
                }
            }
        );
    }

    start()
    {
        console.log("ImageSource.start...");
        //    xxxx.yyyy.ddd;
        if (this.startTime)
            this.setPlayTime(this.startTime);
        this.running = true;
        setTimeout(this.updateTexture(), 1000);
    }

    stop()
    {
        this.running = false;
    }
}
