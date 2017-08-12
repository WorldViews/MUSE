
import * as THREE from 'three';
import { sprintf } from "sprintf-js";
import {Game} from './Game';

var computeShaderPositionStr = `

#define delta ( 1.0 / 60.0 )

void main() {

   vec2 uv = gl_FragCoord.xy / resolution.xy;

   vec4 tmpPos = texture2D( texturePosition, uv );
   vec3 pos = tmpPos.xyz;

   vec4 tmpVel = texture2D( textureVelocity, uv );
   vec3 vel = tmpVel.xyz;
   float mass = tmpVel.w;

   if ( mass == 0.0 ) {
	vel = vec3( 0.0 );
   }

   // Dynamics
   pos += vel * delta;

   gl_FragColor = vec4( pos, 1.0 );

}
`

var computeShaderVelocityStr = `

			// For PI declaration:
			#include <common>

			#define delta ( 1.0 / 60.0 )

			uniform float gravityConstant;
			uniform float density;

			const float width = resolution.x;
			const float height = resolution.y;

			float radiusFromMass( float mass ) {
				// Calculate radius of a sphere from mass and density
				return pow( ( 3.0 / ( 4.0 * PI ) ) * mass / density, 1.0 / 3.0 );
			}

			void main()	{

				vec2 uv = gl_FragCoord.xy / resolution.xy;
				float idParticle = uv.y * resolution.x + uv.x;

				vec4 tmpPos = texture2D( texturePosition, uv );
				vec3 pos = tmpPos.xyz;

				vec4 tmpVel = texture2D( textureVelocity, uv );
				vec3 vel = tmpVel.xyz;
				float mass = tmpVel.w;

				if ( mass > 0.0 ) {

					float radius = radiusFromMass( mass );

					vec3 acceleration = vec3( 0.0 );

					// Gravity interaction
					for ( float y = 0.0; y < height; y++ ) {

						for ( float x = 0.0; x < width; x++ ) {

							vec2 secondParticleCoords = vec2( x + 0.5, y + 0.5 ) / resolution.xy;
							vec3 pos2 = texture2D( texturePosition, secondParticleCoords ).xyz;
							vec4 velTemp2 = texture2D( textureVelocity, secondParticleCoords );
							vec3 vel2 = velTemp2.xyz;
							float mass2 = velTemp2.w;

							float idParticle2 = secondParticleCoords.y * resolution.x + secondParticleCoords.x;

							if ( idParticle == idParticle2 ) {
								continue;
							}

							if ( mass2 == 0.0 ) {
								continue;
							}

							vec3 dPos = pos2 - pos;
							float distance = length( dPos );
							float radius2 = radiusFromMass( mass2 );

							if ( distance == 0.0 ) {
								continue;
							}

							// Checks collision
							if (distance < 0.1*(radius + radius2)) {

								if ( idParticle < idParticle2 ) {

									// This particle is aggregated by the other
									vel = ( vel * mass + vel2 * mass2 ) / ( mass + mass2 );
									mass += mass2;
									radius = radiusFromMass( mass );

								}
								else {

									// This particle dies
									mass = 0.0;
									radius = 0.0;
									vel = vec3( 0.0 );
									break;

								}

							}
							float distanceSq = distance * distance;

							float gravityField = gravityConstant * mass2 / distanceSq;

							gravityField = min( gravityField, 1000.0 );

							acceleration += gravityField * normalize( dPos );

						}

						if ( mass == 0.0 ) {
							break;
						}
					}

					// Dynamics
					vel += delta * acceleration;

				}

				gl_FragColor = vec4( vel, mass );

			}

`

var particleVertexShaderStr = `

			// For PI declaration:
			#include <common>

			uniform sampler2D texturePosition;
			uniform sampler2D textureVelocity;

			uniform float cameraConstant;
			uniform float density;

			varying vec4 vColor;

			float radiusFromMass( float mass ) {
				// Calculate radius of a sphere from mass and density
				return pow( ( 3.0 / ( 4.0 * PI ) ) * mass / density, 1.0 / 3.0 );
			}


			void main() {


				vec4 posTemp = texture2D( texturePosition, uv );
				vec3 pos = posTemp.xyz;

				vec4 velTemp = texture2D( textureVelocity, uv );
				vec3 vel = velTemp.xyz;
				float mass = velTemp.w;

				vColor = vec4( 1.0, mass / 250.0, 0.0, 1.0 );

				vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );

				// Calculate radius of a sphere from mass and density
				//float radius = pow( ( 3.0 / ( 4.0 * PI ) ) * mass / density, 1.0 / 3.0 );
				float radius = radiusFromMass( mass );

				// Apparent size in pixels
				if ( mass == 0.0 ) {
					gl_PointSize = 0.0;
				}
				else {
					gl_PointSize = radius * cameraConstant / ( - mvPosition.z );
				}

				gl_Position = projectionMatrix * mvPosition;

			}

`


