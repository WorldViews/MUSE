import * as THREE from 'three';
import ImageSource from './lib/ImageSource';

let DEFAULT_SCREEN_SPEC = {
    x: 5.5,
    y: 2.5,
    z: -0.1,
    width: 6.5,
    height: 4.0,
    spherical: true
};

let re_image = /^(http)?.*\.(png|PNG|jpg|JPG|jpeg|JPEG|gif|GIF)/;
let re_video = /^(http)?.*\.(mp4|MP4|webm|WEBM|avi|AVI|ogg|OGG|mkv|MKV)/;
let re_webrtc = /^webrtc\+(.*)/;
let re_janus = /^janus\+(.+)#(\w+)/;
function getTypeFromURL(url) {
    var matches;
    if (re_image.test(url)) {
        return {
            type: ImageSource.TYPE.IMAGE,
            url: url
        };
    } else if (re_video.test(url)) {
        return {
            type: ImageSource.TYPE.VIDEO,
            url: url
        };
    } else if (matches = re_webrtc.exec(url)) {
        return {
            type: ImageSource.TYPE.WEBRTC,
            url: matches[1]
        };
    } else if (matches = re_janus.exec(url)) {
        let janus_url = url.substring(url.indexOf('+') + 1);
        return {
            type: ImageSource.TYPE.JANUS,
            url: matches[1],
            room: matches[2]
        };
    }
    return null;
}

export default (url, spec) => {
    let textureSpec = {
        ...DEFAULT_SCREEN_SPEC,
        ...spec
    };

    let sourceSpec = getTypeFromURL(url);

    return new Promise((resolve, reject) => {
        let imageSource = new ImageSource(sourceSpec);

        let videoTexture = imageSource.createTexture();
        let videoMaterial = new THREE.MeshBasicMaterial({
            map: videoTexture,
            transparent: true,
            side: THREE.DoubleSide
        });

        resolve({imageSource, videoMaterial});
    });
};
