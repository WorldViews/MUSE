
import * as THREE from 'three';
import {Game} from '../../Game';
import {MUSENode} from '../../Node';
import {Node3D} from '../../Node3D';
import Util from '../../Util';

var CSHARP_MIURA = `
...

public class Miura {

	int nrows;
	int ncols;
	float L;
	float E;
	float alpha;

	public Miura(int nrows, int ncols) : this(nrows, ncols, 1.5f, 1.0f, 20f) {}

...

   public Vector2[] getUV() {
	   Vector3[] pts = getPoints(0);
	   Vector2[] uv = new Vector2[pts.Length];
       //float H = E*Mathf.Cos(radians(alpha));
	   float xmin =   10000;
	   float xmax = -10000;
	   float ymin =   10000;
	   float ymax = -10000;
	   for (int i=0; i<pts.Length; i++) {
		   if (pts[i].x < xmin)
			   xmin = pts[i].x;
		   if (pts[i].x > xmax)
			   xmax = pts[i].x;
		   if (pts[i].y < ymin)
			   ymin = pts[i].y;
		   if (pts[i].y > ymax)
			   ymax = pts[i].y;
	   }
	  // float totalLength = (ncols-1)*L;
	   //float totalHeight = (nrows-1)*H;
	   float totalLength = xmax-xmin;
	   float totalHeight = ymax-ymin;
	   for (int i=0; i<pts.Length; i++) {
		   float x, y, u, v;
		   if (i < nrows*ncols) {
				x = pts[i].x;
				y = pts[i].y;
				u = (x-xmin)/totalLength;
				v = 0.5f*(y-ymin)/totalHeight;
		   }
		   else {
				x = pts[i].x;
				y = pts[i].y;
				u = (x-xmin)/totalLength;
				v = 0.5f+0.5f*(y-ymin)/totalHeight;
		   }
		   uv[i] = new Vector2(u, v);
	   }
	   return uv;
   }

    int idx(int i,  int j) {
        return i*ncols + j;
	}

   ...

`;

function Vector2(x,y) { return new THREE.Vector2(x,y); };
function Vector3(x,y,z) { return new THREE.Vector3(x,y,z); };

class Miura {
        /*
        When flat:
           L is the length of a unit parallelogram
           E is length of slanted left edge
           H is the height of a unit parallelogram
           alpha is the angle the left edge makes with the y axis when flat.
           foldAngle = 0

        When flexed:
           theta (deployment angle) is angle any element makes with horizontal
                0 when fully deployed (flat) and 90 when fully collapsed
           foldAngle is the angle the row lines make with the x axis
           dx is distance between x values of adjacent vertices in a row
           dy is distance between y values of rows
           xOdd is extra offset of x values for vertices in odd rows
           zOdd is height of vertices in odd columns
           zigZagAngle is angle columns make with y axis

           Note a point distance 1 from the point(0,0) whil have
           height = sin(90-alpha)*sin(theta)
           so sin(foldAngle) = sin(90-alpha)*sin(theta)
              foldAngle = asin(sin(90-alpha)*sin(theta))

           Also:
               dy = E*cos(zigZagAngle)
           so
               zigZagAngle = acos(dy/E)

        */
    constructor(nrows, ncols, L, E, alpha) {
            this.nrows = nrows;
            this.ncols = ncols;
    		this.L = L || 1.5;
    		this.E = E || 1.0;
    		this.alpha = alpha || 20;
    }

    getPoints(theta) {
        var pts = [];
    	this.getPoints_(theta, pts, 0);
    	this.getPoints_(theta, pts, this.nrows*this.ncols);
    	return pts;
    }

