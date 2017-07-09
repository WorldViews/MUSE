
//import * as THREE from 'three';

console.log("********************************************");

class Anim
{
    constructor(name) {
        var inst = this;
        window.OBJ = {'x': 0}
        console.log("Anim "+name);
        this.name = name;
        var tw = createjs.Tween.get(OBJ)
	    .to({x:0}, 0)
	    .to({x:10}, 1000)
	    .to({x:20}, 100000);
        window.tw = tw;
        tw = tw.addEventListener('change', () => handleChange(OBJ))
    }
}

function handleChange(obj)
{
    console.log("OBJ: "+JSON.stringify(obj));
    var m = game.models.platform.scene;
    m.position.x = obj.x;
}

function animTest()
{
    console.log("!!!! >>>>>>>>>>>>>>>>>>>>>>>>>> animTest...........");
    window.OBJ = {'x': 0}
    var tw = createjs.Tween.get(OBJ)
        .to({x:0}, 0)
        .to({x:10}, 1000)
        .to({x:20}, 100000);
    window.tw = tw;
    tw = tw.addEventListener('change', () => handleChange(OBJ))
}

export {animTest, Anim};

