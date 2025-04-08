import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

function createHayBlock(width = 1, height = 1, depth = 1, x = 0, y = 0, z = 0) {
    // Load texture
    const textureLoader = new THREE.TextureLoader();
    const hayTexture = textureLoader.load('../statictextures/hay.jpg');
    
    // Repeat texture instead of stretching
    hayTexture.wrapS = THREE.RepeatWrapping;
    hayTexture.wrapT = THREE.RepeatWrapping;
    hayTexture.repeat.set(width, height);
    
    // Create material with texture
    const hayMaterial = new THREE.MeshBasicMaterial({ map: hayTexture });
    
    // Create box geometry
    const hayGeometry = new THREE.BoxGeometry(width, height, depth);
    
    // Create mesh
    const hayBlock = new THREE.Mesh(hayGeometry, hayMaterial);
    
    // Set position
    hayBlock.position.set(x, (y + height) / 2, z);
    
    return hayBlock;
}

function loadHorseModel(scene, x = 0, y = 0, z = 0, scale = 1) {
    const loader = new GLTFLoader();
    loader.load('../staticmodels/low poly horse.gbl', (gltf) => {
        const horse = gltf.scene;
        horse.position.set(x, y, z);
        horse.scale.set(scale, scale, scale);
        scene.add(horse);
    }, undefined, (error) => {
        console.error('Error loading the horse model:', error);
    });
}

function init() {
    const scene = new THREE.Scene();
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0));
    const planeHelper = new THREE.PlaneHelper(plane, 200, 0xaaaaaa);
    scene.add(planeHelper);
    const axes = new THREE.AxesHelper(15);
    scene.add(axes);
    
    const hay_1 = createHayBlock();
    scene.add(hay_1);
    const hay_2 = createHayBlock(4, 1, 1, 3, 0, 0);
    scene.add(hay_2);
    
    loadHorseModel(scene, 0, 0, 5, 2);
    
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 400);
    camera.position.y = 10;
    camera.position.z = 15;
    camera.lookAt(scene.position);
    scene.add(camera);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(new THREE.Color(0xffffff));
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    };
    
    animate();
}

window.onload = init;