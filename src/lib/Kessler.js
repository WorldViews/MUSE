

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

particleVertexShaderStr = `

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


particleFragmentShaderStr = `

			varying vec4 vColor;

			void main() {

				float f = length( gl_PointCoord - vec2( 0.5, 0.5 ) );
				if ( f > 0.5 ) {
					discard;
				}
				gl_FragColor = vColor;

			}


`


function Kessler(scene, camera, width)
{
    this.scene = scene;
    this.camera = camera;
    this.WIDTH = width || 30;
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
	radius: 300,
	height: 8,
	exponent: 0.4,
	maxMass: 15.0,
	velocity: 70,
	velocityExponent: 0.2,
	randVelocity: 0.001
    };
    this.params = params;
    this.initComputeRenderer();
    this.initProtoplanets(scene);

    this.velocityUniforms.gravityConstant.value = params.gravityConstant;
    this.velocityUniforms.density.value = params.density;
    this.particleUniforms.density.value = params.density;
}

Kessler.prototype.initComputeRenderer = function () {

    this.gpuCompute = new GPUComputationRenderer( this.WIDTH, this.WIDTH, renderer );

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

    particles = new THREE.Points( this.geometry, material );
    //particles.matrixAutoUpdate = false;
    //particles.updateMatrix();
    scene.add( particles );
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
