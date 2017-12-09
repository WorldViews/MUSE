/*
This has been adapted from

   https://github.com/jordanstephens/kepler.js

*/
//import {Vector} from 'sylvester';
import * as THREE from 'three';

THREE.Vector3.prototype.norm = function() {
    return 1;
}

function $V(a) {
    return new THREE.Vector3(a[0],a[1],a[2]);
}

//////////////////////////////////////////////////////////
// from constants.js
//

var Constants = {};

//module.exports = Constants;

Constants.EARTH_RADIUS = 6371.0;
Constants.MU = 398600.0;

Constants.I = $V([1, 0, 0]);
Constants.J = $V([0, 1, 0]);
Constants.K = $V([0, 0, 1]);

//////////////////////////////////////////////////////////
// from lagrange.js
//
//var Stumpff = require("./stumpff");
//var Sylvester = require("sylvester");

var Lagrange = {}

//module.exports = Lagrange;

Lagrange.f = function f(x, z, r) {
  var c = Stumpff.c(z);
  return 1 - (Math.pow(x, 2) / r.norm()) * c;
};

Lagrange.g = function g(x, z, mu, dt) {
  var s = Stumpff.s(z);
  return dt - ((1 / Math.sqrt(mu)) * Math.pow(x, 3) * s);
};

Lagrange.df = function df(x, z, r, r0, mu) {
  var s = Stumpff.s(z);
  return (Math.sqrt(mu) / (r.norm() * r0.norm())) * (s * z - 1) * x;
};

Lagrange.dg = function dg(x, z, r) {
  var c = Stumpff.c(z);
  return 1 - ((Math.pow(x, 2) / r.norm()) * c);
};

//////////////////////////////////////////////////////////
// from laguerre.js
//
var Laguerre = {}

//module.exports = Laguerre;


Laguerre.solve = function solve(guess, fn, dfn, d2fn) {
  var x = guess,
      n = 0;

  do {
    var f = fn(x),
        fPrime = dfn(x),
        fPrimePrime = d2fn(x),
        delta = 2 * Math.sqrt(Math.abs(
          (4 * Math.pow(fPrime, 2)) -
          (5 * f * fPrimePrime)
          )),
        dx = (5 * f) / (fPrime + ((Math.abs(fPrime) / fPrime) * delta));

    x = x - dx;
    n += 1;
  } while (!(dx == 0 || n > 10));

  return x;
};

//////////////////////////////////////////////////////////
// from orbit.js
//
//var Sylvester = require("sylvester");

//var ParamHelper = require("./param-helper"),
//    constants = require("./constants"),
var constants = Constants;
//    UniversalFormulation = require("./universal-formulation"),
//    Lagrange = require("./lagrange"),
//    Laguerre = require("./laguerre");

//module.exports = Orbit;

function Orbit(r, v, opts) {
  this.r = r;
  this.v = v;
  this.mu = (opts && opts.mu) || constants.MU;
  this.centralBodyRadius = (opts && opts.centralBodyRadius) || constants.EARTH_RADIUS;
}

Orbit.fromParams = function fromParams(params) {
  var state = ParamHelper.stateFromParams(params);

  return new Orbit(state.r, state.v, {
    mu: params.mu,
    centralBodyRadius: params.centralBodyRadius
  });
};

Orbit.prototype.angularMomentum = function angularMomentum() {
  return this.r.cross(this.v);
};

Orbit.prototype.radialVelocity = function radialVelocity() {
  return this.r.dot(this.v) / this.r.norm();
};

Orbit.prototype.eccentricity = function eccentricity() {
  return this.r.x(
    Math.pow(this.v.norm(), 2) - (this.mu / this.r.norm())
  ).subtract(
    this.v.x(this.r.norm() * this.radialVelocity())
  ).x(1 / this.mu);
};

Orbit.prototype.semimajorAxis = function semimajorAxis() {
  var h = this.angularMomentum().norm(),
      e = this.eccentricity().norm();
  return (Math.pow(h, 2) / this.mu) *
    (1 / (1 - Math.pow(e, 2)));
};

