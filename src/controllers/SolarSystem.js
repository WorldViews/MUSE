
import {Game} from '../Game';
import {addPlanet} from '../lib/CelestialBody';

class SolarSystem {

    constructor(game, options) {
        var earth =   addPlanet(game, 'Sun',      300,  -3000, 0, -2000, './textures/sun_surface1.jpg');
        var earth =   addPlanet(game, 'Earth',   1000,  -2000, 0, 0);
        var mars =    addPlanet(game, 'Mars',     200,   2000, 0, 2000,  './textures/Mars_4k.jpg');
        var jupiter = addPlanet(game, 'Jupiter',  300,   1500, 0, -1500, './textures/Jupiter_Map.jpg');
        var neptune = addPlanet(game, 'Neptune',  100,  -1000, 0, -1000, './textures/Neptune.jpg');

        this.solarSystem = game.getGroup('solarSystem');
    }

    update() {
        //this.solarSystem.rotation.y += 0.0001;
    }
};

function addSolarSystem(game, options)
{
    var cmp = new SolarSystem(game, options);
    var name = options.name || 'solarSystem';
    game.registerController(name, cmp);
    return cmp;
}

Game.registerNodeType("SolarSystem", addSolarSystem);

export default SolarSystem;
