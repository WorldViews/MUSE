class BodyAnimationController {

	constructor(body) {
		this.body = body;
		this._queue = [];
		this._active = null;
	}

	_detatchActive() {
		let {callback} = this._active;
		this._active = null;
		callback && callback();
	}

	enqueue(tween, callback) {
		if (!this._active) {
			this._active = {callback, tween};
			tween.onComplete(this._detatchActive.bind(this)).start();
		}
		else {
			this._queue.push({callback, tween});
		}
	}

	update(time) {
		// Do NOT update tween without time argument!
		if (this._active) {
			let {tween} = this._active;
			tween.update(time);
		}
	}
}

export default BodyAnimationController;
