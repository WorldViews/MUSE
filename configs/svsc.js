
    var SPECS = [
      {  type: 'Group',  name: 'station' },
      {  type: 'Group',  name: 'g2',
         position: [200,0,0],
         children: {type: 'Axes'}
      },
      {  type: 'Group',  name: 'g3',
         position: [200,-500,0],
         rotation: [0,0,0.2],
         children: [
           {  type: 'Axes', name: 'axis3',
              visible: false
           }
         ]
      },
      {  type: 'Axes',   name: 'xyz' },
      {  type: 'Model', name: 'svsc',
         parent: 'station',
         path: 'models/SVSC/v1/SimCenter-room.obj',
         position: [0.2, 0, 1.6],
      },
      {  type: 'PointLight', name: 'torch1',
         color: 0xffffff, distance: 50000
      },
      {  type: 'Dancer', name: 'dancer',
         scale: .06, visible: false
      }
    ]

window.SPECS = SPECS;

