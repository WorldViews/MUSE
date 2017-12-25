
var P = {};

P.v0 = 0.04;
P.theta0 = 0;
P.xbias = 0;
P.lastTrackedTime = 0;
P.pauseTime = 5;

THREE.ImageUtils.crossOrigin = '';

var loader = null;

function getLoader() {
    if (!loader)
        loader = new THREE.TextureLoader();
    return loader
}


function getImageBox(spiral, imageUrl) {
    //var material = new THREE.MeshPhongMaterial( { color: 0x7733dd } );
    //var material = new THREE.MeshPhongMaterial(
    var material = new THREE.MeshLambertMaterial(
        {
            color: 0xdddddd,
            //map: THREE.ImageUtils.loadTexture(imageUrl)
            map: getLoader().load(imageUrl)
        });
    var geometry = new THREE.BoxGeometry(spiral.boxW, spiral.boxH, spiral.boxD);
    var obj = new THREE.Mesh(geometry, material);
    var box = new THREE.Object3D();
    box.add(obj);
    obj.position.y += 0.5 * spiral.boxH + spiral.boxD;
    obj.position.x += 0.0 * spiral.boxW;
    obj.position.z += 0.0 * spiral.boxD;
    return box;
}

function getImageCard(spiral, imageUrl) {
    //console.log("getImageCard "+imageUrl);
    var material = new THREE.MeshLambertMaterial(
        {
            color: 0xdddddd,
            //map: THREE.ImageUtils.loadTexture(imageUrl)
            map: getLoader().load(imageUrl),
            transparent: true
        });
    material.side = THREE.DoubleSide;
    var geometry = new THREE.PlaneGeometry(spiral.boxW, spiral.boxH);
    var obj = new THREE.Mesh(geometry, material);
    var card = new THREE.Object3D();
    card.add(obj);
    obj.rotation.z = - Math.PI / 2;
    obj.scale.y = 2;
    obj.scale.x = 0.5;
    obj.position.y += 0.5 * spiral.boxH + spiral.boxD;
    obj.position.x += 0.0 * spiral.boxW;
    obj.position.z += 0.0 * spiral.boxD;
    card.obj = obj;
    return card;
}

function getBall(spiral) {
    //console.log("getImageCard "+imageUrl);
    var size = spiral.ballSize;
    var material = new THREE.MeshPhongMaterial({ color: 0xff2222 });
    material.color.setHSL(spiral.hue, .9, .5);
    material.transparent = true;
    material.opacity = .8;
    var geometry = new THREE.SphereGeometry(size, 20, 20);
    var mesh = new THREE.Mesh(geometry, material);
    mesh.scale.x = 10;
    var ball = new THREE.Object3D();
    ball.add(mesh);
    mesh.position.y += 0.5 * size;
    return ball;
}

class Spiral {
};

class ImageSpiral extends Spiral {
    constructor(imageList, opts) {
        super();
        opts = opts || {};
        this.boxW = 1.5;
        this.boxH = 0.8;
        this.boxD = 0.1;
        this.lookAtPos = null;
        if (opts.lookAtPos)
            this.lookAtPos = opts.lookAtPos;
        console.log("getImageSpiral " + JSON.stringify(opts));
        var imageObjs = [];
        this.imageObjs = imageObjs;
        var images = new THREE.Object3D();
        for (var i = 0; i < imageList.length; i++) {
            var imageUrl = imageList[i];
            //var imageObj = getImageBox(this, imageUrl);
            var imageObj = getImageCard(this, imageUrl);
            images.add(imageObj);
            imageObjs.push(imageObj)
        }
        this.images = images;
        if (opts.scale) {
            console.log("Setting spiral scale " + opts.scale);
            //images.scale.copy(opts.scale);
            images.scale.x = opts.scale[0];
            images.scale.y = opts.scale[1];
            images.scale.z = opts.scale[2];
        }
        if (opts.position) {
            console.log("Setting spiral position " + opts.position);
            images.position.copy(opts.position);
            images.position.x = opts.position[0];
            images.position.y = opts.position[1];
            images.position.z = opts.position[2];
        }

        this.update();
    }

    update(t0) {
       this.adjustImageObjs(t0);
    }

