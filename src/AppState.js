import _ from 'lodash';

export default class AppState {

    constructor(events) {
        this.state = {};
        this.callbacks = {};
        this.events = events;
    }

    set(name, newValue) {
        let oldValue = _.get(this.state, name);
        _.set(this.state, name, newValue);
        // dispatch change
        //this.dispatch(name, oldValue, newValue);
        let eventType = "setProperties." + name;
        this.events.dispatchEvent({
            type: eventType,
            name,
            oldValue,
            newValue
        });
    }

    get(name, value) {
        return _.get(this.state, name);
    }

    on(name, callback) {
        let eventType = "setProperties." + name;
        let cb = this.callbacks[callback] = (e) => callback(e.name, e.oldValue, e.newValue);
        this.events.addEventListener(eventType, cb);
    }

    off(name, callback) {
        let cb = this.callbacks[callback];
        delete this.callbacks[callback];
        this.events.removeEventListener(eventType, cb)
    }

}