var particleFragmentShaderStr = `

			varying vec4 vColor;

			void main() {

				float f = length( gl_PointCoord - vec2( 0.5, 0.5 ) );
				if ( f > 0.5 ) {
					discard;
				}
				gl_FragColor = vColor;

			}


`


function Kessler(game, options)
{
    this.game = game;
    this.options = options;
    this.scene = game.scene;
    this.camera = game.camera;
    this.WIDTH = options.width || 30;
    this.PARTICLES = this.WIDTH * this.WIDTH;

    this.gpuCompute = null;
    this.velocityVariable = null;
    this.positionVariable = null;
    this.positionUniforms = null;
    this.velocityUniforms = null;
    this.particleUniforms = null;

    var params = {
	// Can be changed dynamically
	gravityConstant: 100.0,
	density: 0.45,
        
	// Must restart simulation
	//radius: 300,
	radius: 30,
	height: 8,
	exponent: 0.4,
	maxMass: 15.0,
	velocity: 70,
	velocityExponent: 0.2,
	randVelocity: 0.001
    };
    this.params = params;
    this.initComputeRenderer();
    this.initProtoplanets(this.game.scene);

    this.velocityUniforms.gravityConstant.value = params.gravityConstant;
    this.velocityUniforms.density.value = params.density;
    this.particleUniforms.density.value = params.density;
}

Kessler.prototype.initComputeRenderer = function () {

    this.gpuCompute = new GPUComputationRenderer( this.WIDTH, this.WIDTH, this.game.renderer );

    var dtPosition = this.gpuCompute.createTexture();
    var dtVelocity = this.gpuCompute.createTexture();

    this.fillTextures( dtPosition, dtVelocity );

    this.velocityVariable = this.gpuCompute.addVariable( "textureVelocity", computeShaderVelocityStr, dtVelocity );
    this.positionVariable = this.gpuCompute.addVariable( "texturePosition", computeShaderPositionStr, dtPosition);

    this.gpuCompute.setVariableDependencies( this.velocityVariable, [ this.positionVariable, this.velocityVariable ] );
    this.gpuCompute.setVariableDependencies( this.positionVariable, [ this.positionVariable, this.velocityVariable ] );

    this.positionUniforms = this.positionVariable.material.uniforms;
    this.velocityUniforms = this.velocityVariable.material.uniforms;

    this.velocityUniforms.gravityConstant = { value: 0.0 };
    this.velocityUniforms.density = { value: 0.0 };

    var error = this.gpuCompute.init();

    if ( error !== null ) {

	console.error( error );

    }
}


Kessler.prototype.initProtoplanets = function(scene) {
    this.geometry = new THREE.BufferGeometry();
    var positions = new Float32Array( this.PARTICLES * 3 );
    var p = 0;

    for ( var i = 0; i < this.PARTICLES; i++ ) {
	positions[ p++ ] = ( Math.random() * 2 - 1 ) * this.params.radius;
	positions[ p++ ] = 0; //( Math.random() * 2 - 1 ) * this.params.radius;
	positions[ p++ ] = ( Math.random() * 2 - 1 ) * this.params.radius;
    }

    var uvs = new Float32Array( this.PARTICLES * 2 );
    p = 0;

    for ( var j = 0; j < this.WIDTH; j++ ) {
	for ( var i = 0; i < this.WIDTH; i++ ) {
	    uvs[ p++ ] = i / ( this.WIDTH - 1 );
	    uvs[ p++ ] = j / ( this.WIDTH - 1 );
	}
    }

    this.geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
    this.geometry.addAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );

    this.particleUniforms = {
	texturePosition: { value: null },
	textureVelocity: { value: null },
	cameraConstant: { value: this.getCameraConstant( this.camera ) },
	density: { value: 0.0 }
    };

    // ShaderMaterial
    var material = new THREE.ShaderMaterial( {
	uniforms:       this.particleUniforms,
	vertexShader:   particleVertexShaderStr,
	fragmentShader: particleFragmentShaderStr,
    } );

    material.extensions.drawBuffers = true;

    this.particles = new THREE.Points( this.geometry, material );
    //particles.matrixAutoUpdate = false;
    //particles.updateMatrix();
    //scene.add( this.particles );
    var options = this.options;
    game.setFromProps(this.particles, options);
    game.addToGame(this.particles, options.name, options.parent);
}


