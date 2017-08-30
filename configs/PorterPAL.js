
var CONFIG = {
    specs: [
        {  type: 'Model', name: 'svsc',
           parent: 'station',
           path: 'models/PorterPAL/model.dae',
           position: [0.2, 0, 1.6],
           scale: .01
        },
        {  type: 'PointLight', name: 'light1',
           position: [-25, 20, 10],
           color: 0xffffff, intensity: 0.3, distance: 2000
        },
        {  type: 'PointLight', name: 'light2',
           position: [25, 20, 10],
           color: 0xffffff, intensity: 0.3, distance: 2000
        },
        {  type: 'PointLight', name: 'light3',
           position: [-25, 20, -20],
           color: 0xffffff, intensity: 0.3, distance: 2000
       },
        {  type: 'PointLight', name: 'light4',
           position: [25, 20, -20],
           color: 0xffffff, intensity: 0.3, distance: 2000
        }
    ]
}