Orbit.prototype.semiminorAxis = function semiminorAxis() {
  var a = this.semimajorAxis(),
      e = this.eccentricity().norm();
  return a * Math.sqrt(1 - Math.pow(e, 2));
}

Orbit.prototype.semilatusRectum = function semilatusRectum() {
  return Math.pow(this.angularMomentum().norm(), 2) / this.mu;
};

Orbit.prototype.inclination = function inclination() {
  var h = this.angularMomentum();
  return toDeg(Math.acos(constants.K.dot(h) / h.norm()));
};

Orbit.prototype.nodeLine = function nodeLine() {
  return constants.K.cross(this.angularMomentum());
};

Orbit.prototype.rightAscension = function rightAscension() {
  var n = this.nodeLine();
  if (n.norm() === 0) { return 0; }
  var omega = toDeg(Math.acos(n.elements[0] / n.norm()));
  return n.elements[1] < 0 ? (360 - omega) : omega;
};

Orbit.prototype.argumentOfPeriapsis = function argumentOfPeriapsis() {
  var n = this.nodeLine();
  if (n.norm() === 0) { return 0; }
  var e = this.eccentricity(),
      w = toDeg(Math.acos(n.dot(e) / (n.norm() * e.norm())));
  return n.elements[2] < 0 ? (360 - w) : w;
};

Orbit.prototype.trueAnomaly = function trueAnomaly() {
  var e = this.eccentricity(),
      eNorm = parseFloat(e.norm().toFixed(5)),
      n = this.nodeLine(),
      nNorm = parseFloat(e.norm().toFixed(5)),
      l, u;

  if (eNorm === 0 && nNorm === 0) {
    u = toDeg(Math.acos(Math.min(1, this.r.elements[0] / this.r.norm())));
  } else {
    l = (eNorm === 0) ? n : e;
    u = toDeg(Math.acos(Math.min(1, l.dot(this.r) / (l.norm() * this.r.norm()))));
  }

  return this.r.dot(this.v) < 0 ? (360 - u) : u;
};

Orbit.prototype.periapsis = function periapsis() {
  var h = this.angularMomentum(),
      e = this.eccentricity();
  return (Math.pow(h.norm(), 2) / this.mu) * (1 / (1 + e.norm() * Math.cos(0)));
};

Orbit.prototype.apoapsis = function apoapsis() {
  var h = this.angularMomentum(),
      e = this.eccentricity();
  return (Math.pow(h.norm(), 2) / this.mu) * (1 / (1 + e.norm() * Math.cos(Math.PI)));
};

Orbit.prototype.period = function period() {
  var a = this.semimajorAxis();
  return (2 * Math.PI / Math.sqrt(this.mu)) * Math.sqrt(Math.pow(a, 3));
};

Orbit.prototype.universalAnomaly = function universalAnomaly(dt) {
  var a = this.semimajorAxis(),
      // initial guess of x
      x = Math.sqrt(this.mu) * (dt / a),
      r = this.r,
      v = this.v,
      mu = this.mu,
      f   = function(x) { return UniversalFormulation.f(x, a, r, v, mu, dt); },
      df  = function(x) { return UniversalFormulation.dfdt(x, a, r, v, mu); },
      d2f = function(x) { return UniversalFormulation.d2fdt(x, a, r, v, mu); };


  return Laguerre.solve(x, f, df, d2f);
};

Orbit.prototype.update = function update(dt) {
  var x = this.universalAnomaly(dt),
      a = this.semimajorAxis(),
      z = UniversalFormulation.z(x, a),
      r0 = this.r,
      v0 = this.v,
      mu = this.mu,

      // make sure you use the same `z` for calculating `this.r` and
      // `this.v`. this can be tricky because `z` depends on `this.r`
      // via `a` so we must be careful to not recalculate `z` between
      // updating `this.r` and updating `this.v`.
      r = r0.x(Lagrange.f(x, z, this.r)).add(v0.x(Lagrange.g(x, z, mu, dt))),
      v = r0.x(Lagrange.df(x, z, r, r0, mu)).add(v0.x(Lagrange.dg(x, z, r)));

  return new Orbit(r, v, {
    mu: mu,
    centralBodyRadius: this.centralBodyRadius
  });
};