Kessler.prototype.fillTextures = function( texturePosition, textureVelocity ) {
    var params = this.params;
    var posArray = texturePosition.image.data;
    var velArray = textureVelocity.image.data;
    var radius = params.radius;
    var height = params.height;
    var exponent = params.exponent;
    var maxMass = params.maxMass * 1024 / this.PARTICLES;
    var maxVel = params.velocity;
    var velExponent = params.velocityExponent;
    var randVel = params.randVelocity;

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
    this.particleUniforms.cameraConstant.value = this.getCameraConstant(this.camera);
}

Kessler.prototype.getCameraConstant = function( camera ) {
    return window.innerHeight / ( Math.tan( THREE.Math.DEG2RAD * 0.5 * camera.fov ) / camera.zoom );
}

Kessler.prototype.update = function()
{
    this.gpuCompute.compute();
    this.particleUniforms.texturePosition.value = this.gpuCompute.getCurrentRenderTarget( this.positionVariable ).texture;
    this.particleUniforms.textureVelocity.value = this.gpuCompute.getCurrentRenderTarget( this.velocityVariable ).texture;
}


Game.registerNodeType("Kessler", (game, options) => {
    if (!options.name)
        options.name = "kessler";
    var kessler = new Kessler(game, options);
    game.registerController(options.name, kessler);
    return kessler;
});

/***************************************************************************/
/**
 * @author yomboprime https://github.com/yomboprime
 *
 * GPUComputationRenderer, based on SimulationRenderer by zz85
 *
 * The GPUComputationRenderer uses the concept of variables. These variables are RGBA float textures that hold 4 floats
 * for each compute element (texel)
 *
 * Each variable has a fragment shader that defines the computation made to obtain the variable in question.
 * You can use as many variables you need, and make dependencies so you can use textures of other variables in the shader
 * (the sampler uniforms are added automatically) Most of the variables will need themselves as dependency.
 *
 * The renderer has actually two render targets per variable, to make ping-pong. Textures from the current frame are used
 * as inputs to render the textures of the next frame.
 *
 * The render targets of the variables can be used as input textures for your visualization shaders.
 *
 * Variable names should be valid identifiers and should not collide with THREE GLSL used identifiers.
 * a common approach could be to use 'texture' prefixing the variable name; i.e texturePosition, textureVelocity...
 *
 * The size of the computation (sizeX * sizeY) is defined as 'resolution' automatically in the shader. For example:
 * #DEFINE resolution vec2( 1024.0, 1024.0 )
 *
 * -------------
 *
 * Basic use:
 *
 * // Initialization...
 *
 * // Create computation renderer
 * var gpuCompute = new GPUComputationRenderer( 1024, 1024, renderer );
 *
 * // Create initial state float textures
 * var pos0 = gpuCompute.createTexture();
 * var vel0 = gpuCompute.createTexture();
 * // and fill in here the texture data...
 *
 * // Add texture variables
 * var velVar = gpuCompute.addVariable( "textureVelocity", fragmentShaderVel, pos0 );
 * var posVar = gpuCompute.addVariable( "texturePosition", fragmentShaderPos, vel0 );
 *
 * // Add variable dependencies
 * gpuCompute.setVariableDependencies( velVar, [ velVar, posVar ] );
 * gpuCompute.setVariableDependencies( posVar, [ velVar, posVar ] );
 *
 * // Add custom uniforms
 * velVar.material.uniforms.time = { value: 0.0 };
 *
 * // Check for completeness
 * var error = gpuCompute.init();
 * if ( error !== null ) {
 *		console.error( error );
  * }
 *
 *
 * // In each frame...
 *
 * // Compute!
 * gpuCompute.compute();
 *
 * // Update texture uniforms in your visualization materials with the gpu renderer output
 * myMaterial.uniforms.myTexture.value = gpuCompute.getCurrentRenderTarget( posVar ).texture;
 *
 * // Do your rendering
 * renderer.render( myScene, myCamera );
 *
 * -------------
 *
 * Also, you can use utility functions to create ShaderMaterial and perform computations (rendering between textures)
 * Note that the shaders can have multiple input textures.
 *
 * var myFilter1 = gpuCompute.createShaderMaterial( myFilterFragmentShader1, { theTexture: { value: null } } );
 * var myFilter2 = gpuCompute.createShaderMaterial( myFilterFragmentShader2, { theTexture: { value: null } } );
 *
 * var inputTexture = gpuCompute.createTexture();
 *
 * // Fill in here inputTexture...
 *
 * myFilter1.uniforms.theTexture.value = inputTexture;
 *
 * var myRenderTarget = gpuCompute.createRenderTarget();
 * myFilter2.uniforms.theTexture.value = myRenderTarget.texture;
 *
 * var outputRenderTarget = gpuCompute.createRenderTarget();
 *
 * // Now use the output texture where you want:
 * myMaterial.uniforms.map.value = outputRenderTarget.texture;
 *
 * // And compute each frame, before rendering to screen:
 * gpuCompute.doRenderTarget( myFilter1, myRenderTarget );
 * gpuCompute.doRenderTarget( myFilter2, outputRenderTarget );
 * 
 *
 *
 * @param {int} sizeX Computation problem size is always 2d: sizeX * sizeY elements.
 * @param {int} sizeY Computation problem size is always 2d: sizeX * sizeY elements.
 * @param {WebGLRenderer} renderer The renderer
  */

