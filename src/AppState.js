import _ from 'lodash';

export default class AppState {

    constructor(events) {
        this.state = {};
        this.callbacks = {};
        this.events = events;
    }

    dispatch(name, newValue) {

        let oldValues = [];
        let path = name.split('.');
        while (path.length > 0) {
            let joinedPath = path.join('.');
            oldValues[joinedPath] = _.cloneDeep(_.get(this.state, joinedPath));
            path.pop()
        }

        _.set(this.state, name, newValue);

        // dispatch callbacks
        let self = this;
        Object.keys(oldValues).forEach(function(p) {
            let name = p;
            let oldValue = oldValues[name];
            let newValue = _.cloneDeep(_.get(self.state, name));
            let eventType = "setProperties." + name;
            self.events.dispatchEvent({
                type: eventType,
                name,
                oldValue,
                newValue
            });
        });
    }

    set(name, newValue) {
        if (_.isEqual(_.get(this.state, name), newValue)) {
            return;
        }

        this.dispatch(name, newValue);
    }

    get(name, value) {
        return _.cloneDeep(_.get(this.state, name));
    }

    on(name, callback) {
        let eventType = "setProperties." + name;
        let cb = this.callbacks[callback] = (e) => callback(e.newValue, e.oldValue, e.name);
        this.events.addEventListener(eventType, cb);
    }

    off(name, callback) {
        let cb = this.callbacks[callback];
        delete this.callbacks[callback];
        this.events.removeEventListener(eventType, cb)
    }

}
