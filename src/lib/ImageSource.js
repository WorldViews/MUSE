import * as THREE from 'three';
import WebRTCClient from './webrtc';

/**
 * Wrapper to create three.js texture from multiple different sources.
 * 
 * @class
 * @constructor
 */

function getClockTime() { return new Date().getTime()/1000.0; }


export default class ImageSource {

    constructor(options) {
        this.options = options;

        this.url = this.options.url;
        this.type = this.options.type || this.TYPE.NONE;
        this.startTime = this.options.startTime || 0;
        this.video = document.createElement('video');
        this.video.setAttribute('crossorigin', 'anonymous');
        this.video.autoplay = true;
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
                console.log("*** setting video.currentTime to "+t);
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
                texture.image = video;

                function update() {
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
