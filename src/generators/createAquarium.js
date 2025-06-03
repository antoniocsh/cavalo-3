import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function createAquarium() {

    let cavalomarinho = null;
    let clock = new THREE.Clock();

    const loader = new GLTFLoader();

    const aquariumSize = { x: 10, y: 5, z: 5 };


    const glassMaterial = new THREE.MeshStandardMaterial({
        color: 0xe4f1f7,
        transparent: true,
        opacity: 0.15,
        roughness: 0,
        metalness: 0.6,
        transmission: 1.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
    });

    const aquarium = new THREE.Group();
    const wallThickness = 0.1;

    const base = new THREE.Mesh(
        new THREE.BoxGeometry(aquariumSize.x, wallThickness, aquariumSize.z),
        glassMaterial
    );
    base.position.y = 0;
    aquarium.add(base);

    const side1 = new THREE.Mesh(
        new THREE.BoxGeometry(wallThickness, aquariumSize.y, aquariumSize.z),
        glassMaterial
    );
    side1.position.set(-aquariumSize.x / 2 + wallThickness / 2, aquariumSize.y / 2, 0);
    aquarium.add(side1);

    const side2 = side1.clone();
    side2.position.x *= -1;
    aquarium.add(side2);

    const front = new THREE.Mesh(
        new THREE.BoxGeometry(aquariumSize.x, aquariumSize.y, wallThickness),
        glassMaterial
    );
    front.position.set(0, aquariumSize.y / 2, -aquariumSize.z / 2 + wallThickness / 2);
    aquarium.add(front);

    const back = front.clone();
    back.position.z *= -1;
    aquarium.add(back);

    const waterMaterial = new THREE.MeshStandardMaterial({
        color: 0x3399ff,
        transparent: true,
        opacity: 0.6,
        roughness: 0.1,
        metalness: 0.4,
        transmission: 1.0,
    });

    const water = new THREE.Mesh(
        new THREE.BoxGeometry(aquariumSize.x - wallThickness * 2, aquariumSize.y*0.8, aquariumSize.z - wallThickness * 2),
        waterMaterial
    );
    water.position.y = (aquariumSize.y*0.8) / 2 + wallThickness;
    aquarium.add(water);
    
    loader.load('models/sea_horse.glb', (gltf) => {
        cavalomarinho = gltf.scene;
        cavalomarinho.scale.set(2, 2, 2);
        cavalomarinho.position.set(0, 1.5, 0);
        cavalomarinho.rotation.y = -Math.PI / 2;
        cavalomarinho.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        aquarium.add(cavalomarinho);
    });



    aquarium.tick = () => {
        if (cavalomarinho) {
            const t = clock.getElapsedTime();

            // Movimento circular no plano XZ
            const radius = 1.8;
            cavalomarinho.position.x = Math.cos(t) * radius;
            cavalomarinho.position.z = Math.sin(t) * radius;
            cavalomarinho.position.y = 1.5 + Math.sin(t * 2) * 0.5;

            // Roda o cavalo marinho levemente para parecer nadando
            cavalomarinho.rotation.y = -Math.PI / 2 + Math.sin(t);
        }
    };

    return aquarium;
}
