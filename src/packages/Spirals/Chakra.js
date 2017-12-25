
import {Node3D} from 'core/Node3D';
import {BallSpiral} from './ISPIRAL';

var CHAKRA = {};
CHAKRA.hues = [0, 30, 60, 120, 240, 260, 320];

// Requires ISPIRAL
//
CHAKRA.chakras = [];
CHAKRA.y0 = 1;
CHAKRA.spacing = 1;
CHAKRA.ballSize = .5;

class Chakra {
	constructor(num, opts) {
		if (!opts)
			opts = {};
		this.num = num;
		this.name = "Chakra" + num;
		this.spiral = null;
		this.imageSpiral = null;
		this.opts = opts;
		this.speed = 1;
		if (opts.speed)
			this.speed = opts.speed;
		this.init(opts);
	}

	init(opts) {
		CHAKRA.chakras[this.num] = this;
		this.y = CHAKRA.y0 + this.num * CHAKRA.spacing;
		var ballSize = CHAKRA.ballSize;
		var geo = new THREE.SphereGeometry(ballSize, 20, 20);
		var material = new THREE.MeshPhongMaterial({ color: 0xffaaaa });
		this.hue = CHAKRA.hues[this.num - 1] / 360;
		this.material = material;
		material.color.setHSL(this.hue, .9, .5);
		material.transparent = true;
		material.opacity = .6;
		var mesh = new THREE.Mesh(geo, material);
		mesh.position.y = this.y;
		mesh.castShadow = false;
		mesh.receiveShadow = false;
		if (opts.scale) {
			report("Setting chakra scale " + opts.scale);
			mesh.scale.x = opts.scale[0];
			mesh.scale.y = opts.scale[1];
			mesh.scale.z = opts.scale[2];
		}
		this.mesh = mesh;
		this.group = new THREE.Object3D();
		this.group.add(mesh);
		if (opts.spiral) {
			this.addSpiral();
		}
		if (opts.imageSpiral) {
			report("Chakra adding imageSpiral");
			this.addImageSpiral(opts.imageSpiral);
		}
		//if (opts.scene)
		//	opts.scene.add(this.group);
	}

	addSpiral(opts) {
		if (this.spiral) {
			this.spiral.group.visible = true;
			return;
		}
		this.spiral = new BallSpiral(200, { scale: [4, 40, 40], position: [0, this.y, 0], hue: this.hue });
		this.spiral.group.rotation.z = Math.PI / 2;
		this.group.add(this.spiral.group);
	}

	hideSpiral(opts) {
		if (this.spiral)
			this.spiral.group.visible = false;
	}

	addImageSpiral(opts) {
		if (this.imageSpiral) {
			this.imageSpiral.images.visible = true;
			return;
		}
		var imageList = opts.images; // list of paths
		if (imageList) {
			this.imageSpiral = new ImageSpiral(imageList, { scale: [4, 20, 20], position: [0, this.y, 0] });
			var images = this.imageSpiral.images;
			images.rotation.z = Math.PI / 2;
			this.group.add(images);
		}
		else {
			report("**** no imageList given ****");
		}
	}

	hideImageSpiral(opts) {
		if (this.imageSpiral)
			this.imageSpiral.images.visible = false;
	}

	update(t) {
		if (this.spiral)
			this.spiral.update(this.speed * t);
		if (this.imageSpiral)
			this.imageSpiral.update(this.speed * t);
	}
}


CHAKRA.update = function (t) {
	//  report("CHAKRA.update "+t);
	for (i in CHAKRA.chakras) {
		var chakra = CHAKRA.chakras[i];
		chakra.update(t);
	}
}

CHAKRA.Chakra = Chakra;
MUSE.CHAKRA = CHAKRA;

class ChakrasNode extends Node3D {
	constructor(game, opts) {
		super(game,opts);
		this.group = new THREE.Object3D();
		var num = 7;
		this.chakras = [];
		for (var i=0; i<num; i++) {
			var chakra = new Chakra(i+1);
			this.chakras.push(chakra);
			this.group.add(chakra.group);
		}
		this.setObject3D(this.group);
		game.addToGame(this.group, this.name, opts.parent);
		//game.registerController(this.name, this);
	}

	addSpirals() {
		this.chakras.forEach(chakra => chakra.addSpiral());
	}

	hideSpirals() {
		this.chakras.forEach(chakra => chakra.hideSpiral());
	}
	
	update(t) {
		this.chakras.forEach(chakra => chakra.update(t));
	}
}

function addChakras(game, opts)
{
    var chakras = new ChakrasNode(game, opts);
    //game.setFromProps(ve.group, opts);
    //game.addToGame(ve.group, opts.name, opts.parent);
    game.registerController(chakras.name, chakras);
    return chakras;
}

MUSE.registerNodeType("Chakras", addChakras);

export { CHAKRA, Chakra }
