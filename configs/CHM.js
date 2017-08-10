
var LIGHTS = [
    {  type: 'PointLight', name: 'light1', color: 0xffaaaa, position: [0, -25,-2]},
    {  type: 'PointLight', name: 'light2', color: 0xaaffaa, position: [0, -25, 0]},
    {  type: 'PointLight', name: 'light3', color: 0xaaaaff, position: [0, -25, 2]},
    {  type: 'PointLight', name: 'light4', color: 0xffffff, position: [50, 25, 20]},
    {  type: 'PointLight', name: 'light5', color: 0xffffff, position: [20, 25,50]},
    {  type: 'PointLight', name: 'light6', color: 0xffffff, position: [50, 5, 50]},
    {  type: 'PointLight', name: 'sun',    color: 0xffffff, position: [0, 1000, 0], distance: 5000},
];

var SPECS = [
    {   type: 'Group', name: 'station'  },
    {   type: 'Model', name: 'platform',
        parent: 'station',
        path: 'models/CHM/ComputerHistoryMuseum3.dae',
        position: [0, 0, 0],
        rot: [0, 0, 0],
        scale: 0.001
    },
    LIGHTS,
    //{  type: 'SolarSystem' },
    //{  type: 'Stars' },
    {  type: 'SlidePlayer', name: 'slidePlayer', screenName: 'rightScreen' },
    {  type: 'ViewManager', bookmarksUrl: 'data/imaginarium_bookmarks.json' },
    //{  type: 'Hurricane', scale: 0.01, parent: 'station' }
    //VEARTH
];

CMP_IMAGINARIUM = SPECS;
