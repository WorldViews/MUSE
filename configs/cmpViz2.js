
VEARTH = [
    {  type: 'VirtualEarth', name: 'vEarth',
       radius: 1.25, position: [0,0,0],
       satellites: 0, satTracks: 0,
       dataViz: 1
    }
];

var SPECS = [
    {  type: 'Group', name: 'station'  },
    {  type: 'PointLight', name: 'sun',    color: 0xffffff, position: [-1000, 0, 0], distance: 5000},
    {  type: 'PointLight', name: 'sun',    color: 0xffffff, position: [3000, 0, 0], distance: 5000},
    {  type: 'CMPDataViz', name: 'cmp',
       position: [0, 0, 0], rotation: [0, 0, 0], scale: [1.5, 1, 1.5],
       visible: false
    },
    {  type: 'Stars' },
    VEARTH
];

CONFIG = {
    'cameraControls': 'Orbit',
    'specs': SPECS
};
