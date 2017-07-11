import {addPlanet, addPlanets} from '../lib/Planet';

class SolarSystemController {

    constructor(game) {
    	addPlanets(game);

	    let vEarth =  addPlanet(game, 'vEarth',   1.2, 0, 2, 0, null, game.defaultGroupName);
    	let SF = {lat: 37.4, lon: -122};
    	vEarth.addMarker(SF.lat, SF.lon)

        this.solarSystem = game.getGroup('solarSystem');
    }

    update() {
        this.solarSystem.rotation.y += 0.0001;
    }
};

export default SolarSystemController;