    getPoints_(theta, pts, startIdx) {
        var L = this.L;
        var E = this.E;
        var alpha = this.alpha;

        var a = Util.toRad(alpha);
        var theta = Util.toRad(theta);
        var H = E*Math.cos(a);
        var foldAngle = Math.asin(Math.cos(a)*Math.sin(theta));
        var dx = L*Math.cos(foldAngle);
        var dy = H*Math.cos(theta)/Math.cos(foldAngle);
        var zigZagAngle = Math.acos(dy/E);
        var xOdd = E*Math.sin(zigZagAngle);
        var zOdd = L*Math.sin(foldAngle);

    	for (var i=0; i<this.nrows; i++) {
    	   for (var j=0; j<this.ncols; j++) {
    		   var x = j*dx;
    		   if (i % 2 == 1)
    			   x += xOdd;
    		   var y = i*dy;
    		   var z = 0;
    		   if (j % 2 == 1)
    			   z = zOdd;
               //console.log("i: "+i+" j: "+j);
               var v = Vector3(x,y,z);
               //console.log("v: "+v);
    		   pts[startIdx+this.idx(i,j)] = v; //Vector3(x,y,z);
    	   }
        }
    }

    getUV() {
        console.log("Miura.getUV");
        var nrows = this.nrows;
        var ncols = this.ncols;
    	var pts = this.getPoints(0);
    	var uv = []; //new Vector2[pts.Length];
           //float H = E*Mathf.Cos(radians(alpha));
    	var xmin =   10000;
    	var xmax = -10000;
    	var ymin =   10000;
    	var ymax = -10000;
    	for (var i=0; i<pts.length; i++) {
    	    if (pts[i].x < xmin)
    	       xmin = pts[i].x;
    		if (pts[i].x > xmax)
    	       xmax = pts[i].x;
    		if (pts[i].y < ymin)
    		   ymin = pts[i].y;
    		if (pts[i].y > ymax)
    		   ymax = pts[i].y;
    	}
    	// float totalLength = (ncols-1)*L;
    	//float totalHeight = (nrows-1)*H;
    	var totalLength = xmax-xmin;
    	var totalHeight = ymax-ymin;
        console.log("totalLength: "+totalLength+"  totalHeight: "+totalHeight);
    	for (var i=0; i<pts.length; i++) {
    	    var x, y, u, v;
    		if (i < nrows*ncols) {
    			x = pts[i].x;
    			y = pts[i].y;
    			u = (x-xmin)/totalLength;
    			v = 0.5*(y-ymin)/totalHeight;
    		}
    		else {
    			x = pts[i].x;
    			y = pts[i].y;
    			u = (x-xmin)/totalLength;
    			v = 0.5+0.5*(y-ymin)/totalHeight;
    		}
    		uv[i] = new Vector2(u, v);
        }
    	return uv;
    }

    idx(i, j) {
        return i*this.ncols + j;
    }

    //	public int[] getTriangles() { return getTriangles(true, true); }
    getTriangles() { return this.getTriangles_(true, true); }
    getFrontTriangles() { return this.getTriangles_(true, false); }
    getBackTriangles() { return this.getTriangles_(false, true); }

    getTriangles_(front, back) {
        var idx = this.idx.bind(this);
        var nrows = this.nrows;
        var ncols = this.ncols;
    	var nSides = 0;
    	if (front)
    		nSides += 1;
    	if (back)
    		nSides += 1;
    	var nFaces = (ncols-1)*(nrows-1);
    	var nIndices = nSides*nFaces*2*3;
    	var indices = [];//new int[nIndices];
    	var k = 0;
    	if (front) {
    		for (var i=0; i<nrows-1; i++) {
    			for (var j=0; j<ncols-1; j++) {
    				var i0 = idx(i,j);
    				var i1 = idx(i+1,j);
    				var i2 = idx(i+1,j+1);
    				var i3 = idx(i, j+1);
    				indices[k++] = i0;
    				indices[k++] = i1;
    				indices[k++] = i2;
    				indices[k++] = i0;
    				indices[k++] = i2;
    				indices[k++] = i3;
    			}
    		}
    	}
    	if (back) {
    		var m = nrows*ncols;
    		for (var i=0; i<nrows-1; i++) {
    			for (var j=0; j<ncols-1; j++) {
    				var i0 = m+idx(i,j);
    				var i1 = m+idx(i+1,j);
    				var i2 = m+idx(i+1,j+1);
    				var i3 = m+idx(i, j+1);
    				indices[k++] = i2;
    				indices[k++] = i1;
    				indices[k++] = i0;
    				indices[k++] = i3;
    				indices[k++] = i2;
    				indices[k++] = i0;
    			}
    		}
    	}
    	return indices;
    }
}

