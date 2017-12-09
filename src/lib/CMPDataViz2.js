
import {Game} from '../Game';
import * as THREE from 'three';

// return random numver in [low,high]
function uniform(low,high)
{
    var r = Math.random();
    return low + r*(high-low);
}

function ranVertex(rMin, rMax) {
    var r = uniform(rMin, rMax);
    var lat = uniform(-Math.PI, Math.PI);
    var theta = uniform(0, 2*Math.PI);
    var z = r*Math.sin(lat);
    var rxy = r*Math.cos(lat);
    var x = rxy*Math.cos(theta);
    var y = rxy*Math.sin(theta);
    return new THREE.Vector3(x,y,z);
}

function setNumBlobs(geom, n, posfun) {
    var v = geom.vertices;
    if (v.length > n) {
        v.length = n;
    }
    else {
        for (var i = v.length; i < n; i++ ) {
            v.push(posfun());
        }
    }
    geom.vertices = v;
    geom.verticesNeedUpdate = true;
}

class BlobSet {
    constructor(opts, ranVertexFun) {

        opts = opts || {};
        var n = opts.n || 1000;
        var size = opts.size || 20;
        var color = opts.color || 0xff0000;
        var opacity = opts.opacity || 0.3;
        this.geometry = new THREE.Geometry();
        var sprite = null;
        var texPath = opts.texture || "textures/sprites/disc.png";
        sprite = new THREE.TextureLoader().load( texPath );
        var rMin = opts.rMin || this.radius*1.1;
        var rMax = opts.rMax || this.radius*1.2;
        setNumBlobs(this.geometry, n, ranVertexFun);
        this.material = new THREE.PointsMaterial({
            size: size, sizeAttenuation: false,
            map: sprite,
            color: color,
            opacity: 0.3,
            alphaTest: 0.1,
            transparent: true
        });
        this.particles = new THREE.Points( this.geometry, this.material );
        this.particles.userData = {museIgnorePicking: true};
    }
}

class CMPDataViz2 {
    constructor(earth, opts) {
        opts = opts || {};
        this.earth = earth;
        this.object3D = new THREE.Object3D();
        earth.object3D.add(this.object3D);
        this.rMin = earth.radius;
        this.rMax = earth.radius*2;
        this.co2Mat = null;
        this.co2Blobs = null;
        this.co2Density = 0.2;
        this.energyInMat = null;
        this.energyInBlobs = null;
        this.energyOutMat = null;
        this.energyOutBlobs = null;
        this.hue = 0;
        this.setCo2(1000);
        this.addEnergy(opts);
    }

    setVisible(v) {
        this.object3D.visible = v;
    }
    
    addBlobs(opts) {
        var rMin = opts.rMin || this.radius*1.1;
        var rMax = opts.rMax || this.radius*1.2;
        var blobSet = new BlobSet(opts, () => ranVertex(rMin, rMax));
        this.object3D.add(blobSet.particles);
        return blobSet;
    }

    addCo2(opts) {
        var material, particles;
        var res = this.addBlobs({n: 5000, size: 20,
            texture: 'textures/sprites/clouds.png'
        });
        this.co2Mat = res.material;
        this.co2Blobs = res.particles;
    }

    setCo2(n) {
        var material, particles;
        if (this.co2Blobs)
            this.object3D.remove(this.co2Blobs);
        var res = this.addBlobs({n: n, size: 20, color: 0xFFFF00, opacity: 1,
            texture: 'textures/sprites/clouds.png'
        });
        //                                       rMin: this.rMin, rMax: this.rMax});
        this.co2Mat = res.material;
        this.co2Blobs = res.particles;
    }

    addEnergy(opts) {
        var size = 6;
        var material, particles;
        var opacity = 0.1;
        var res = this.addBlobs({n: 5000, size: size, color: 0xFF0000, opacity: opacity,
            rMin: this.rMin, rMax: this.rMax
        });
        this.energInMat = res.material;
        this.eInBlobs = res.particles;
        var res = this.addBlobs({n: 5000, size: size, color: 0xFFFF00, opacity: opacity,
            rMin: this.rMin, rMax: this.rMax
        });
        this.energOutMat = res.material;
        this.eOutBlobs = res.particles;
        this.d2Min = this.rMin*this.rMin;
        this.d2Max = this.rMax*this.rMax;
    }

    // We try just changing vertices and indicating needs update, but it doesn't work.
    setEnergyXXX(n) {
        var rMin = this.rMin;
        var rMax = this.rMax;
        var geo = this.eOutBlobs.geometry;
        setNumBlobs(this.eOutBlobs.geometry, n, () => ranVertex(this.rMin, this.rMax));
        geo.vertices = geo.vertices;
        this.eOutBlobs.geometry = null;
        this.eOutBlobs.geometry = geo;
    }

    setEnergy(n) {
        var material, particles;
        var opacity = .2;
        this.object3D.remove(this.eOutBlobs);
        var res = this.addBlobs({
            n: n, size: 5, color: 0xFFFF00, opacity: opacity,
            rMin: this.rMin, rMax: this.rMax
        });
        this.energOutMat = res.material;
        this.eOutBlobs = res.particles;
    }

    update() {
        if (!this.object3D.visible) {
            return;
        }
        if (this.co2Blobs)
        this.co2Blobs.rotation.y += 0.005;
        if (this.co2Mat) {
            this.hue += 0.001;
            if (this.hue > 1)
            this.hue = 0;
            this.co2Mat.color.setHSL( this.hue, 0.6, 0.7 );
            this.co2Density += 0.002;
            if (this.co2Density > 1)
            this.co2Density = 0.3;
            this.co2Mat.opacity = this.co2Density;
        }
        if (this.eInBlobs) {
            var s0 = this.rMax/this.rMin;
            var s1 = .99;
            this.scaleVertices(
                this.eInBlobs.geometry,
                d2 => d2 < this.d2Min ? s0 : s1
            );
        }
        if (this.eOutBlobs) {
            var s0 = this.rMin/this.rMax;
            var s1 = 1/0.99;
            this.scaleVertices(this.eOutBlobs.geometry,
                d2 => d2 > this.d2Max ? s0 : s1
            );
        }
    }

    scaleVertices(geom, sfun) {
        var vertices = geom.vertices;
        for (var i=0; i<vertices.length; i++) {
            var d2 = vertices[i].lengthSq();
            vertices[i].multiplyScalar(sfun(d2));
        }
        geom.verticesNeedUpdate = true;
    }
}

export {CMPDataViz2};
