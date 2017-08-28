
import * as THREE from 'three';
import {Math} from 'three';

function getClockTime() { return new Date().getTime()/1000.0;}

/**
* from http://stemkoski.blogspot.fr/2013/07/shaders-in-threejs-glow-and-halo.html
* @return {[type]} [description]
*/
let vertexShader = `
	varying vec3	vVertexWorldPosition;
	varying vec3	vVertexNormal;

	void main(){
		vVertexNormal	= normalize(normalMatrix * normal);
		vVertexWorldPosition	= (modelMatrix * vec4(position, 1.0)).xyz;
		// set gl_Position
		gl_Position	= projectionMatrix * modelViewMatrix * vec4(position, 1.0);
	}
`;

let fragmentShader	= `
	uniform vec3	glowColor;
	uniform float	coeficient;
	uniform float	power;

	varying vec3	vVertexNormal;
	varying vec3	vVertexWorldPosition;

	void main(){
		vec3 worldCameraToVertex= vVertexWorldPosition - cameraPosition;
		vec3 viewCameraToVertex	= (viewMatrix * vec4(worldCameraToVertex, 0.0)).xyz;
		viewCameraToVertex	= normalize(viewCameraToVertex);
		float intensity		= pow(coeficient + dot(vVertexNormal, viewCameraToVertex), power);
		gl_FragColor		= vec4(glowColor, intensity);
	}
`;

let createAtmosphereMaterial	= function(){
	// create custom material from the shader code above
	//   that is within specially labeled script tags
	var material	= new THREE.ShaderMaterial({
		uniforms: {
			coeficient	: {
				type	: "f",
				value	: 1.0
			},
			power		: {
				type	: "f",
				value	: 2
			},
			glowColor	: {
				type	: "c",
				value	: new THREE.Color('pink')
			},
		},
		vertexShader	: vertexShader,
		fragmentShader	: fragmentShader,
		//blending	: THREE.AdditiveBlending,
		transparent	: true,
		depthWrite	: false,
	});
	return material
}

class Glow {
	constructor(obj3d, planet, radius) {
		var container	= new THREE.Object3D()
		container.name = "container";
		obj3d.add(container)

		if (0) {
			var loader = new THREE.TextureLoader();
			loader.load( 'textures/land_ocean_ice_cloud_2048.jpg',
			function ( texture ) {
				var geometry = new THREE.SphereGeometry(radius, 32, 32);
				var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );
				var mesh = new THREE.Mesh( geometry, material );
				mesh.name = "newEarth"
				container.add( mesh );
			});
		}

		if (0) {
			var geometry	= new THREE.SphereGeometry(radius, 32, 32)
			var material	= createAtmosphereMaterial()
			material.uniforms.glowColor.value.set(0xffffff)
			material.uniforms.coeficient.value	= 0.8
			material.uniforms.power.value		= 4.0
			var mesh	= new THREE.Mesh(geometry, material );
			mesh.scale.multiplyScalar(1.01);
			mesh.name = "atmosphere1"
			container.add( mesh );
		}

		if (1) {
			var geometry	= new THREE.SphereGeometry(radius, 32, 32)
			var material	= createAtmosphereMaterial()
			this.material = material;
			material.side	= THREE.BackSide
			material.uniforms.glowColor.value.set(0x00b3ff)
			material.uniforms.coeficient.value	= 0.32
			material.uniforms.power.value		= 2.5
			var mesh	= new THREE.Mesh(geometry, material );
			mesh.scale.multiplyScalar(1.05);
			mesh.name = "atmosphere2"
			container.add( mesh );
		}
	}
}


class Haze {
	constructor(obj3d, atmosphere, radius) {
		radius = radius || 0.51;
		var inst = this;
			this.atmosphere = atmosphere;

		var loader = new THREE.TextureLoader();
		var geometry = new THREE.SphereGeometry(radius, 32, 32);
		this.mat = new THREE.MeshBasicMaterial({
			overdraw: 0.5,
			color: ("rgb(173,172,196)"),
			transparent: true,
			opacity: 0.4,
		});
			var mesh = new THREE.Mesh(geometry, this.mat);
		mesh.name = "co2fog";
		obj3d.add(mesh);
		loader.load('textures/wholeFog.jpg', function (texture){
			inst.mat.map = texture;
		})
	/*
		loader.load('textures/wholeFog.jpg', function (texture){
			var geometry = new THREE.SphereGeometry(radius, 32, 32);
			var material = new THREE.MeshBasicMaterial({
				map: texture,
				overdraw: 0.5,
				color: ("rgb(173,172,196)"),
				transparent: true,
				opacity: 0.4,
			});
			inst.mat = material;
			var mesh = new THREE.Mesh(geometry, material);
			mesh.name = "co2fog";
			obj3d.add(mesh);
		})
		*/
	}
}

class BasicAtmosphere {
	constructor(obj3d, planet, opts) {
		opts = opts || {};
		this.planet = planet;
		this.radius = opts.radius || planet.radius || 1.0;
		this.haze = new Haze(obj3d, this, this.radius*1.02);
		this.glow = new Glow(obj3d, this, this.radius*1.05);
	}

	setHSL(h,s,l) {
		console.log("setHSL "+h+" "+s+" "+l);
		if (this.haze.mat)
			this.haze.mat.color.setHSL(h, s, l);
		this.glow.material.uniforms.glowColor.value.setHSL(h, s, l);

	}

	setOpacity(f) {
		console.log("Atmosphere.setOpacity "+f);
		this.haze.mat.opacity = f;
	}

	setHue(h) {
		var hsl = this.haze.mat.color.getHSL();
		this.setHSL(h,hsl.s, hsl.l);
	}
}

class Atmosphere extends BasicAtmosphere {

	constructor(obj3d, planet, opts) {
		super(obj3d, planet, opts);
		this.setHSL(0,.4,.5);
		this.t0 = getClockTime();
		this.interval = null;
	}

	updateAnimation() {
		console.log("updateAnimation");
		var t = getClockTime();
		var dt = t-this.t0;
		var f = dt % this.period;
		f=f/this.period;
		this.setOpacity(f);
		this.setHue(f);
		/*
		this.mat.opacity=f;
		this.mat.color.setHSL(f,.5,.4);
		//this.earth.material.uniforms.glowColor.value.set(0x00b3ff)
		var glow = this.atmosphere.glow;
		glow.material.uniforms.glowColor.value.setHSL(f,.5,.4);
		*/
	}

	setTemperature(t) {
	}

	setCO2Level(co2ppm) {
	}

	startAnimation(period) {
		this.period = period || 10;
		var inst = this;
		this.interval = setInterval(function() { inst.updateAnimation(); }, 50);
	}

	stopAnimation() {
		//TODO: implement this
		if (this.interval) {
			clearInterval(this.interval);
			this.interval = null;
		}
	}
}

export {Atmosphere};