class MiuraNode extends Node3D
{
    constructor(game, opts)
    {
        super(game, opts);
        var opts = this.options; // super may have filled in some things
        this.game = game;
        this.checkOptions(opts);
        this.group = new THREE.Group();
        this.group.name = this.name;
        this.texturePath = "src/packages/Miura/textures/monacat.jpg";
        this.setObject3D(this.group);
        this.addMesh();
        game.setFromProps(this.group, opts);
        game.addToGame(this.group, this.name, opts.parent);

        // This ensures we get update calls each frame
        game.registerController(this.options.name, this);
    }

    setAngle(a) {
        if (!this.mesh) {
            console.log("No mesh");
            return;
        }
        var pts = this.miura.getPoints(a);
        var vertices = this.mesh.geometry.vertices;
        for (var i=0; i<pts.length; i++) {
            vertices[i].copy(pts[i]);
        }
        this.mesh.geometry.computeFaceNormals();
        this.mesh.geometry.verticesNeedUpdate = true;
    }

    addBall(texture) {
        var radius = this.options.size || 0.1;
        if (texture) {
            this.ballMaterial = new THREE.MeshPhongMaterial( { map: texture, overdraw: 0.5} );
        }
        else {
            this.ballMaterial = new THREE.MeshPhongMaterial( { color: 0x331111} );
        }
        this.ballGeometry = new THREE.SphereGeometry( radius, 32, 32 );
        this.ball = new THREE.Mesh(this.ballGeometry, this.ballMaterial);
        this.group.add(this.ball);
    }

    addMesh() {
        if (this.texturePath) {
            var loader = new THREE.TextureLoader();
            var inst = this;
            loader.load( this.texturePath, function ( texture ) {
                console.log("Got texture for "+inst.texturePath, texture);
                inst.addBall(texture);
                inst.addMesh_(texture);
            });
        }
        else {
            this.addMesh_();
        }
    }

    addMesh_(texture) {
        this.miura = new Miura(10,10);
        var a = 30;
        var pts = this.miura.getPoints(a);
        //var indices = this.miura.getFrontTriangles();
        var indices = this.miura.getTriangles();
        if (texture) {
            this.material = new THREE.MeshPhongMaterial( { map: texture, overdraw: 0.5} );
        }
        else {
            this.material = new THREE.MeshPhongMaterial( { color: 0x331111} );
        }
        var geometry = new THREE.Geometry();
        var vertices = geometry.vertices;
        pts.forEach(pt => vertices.push(pt));
        for (var k=0; k<indices.length; k += 3) {
            //console.log(indices[k], indices[k+1], indices[k+2]);
            var face = new THREE.Face3(indices[k], indices[k+1], indices[k+2]);
            geometry.faces.push(face);
        }
        geometry.computeFaceNormals();
        //geometry.computeVertexNormals();
        this.vertices = pts;
        this.indices = indices;
        this.mesh = new THREE.Mesh(geometry, this.material);
        var s = .1;
        this.mesh.scale.set(s,s,s);
        //this.mesh.scale.set(20,20,20);
        this.group.add(this.mesh);
    }

    update() {
        if (!this.visible)
	       return;
    }
}

// could add fields there.  If checkOptions is used, it
// complains about unexpected fields in options.
MUSENode.defineFields(MiuraNode, [
    "size"
]);

// note that this could return a promise instead.
// (See DanceController)
function addMiuraNode(game, options) {
    var op = new MiuraNode(game, options);
    return op;
}

Game.registerNodeType("Miura", addMiuraNode);

MUSE.Miura = Miura;
MUSE.MiuraNode = MiuraNode;

export {MiuraNode};
