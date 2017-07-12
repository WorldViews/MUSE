import _ from 'lodash';
import { sprintf } from "sprintf-js";

export default (game, imageSource) => {
    let timeline = $('#timeLine');
    var initialized = false;

    imageSource.video.addEventListener('timeupdate', (e) => {
    	if (!initialized && timeline.data('ui-slider')) {
    		initialized = true;
    	}

    	if (initialized) {
    		let value = Math.round(e.target.currentTime / e.target.duration * 1000) / 1000;
    		timeline.slider('value', value);
            _.set(game, 'controllers.ui.slider.value', value);

			var tStr = sprintf("%8.1f", e.target.currentTime);
            game.events.dispatchEvent({
                type: 'valueChange',
                message: {
                    'name': 'timeText',
                    'value': tStr
                }
            });
    	}
    });
};
