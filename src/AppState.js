import _ from 'lodash';

export default class AppState {

    constructor() {
        this.state = {};
        this.callback = {};
    }

    set(name, newValue) {
        let oldValue = _.get(this.state, name);
        _.set(this.state, name, newValue);
        // dispatch change
        this.dispatch(name, oldValue, newValue);
    }

    get(name, value) {
        return _.get(this.state, name);
    }

    on(name, callback) {
        var cb = this.getCallbacks(name);
        cb.push(callback);
    }

    off(name, callback) {
        var cb = this.getCallbacks(name);
        _.remove(cb, (c) => callback === c);
    }

    dispatch(name, oldValue, newValue) {
        var cb = this.getCallbacks(name);
        _.forEach(cb, (fn) => {
            if (typeof fn == 'function') {
                fn(name, oldValue, newValue);
            }
        });
    }

    getCallbacks(name) {
        let key = name + '.callback';
        if (!_.has(this.callback, key)) {
            _.set(this.callback, key, []);
        }
        return _.get(this.callback, key, []);
    }
}
