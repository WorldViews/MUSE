import * as THREE from 'three';
import Stars from '../lib/Stars';

class StarsController {

    constructor(parent, position) {
        this.parent = parent;
        this.group = new THREE.Group();
        this.stars = new Stars(this.group, 5000, {name: 'Stars'});

        parent.add(this.group);
        this.group.position.fromArray(position);
    }

    update() {
  		this.group.rotation.y += 0.0001;
    }
}

export default StarsController;
