
import loadVideo from './loadVideo'
import * as THREE from 'three';

import {R, TH_LEN, TH_MIN, PH_LEN, PH_MIN} from './const/screen';

function loadScreen(path, scene)
{
  console.log('Loading screen... video: '+path);
  var spec = {x: 5.5, y: 2.5, z: -0.1, width: 6.5, height: 4.0};
  //loadVideo(VIDEO_PATH).then(({imageSource, videoMaterial}) => {
  loadVideo(path).then(({imageSource, videoMaterial}) => {
    console.log('Creating video geometry...');

    let geometry = new THREE.SphereGeometry(
      R,
      40,
      40,
      TH_LEN, 
      TH_MIN,
      PH_LEN,
      PH_MIN
    );
    let screenObject = new THREE.Mesh(geometry, videoMaterial);

    screenObject.scale.x = -1;
    screenObject.scale.x *= 8.6;
    screenObject.scale.y *= 8.6;
    screenObject.scale.z *= 8.6;
    screenObject.position.y = 0;
    screenObject.name = "movieScreen";

    let screenParent = new THREE.Object3D();
    screenParent.add(screenObject);
    screenParent.rotation.z = 0;

    scene.add(screenParent);
  });
}

export default loadScreen;
