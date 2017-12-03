
var CONFIG = {
    specs: [
        {  type: 'Model', name: 'svsc',
           parent: 'station',
           path: 'assets/models/SVSC/v1/SimCenter-room.obj',
           position: [0.2, 0, 1.6],
        },
        {  type: 'PointLight', name: 'light1',
           position: [-5, 2, 4],
           color: 0xffffff, intensity: 0.4, distance: 2000
        },
        {  type: 'PointLight', name: 'light2',
           position: [5, 2, 4],
           color: 0xffffff, intensity: 0.4, distance: 2000
        },
        {  type: 'PointLight', name: 'light3',
           position: [0, 2, -10],
           color: 0xffffff, intensity: 0.4, distance: 2000
        }
    ]
}

MUSE.returnValue(CONFIG);
