
class PlayerControl
{
    constructor(game) {
	this.game = game;
    }

    setPlayTime(t) {
	console.log(">>>> noticeTime "+t);
	Object.values(this.game.screens).forEach(scr => {
	    scr.imageSource.setPlayTime(t);
	});
    }
}

export {PlayerControl};