    adjustImageObjs(t0) {
        var spiral = this;
        if (!t0)
            t0 = 0;
        var y0 = 0
        var z0 = 0;
        var dy = 0.2;
        var dt = 1;
        var omega = 4;
        var xMin = -10;
        var xMax = 10;
        var xMid = (xMin + xMax) / 2.0;
        var xWid = xMax - xMin;
        var N = spiral.imageObjs.length;
        var dx = xWid / N;
        var drift = t0 * 0.05;
        var iLow = Math.floor(0 - drift / dx - P.xbias / dx);
        var iHigh = iLow + N;
        for (var j = iLow; j < iHigh; j++) {
            var i = (j + 100000 * N) % N;
            var x0 = xMin + dx * j;
            var x = x0 + drift;
            var theta = x * omega + P.theta0;
            x += P.xbias;
            var dm = x - xMid;
            var s = (xMax * xMax - dm * dm) / (xMax * xMax);
            s = s * s * s * s + 0.001; // make sure not zero
            s = 1.1 * s
            var r = 2.9 * s;
             var obj = spiral.imageObjs[i];
            //console.log("N: "+N+" i: "+i+" j: "+j);
            //console.log("spiral.imageObjs "+spiral.imageObjs)
            //console.log("spiral.imageObjs.length "+spiral.imageObjs.length)
            //console.log("obj: "+obj);
            var y = y0 + r * Math.cos(theta);
            var z = z0 + r * Math.sin(theta);
            //console.log("imageObj "+i+"  x: "+x+"  y: "+y+"   z: "+z+" s: "+s+" theta: "+theta);
            //console.log("spiral.imageObjs.length "+spiral.imageOjs.length);
            obj.rotation.x = theta - Math.PI / 2;
            obj.position.x = x;
            obj.position.y = y;
            obj.position.z = z;
            obj.scale.x = s;
            obj.scale.y = s;
            obj.scale.z = s;
            //obj.obj.lookAt(P.camera.position);
            var faceUp = false;
            if (faceUp) {
                obj.obj.rotation.y = - Math.PI / 2;
                obj.obj.rotation.x = - Math.PI / 2;
            }
            //obj.lookAt(new THREE.Vector3(10000,0,0));
            if (spiral.lookAtPos)
                obj.lookAt(spiral.lookAtPos);
        }
    }    
}

class BallSpiral extends Spiral {
    constructor(numItems, opts) {
        super();
        opts = opts || {};
        console.log("getBallSpiral " + numItems + " " + JSON.stringify(opts));
        var objs = [];
        this.ballSize = .1;
        this.hue = opts.hue || (300 / 360)
        this.objs = objs;
        this.numItems = numItems;
        var group = new THREE.Object3D();
        for (var i = 0; i < numItems; i++) {
            var obj = getBall(this);
            group.add(obj);
            objs.push(obj)
        }
        this.group = group;
        if (opts.scale) {
            console.log("Setting spiral scale " + opts.scale);
            group.scale.x = opts.scale[0];
            group.scale.y = opts.scale[1];
            group.scale.z = opts.scale[2];
        }
        if (opts.position) {
            console.log("Setting spiral position " + opts.position);
            group.position.x = opts.position[0];
            group.position.y = opts.position[1];
            group.position.z = opts.position[2];
        }
        this.update();
    }

    update(t0) {
        this.horizontal_adjustObjs(t0);
    }
   
    horizontal_adjustObjs(t0) {
        var spiral = this;
        if (!t0)
            t0 = 0;
        var y0 = 0
        var z0 = 0;
        var dy = 0.2;
        var dt = 1;
        var omega = 4;
        var xMin = -10;
        var xMax = 10;
        var xMid = (xMin + xMax) / 2.0;
        var xWid = xMax - xMin;
        var N = spiral.objs.length;
        var dx = xWid / N;
        var drift = t0 * 0.05;
        var iLow = Math.floor(0 - drift / dx - P.xbias / dx);
        var iHigh = iLow + N;
        for (var j = iLow; j < iHigh; j++) {
            var i = (j + 100000 * N) % N;
            var x0 = xMin + dx * j;
            var x = x0 + drift;
            var theta = x * omega + P.theta0;
            x += P.xbias;
            var dm = x - xMid;
            var s = (xMax * xMax - dm * dm) / (xMax * xMax);
            s = s * s * s * s + 0.001; // make sure not zero
            s = 1.1 * s
            var r = 2.9 * s;
            var obj = spiral.objs[i];
            var y = y0 + r * Math.cos(theta);
            var z = z0 + r * Math.sin(theta);
            //console.log("imageObj "+i+"  x: "+x+"  y: "+y+"   z: "+z+" s: "+s+" theta: "+theta);
            obj.rotation.x = theta - Math.PI / 2;
            obj.position.x = x;
            obj.position.y = y;
            obj.position.z = z;
            obj.scale.x = s;
            obj.scale.y = s;
            obj.scale.z = s;
        }
    }
}


 


export { ImageSpiral, BallSpiral };
