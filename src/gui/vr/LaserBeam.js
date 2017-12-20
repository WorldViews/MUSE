import * as THREE from 'three';


export default class LaserBeam extends THREE.Object3D {

    generateLaserBodyCanvas(){
        // init canvas
        var canvas	= document.createElement( 'canvas' );
        var context	= canvas.getContext( '2d' );
        canvas.width	= 1;
        canvas.height	= 64;
        // set gradient
        var gradient	= context.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop( 0  , 'rgba(  0,  0,  0,0.1)' );
        gradient.addColorStop( 0.1, 'rgba(160,160,160,0.3)' );
        gradient.addColorStop( 0.5, 'rgba(255,255,255,0.5)' );
        gradient.addColorStop( 0.9, 'rgba(160,160,160,0.3)' );
        gradient.addColorStop( 1.0, 'rgba(  0,  0,  0,0.1)' );
        // fill the rectangle
        context.fillStyle	= gradient;
        context.fillRect(0,0, canvas.width, canvas.height);
        // return the just built canvas
        return canvas;
    }

    constructor() {
        super();
        // generate the texture
        var canvas	= this.generateLaserBodyCanvas()
        var texture	= new THREE.Texture( canvas )
        texture.needsUpdate	= true;
        // do the material
        var material	= new THREE.MeshBasicMaterial({
            map		: texture,
            blending	: THREE.AdditiveBlending,
            color		: 0x4444aa,
            side		: THREE.DoubleSide,
            depthWrite	: false,
            transparent	: true
        })
        var geometry	= new THREE.PlaneGeometry(1, 0.02)
        var nPlanes	= 16;
        for(var i = 0; i < nPlanes; i++){
            var mesh	= new THREE.Mesh(geometry, material)
            mesh.rotation.x	= i/nPlanes * Math.PI
            mesh.position.x	= 1/2
            this.add(mesh)
        }

        // build THREE.Sprite for impact
        var textureUrl	= '/assets/images/blue_particle.jpg';
        var texture	= new THREE.TextureLoader().load(textureUrl)
        var material	= new THREE.SpriteMaterial({
            map		: texture,
            depthTest:      false,
            depthWrite:      false,
            blending	: THREE.AdditiveBlending,
        })
        var sprite	= new THREE.Sprite(material)
        sprite.scale.x = 0.5
        sprite.scale.y = 2;

        sprite.position.x	= 1-0.01
        this.add(sprite)
        this.sprite = sprite;

        // add a point light
        var light	= new THREE.PointLight( 0x4444ff);
        light.intensity	= 0.5
        light.distance	= 4
        light.position.x= -0.05
        this.light	= light
        sprite.add(light)
    }
}