function GPUComputationRenderer( sizeX, sizeY, renderer ) {

	this.variables = [];

	this.currentTextureIndex = 0;

	var scene = new THREE.Scene();

	var camera = new THREE.Camera();
	camera.position.z = 1;

	var passThruUniforms = {
		texture: { value: null }
	};

	var passThruShader = createShaderMaterial( getPassThroughFragmentShader(), passThruUniforms );

	var mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), passThruShader );
	scene.add( mesh );


	this.addVariable = function( variableName, computeFragmentShader, initialValueTexture ) {

		var material = this.createShaderMaterial( computeFragmentShader );

		var variable = {
			name: variableName,
			initialValueTexture: initialValueTexture,
			material: material,
			dependencies: null,
			renderTargets: [],
			wrapS: null,
			wrapT: null,
			minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter
		};

		this.variables.push( variable );

		return variable;
		
	};

	this.setVariableDependencies = function( variable, dependencies ) {

		variable.dependencies = dependencies;

	};

	this.init = function() {

		if ( ! renderer.extensions.get( "OES_texture_float" ) ) {

			return "No OES_texture_float support for float textures.";

		}

		if ( renderer.capabilities.maxVertexTextures === 0 ) {

			return "No support for vertex shader textures.";

		}

		for ( var i = 0; i < this.variables.length; i++ ) {

			var variable = this.variables[ i ];

			// Creates rendertargets and initialize them with input texture
			variable.renderTargets[ 0 ] = this.createRenderTarget( sizeX, sizeY, variable.wrapS, variable.wrapT, variable.minFilter, variable.magFilter );
			variable.renderTargets[ 1 ] = this.createRenderTarget( sizeX, sizeY, variable.wrapS, variable.wrapT, variable.minFilter, variable.magFilter );
			this.renderTexture( variable.initialValueTexture, variable.renderTargets[ 0 ] );
			this.renderTexture( variable.initialValueTexture, variable.renderTargets[ 1 ] );

			// Adds dependencies uniforms to the ShaderMaterial
			var material = variable.material;
			var uniforms = material.uniforms;
			if ( variable.dependencies !== null ) {

				for ( var d = 0; d < variable.dependencies.length; d++ ) {

					var depVar = variable.dependencies[ d ];

					if ( depVar.name !== variable.name ) {

						// Checks if variable exists
						var found = false;
						for ( var j = 0; j < this.variables.length; j++ ) {

							if ( depVar.name === this.variables[ j ].name ) {
								found = true;
								break;
							}

						}
						if ( ! found ) {
							return "Variable dependency not found. Variable=" + variable.name + ", dependency=" + depVar.name;
						}

					}

					uniforms[ depVar.name ] = { value: null };

					material.fragmentShader = "\nuniform sampler2D " + depVar.name + ";\n" + material.fragmentShader;

				}
			}
		}

		this.currentTextureIndex = 0;

		return null;

	};

	this.compute = function() {

		var currentTextureIndex = this.currentTextureIndex;
		var nextTextureIndex = this.currentTextureIndex === 0 ? 1 : 0;

		for ( var i = 0, il = this.variables.length; i < il; i++ ) {

			var variable = this.variables[ i ];

			// Sets texture dependencies uniforms
			if ( variable.dependencies !== null ) {

				var uniforms = variable.material.uniforms;
				for ( var d = 0, dl = variable.dependencies.length; d < dl; d++ ) {

					var depVar = variable.dependencies[ d ];

					uniforms[ depVar.name ].value = depVar.renderTargets[ currentTextureIndex ].texture;

				}

			}

			// Performs the computation for this variable
			this.doRenderTarget( variable.material, variable.renderTargets[ nextTextureIndex ] );

		}

		this.currentTextureIndex = nextTextureIndex;
	};

	this.getCurrentRenderTarget = function( variable ) {

		return variable.renderTargets[ this.currentTextureIndex ];

	};

	this.getAlternateRenderTarget = function( variable ) {

		return variable.renderTargets[ this.currentTextureIndex === 0 ? 1 : 0 ];

	};

	function addResolutionDefine( materialShader ) {

		materialShader.defines.resolution = 'vec2( ' + sizeX.toFixed( 1 ) + ', ' + sizeY.toFixed( 1 ) + " )";

	}
	this.addResolutionDefine = addResolutionDefine;


	// The following functions can be used to compute things manually

	function createShaderMaterial( computeFragmentShader, uniforms ) {

		uniforms = uniforms || {};

		var material = new THREE.ShaderMaterial( {
			uniforms: uniforms,
			vertexShader: getPassThroughVertexShader(),
			fragmentShader: computeFragmentShader
		} );

		addResolutionDefine( material );

		return material;
	}
	this.createShaderMaterial = createShaderMaterial;

	this.createRenderTarget = function( sizeXTexture, sizeYTexture, wrapS, wrapT, minFilter, magFilter ) {

		sizeXTexture = sizeXTexture || sizeX;
		sizeYTexture = sizeYTexture || sizeY;

		wrapS = wrapS || THREE.ClampToEdgeWrapping;
		wrapT = wrapT || THREE.ClampToEdgeWrapping;

		minFilter = minFilter || THREE.NearestFilter;
		magFilter = magFilter || THREE.NearestFilter;

		var renderTarget = new THREE.WebGLRenderTarget( sizeXTexture, sizeYTexture, {
			wrapS: wrapS,
			wrapT: wrapT,
			minFilter: minFilter,
			magFilter: magFilter,
			format: THREE.RGBAFormat,
			type: ( /(iPad|iPhone|iPod)/g.test( navigator.userAgent ) ) ? THREE.HalfFloatType : THREE.FloatType,
			stencilBuffer: false
		} );

		return renderTarget;

	};

    this.createTexture = function( sizeXTexture, sizeYTexture ) {

		sizeXTexture = sizeXTexture || sizeX;
		sizeYTexture = sizeYTexture || sizeY;

		var a = new Float32Array( sizeXTexture * sizeYTexture * 4 );
		var texture = new THREE.DataTexture( a, sizeX, sizeY, THREE.RGBAFormat, THREE.FloatType );
		texture.needsUpdate = true;

		return texture;

	};


	this.renderTexture = function( input, output ) {

		// Takes a texture, and render out in rendertarget
		// input = Texture
		// output = RenderTarget

		passThruUniforms.texture.value = input;

		this.doRenderTarget( passThruShader, output);

		passThruUniforms.texture.value = null;

	};

	this.doRenderTarget = function( material, output ) {

		mesh.material = material;
		renderer.render( scene, camera, output );
		mesh.material = passThruShader;

	};

	// Shaders

	function getPassThroughVertexShader() {

		return	"void main()	{\n" +
				"\n" +
				"	gl_Position = vec4( position, 1.0 );\n" +
				"\n" +
				"}\n";

	}

	function getPassThroughFragmentShader() {

		return	"uniform sampler2D texture;\n" +
				"\n" +
				"void main() {\n" +
				"\n" +
				"	vec2 uv = gl_FragCoord.xy / resolution.xy;\n" +
				"\n" +
				"	gl_FragColor = texture2D( texture, uv );\n" +
				"\n" +
				"}\n";

	}

}