function toDeg(rad) {
  return rad * (180 / Math.PI);
}

//////////////////////////////////////////////////////////
// from param-helper.js
//
//require("es6-object-assign").polyfill();

//var intersect = require("intersect"),
//    arrayIsEqual = require("array-equal"),
//    constants = require("./constants");

var ParamHelper = {};

//module.exports = ParamHelper;


var MINIMUM_PARAM_SETS = [
  ["semimajorAxis", "eccentricity"],
  ["semilatusRectum", "eccentricity"],
  ["apogee", "perigee"]
];

var DEFAULT_PARAMS = {
  inclination: 0.0,
  argumentOfPeriapsis: 0.0,
  rightAscension: 0.0,
  trueAnomaly: 0.0,
  eccentricity: 0.0
};

ParamHelper.stateFromParams = function stateFromParams(params) {
  var params = expandedParams(params)
      r_p = perifocalPosition(
        params.angularMomentum,
        params.eccentricity,
        params.trueAnomaly,
        params.mu
      ),
      v_p = perifocalVelocity(
        params.angularMomentum,
        params.eccentricity,
        params.trueAnomaly,
        params.mu
      ),
      q = transformMatrix(
        params.argumentOfPeriapsis,
        params.inclination,
        params.rightAscension
      );
  return {
    r: q.x(r_p),
    v: q.x(v_p)
  };
};

function expandedParams(params) {
  params = baseParams(params);

  var paramKeys = Object.keys(params);

  if (paramKeys.indexOf("apogee") !== -1 && paramKeys.indexOf("perigee") !== -1) {
    params.semimajorAxis = semimajorAxisFromApogeeAndPerigee(params.apogee, params.perigee, params.centralBodyRadius);
    params.eccentricity = eccentricityFromSemimajorAxisAndPerigee(params.semimajorAxis, params.perigee, params.centralBodyRadius);
  } else if (paramKeys.indexOf("semilatusRectum") !== -1) {
    params.semimajorAxis = semimajorAxisFromSemilatusRectumAndEccentricity(params.semilatusRectum, params.eccentricity);
  }

  if (paramKeys.indexOf("semilatusRectum") === -1) {
    params.semilatusRectum = semilatusRectumFromSemimajorAxisAndEccentricity(params.semimajorAxis, params.eccentricity);
  }

  params.angularMomentum = angularMomentumFromSemilatusRectum(params.semilatusRectum);

  return params;
};

function perifocalPosition(angularMomentum, eccentricity, trueAnomaly, mu) {
  var h = angularMomentum,
      e = eccentricity,
      theta = toRad(trueAnomaly);

  return (
    $V([Math.cos(theta), Math.sin(theta), 0]).x(
      (Math.pow(h, 2) / mu) *
      (1 / (1 + (e * Math.cos(theta))))
    )
  );
};

function perifocalVelocity(angularMomentum, eccentricity, trueAnomaly, mu) {
  var h = angularMomentum,
      e = eccentricity,
      theta = toRad(trueAnomaly);

  return (
    $V([-Math.sin(theta), e + Math.cos(theta), 0]).x(
      (mu / h)
    )
  );
};

function transformMatrix(argumentOfPeriapsis, inclination, rightAscension) {
    var w = toRad(argumentOfPeriapsis),
        i = toRad(inclination),
        omega = toRad(rightAscension),

        sin_omega = Math.sin(omega),
        cos_omega = Math.cos(omega),
        sin_i = Math.sin(i),
        cos_i = Math.cos(i),
        sin_w = Math.sin(w),
        cos_w = Math.cos(w);

    return $M([
      [-sin_omega * cos_i * sin_w + (cos_omega * cos_w),
       -sin_omega * cos_i * cos_w - (cos_omega * sin_w),
       sin_omega * sin_i],
      [cos_omega * cos_i * sin_w + (sin_omega * cos_w),
       cos_omega * cos_i * cos_w - (sin_omega * sin_w),
       -cos_omega * sin_i],
      [sin_i * sin_w,
       sin_i * cos_w,
       cos_i]
    ]);
};

