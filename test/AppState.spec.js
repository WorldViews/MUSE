import assert from 'assert';
import AppState from '../src/AppState';
import * as THREE from 'three';
import Promise from 'bluebird';

function MockEventListener() {

    this.addEventListener = function() {
        console.log('removeEventListener', arguments);
    }

    this.removeEventListener = function() {
        console.log('removeEventListener', arguments);
    }

    this.dispatchEvent
}

function getState() {
    let events = new THREE.EventDispatcher();
    let state = new AppState(events);
    return state;
}

describe('AppState Module', function() {
    it('validate set foo.bar=1 is {foo:{bar:1}}', function(done) {
        let state = getState();
        state.set('foo.bar', 1);
        assert.deepEqual(state.state, {'foo': {'bar': 1}});
        done();
    });
    it('validate get foo.bar is 1', function(done) {
        let state = getState();
        state.set('foo.bar', 1);
        assert.equal(1, state.get('foo.bar'));
        done();
    });
    it('should get callback when changing foo.bar', function (done) {
        let state = getState();
        state.set('foo.bar', 1);
        state.on('foo.bar', function(newValue, oldValue, name) {
            assert.equal(1, oldValue);
            assert.equal(2, newValue);
            assert.equal('foo.bar', name);
            done();
        });
        state.set('foo.bar', 2);
    });
    it('should get callbacks for foo and foo.bar', function(done) {
        let state = getState();
        let p1 = new Promise(function(resolve, reject) {
            state.on('foo', function(newValue, oldValue, name) {
                assert.equal('foo', name);
                assert.deepEqual(newValue, {'bar': 1});
                resolve();
            });
        });
        let p2 = new Promise(function(resolve, reject) {
            state.on('foo.bar', function(newValue, oldValue, name) {
                assert.equal('foo.bar', name);
                assert.equal(1, newValue);
                resolve();
            });
        });
        state.set('foo.bar', 1);
        Promise.all([p1,p2]).then(() => done());
    });
});
