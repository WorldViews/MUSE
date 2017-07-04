
// TODO: THIS KINDA WORKS, BUT MIGRATION ISSUES STILL EXIST
// window.THREE = require('three');
// var {Bootstrap, Api} = require('exports-loader?THREE!threestrap');
// window.THREE.Bootstrap = Bootstrap;
// window.THREE.Api = Api;

// Import mathbox with global side effects (writes to window).
require('mathbox');

import * as _ from 'lodash';

export default (renderer, scene, camera) => {
  return new Promise((resolve, reject) => {
    let context = new MathBox.Context(renderer, null, camera);
    
    context.init();
    context.resize({viewHeight: renderer.width, viewWidth: renderer.height});

    let {api} = context;
    
    // let view = api.cartesian({
    //   range: [[-2, 2], [-1, 1]],
    //   scale: [2, 1],
    // });

    // view
    //   .axis({
    //     axis: 1,
    //     width: 3,
    //   })
    //   .axis({
    //     axis: 2,
    //     width: 3,
    //   })
    //   .grid({
    //     width: 2,  
    //     divideX: 20,
    //     divideY: 10,        
    //   });

    let view = api
      .set({
        focus: 3,
      })
      .cartesian({
        range: [[-2, 2], [-1, 1], [-1, 1]],
        scale: [2, 1, 1],
      });

    resolve({context});
  });
};
