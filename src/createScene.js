import * as THREE from 'three';

export default () => {
    let canvas3d = document.getElementById('canvas3d');
    canvas3d.height = window.innerHeight;
    canvas3d.width = window.innerWidth;

    let renderer = new THREE.WebGLRenderer({ canvas: canvas3d, antialias: true });
    renderer.setSize(canvas3d.width, canvas3d.height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.autoClear = false;

    let scene = new THREE.Scene();
    let camera = new THREE.PerspectiveCamera(75, canvas3d.width / canvas3d.height, 1, 4000);

    return {camera, renderer, scene};
};
