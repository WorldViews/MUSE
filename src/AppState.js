"use strict";
exports.__esModule = true;
var lodash_1 = require("lodash");
var AppState = /** @class */ (function () {
    function AppState(events) {
        this.state = {};
        this.callbacks = {};
        this.events = events;
    }
    // This sets state without any callbacks.
    AppState.prototype.init = function (name, newValue) {
        newValue = lodash_1["default"].cloneDeep(newValue);
        var oldValues = [];
        var path = name.split('.');
        while (path.length > 0) {
            var joinedPath = path.join('.');
            oldValues[joinedPath] = lodash_1["default"].cloneDeep(lodash_1["default"].get(this.state, joinedPath));
            path.pop();
        }
        lodash_1["default"].set(this.state, name, newValue);
    };
    // This sets, and dispatches regardless of whether the
    // state has changed.
    AppState.prototype.dispatch = function (name, newValue) {
        newValue = lodash_1["default"].cloneDeep(newValue);
        var oldValues = [];
        var path = name.split('.');
        while (path.length > 0) {
            var joinedPath = path.join('.');
            oldValues[joinedPath] = lodash_1["default"].cloneDeep(lodash_1["default"].get(this.state, joinedPath));
            path.pop();
        }
        lodash_1["default"].set(this.state, name, newValue);
        // dispatch callbacks
        var self = this;
        Object.keys(oldValues).forEach(function (p) {
            var name = p;
            var oldValue = oldValues[name];
            var newValue = lodash_1["default"].cloneDeep(lodash_1["default"].get(self.state, name));
            var eventType = "setProperties." + name;
            self.events.dispatchEvent({
                type: eventType,
                name: name,
                oldValue: oldValue,
                newValue: newValue
            });
        });
    };
    // This sets state and dispatches, but only dispatces if
    // state has changed.
    AppState.prototype.set = function (name, newValue) {
        if (lodash_1["default"].isEqual(lodash_1["default"].get(this.state, name), newValue)) {
            return;
        }
        this.dispatch(name, newValue);
    };
    AppState.prototype.get = function (name) {
        return lodash_1["default"].cloneDeep(lodash_1["default"].get(this.state, name));
    };
    AppState.prototype.on = function (name, callback) {
        var eventType = "setProperties." + name;
        var cb = this.callbacks[callback] = function (e) { return callback(e.newValue, e.oldValue, e.name); };
        this.events.addEventListener(eventType, cb);
    };
    AppState.prototype.off = function (name, callback) {
        var eventType = "setProperties." + name;
        var cb = this.callbacks[callback];
        delete this.callbacks[callback];
        this.events.removeEventListener(eventType, cb);
    };
    return AppState;
}());
exports["default"] = AppState;
