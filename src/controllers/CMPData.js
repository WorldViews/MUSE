
import {Game} from '../Game';

const startYear = 1850
const endYear = 2300

class CMPData {

    constructor(game, options) {
        this.game = game;
    }

    update() {
        var game = this.game;
        var t = game.program.getPlayTime();
        //console.log("CMPDataUpdater "+t);
        var year = GSS.timeToYear(t);
        //console.log("year: "+year);
        var data = game.controllers.cmp.loader.data;
        if (data)
            data = data.rcp8p5;
        window.DATA = data;
        if (data && year) {
            var yearf = Math.floor(year);
            var i = Math.floor(yearf - 1850);
            if (i < 0) {
                console.log("updateFields i:"+i);
                return;
            }
            var T = data.temperature[i];
            var co2 = data.co2[i];
            var balance = data.balance[i];
            var dyear = data.year[i];
            //console.log(sprintf("T: %6.1f CO2: %6.1f dyear: %6.1f", T, co2, dyear));
            game.state.set("temp", T);
            game.state.set("co2", co2);
            game.state.set("balance", balance);
            game.state.set("dyear", dyear)
        }
        /*
        else {
            game.state.set("temp", "");
            game.state.set("co2", "");
            game.state.set("balance", "");
            game.state.set("dyear", "");
        }
        */
    }
}

function addCMPData(game, options)
{
    return game.registerController('cmpDataUpdater', new CMPData(game, options));
}

Game.registerNodeType("CMPData", addCMPData);

export {CMPData};
