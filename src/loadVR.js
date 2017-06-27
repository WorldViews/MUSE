import WebVR from './lib/vr/WebVR';

export default (domElement) => {
  return new Promise((resolve, reject) => {
    if (WebVR.isAvailable()) {
      WebVR.getVRDisplay((display) => {
        let button = WebVR.getButton(display, domElement);
        resolve({button, display});
      });
    }
    else {
      reject({isVRAvailable: false});
    }
  });
};
