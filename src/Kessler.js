
var Kess = {};

function Kessler(scene, camera, width)
{
    this.scene = scene;
    this.camera = camera;
    Kess.WIDTH = width || 30;
    Kess.PARTICLES = Kess.WIDTH * Kess.WIDTH;

    //Kess = this;
    Kess.gpuCompute = null;
    Kess.velocityVariable = null;
    Kess.positionVariable = null;
    Kess.positionUniforms = null;
    Kess.velocityUniforms = null;
    Kess.particleUniforms = null;

    Kess.params = {
	// Can be changed dynamically
	gravityConstant: 100.0,
	density: 0.45,
        
	// Must restart simulation
	radius: 300,
	height: 8,
	exponent: 0.4,
	maxMass: 15.0,
	velocity: 70,
	velocityExponent: 0.2,
	randVelocity: 0.001
    };
    this.initComputeRenderer();
    this.initProtoplanets(scene);

    Kess.velocityUniforms.gravityConstant.value = Kess.params.gravityConstant;
    Kess.velocityUniforms.density.value = Kess.params.density;
    Kess.particleUniforms.density.value = Kess.params.density;
}

Kessler.prototype.initComputeRenderer = function () {

    Kess.gpuCompute = new GPUComputationRenderer( Kess.WIDTH, Kess.WIDTH, renderer );

    var dtPosition = Kess.gpuCompute.createTexture();
    var dtVelocity = Kess.gpuCompute.createTexture();

    this.fillTextures( dtPosition, dtVelocity );

    Kess.velocityVariable = Kess.gpuCompute.addVariable( "textureVelocity", computeShaderVelocityStr, dtVelocity );
    Kess.positionVariable = Kess.gpuCompute.addVariable( "texturePosition", computeShaderPositionStr, dtPosition);

    Kess.gpuCompute.setVariableDependencies( Kess.velocityVariable, [ Kess.positionVariable, Kess.velocityVariable ] );
    Kess.gpuCompute.setVariableDependencies( Kess.positionVariable, [ Kess.positionVariable, Kess.velocityVariable ] );

    Kess.positionUniforms = Kess.positionVariable.material.uniforms;
    Kess.velocityUniforms = Kess.velocityVariable.material.uniforms;

    Kess.velocityUniforms.gravityConstant = { value: 0.0 };
    Kess.velocityUniforms.density = { value: 0.0 };

    var error = Kess.gpuCompute.init();

    if ( error !== null ) {

	console.error( error );

    }
}


Kessler.prototype.initProtoplanets = function(scene) {

    Kess.geometry = new THREE.BufferGeometry();

    var positions = new Float32Array( Kess.PARTICLES * 3 );
    var p = 0;

    for ( var i = 0; i < Kess.PARTICLES; i++ ) {

	positions[ p++ ] = ( Math.random() * 2 - 1 ) * Kess.params.radius;
	positions[ p++ ] = 0; //( Math.random() * 2 - 1 ) * Kess.params.radius;
	positions[ p++ ] = ( Math.random() * 2 - 1 ) * Kess.params.radius;

    }

    var uvs = new Float32Array( Kess.PARTICLES * 2 );
    p = 0;

    for ( var j = 0; j < Kess.WIDTH; j++ ) {

	for ( var i = 0; i < Kess.WIDTH; i++ ) {

	    uvs[ p++ ] = i / ( Kess.WIDTH - 1 );
	    uvs[ p++ ] = j / ( Kess.WIDTH - 1 );

	}

    }

    Kess.geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
    Kess.geometry.addAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );

    Kess.particleUniforms = {
	texturePosition: { value: null },
	textureVelocity: { value: null },
	cameraConstant: { value: this.getCameraConstant( this.camera ) },
	density: { value: 0.0 }
    };

    // ShaderMaterial
    var material = new THREE.ShaderMaterial( {
	uniforms:       Kess.particleUniforms,
	vertexShader:   particleVertexShaderStr,
	fragmentShader: particleFragmentShaderStr,
    } );

    material.extensions.drawBuffers = true;

    particles = new THREE.Points( Kess.geometry, material );
    //particles.matrixAutoUpdate = false;
    //particles.updateMatrix();

    scene.add( particles );

}


Kessler.prototype.fillTextures = function( texturePosition, textureVelocity ) {

    var posArray = texturePosition.image.data;
    var velArray = textureVelocity.image.data;

    var radius = Kess.params.radius;
    var height = Kess.params.height;
    var exponent = Kess.params.exponent;
    var maxMass = Kess.params.maxMass * 1024 / Kess.PARTICLES;
    var maxVel = Kess.params.velocity;
    var velExponent = Kess.params.velocityExponent;
    var randVel = Kess.params.randVelocity;

    for ( var k = 0, kl = posArray.length; k < kl; k += 4 ) {

	// Position
	var x, y, z, rr, r, r0, theta;
        r0 = .8;
	do {
	    //x = ( Math.random() * 2 - 1 );
	    //z = ( Math.random() * 2 - 1 );
	    //y = ( Math.random() * 2 - 1 );
	    //rr = x * x + z * z;
            r0 = 0.5 + 0.02*Math.random();
            theta = 2*3.14159*Math.random();
	    x = r0 * Math.cos(theta);
	    z = r0 * Math.sin(theta);
	    //y = 0.000001 * ( Math.random() * 2 - 1 );
	    y = 0.0 * ( Math.random() * 2 - 1 );
	    rr = x*x + y*y + z*z;
            r = Math.sqrt(rr);                           

	    //} while ( rr > 1 );
	    //} while ( rr > 1 && r < .8 );
	} while ( rr > 1 );

	rr = Math.sqrt( rr );

	var rExp = radius * Math.pow( rr, exponent );

	// Velocity
	var vel = maxVel * Math.pow( rr, velExponent );
        var V0 = 142;
	var vx = V0 * r0 * -Math.sin(theta);
	var vz = V0 * r0 * Math.cos(theta);
	//var vy = 0.000001 * ( Math.random() * 2 - 1 );
	var vy = 0.0 * ( Math.random() * 2 - 1 );
	x *= rExp;
	z *= rExp;
	y = ( Math.random() * 2 - 1 ) * height;

	//var mass = Math.random() * maxMass + 1;
	//var mass = 0.02;
	var mass = 2.0;

        if (k == 0) {
            x = 0; y = 0; z = 0;
            vx = 0; vy = 0; vz = 0;
            mass = 6500;
        }
	// Fill in texture values
	posArray[ k + 0 ] = x;
	posArray[ k + 1 ] = y;
	posArray[ k + 2 ] = z;
	posArray[ k + 3 ] = 1;

	velArray[ k + 0 ] = vx;
	velArray[ k + 1 ] = vy;
	velArray[ k + 2 ] = vz;
	velArray[ k + 3 ] = mass;

    }

}

Kessler.prototype.handleResize = function() {
    Kess.particleUniforms.cameraConstant.value = this.getCameraConstant(this.camera);
}

Kessler.prototype.getCameraConstant = function( camera ) {
    return window.innerHeight / ( Math.tan( THREE.Math.DEG2RAD * 0.5 * camera.fov ) / camera.zoom );
}

Kessler.prototype.update = function()
{
    Kess.gpuCompute.compute();
    Kess.particleUniforms.texturePosition.value = Kess.gpuCompute.getCurrentRenderTarget( Kess.positionVariable ).texture;
    Kess.particleUniforms.textureVelocity.value = Kess.gpuCompute.getCurrentRenderTarget( Kess.velocityVariable ).texture;
}