function baseParams(params) {
  var paramSet = MINIMUM_PARAM_SETS.find(function(rp) {
    var intersection = intersect(Object.keys(params), rp);
    return arrayIsEqual(intersection, rp);
  });

  if (!paramSet) {
    throw new Error("Invalid parameter set");
  }

  params.mu = constants.MU;
  params.centralBodyRadius = constants.EARTH_RADIUS;

  return Object.assign({}, DEFAULT_PARAMS, params);
}

function angularMomentumFromSemilatusRectum(semilatusRectum) {
  return Math.sqrt(semilatusRectum * constants.MU);
}

function semilatusRectumFromSemimajorAxisAndEccentricity(semimajorAxis, eccentricity) {
  return semimajorAxis * (1 - (Math.pow(eccentricity, 2)));
}

function semimajorAxisFromSemilatusRectumAndEccentricity(semilatusRectum, eccentricity) {
  return semilatusRectum / (1 - Math.pow(eccentricity, 2));
}

function semimajorAxisFromApogeeAndPerigee(apogee, perigee, centralBodyRadius) {
  return ((centralBodyRadius * 2) + apogee + perigee) / 2.0;
}

function eccentricityFromSemimajorAxisAndPerigee(semimajorAxis, perigee, centralBodyRadius) {
  return (semimajorAxis / (centralBodyRadius + perigee)) - 1;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

//////////////////////////////////////////////////////////
// from stumpff.js
//
var Stumpff = {}

Stumpff.c = function c(z) {
  var value;
  if (z > 0) {
    value = (1 - Math.cos(Math.sqrt(z))) / z;
  } else if (z < 0) {
    value = (Math.cosh(Math.sqrt(-z)) - 1) / (-z);
  } else {
    value = 0.5;
  }
  return value;
};

Stumpff.s = function s(z) {
  var value;
  if (z > 0) {
    value = (Math.sqrt(z) - Math.sin(Math.sqrt(z))) / Math.pow(Math.sqrt(z), 3);
  } else if (z < 0) {
    value = (Math.sinh(Math.sqrt(-z)) - Math.sqrt(-z)) / Math.pow(Math.sqrt(-z), 3);
  } else {
    value = 1 / 6;
  }
  return value;
};

//module.exports = Stumpff;

//////////////////////////////////////////////////////////
// from universal-formulation.js
//
//var Stumpff = require("./stumpff");

//var Sylvester = require("sylvester");

var UniversalFormulation = {};

//module.exports = UniversalFormulation;

function _z(x, a) {
  return Math.pow(x, 2) / a;
};
UniversalFormulation.z = _z;

UniversalFormulation.f = function f(x, a, r, v, mu, dt) {
  var z = _z(x, a),
      s = Stumpff.s(z),
      c = Stumpff.c(z);

  return (
    ((1 - (r.norm() / a)) * s * Math.pow(x, 3)) +
    ((r.dot(v) / Math.sqrt(mu)) * c * Math.pow(x, 2)) +
    (r.norm() * x) -
    (Math.sqrt(mu) * dt)
  );
};

UniversalFormulation.dfdt = function dfdt(x, a, r, v, mu) {
  var z = _z(x, a),
      s = Stumpff.s(z),
      c = Stumpff.c(z);

  return (
    (c * Math.pow(x, 2)) +
    ((r.dot(v) / Math.sqrt(mu)) * (1 - (s * z)) * x) +
    (r.norm() * (1 - (c * z)))
  );
};

UniversalFormulation.d2fdt = function d2fdt(x, a, r, v, mu) {
  var z = _z(x, a),
      s = Stumpff.s(z),
      c = Stumpff.c(z);

  return (
    ((1 - (r.norm() / a)) * (1 - (s * z)) * x) +
    ((r.dot(v) / Math.sqrt(mu)) * (1 - (c * z)))
  );
};

//////////////////////////////////////////////////////////
// from kepler.js
//
//require("es6-shim");

var Kepler = {};
Kepler.Orbit = Orbit;
//module.exports = Kepler;

//Kepler.Orbit = require("./orbit");

//export {Constants,Lagrange,Laguerre,Orbit,ParamHelper,Stumpff,UniversalFormulation,Kepler};
export {Kepler,$V};
