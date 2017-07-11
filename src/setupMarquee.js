const TIMEOUT = 30000; // 30 seconds

var timeoutId = null;

export default (game) => {
    let {marquee} = game;

    game.events.addEventListener('valueChange', ({message}) => {
    	if (message.name === 'narrativeText') {
    		marquee.updateText(message.value);

    		if (timeoutId) {
    			clearTimeout(timeoutId);
    		}

    		timeoutId = setTimeout(
    			() => marquee.updateText(''),
    			TIMEOUT
    		);
    	}
    });
};
